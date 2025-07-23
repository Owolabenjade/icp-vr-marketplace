import Principal "mo:base/Principal";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Option "mo:base/Option";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";

import Types "types";
import SharedTypes "../shared/types";
import Utils "utils";

actor Marketplace {
    type UserId = Types.UserId;
    type AssetId = Types.AssetId;
    type VRAsset = Types.VRAsset;
    type Listing = Types.Listing;
    type ListingId = Types.ListingId;
    type PurchaseRecord = Types.PurchaseRecord;
    type CreateListingRequest = Types.CreateListingRequest;
    type UpdateListingRequest = Types.UpdateListingRequest;
    type PurchaseRequest = Types.PurchaseRequest;
    type Transaction = Types.Transaction;
    type TransactionStatus = Types.TransactionStatus;
    type PaymentMethod = Types.PaymentMethod;
    type MarketplaceStats = Types.MarketplaceStats;
    type ListingFilters = Types.ListingFilters;
    type UserTransactionHistory = Types.UserTransactionHistory;
    type EscrowInfo = Types.EscrowInfo;
    type Result<T, E> = Types.Result<T, E>;
    type ApiError = Types.ApiError;

    // Stable storage for upgrades
    private stable var listingEntries: [(ListingId, Listing)] = [];
    private stable var transactionEntries: [(Text, Transaction)] = [];
    private stable var purchaseEntries: [(Text, PurchaseRecord)] = [];
    private stable var escrowEntries: [(Text, EscrowInfo)] = [];
    private stable var userBalanceEntries: [(UserId, Nat)] = [];

    // Runtime storage
    private var listings = HashMap.HashMap<ListingId, Listing>(0, Text.equal, Text.hash);
    private var transactions = HashMap.HashMap<Text, Transaction>(0, Text.equal, Text.hash);
    private var purchases = HashMap.HashMap<Text, PurchaseRecord>(0, Text.equal, Text.hash);
    private var escrowHoldings = HashMap.HashMap<Text, EscrowInfo>(0, Text.equal, Text.hash);
    private var userBalances = HashMap.HashMap<UserId, Nat>(0, Principal.equal, Principal.hash); // For escrow

    // Indexes for fast queries
    private var sellerListings = HashMap.HashMap<UserId, [ListingId]>(0, Principal.equal, Principal.hash);
    private var userTransactions = HashMap.HashMap<UserId, [Text]>(0, Principal.equal, Principal.hash);

    // Marketplace statistics
    private stable var totalVolume: Nat = 0;
    private stable var totalFees: Nat = 0;

    // System functions for upgrades
    system func preupgrade() {
        listingEntries := listings.entries() |> Iter.toArray(_);
        transactionEntries := transactions.entries() |> Iter.toArray(_);
        purchaseEntries := purchases.entries() |> Iter.toArray(_);
        escrowEntries := escrowHoldings.entries() |> Iter.toArray(_);
        userBalanceEntries := userBalances.entries() |> Iter.toArray(_);
    };

    system func postupgrade() {
        // Restore from stable storage
        for ((id, listing) in listingEntries.vals()) {
            listings.put(id, listing);
        };
        for ((id, transaction) in transactionEntries.vals()) {
            transactions.put(id, transaction);
        };
        for ((id, purchase) in purchaseEntries.vals()) {
            purchases.put(id, purchase);
        };
        for ((id, escrow) in escrowEntries.vals()) {
            escrowHoldings.put(id, escrow);
        };
        for ((userId, balance) in userBalanceEntries.vals()) {
            userBalances.put(userId, balance);
        };

        // Clear stable storage
        listingEntries := [];
        transactionEntries := [];
        purchaseEntries := [];
        escrowEntries := [];
        userBalanceEntries := [];
    };

    // Create new listing
    public shared(msg) func createListing(request: CreateListingRequest): async Result<Listing, ApiError> {
        let caller = msg.caller;
        
        // Validate input
        if (not Utils.isValidPurchaseAmount(request.price)) {
            return #err(#BadRequest("Price must be greater than 0"));
        };

        // TODO: Verify caller owns the asset by calling Assets canister
        // For now, we'll assume ownership validation happens in the frontend

        let listingId = Utils.generateListingId();
        let now = Time.now();

        // Create placeholder asset - in production, fetch from Assets canister
        let placeholderAsset: VRAsset = {
            metadata = {
                id = request.assetId;
                title = "VR Asset"; // TODO: Get from Assets canister
                description = "Description"; // TODO: Get from Assets canister
                category = #Object; // TODO: Get from Assets canister
                tags = [];
                previewImage = null;
                fileSize = 0;
                fileFormat = "fbx";
                compatibility = [];
                createdAt = now;
                updatedAt = now;
            };
            creator = caller;
            price = request.price;
            isForSale = true;
            downloads = 0;
            rating = 0.0;
            reviewCount = 0;
        };

        let listing: Listing = {
            id = listingId;
            asset = placeholderAsset;
            seller = caller;
            price = request.price;
            isActive = true;
            createdAt = now;
            updatedAt = now;
        };

        // Store listing
        listings.put(listingId, listing);

        // Update seller listings index
        switch (sellerListings.get(caller)) {
            case null {
                sellerListings.put(caller, [listingId]);
            };
            case (?existing) {
                let updated = Array.append(existing, [listingId]);
                sellerListings.put(caller, updated);
            };
        };

        #ok(listing);
    };

    // Get listing by ID
    public query func getListing(listingId: ListingId): async Result<Listing, ApiError> {
        switch (listings.get(listingId)) {
            case (?listing) { #ok(listing) };
            case null { #err(#NotFound) };
        };
    };

    // Get all active listings
    public query func getActiveListings(): async [Listing] {
        let allListings = listings.vals() |> Iter.toArray(_);
        Array.filter<Listing>(allListings, func(listing) = listing.isActive);
    };

    // Get listings with filters
    public query func getListings(filters: ListingFilters): async [Listing] {
        var results = listings.vals() |> Iter.toArray(_);

        // Filter by active status
        switch (filters.isActive) {
            case (?isActive) {
                results := Array.filter<Listing>(results, func(listing) = listing.isActive == isActive);
            };
            case null { };
        };

        // Filter by price range
        switch (filters.minPrice) {
            case (?minPrice) {
                results := Array.filter<Listing>(results, func(listing) = listing.price >= minPrice);
            };
            case null { };
        };

        switch (filters.maxPrice) {
            case (?maxPrice) {
                results := Array.filter<Listing>(results, func(listing) = listing.price <= maxPrice);
            };
            case null { };
        };

        // Filter by seller
        switch (filters.seller) {
            case (?seller) {
                results := Array.filter<Listing>(results, func(listing) = Principal.equal(listing.seller, seller));
            };
            case null { };
        };

        // Filter by category
        switch (filters.category) {
            case (?category) {
                results := Array.filter<Listing>(results, func(listing) = listing.asset.metadata.category == category);
            };
            case null { };
        };

        results;
    };

    // Get listings by seller
    public query func getListingsBySeller(seller: UserId): async [Listing] {
        switch (sellerListings.get(seller)) {
            case null { [] };
            case (?listingIds) {
                Array.mapFilter<ListingId, Listing>(listingIds, func(id) = listings.get(id));
            };
        };
    };

    // Get current user's listings
    public shared(msg) func getMyListings(): async [Listing] {
        getListingsBySeller(msg.caller);
    };

    // Update listing
    public shared(msg) func updateListing(listingId: ListingId, request: UpdateListingRequest): async Result<Listing, ApiError> {
        let caller = msg.caller;
        
        switch (listings.get(listingId)) {
            case null { #err(#NotFound) };
            case (?currentListing) {
                // Check ownership
                if (not Principal.equal(currentListing.seller, caller)) {
                    return #err(#Unauthorized);
                };

                // Validate updated price if provided
                switch (request.price) {
                    case (?price) {
                        if (not Utils.isValidPurchaseAmount(price)) {
                            return #err(#BadRequest("Price must be greater than 0"));
                        };
                    };
                    case null { };
                };

                let updatedListing: Listing = {
                    id = currentListing.id;
                    asset = currentListing.asset;
                    seller = currentListing.seller;
                    price = Option.get(request.price, currentListing.price);
                    isActive = Option.get(request.isActive, currentListing.isActive);
                    createdAt = currentListing.createdAt;
                    updatedAt = Time.now();
                };

                listings.put(listingId, updatedListing);
                #ok(updatedListing);
            };
        };
    };

    // Delete listing (deactivate)
    public shared(msg) func deleteListing(listingId: ListingId): async Result<(), ApiError> {
        let caller = msg.caller;
        
        switch (listings.get(listingId)) {
            case null { #err(#NotFound) };
            case (?listing) {
                // Check ownership
                if (not Principal.equal(listing.seller, caller)) {
                    return #err(#Unauthorized);
                };

                let deactivatedListing: Listing = {
                    id = listing.id;
                    asset = listing.asset;
                    seller = listing.seller;
                    price = listing.price;
                    isActive = false;
                    createdAt = listing.createdAt;
                    updatedAt = Time.now();
                };

                listings.put(listingId, deactivatedListing);
                #ok(());
            };
        };
    };

    // Purchase asset (simplified - in production would integrate with ICP ledger)
    public shared(msg) func purchaseAsset(request: PurchaseRequest): async Result<PurchaseRecord, ApiError> {
        let buyer = msg.caller;
        
        switch (listings.get(request.listingId)) {
            case null { #err(#NotFound) };
            case (?listing) {
                if (not listing.isActive) {
                    return #err(#AssetNotForSale);
                };

                if (Principal.equal(listing.seller, buyer)) {
                    return #err(#BadRequest("Cannot purchase your own asset"));
                };

                // TODO: In production, integrate with ICP ledger for actual payments
                // For now, simulate successful payment

                let transactionId = Utils.generateTransactionId();
                let now = Time.now();

                // Create transaction record
                let transaction: Transaction = {
                    id = transactionId;
                    buyer = buyer;
                    seller = listing.seller;
                    listingId = request.listingId;
                    assetId = listing.asset.metadata.id;
                    amount = listing.price;
                    paymentMethod = request.paymentMethod;
                    status = #Completed; // In production, would start as #Pending
                    createdAt = now;
                    completedAt = ?now;
                    failureReason = null;
                };

                // Create purchase record
                let purchaseRecord: PurchaseRecord = {
                    id = transactionId;
                    buyer = buyer;
                    seller = listing.seller;
                    asset = listing.asset;
                    price = listing.price;
                    timestamp = now;
                    transactionHash = ?transactionId;
                };

                // Calculate fees
                let marketplaceFee = Utils.calculateMarketplaceFee(listing.price);
                let sellerEarnings = Utils.calculateSellerEarnings(listing.price);

                // Store records
                transactions.put(transactionId, transaction);
                purchases.put(transactionId, purchaseRecord);

                // Update indexes
                switch (userTransactions.get(buyer)) {
                    case null {
                        userTransactions.put(buyer, [transactionId]);
                    };
                    case (?existing) {
                        let updated = Array.append(existing, [transactionId]);
                        userTransactions.put(buyer, updated);
                    };
                };

                // Update marketplace stats
                totalVolume += listing.price;
                totalFees += marketplaceFee;

                // TODO: Call Assets canister to transfer ownership
                // TODO: Call Users canister to update user stats

                // Deactivate listing
                let updatedListing: Listing = {
                    id = listing.id;
                    asset = listing.asset;
                    seller = listing.seller;
                    price = listing.price;
                    isActive = false;
                    createdAt = listing.createdAt;
                    updatedAt = now;
                };
                listings.put(request.listingId, updatedListing);

                #ok(purchaseRecord);
            };
        };
    };

    // Get user's transaction history
    public shared(msg) func getMyTransactionHistory(): async UserTransactionHistory {
        let caller = msg.caller;
        let allPurchases = purchases.vals() |> Iter.toArray(_);
        
        let userPurchases = Array.filter<PurchaseRecord>(allPurchases, func(purchase) = Principal.equal(purchase.buyer, caller));
        let userSales = Array.filter<PurchaseRecord>(allPurchases, func(purchase) = Principal.equal(purchase.seller, caller));
        
        let totalSpent = Array.foldLeft<PurchaseRecord, Nat>(userPurchases, 0, func(acc, purchase) = acc + purchase.price);
        let totalEarned = Array.foldLeft<PurchaseRecord, Nat>(userSales, 0, func(acc, purchase) = acc + Utils.calculateSellerEarnings(purchase.price));

        {
            purchases = userPurchases;
            sales = userSales;
            totalSpent = totalSpent;
            totalEarned = totalEarned;
        };
    };

    // Get transaction by ID
    public query func getTransaction(transactionId: Text): async Result<Transaction, ApiError> {
        switch (transactions.get(transactionId)) {
            case (?transaction) { #ok(transaction) };
            case null { #err(#NotFound) };
        };
    };

    // Get purchase record by ID
    public query func getPurchaseRecord(purchaseId: Text): async Result<PurchaseRecord, ApiError> {
        switch (purchases.get(purchaseId)) {
            case (?purchase) { #ok(purchase) };
            case null { #err(#NotFound) };
        };
    };

    // Get marketplace statistics
    public query func getMarketplaceStats(): async MarketplaceStats {
        let allListings = listings.vals() |> Iter.toArray(_);
        let activeListings = Array.filter<Listing>(allListings, func(listing) = listing.isActive);
        
        {
            totalListings = allListings.size();
            activeListings = activeListings.size();
            totalTransactions = transactions.size();
            totalVolume = totalVolume;
            totalFees = totalFees;
        };
    };

    // Get featured/trending listings (placeholder implementation)
    public query func getFeaturedListings(): async [Listing] {
        let activeListings = getActiveListings();
        // TODO: Implement actual trending algorithm based on views, purchases, etc.
        Array.take(activeListings, 10);
    };

    // Search listings by title/description
    public query func searchListings(searchTerm: Text): async [Listing] {
        let allListings = listings.vals() |> Iter.toArray(_);
        let activeListings = Array.filter<Listing>(allListings, func(listing) = listing.isActive);
        
        Array.filter<Listing>(activeListings, func(listing) = 
            Text.contains(listing.asset.metadata.title, #text searchTerm) or
            Text.contains(listing.asset.metadata.description, #text searchTerm)
        );
    };

    // Admin functions (TODO: Add proper admin authorization)
    
    // Get all transactions (admin only)
    public query func getAllTransactions(): async [Transaction] {
        transactions.vals() |> Iter.toArray(_);
    };

    // Refund transaction (admin only)
    public func refundTransaction(transactionId: Text): async Result<(), ApiError> {
        switch (transactions.get(transactionId)) {
            case null { #err(#NotFound) };
            case (?transaction) {
                if (transaction.status != #Completed) {
                    return #err(#BadRequest("Can only refund completed transactions"));
                };

                let refundedTransaction: Transaction = {
                    id = transaction.id;
                    buyer = transaction.buyer;
                    seller = transaction.seller;
                    listingId = transaction.listingId;
                    assetId = transaction.assetId;
                    amount = transaction.amount;
                    paymentMethod = transaction.paymentMethod;
                    status = #Refunded;
                    createdAt = transaction.createdAt;
                    completedAt = transaction.completedAt;
                    failureReason = ?"Refunded by admin";
                };

                transactions.put(transactionId, refundedTransaction);
                
                // TODO: Implement actual refund logic with ICP ledger
                // TODO: Remove asset ownership from buyer
                
                #ok(());
            };
        };
    };

    // Emergency functions
    public func pauseMarketplace(): async () {
        // TODO: Implement marketplace pause functionality
        Debug.print("Marketplace paused");
    };

    public func unpauseMarketplace(): async () {
        // TODO: Implement marketplace unpause functionality
        Debug.print("Marketplace unpaused");
    };
}

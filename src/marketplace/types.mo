import SharedTypes "../shared/types";

module {
    public type UserId = SharedTypes.UserId;
    public type AssetId = SharedTypes.AssetId;
    public type VRAsset = SharedTypes.VRAsset;
    public type Listing = SharedTypes.Listing;
    public type ListingId = SharedTypes.ListingId;
    public type PurchaseRecord = SharedTypes.PurchaseRecord;
    public type Result<T, E> = SharedTypes.Result<T, E>;
    public type ApiError = SharedTypes.ApiError;

    public type CreateListingRequest = {
        assetId: AssetId;
        price: Nat; // in e8s (ICP smallest unit)
        description: ?Text;
    };

    public type UpdateListingRequest = {
        price: ?Nat;
        isActive: ?Bool;
        description: ?Text;
    };

    public type PurchaseRequest = {
        listingId: ListingId;
        paymentMethod: PaymentMethod;
    };

    public type PaymentMethod = {
        #ICP;
        #Cycles;
        // Future: #ICRC1: Text; // Token canister ID
    };

    public type TransactionStatus = {
        #Pending;
        #Completed;
        #Failed: Text;
        #Refunded;
    };

    public type Transaction = {
        id: Text;
        buyer: UserId;
        seller: UserId;
        listingId: ListingId;
        assetId: AssetId;
        amount: Nat;
        paymentMethod: PaymentMethod;
        status: TransactionStatus;
        createdAt: Int;
        completedAt: ?Int;
        failureReason: ?Text;
    };

    public type MarketplaceStats = {
        totalListings: Nat;
        activeListings: Nat;
        totalTransactions: Nat;
        totalVolume: Nat; // in e8s
        totalFees: Nat; // marketplace fees collected
    };

    public type ListingFilters = {
        minPrice: ?Nat;
        maxPrice: ?Nat;
        seller: ?UserId;
        category: ?SharedTypes.AssetCategory;
        isActive: ?Bool;
    };

    public type UserTransactionHistory = {
        purchases: [PurchaseRecord];
        sales: [PurchaseRecord];
        totalSpent: Nat;
        totalEarned: Nat;
    };

    public type EscrowInfo = {
        transactionId: Text;
        amount: Nat;
        buyer: UserId;
        seller: UserId;
        createdAt: Int;
        expiresAt: Int;
    };
}

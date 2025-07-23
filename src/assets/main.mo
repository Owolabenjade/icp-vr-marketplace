import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Option "mo:base/Option";
import Float "mo:base/Float";
import Iter "mo:base/Iter";

import Types "types";
import SharedTypes "../shared/types";
import Utils "../shared/utils";
import Storage "storage";

actor Assets {
    type AssetId = Types.AssetId;
    type UserId = Types.UserId;
    type VRAsset = Types.VRAsset;
    type AssetMetadata = Types.AssetMetadata;
    type AssetCategory = Types.AssetCategory;
    type CreateAssetRequest = Types.CreateAssetRequest;
    type UpdateAssetRequest = Types.UpdateAssetRequest;
    type AssetSearchFilters = Types.AssetSearchFilters;
    type AssetWithOwnership = Types.AssetWithOwnership;
    type AssetStats = Types.AssetStats;
    type Result<T, E> = Types.Result<T, E>;
    type ApiError = Types.ApiError;

    // Stable storage for upgrades
    private stable var assetEntries: [(AssetId, VRAsset)] = [];
    private stable var assetStatsEntries: [(AssetId, AssetStats)] = [];
    private stable var userAssetsEntries: [(UserId, [AssetId])] = [];
    private stable var assetOwnersEntries: [(AssetId, [UserId])] = [];

    // Storage instance
    private var storage = Storage.AssetStorage();

    // System functions for upgrades
    system func preupgrade() {
        assetEntries := storage.getAssetEntries();
        assetStatsEntries := storage.getAssetStatsEntries();
        userAssetsEntries := storage.getUserAssetsEntries();
        assetOwnersEntries := storage.getAssetOwnersEntries();
    };

    system func postupgrade() {
        storage.restoreAssets(assetEntries);
        storage.restoreAssetStats(assetStatsEntries);
        storage.restoreUserAssets(userAssetsEntries);
        storage.restoreAssetOwners(assetOwnersEntries);
        
        // Clear stable storage
        assetEntries := [];
        assetStatsEntries := [];
        userAssetsEntries := [];
        assetOwnersEntries := [];
    };

    // Create new VR asset
    public shared(msg) func createAsset(request: CreateAssetRequest): async Result<VRAsset, ApiError> {
        let caller = msg.caller;
        
        // Validate input
        let sanitizedTitle = Utils.sanitizeText(request.title);
        let sanitizedDescription = Utils.sanitizeText(request.description);
        
        if (Text.size(sanitizedTitle) == 0) {
            return #err(#BadRequest("Title cannot be empty"));
        };

        if (Text.size(sanitizedDescription) == 0) {
            return #err(#BadRequest("Description cannot be empty"));
        };

        if (not Utils.isValidVRFormat(request.fileFormat)) {
            return #err(#BadRequest("Invalid file format for VR assets"));
        };

        if (not Utils.isValidPrice(request.price)) {
            return #err(#BadRequest("Price must be greater than 0"));
        };

        // Generate unique asset ID
        let assetId = Utils.generateId("asset");
        
        // Create asset metadata
        let metadata: AssetMetadata = {
            id = assetId;
            title = sanitizedTitle;
            description = sanitizedDescription;
            category = request.category;
            tags = request.tags;
            previewImage = request.previewImage;
            fileSize = request.fileSize;
            fileFormat = Text.toLowercase(request.fileFormat);
            compatibility = request.compatibility;
            createdAt = Time.now();
            updatedAt = Time.now();
        };

        // Create VR asset
        let vrAsset: VRAsset = {
            metadata = metadata;
            creator = caller;
            price = request.price;
            isForSale = true;
            downloads = 0;
            rating = 0.0;
            reviewCount = 0;
        };

        // Create initial stats
        let stats: AssetStats = {
            totalViews = 0;
            totalDownloads = 0;
            totalRevenue = 0;
            averageRating = 0.0;
            reviewCount = 0;
            createdAt = Time.now();
            lastDownloaded = null;
        };

        // Store asset and stats
        storage.putAsset(vrAsset);
        storage.putAssetStats(assetId, stats);
        
        // Creator automatically owns their asset
        storage.addAssetOwner(assetId, caller);

        #ok(vrAsset);
    };

    // Get asset by ID
    public query func getAsset(assetId: AssetId): async Result<VRAsset, ApiError> {
        switch (storage.getAsset(assetId)) {
            case (?asset) { #ok(asset) };
            case null { #err(#NotFound) };
        };
    };

    // Get asset with ownership status for a specific user
    public shared(msg) func getAssetWithOwnership(assetId: AssetId): async Result<AssetWithOwnership, ApiError> {
        let caller = msg.caller;
        
        switch (storage.getAsset(assetId)) {
            case null { #err(#NotFound) };
            case (?asset) {
                // Increment view count
                storage.incrementViews(assetId);
                
                let isOwned = storage.isAssetOwner(assetId, caller) or Principal.equal(asset.creator, caller);
                let assetWithOwnership: AssetWithOwnership = {
                    asset = asset;
                    isOwned = isOwned;
                    purchaseDate = null; // TODO: Get actual purchase date
                };
                #ok(assetWithOwnership);
            };
        };
    };

    // Get all assets (with pagination support)
    public query func getAllAssets(): async [VRAsset] {
        storage.getAllAssets();
    };

    // Get assets by creator
    public query func getAssetsByCreator(creator: UserId): async [VRAsset] {
        storage.getAssetsByCreator(creator);
    };

    // Get current user's assets
    public shared(msg) func getMyAssets(): async [VRAsset] {
        storage.getAssetsByCreator(msg.caller);
    };

    // Get assets by category
    public query func getAssetsByCategory(category: AssetCategory): async [VRAsset] {
        storage.getAssetsByCategory(category);
    };

    // Get assets by tag
    public query func getAssetsByTag(tag: Text): async [VRAsset] {
        storage.getAssetsByTag(tag);
    };

    // Search assets with filters
    public query func searchAssets(filters: AssetSearchFilters): async [VRAsset] {
        var results = storage.getAllAssets();

        // Filter by category
        switch (filters.category) {
            case (?category) {
                results := Array.filter<VRAsset>(results, func(asset) = asset.metadata.category == category);
            };
            case null { };
        };

        // Filter by price range
        switch (filters.minPrice) {
            case (?minPrice) {
                results := Array.filter<VRAsset>(results, func(asset) = asset.price >= minPrice);
            };
            case null { };
        };

        switch (filters.maxPrice) {
            case (?maxPrice) {
                results := Array.filter<VRAsset>(results, func(asset) = asset.price <= maxPrice);
            };
            case null { };
        };

        // Filter by creator
        switch (filters.creator) {
            case (?creator) {
                results := Array.filter<VRAsset>(results, func(asset) = Principal.equal(asset.creator, creator));
            };
            case null { };
        };

        // Filter by compatibility
        switch (filters.compatibility) {
            case (?platform) {
                results := Array.filter<VRAsset>(results, func(asset) = 
                    Array.find<Text>(asset.metadata.compatibility, func(p) = Text.contains(p, #text platform)) != null
                );
            };
            case null { };
        };

        // Filter by tags
        switch (filters.tags) {
            case (?filterTags) {
                results := Array.filter<VRAsset>(results, func(asset) = 
                    Array.find<Text>(filterTags, func(filterTag) = 
                        Array.find<Text>(asset.metadata.tags, func(assetTag) = assetTag == filterTag) != null
                    ) != null
                );
            };
            case null { };
        };

        results;
    };

    // Update asset
    public shared(msg) func updateAsset(assetId: AssetId, request: UpdateAssetRequest): async Result<VRAsset, ApiError> {
        let caller = msg.caller;
        
        switch (storage.getAsset(assetId)) {
            case null { #err(#NotFound) };
            case (?currentAsset) {
                // Check ownership
                if (not Principal.equal(currentAsset.creator, caller)) {
                    return #err(#Unauthorized);
                };

                // Create updated asset
                let updatedMetadata: AssetMetadata = {
                    id = currentAsset.metadata.id;
                    title = Option.get(request.title, currentAsset.metadata.title);
                    description = Option.get(request.description, currentAsset.metadata.description);
                    category = Option.get(request.category, currentAsset.metadata.category);
                    tags = Option.get(request.tags, currentAsset.metadata.tags);
                    previewImage = Option.get(request.previewImage, currentAsset.metadata.previewImage);
                    fileSize = currentAsset.metadata.fileSize;
                    fileFormat = currentAsset.metadata.fileFormat;
                    compatibility = Option.get(request.compatibility, currentAsset.metadata.compatibility);
                    createdAt = currentAsset.metadata.createdAt;
                    updatedAt = Time.now();
                };

                let updatedAsset: VRAsset = {
                    metadata = updatedMetadata;
                    creator = currentAsset.creator;
                    price = Option.get(request.price, currentAsset.price);
                    isForSale = Option.get(request.isForSale, currentAsset.isForSale);
                    downloads = currentAsset.downloads;
                    rating = currentAsset.rating;
                    reviewCount = currentAsset.reviewCount;
                };

                // Validate updated data
                if (Option.isSome(request.price) and not Utils.isValidPrice(Option.get(request.price, 0))) {
                    return #err(#BadRequest("Price must be greater than 0"));
                };

                // Update in storage
                ignore storage.updateAsset(assetId, updatedAsset);
                #ok(updatedAsset);
            };
        };
    };

    // Get asset statistics
    public query func getAssetStats(assetId: AssetId): async Result<AssetStats, ApiError> {
        switch (storage.getAssetStats(assetId)) {
            case (?stats) { #ok(stats) };
            case null { #err(#NotFound) };
        };
    };

    // Purchase asset (called by marketplace canister)
    public func purchaseAsset(assetId: AssetId, buyer: UserId): async Result<(), ApiError> {
        // TODO: Add proper authorization check for inter-canister calls
        
        switch (storage.getAsset(assetId)) {
            case null { #err(#NotFound) };
            case (?asset) {
                if (not asset.isForSale) {
                    return #err(#AssetNotForSale);
                };

                if (storage.isAssetOwner(assetId, buyer)) {
                    return #err(#AlreadyOwned);
                };

                // Add buyer as owner
                storage.addAssetOwner(assetId, buyer);
                
                // Increment download count
                storage.incrementDownloads(assetId);

                #ok(());
            };
        };
    };

    // Get owned assets for a user
    public shared(msg) func getOwnedAssets(): async [VRAsset] {
        let caller = msg.caller;
        let allAssets = storage.getAllAssets();
        
        Array.filter<VRAsset>(allAssets, func(asset) = 
            storage.isAssetOwner(asset.metadata.id, caller) or Principal.equal(asset.creator, caller)
        );
    };

    // Check if user owns an asset
    public shared(msg) func checkOwnership(assetId: AssetId): async Bool {
        let caller = msg.caller;
        
        switch (storage.getAsset(assetId)) {
            case null { false };
            case (?asset) {
                storage.isAssetOwner(assetId, caller) or Principal.equal(asset.creator, caller);
            };
        };
    };

    // Get featured assets (placeholder - could implement trending logic)
    public query func getFeaturedAssets(): async [VRAsset] {
        // For now, return assets with highest download count
        let allAssets = storage.getAllAssets();
        // TODO: Sort by downloads/rating
        Array.take(allAssets, 10);
    };

    // Get total asset count (for admin/stats)
    public query func getTotalAssetCount(): async Nat {
        storage.getAllAssets().size();
    };
}

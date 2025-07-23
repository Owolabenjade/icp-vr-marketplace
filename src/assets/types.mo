import SharedTypes "../shared/types";

module {
    public type AssetId = SharedTypes.AssetId;
    public type UserId = SharedTypes.UserId;
    public type VRAsset = SharedTypes.VRAsset;
    public type AssetMetadata = SharedTypes.AssetMetadata;
    public type AssetCategory = SharedTypes.AssetCategory;
    public type Result<T, E> = SharedTypes.Result<T, E>;
    public type ApiError = SharedTypes.ApiError;

    public type CreateAssetRequest = {
        title: Text;
        description: Text;
        category: AssetCategory;
        tags: [Text];
        previewImage: ?Text;
        fileSize: Nat;
        fileFormat: Text;
        compatibility: [Text];
        price: Nat;
        fileHash: Text; // IPFS or content hash
        downloadUrl: Text; // Where the actual VR file is stored
    };

    public type UpdateAssetRequest = {
        title: ?Text;
        description: ?Text;
        category: ?AssetCategory;
        tags: ?[Text];
        previewImage: ?Text;
        compatibility: ?[Text];
        price: ?Nat;
        isForSale: ?Bool;
    };

    public type AssetSearchFilters = {
        category: ?AssetCategory;
        minPrice: ?Nat;
        maxPrice: ?Nat;
        tags: ?[Text];
        creator: ?UserId;
        compatibility: ?Text;
    };

    public type AssetWithOwnership = {
        asset: VRAsset;
        isOwned: Bool;
        purchaseDate: ?Int;
    };

    public type AssetStats = {
        totalViews: Nat;
        totalDownloads: Nat;
        totalRevenue: Nat;
        averageRating: Float;
        reviewCount: Nat;
        createdAt: Int;
        lastDownloaded: ?Int;
    };
}

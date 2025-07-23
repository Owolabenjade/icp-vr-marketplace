import Time "mo:base/Time";
import Principal "mo:base/Principal";

module {
    // User types
    public type UserId = Principal;
    
    public type UserProfile = {
        id: UserId;
        username: Text;
        email: ?Text;
        bio: ?Text;
        avatar: ?Text;
        createdAt: Time.Time;
        isVerified: Bool;
    };

    // Asset types
    public type AssetId = Text;
    
    public type AssetCategory = {
        #Environment;
        #Character;
        #Object;
        #Animation;
        #Audio;
        #Complete_Experience;
    };

    public type AssetMetadata = {
        id: AssetId;
        title: Text;
        description: Text;
        category: AssetCategory;
        tags: [Text];
        previewImage: ?Text;
        fileSize: Nat;
        fileFormat: Text;
        compatibility: [Text]; // VR platforms: ["Oculus", "Steam VR", etc.]
        createdAt: Time.Time;
        updatedAt: Time.Time;
    };

    public type VRAsset = {
        metadata: AssetMetadata;
        creator: UserId;
        price: Nat; // in e8s (ICP smallest unit)
        isForSale: Bool;
        downloads: Nat;
        rating: Float;
        reviewCount: Nat;
    };

    // Marketplace types
    public type ListingId = Text;
    
    public type Listing = {
        id: ListingId;
        asset: VRAsset;
        seller: UserId;
        price: Nat;
        isActive: Bool;
        createdAt: Time.Time;
        updatedAt: Time.Time;
    };

    public type PurchaseRecord = {
        id: Text;
        buyer: UserId;
        seller: UserId;
        asset: VRAsset;
        price: Nat;
        timestamp: Time.Time;
        transactionHash: ?Text;
    };

    // API Response types
    public type Result<T, E> = {
        #ok: T;
        #err: E;
    };

    public type ApiError = {
        #NotFound;
        #Unauthorized;
        #BadRequest: Text;
        #InternalError: Text;
        #InsufficientFunds;
        #AssetNotForSale;
        #AlreadyOwned;
    };
}

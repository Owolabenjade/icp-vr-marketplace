import SharedTypes "../shared/types";

module {
    public type UserId = SharedTypes.UserId;
    public type UserProfile = SharedTypes.UserProfile;
    public type Result<T, E> = SharedTypes.Result<T, E>;
    public type ApiError = SharedTypes.ApiError;

    public type CreateUserRequest = {
        username: Text;
        email: ?Text;
        bio: ?Text;
        avatar: ?Text;
    };

    public type UpdateUserRequest = {
        username: ?Text;
        email: ?Text;
        bio: ?Text;
        avatar: ?Text;
    };

    public type UserStats = {
        totalAssetsCreated: Nat;
        totalAssetsSold: Nat;
        totalEarnings: Nat;
        averageRating: Float;
        joinedAt: Int;
    };
}

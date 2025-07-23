import Principal "mo:base/Principal";
import Time "mo:base/Time";
import HashMap "mo:base/HashMap";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Option "mo:base/Option";

import Types "types";
import SharedTypes "../shared/types";
import Utils "../shared/utils";

actor Users {
    type UserId = Types.UserId;
    type UserProfile = Types.UserProfile;
    type CreateUserRequest = Types.CreateUserRequest;
    type UpdateUserRequest = Types.UpdateUserRequest;
    type UserStats = Types.UserStats;
    type Result<T, E> = Types.Result<T, E>;
    type ApiError = Types.ApiError;

    // Stable storage for upgrades
    private stable var userEntries: [(UserId, UserProfile)] = [];
    private stable var userStatsEntries: [(UserId, UserStats)] = [];

    // Runtime storage
    private var users = HashMap.HashMap<UserId, UserProfile>(0, Principal.equal, Principal.hash);
    private var userStats = HashMap.HashMap<UserId, UserStats>(0, Principal.equal, Principal.hash);

    // Initialize from stable storage
    system func preupgrade() {
        userEntries := users.entries() |> Iter.toArray(_);
        userStatsEntries := userStats.entries() |> Iter.toArray(_);
    };

    system func postupgrade() {
        userEntries := [];
        userStatsEntries := [];
    };

    // Create new user profile
    public shared(msg) func createUser(request: CreateUserRequest): async Result<UserProfile, ApiError> {
        let caller = msg.caller;
        
        // Check if user already exists
        switch (users.get(caller)) {
            case (?existing) { #err(#BadRequest("User already exists")) };
            case null {
                // Validate input
                let sanitizedUsername = Utils.sanitizeText(request.username);
                if (Text.size(sanitizedUsername) == 0) {
                    return #err(#BadRequest("Username cannot be empty"));
                };

                // Create user profile
                let profile: UserProfile = {
                    id = caller;
                    username = sanitizedUsername;
                    email = request.email;
                    bio = request.bio;
                    avatar = request.avatar;
                    createdAt = Time.now();
                    isVerified = false;
                };

                // Create initial stats
                let stats: UserStats = {
                    totalAssetsCreated = 0;
                    totalAssetsSold = 0;
                    totalEarnings = 0;
                    averageRating = 0.0;
                    joinedAt = Time.now();
                };

                // Store in memory
                users.put(caller, profile);
                userStats.put(caller, stats);

                #ok(profile);
            };
        };
    };

    // Get user profile by ID
    public query func getUser(userId: UserId): async Result<UserProfile, ApiError> {
        switch (users.get(userId)) {
            case (?profile) { #ok(profile) };
            case null { #err(#NotFound) };
        };
    };

    // Get current user profile
    public shared(msg) func getCurrentUser(): async Result<UserProfile, ApiError> {
        getUser(msg.caller);
    };

    // Update user profile
    public shared(msg) func updateUser(request: UpdateUserRequest): async Result<UserProfile, ApiError> {
        let caller = msg.caller;
        
        switch (users.get(caller)) {
            case null { #err(#NotFound) };
            case (?currentProfile) {
                let updatedProfile: UserProfile = {
                    id = currentProfile.id;
                    username = Option.get(request.username, currentProfile.username);
                    email = Option.get(request.email, currentProfile.email);
                    bio = Option.get(request.bio, currentProfile.bio);
                    avatar = Option.get(request.avatar, currentProfile.avatar);
                    createdAt = currentProfile.createdAt;
                    isVerified = currentProfile.isVerified;
                };

                users.put(caller, updatedProfile);
                #ok(updatedProfile);
            };
        };
    };

    // Get user statistics
    public query func getUserStats(userId: UserId): async Result<UserStats, ApiError> {
        switch (userStats.get(userId)) {
            case (?stats) { #ok(stats) };
            case null { #err(#NotFound) };
        };
    };

    // Update user stats (called by other canisters)
    public func updateUserStats(userId: UserId, stats: UserStats): async Result<(), ApiError> {
        // TODO: Add proper authorization check for inter-canister calls
        userStats.put(userId, stats);
        #ok(());
    };

    // Get all users (for admin/debugging - limit in production)
    public query func getAllUsers(): async [(UserId, UserProfile)] {
        users.entries() |> Iter.toArray(_);
    };

    // Verify user (admin function)
    public func verifyUser(userId: UserId): async Result<UserProfile, ApiError> {
        // TODO: Add admin authorization
        switch (users.get(userId)) {
            case null { #err(#NotFound) };
            case (?profile) {
                let verifiedProfile: UserProfile = {
                    id = profile.id;
                    username = profile.username;
                    email = profile.email;
                    bio = profile.bio;
                    avatar = profile.avatar;
                    createdAt = profile.createdAt;
                    isVerified = true;
                };
                users.put(userId, verifiedProfile);
                #ok(verifiedProfile);
            };
        };
    };
}

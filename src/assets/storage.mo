import HashMap "mo:base/HashMap";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Result "mo:base/Result";

import Types "types";
import SharedTypes "../shared/types";

module {
    type AssetId = Types.AssetId;
    type UserId = Types.UserId;
    type VRAsset = Types.VRAsset;
    type AssetStats = Types.AssetStats;

    public class AssetStorage() {
        // Asset storage
        private var assets = HashMap.HashMap<AssetId, VRAsset>(0, Text.equal, Text.hash);
        private var assetStats = HashMap.HashMap<AssetId, AssetStats>(0, Text.equal, Text.hash);
        private var userAssets = HashMap.HashMap<UserId, [AssetId]>(0, Principal.equal, Principal.hash);
        private var assetOwners = HashMap.HashMap<AssetId, [UserId]>(0, Text.equal, Text.hash);
        
        // Category and tag indexes for fast searching
        private var categoryIndex = HashMap.HashMap<Text, [AssetId]>(0, Text.equal, Text.hash);
        private var tagIndex = HashMap.HashMap<Text, [AssetId]>(0, Text.equal, Text.hash);

        // Store asset
        public func putAsset(asset: VRAsset): () {
            assets.put(asset.metadata.id, asset);
            
            // Update user assets index
            switch (userAssets.get(asset.creator)) {
                case null { 
                    userAssets.put(asset.creator, [asset.metadata.id]); 
                };
                case (?existing) {
                    let updated = Array.append(existing, [asset.metadata.id]);
                    userAssets.put(asset.creator, updated);
                };
            };

            // Update category index
            let categoryKey = debug_show(asset.metadata.category);
            switch (categoryIndex.get(categoryKey)) {
                case null {
                    categoryIndex.put(categoryKey, [asset.metadata.id]);
                };
                case (?existing) {
                    let updated = Array.append(existing, [asset.metadata.id]);
                    categoryIndex.put(categoryKey, updated);
                };
            };

            // Update tag indexes
            for (tag in asset.metadata.tags.vals()) {
                switch (tagIndex.get(tag)) {
                    case null {
                        tagIndex.put(tag, [asset.metadata.id]);
                    };
                    case (?existing) {
                        let updated = Array.append(existing, [asset.metadata.id]);
                        tagIndex.put(tag, updated);
                    };
                };
            };
        };

        // Get asset by ID
        public func getAsset(assetId: AssetId): ?VRAsset {
            assets.get(assetId);
        };

        // Get all assets
        public func getAllAssets(): [VRAsset] {
            assets.vals() |> Iter.toArray(_);
        };

        // Get assets by creator
        public func getAssetsByCreator(creator: UserId): [VRAsset] {
            switch (userAssets.get(creator)) {
                case null { [] };
                case (?assetIds) {
                    Array.mapFilter<AssetId, VRAsset>(assetIds, func(id) = assets.get(id));
                };
            };
        };

        // Get assets by category
        public func getAssetsByCategory(category: SharedTypes.AssetCategory): [VRAsset] {
            let categoryKey = debug_show(category);
            switch (categoryIndex.get(categoryKey)) {
                case null { [] };
                case (?assetIds) {
                    Array.mapFilter<AssetId, VRAsset>(assetIds, func(id) = assets.get(id));
                };
            };
        };

        // Get assets by tag
        public func getAssetsByTag(tag: Text): [VRAsset] {
            switch (tagIndex.get(tag)) {
                case null { [] };
                case (?assetIds) {
                    Array.mapFilter<AssetId, VRAsset>(assetIds, func(id) = assets.get(id));
                };
            };
        };

        // Update asset
        public func updateAsset(assetId: AssetId, updatedAsset: VRAsset): Bool {
            switch (assets.get(assetId)) {
                case null { false };
                case (?_) {
                    assets.put(assetId, updatedAsset);
                    // TODO: Update indexes if category/tags changed
                    true;
                };
            };
        };

        // Delete asset
        public func deleteAsset(assetId: AssetId): Bool {
            switch (assets.get(assetId)) {
                case null { false };
                case (?asset) {
                    assets.delete(assetId);
                    // TODO: Clean up indexes
                    true;
                };
            };
        };

        // Asset ownership management
        public func addAssetOwner(assetId: AssetId, owner: UserId): () {
            switch (assetOwners.get(assetId)) {
                case null {
                    assetOwners.put(assetId, [owner]);
                };
                case (?existing) {
                    // Check if already owned
                    if (Array.find<UserId>(existing, func(u) = Principal.equal(u, owner)) == null) {
                        let updated = Array.append(existing, [owner]);
                        assetOwners.put(assetId, updated);
                    };
                };
            };
        };

        public func isAssetOwner(assetId: AssetId, user: UserId): Bool {
            switch (assetOwners.get(assetId)) {
                case null { false };
                case (?owners) {
                    Array.find<UserId>(owners, func(u) = Principal.equal(u, user)) != null;
                };
            };
        };

        // Asset statistics
        public func putAssetStats(assetId: AssetId, stats: AssetStats): () {
            assetStats.put(assetId, stats);
        };

        public func getAssetStats(assetId: AssetId): ?AssetStats {
            assetStats.get(assetId);
        };

        public func incrementDownloads(assetId: AssetId): () {
            switch (assetStats.get(assetId)) {
                case null { /* No stats yet */ };
                case (?stats) {
                    let updated: AssetStats = {
                        totalViews = stats.totalViews;
                        totalDownloads = stats.totalDownloads + 1;
                        totalRevenue = stats.totalRevenue;
                        averageRating = stats.averageRating;
                        reviewCount = stats.reviewCount;
                        createdAt = stats.createdAt;
                        lastDownloaded = ?Time.now();
                    };
                    assetStats.put(assetId, updated);
                };
            };
        };

        public func incrementViews(assetId: AssetId): () {
            switch (assetStats.get(assetId)) {
                case null { /* No stats yet */ };
                case (?stats) {
                    let updated: AssetStats = {
                        totalViews = stats.totalViews + 1;
                        totalDownloads = stats.totalDownloads;
                        totalRevenue = stats.totalRevenue;
                        averageRating = stats.averageRating;
                        reviewCount = stats.reviewCount;
                        createdAt = stats.createdAt;
                        lastDownloaded = stats.lastDownloaded;
                    };
                    assetStats.put(assetId, updated);
                };
            };
        };

        // Get entries for stable storage
        public func getAssetEntries(): [(AssetId, VRAsset)] {
            assets.entries() |> Iter.toArray(_);
        };

        public func getAssetStatsEntries(): [(AssetId, AssetStats)] {
            assetStats.entries() |> Iter.toArray(_);
        };

        public func getUserAssetsEntries(): [(UserId, [AssetId])] {
            userAssets.entries() |> Iter.toArray(_);
        };

        public func getAssetOwnersEntries(): [(AssetId, [UserId])] {
            assetOwners.entries() |> Iter.toArray(_);
        };

        // Restore from stable storage
        public func restoreAssets(entries: [(AssetId, VRAsset)]): () {
            for ((id, asset) in entries.vals()) {
                assets.put(id, asset);
            };
        };

        public func restoreAssetStats(entries: [(AssetId, AssetStats)]): () {
            for ((id, stats) in entries.vals()) {
                assetStats.put(id, stats);
            };
        };

        public func restoreUserAssets(entries: [(UserId, [AssetId])]): () {
            for ((userId, assetIds) in entries.vals()) {
                userAssets.put(userId, assetIds);
            };
        };

        public func restoreAssetOwners(entries: [(AssetId, [UserId])]): () {
            for ((assetId, owners) in entries.vals()) {
                assetOwners.put(assetId, owners);
            };
        };
    };
}

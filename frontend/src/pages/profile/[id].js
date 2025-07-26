import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  User,
  Edit,
  Calendar,
  Star,
  Download,
  Upload,
  Shield,
  MapPin,
  Link as LinkIcon,
  Mail,
  Settings,
  Grid,
  List
} from 'lucide-react';

import { PageLayout } from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AssetGrid from '../../components/marketplace/AssetGrid';

import { useAuth, useAssets, useProfile } from '../../hooks';
import { usersService, assetsService } from '../../services';
import { ROUTES, ASSET_CATEGORIES } from '../../utils/constants';
import { dateUtils, authUtils } from '../../utils/helpers';

/**
 * User Profile Page Component
 */
const UserProfilePage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user: currentUser, isAuthenticated } = useAuth();
  
  // State
  const [profileUser, setProfileUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('assets'); // 'assets', 'about'
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'

  // Check if viewing own profile
  const isOwnProfile = currentUser && profileUser && currentUser.id === profileUser.id;

  // Fetch user's assets
  const {
    assets: userAssets,
    loading: assetsLoading,
    error: assetsError
  } = useAssets({
    filters: { creator: id },
    autoFetch: !!id
  });

  // Fetch user profile and stats
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const [userProfile, stats] = await Promise.all([
          usersService.getUserProfile(id),
          usersService.getUserStats(id).catch(() => null), // Stats might not exist
        ]);

        setProfileUser(userProfile);
        setUserStats(stats);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [id]);

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleViewAsset = (asset) => {
    router.push(ROUTES.asset(asset.metadata.id));
  };

  const handleContactUser = () => {
    // TODO: Implement messaging system
    console.log('Contact user:', profileUser.username);
  };

  if (loading) {
    return (
      <PageLayout title="Loading Profile...">
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </PageLayout>
    );
  }

  if (error || !profileUser) {
    return (
      <PageLayout title="Profile Not Found">
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
          <p className="text-gray-600 mb-4">
            {error || 'This user profile does not exist or has been removed.'}
          </p>
          <Button variant="primary" onClick={() => router.push('/')}>
            Go Home
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={`${authUtils.getDisplayName(profileUser)} - Profile`}
      description={profileUser.bio || `View ${authUtils.getDisplayName(profileUser)}'s VR assets and profile`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow mb-8">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-primary-500 to-accent-500 rounded-t-lg relative">
            <div className="absolute inset-0 bg-black bg-opacity-20 rounded-t-lg"></div>
          </div>

          {/* Profile Info */}
          <div className="px-6 pb-6 -mt-12 relative">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={authUtils.getAvatarUrl(profileUser)}
                  alt={authUtils.getDisplayName(profileUser)}
                  className="w-24 h-24 rounded-full border-4 border-white bg-white shadow-lg"
                />
                {profileUser.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* User Details */}
              <div className="flex-1 mt-4 sm:mt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                      <span>{authUtils.getDisplayName(profileUser)}</span>
                      {profileUser.isVerified && (
                        <Shield className="w-5 h-5 text-green-500" />
                      )}
                    </h1>
                    {profileUser.bio && (
                      <p className="text-gray-600 mt-1 max-w-2xl">{profileUser.bio}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {dateUtils.format(profileUser.createdAt, 'short')}</span>
                      </div>
                      {userStats && (
                        <>
                          <div className="flex items-center space-x-1">
                            <Upload className="w-4 h-4" />
                            <span>{userStats.totalAssetsCreated} assets created</span>
                          </div>
                          {userStats.averageRating > 0 && (
                            <div className="flex items-center space-x-1">
                              <Star className="w-4 h-4" />
                              <span>{userStats.averageRating.toFixed(1)} rating</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 mt-4 sm:mt-0">
                    {isOwnProfile ? (
                      <Button
                        variant="primary"
                        onClick={handleEditProfile}
                        icon={Edit}
                      >
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          onClick={handleContactUser}
                          icon={Mail}
                        >
                          Contact
                        </Button>
                        <Button variant="primary">
                          Follow
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Stats */}
        {userStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-primary-600">
                {userStats.totalAssetsCreated}
              </div>
              <div className="text-sm text-gray-600">Assets Created</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-green-600">
                {userStats.totalAssetsSold}
              </div>
              <div className="text-sm text-gray-600">Assets Sold</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-accent-600">
                {userStats.averageRating > 0 ? userStats.averageRating.toFixed(1) : '0.0'}
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-2xl font-bold text-blue-600">
                {userAssets.reduce((sum, asset) => sum + asset.downloads, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Downloads</div>
            </div>
          </div>
        )}

        {/* Profile Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { key: 'assets', label: 'Assets', count: userAssets.length },
                { key: 'about', label: 'About' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'assets' && (
              <div>
                {/* Assets Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {isOwnProfile ? 'Your Assets' : `${authUtils.getDisplayName(profileUser)}'s Assets`}
                  </h3>
                  
                  <div className="flex items-center space-x-3">
                    {/* View Mode Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded ${
                          viewMode === 'grid'
                            ? 'bg-white shadow text-primary-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${
                          viewMode === 'list'
                            ? 'bg-white shadow text-primary-600'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Assets Grid */}
                <AssetGrid
                  assets={userAssets}
                  loading={assetsLoading}
                  error={assetsError}
                  onAssetView={handleViewAsset}
                  variant={viewMode === 'list' ? 'compact' : 'default'}
                  emptyMessage={
                    isOwnProfile
                      ? 'You haven\'t created any assets yet'
                      : `${authUtils.getDisplayName(profileUser)} hasn't created any assets yet`
                  }
                  emptyDescription={
                    isOwnProfile
                      ? 'Start creating and sharing VR assets with the community'
                      : 'Check back later for new content'
                  }
                />
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-6">
                {/* Bio */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">About</h3>
                  <p className="text-gray-600">
                    {profileUser.bio || 'This user hasn\'t added a bio yet.'}
                  </p>
                </div>

                {/* Details */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600">
                        Joined {dateUtils.format(profileUser.createdAt, 'long')}
                      </span>
                    </div>

                    {profileUser.isVerified && (
                      <div className="flex items-center space-x-3">
                        <Shield className="w-5 h-5 text-green-500" />
                        <span className="text-green-700 font-medium">Verified Creator</span>
                      </div>
                    )}

                    {userStats && userStats.totalAssetsCreated > 0 && (
                      <div className="flex items-center space-x-3">
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-600">
                          Created {userStats.totalAssetsCreated} VR asset{userStats.totalAssetsCreated !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Asset Categories */}
                {userAssets.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Specializations</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(
                        userAssets.reduce((acc, asset) => {
                          const category = asset.metadata.category;
                          acc[category] = (acc[category] || 0) + 1;
                          return acc;
                        }, {})
                      ).map(([category, count]) => (
                        <span
                          key={category}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            ASSET_CATEGORIES[category]?.color || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {ASSET_CATEGORIES[category]?.label || category} ({count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default UserProfilePage;

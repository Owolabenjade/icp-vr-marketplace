import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Upload,
  TrendingUp,
  DollarSign,
  Eye,
  Download,
  Star,
  Calendar,
  BarChart3,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';

import { PageLayout } from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AssetGrid from '../../components/marketplace/AssetGrid';

import { 
  useAuth, 
  useMyAssets, 
  useMyListings, 
  useSalesAnalytics, 
  useAssetActions 
} from '../../hooks';
import { ROUTES } from '../../utils/constants';
import { dateUtils, icpUtils } from '../../utils/helpers';

/**
 * Creator Dashboard Page Component
 */
const CreatorDashboardPage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  
  // Hooks
  const { assets: myAssets, loading: assetsLoading, refresh: refreshAssets } = useMyAssets();
  const { listings: myListings, loading: listingsLoading } = useMyListings();
  const { analytics, loading: analyticsLoading } = useSalesAnalytics('all');

  // State
  const [timeframe, setTimeframe] = useState('all');
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(router.asPath));
    }
  }, [isAuthenticated, router]);

  const handleUploadAsset = () => {
    router.push(ROUTES.creatorUpload);
  };

  const handleViewAsset = (asset) => {
    router.push(ROUTES.asset(asset.metadata.id));
  };

  const handleEditAsset = (asset) => {
    router.push(`/creator/assets/${asset.metadata.id}/edit`);
  };

  const handleDeleteAsset = async (asset) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    
    // TODO: Implement asset deletion
    console.log('Delete asset:', asset.metadata.id);
  };

  // Calculate dashboard stats
  const dashboardStats = React.useMemo(() => {
    if (!myAssets.length) return null;

    const totalDownloads = myAssets.reduce((sum, asset) => sum + asset.downloads, 0);
    const totalViews = myAssets.reduce((sum, asset) => sum + (asset.views || 0), 0);
    const averageRating = myAssets.length > 0 
      ? myAssets.reduce((sum, asset) => sum + asset.rating, 0) / myAssets.length 
      : 0;

    return {
      totalAssets: myAssets.length,
      totalDownloads,
      totalViews,
      averageRating,
      totalEarnings: analytics?.totalRevenue || 0,
      totalSales: analytics?.totalSales || 0,
    };
  }, [myAssets, analytics]);

  if (!isAuthenticated) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <PageLayout
      title="Creator Dashboard"
      subtitle="Manage your VR assets and track your performance"
      actions={
        <Button
          variant="primary"
          onClick={handleUploadAsset}
          icon={Plus}
        >
          Upload Asset
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">
            Welcome back, {user?.username || 'Creator'}! 👋
          </h2>
          <p className="text-primary-100 mb-4">
            Ready to create something amazing? Upload your latest VR assets and share them with the world.
          </p>
          <Button
            variant="white"
            onClick={handleUploadAsset}
            icon={Upload}
            className="text-primary-600 hover:text-primary-700"
          >
            Upload New Asset
          </Button>
        </div>

        {/* Dashboard Stats */}
        {dashboardStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Assets</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStats.totalAssets}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {icpUtils.format(dashboardStats.totalEarnings)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Download className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStats.totalDownloads.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardStats.averageRating.toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={handleUploadAsset}
              icon={Upload}
              className="justify-start"
            >
              Upload New Asset
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/creator/analytics')}
              icon={BarChart3}
              className="justify-start"
            >
              View Analytics
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/transactions')}
              icon={DollarSign}
              className="justify-start"
            >
              View Earnings
            </Button>
          </div>
        </div>

        {/* Recent Sales */}
        {analytics && analytics.recentSales?.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Sales</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.recentSales.slice(0, 5).map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        {sale.asset.metadata.previewImage ? (
                          <img
                            src={sale.asset.metadata.previewImage}
                            alt={sale.asset.metadata.title}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-gray-500 text-xs font-medium">
                            {sale.asset.metadata.title.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {sale.asset.metadata.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {dateUtils.relative(sale.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">
                        +{icpUtils.format(sale.price * 0.975)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {icpUtils.format(sale.price)} gross
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* My Assets */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">My Assets</h3>
            <Button
              variant="primary"
              onClick={handleUploadAsset}
              icon={Plus}
              size="sm"
            >
              Add Asset
            </Button>
          </div>
          
          <div className="p-6">
            {assetsLoading ? (
              <div className="text-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : myAssets.length === 0 ? (
              <div className="text-center py-12">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No assets yet
                </h4>
                <p className="text-gray-600 mb-6">
                  Upload your first VR asset to start earning on the marketplace
                </p>
                <Button
                  variant="primary"
                  onClick={handleUploadAsset}
                  icon={Upload}
                >
                  Upload Your First Asset
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myAssets.map((asset) => (
                  <div
                    key={asset.metadata.id}
                    className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {/* Asset Preview */}
                    <div className="flex-shrink-0">
                      {asset.metadata.previewImage ? (
                        <img
                          src={asset.metadata.previewImage}
                          alt={asset.metadata.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500 text-xs font-medium">
                            {asset.metadata.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Asset Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {asset.metadata.title}
                      </h4>
                      <p className="text-sm text-gray-600 truncate">
                        {asset.metadata.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>Category: {asset.metadata.category}</span>
                        <span className="flex items-center space-x-1">
                          <Download className="w-3 h-3" />
                          <span>{asset.downloads}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>{asset.rating.toFixed(1)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Price and Status */}
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {asset.priceFormatted}
                      </p>
                      <p className={`text-sm ${
                        asset.isForSale ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {asset.isForSale ? 'For Sale' : 'Not Listed'}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAsset(asset)}
                        icon={Eye}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAsset(asset)}
                        icon={Edit}
                      >
                        Edit
                      </Button>
                      <button
                        onClick={() => handleDeleteAsset(asset)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Performance Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            💡 Tips to Boost Your Sales
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Add high-quality preview images to increase click-through rates</li>
            <li>• Use detailed descriptions with relevant keywords for better discoverability</li>
            <li>• Price competitively based on similar assets in your category</li>
            <li>• Update your assets regularly to maintain engagement</li>
            <li>• Respond to user feedback and improve based on ratings</li>
          </ul>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreatorDashboardPage;

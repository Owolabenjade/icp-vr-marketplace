import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Download,
  Upload,
  Calendar,
  Filter,
  Search,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react';

import { PageLayout } from '../components/layout/Layout';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';

import { useAuth, useTransactionHistory, useTransaction } from '../hooks';
import { TRANSACTION_STATUS, ROUTES } from '../utils/constants';
import { dateUtils, icpUtils } from '../utils/helpers';

/**
 * Transaction History Page Component
 */
const TransactionHistoryPage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { history, loading, error, refresh } = useTransactionHistory();

  // State
  const [filter, setFilter] = useState('all'); // 'all', 'purchases', 'sales'
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'week', 'month', 'year'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(router.asPath));
    }
  }, [isAuthenticated, router]);

  // Filter transactions
  const filteredTransactions = React.useMemo(() => {
    if (!history) return [];

    let transactions = [];

    // Combine purchases and sales
    if (filter === 'all' || filter === 'purchases') {
      transactions = [...transactions, ...history.purchases.map(p => ({ ...p, type: 'purchase' }))];
    }
    if (filter === 'all' || filter === 'sales') {
      transactions = [...transactions, ...history.sales.map(s => ({ ...s, type: 'sale' }))];
    }

    // Apply time filter
    if (timeFilter !== 'all') {
      const now = Date.now();
      const timeframeLimits = {
        'week': 7 * 24 * 60 * 60 * 1000,
        'month': 30 * 24 * 60 * 60 * 1000,
        'year': 365 * 24 * 60 * 60 * 1000,
      };

      const limit = timeframeLimits[timeFilter];
      if (limit) {
        transactions = transactions.filter(transaction =>
          (now - Number(transaction.timestamp) / 1_000_000) <= limit
        );
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      transactions = transactions.filter(transaction =>
        transaction.asset.metadata.title.toLowerCase().includes(query) ||
        transaction.asset.metadata.description.toLowerCase().includes(query)
      );
    }

    // Sort by timestamp (newest first)
    return transactions.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
  }, [history, filter, timeFilter, searchQuery]);

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);
  };

  const handleViewAsset = (assetId) => {
    router.push(ROUTES.asset(assetId));
  };

  if (!isAuthenticated) {
    return <LoadingSpinner size="lg" />;
  }

  if (loading) {
    return (
      <PageLayout title="Transaction History">
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your transactions...</p>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="Transaction History">
        <div className="text-center py-12">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Transactions</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button variant="primary" onClick={refresh}>
            Try Again
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Transaction History"
      subtitle="View your purchase and sale history"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Transactions' },
      ]}
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        {history && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Download className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                  <p className="text-2xl font-bold text-gray-900">{history.purchases.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Upload className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold text-gray-900">{history.sales.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {history.totalSpentFormatted}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Earned</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {history.totalEarnedFormatted}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Transaction Type Filter */}
            <div className="flex space-x-2">
              {[
                { value: 'all', label: 'All Transactions' },
                { value: 'purchases', label: 'Purchases' },
                { value: 'sales', label: 'Sales' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === option.value
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Time Filter */}
            <div className="flex items-center space-x-4">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Transactions Found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? 'No transactions match your search criteria'
                  : 'You haven\'t made any transactions yet'}
              </p>
              {!searchQuery && (
                <Button
                  variant="primary"
                  onClick={() => router.push(ROUTES.marketplace)}
                >
                  Browse Marketplace
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {transaction.asset.metadata.previewImage ? (
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={transaction.asset.metadata.previewImage}
                                alt={transaction.asset.metadata.title}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 text-xs font-medium">
                                  {transaction.asset.metadata.title.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {transaction.asset.metadata.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {transaction.asset.metadata.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {transaction.type === 'purchase' ? (
                            <>
                              <Download className="w-4 h-4 text-blue-500 mr-2" />
                              <span className="text-sm text-blue-700 font-medium">Purchase</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 text-green-500 mr-2" />
                              <span className="text-sm text-green-700 font-medium">Sale</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          transaction.type === 'purchase' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {transaction.type === 'purchase' ? '-' : '+'}
                          {icpUtils.format(transaction.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {dateUtils.format(transaction.timestamp, 'short')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewTransaction(transaction)}
                            icon={Eye}
                          >
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewAsset(transaction.asset.metadata.id)}
                            icon={ExternalLink}
                          >
                            Asset
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Detail Modal */}
      <Modal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        title="Transaction Details"
        size="lg"
      >
        {selectedTransaction && (
          <div className="space-y-6">
            {/* Transaction Header */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className={`p-3 rounded-full ${
                selectedTransaction.type === 'purchase' ? 'bg-blue-100' : 'bg-green-100'
              }`}>
                {selectedTransaction.type === 'purchase' ? (
                  <Download className="w-6 h-6 text-blue-600" />
                ) : (
                  <Upload className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedTransaction.type === 'purchase' ? 'Asset Purchase' : 'Asset Sale'}
                </h3>
                <p className="text-sm text-gray-500">
                  Transaction ID: {selectedTransaction.id}
                </p>
              </div>
            </div>

            {/* Asset Information */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Asset Details</h4>
              <div className="flex items-center space-x-4 p-4 border rounded-lg">
                {selectedTransaction.asset.metadata.previewImage ? (
                  <img
                    src={selectedTransaction.asset.metadata.previewImage}
                    alt={selectedTransaction.asset.metadata.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500 font-medium">
                      {selectedTransaction.asset.metadata.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900">
                    {selectedTransaction.asset.metadata.title}
                  </h5>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedTransaction.asset.metadata.description}
                  </p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>Category: {selectedTransaction.asset.metadata.category}</span>
                    <span>Format: {selectedTransaction.asset.metadata.fileFormat}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Transaction Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Date:</span>
                  <span className="text-sm font-medium">
                    {dateUtils.format(selectedTransaction.timestamp, 'long')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className={`text-sm font-medium ${
                    selectedTransaction.type === 'purchase' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {selectedTransaction.type === 'purchase' ? '-' : '+'}
                    {icpUtils.format(selectedTransaction.price)}
                  </span>
                </div>
                {selectedTransaction.type === 'purchase' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Seller:</span>
                      <span className="text-sm font-medium font-mono">
                        {selectedTransaction.seller?.toString().slice(0, 8)}...
                      </span>
                    </div>
                  </>
                )}
                {selectedTransaction.type === 'sale' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Buyer:</span>
                      <span className="text-sm font-medium font-mono">
                        {selectedTransaction.buyer?.toString().slice(0, 8)}...
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Marketplace Fee (2.5%):</span>
                      <span className="text-sm text-red-600">
                        -{icpUtils.format(selectedTransaction.price * 0.025)}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium pt-2 border-t">
                      <span className="text-sm text-gray-900">Net Earnings:</span>
                      <span className="text-sm text-green-600">
                        +{icpUtils.format(selectedTransaction.price * 0.975)}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </span>
                </div>
                {selectedTransaction.transactionHash && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Transaction Hash:</span>
                    <span className="text-sm font-mono text-blue-600">
                      {selectedTransaction.transactionHash.slice(0, 16)}...
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <Button
                variant="primary"
                onClick={() => handleViewAsset(selectedTransaction.asset.metadata.id)}
                icon={ExternalLink}
                className="flex-1"
              >
                View Asset
              </Button>
              {selectedTransaction.type === 'purchase' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    // TODO: Implement download functionality
                    console.log('Download asset:', selectedTransaction.asset.metadata.id);
                  }}
                  icon={Download}
                  className="flex-1"
                >
                  Download
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </PageLayout>
  );
};

export default TransactionHistoryPage;

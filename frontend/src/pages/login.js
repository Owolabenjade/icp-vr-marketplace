import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Sparkles, Shield, Globe, Zap } from 'lucide-react';
import { AuthLayout } from '../components/layout/Layout';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../hooks';

/**
 * Login Page Component
 */
const LoginPage = () => {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = router.query.redirect || '/marketplace';
      router.push(redirect);
    }
  }, [isAuthenticated, router]);

  const handleLogin = async () => {
    try {
      setLoginLoading(true);
      setError(null);

      const result = await login();

      if (result.success) {
        const redirect = router.query.redirect || '/marketplace';
        router.push(redirect);
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoginLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AuthLayout title="Loading...">
        <div className="text-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Welcome to VR Marketplace"
      subtitle="Sign in with Internet Identity to get started"
      showBackLink
    >
      <div className="space-y-6">
        {/* Internet Identity Login */}
        <div className="space-y-4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleLogin}
            loading={loginLoading}
            icon={Shield}
          >
            {loginLoading ? 'Connecting...' : 'Sign in with Internet Identity'}
          </Button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* What is Internet Identity */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            What is Internet Identity?
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Internet Identity is a secure, privacy-preserving authentication system
            built on the Internet Computer. No passwords, no tracking, just secure access.
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Why join VR Marketplace?</h3>

          <div className="space-y-3">
            {[
              {
                icon: Sparkles,
                title: 'Discover Amazing VR Content',
                description: 'Access thousands of high-quality VR assets from creators worldwide',
              },
              {
                icon: Shield,
                title: 'True Digital Ownership',
                description: 'Your purchases are secured on the blockchain with verifiable ownership',
              },
              {
                icon: Globe,
                title: 'Global Marketplace',
                description: 'Buy and sell anywhere in the world with no geographic restrictions',
              },
              {
                icon: Zap,
                title: 'Fair Creator Payouts',
                description: 'Creators keep 97.5% of sales with transparent, instant payments',
              },
            ].map((benefit, index) => (
              <div key={index} className="flex space-x-3">
                <div className="flex-shrink-0">
                  <benefit.icon className="w-5 h-5 text-primary-600 mt-0.5" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {benefit.title}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security Notice */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Shield className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-900">Secure & Private</span>
          </div>
          <p className="text-xs text-gray-600">
            We never store your personal data or passwords. All authentication
            is handled securely by the Internet Computer network.
          </p>
        </div>

        {/* Help Links */}
        <div className="text-center space-y-2">
          <Link href="/help/getting-started">
            <a className="block text-sm text-primary-600 hover:text-primary-500">
              Need help getting started?
            </a>
          </Link>

          <Link href="/help/internet-identity">
            <a className="block text-sm text-gray-500 hover:text-gray-700">
              Learn more about Internet Identity →
            </a>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;

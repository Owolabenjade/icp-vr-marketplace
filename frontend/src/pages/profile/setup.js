import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  User,
  ArrowRight,
  CheckCircle,
  Sparkles
} from 'lucide-react';

import { AuthLayout } from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import { useAuth, useProfile } from '../../hooks';
import { createUserSchema } from '../../utils/validation';
import { ROUTES } from '../../utils/constants';

/**
 * Profile Setup Page Component - For new users after first login
 */
const ProfileSetupPage = () => {
  const router = useRouter();
  const { isAuthenticated, user, principal } = useAuth();
  const { createProfile, loading } = useProfile();

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(createUserSchema),
    mode: 'onChange',
  });

  // Redirect if not authenticated or already has profile
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      // User already has a profile, redirect
      const redirect = router.query.redirect || ROUTES.marketplace;
      router.push(redirect);
    }
  }, [isAuthenticated, user, router]);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const result = await createProfile(data);

      if (result.success) {
        toast.success('Profile created successfully! Welcome to VR Marketplace! 🎉');
        
        // Redirect to intended destination or marketplace
        const redirect = router.query.redirect || ROUTES.marketplace;
        router.push(redirect);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Profile creation error:', error);
      toast.error('Failed to create profile. Please try again.');
    }
  };

  if (!isAuthenticated || user) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <AuthLayout
      title="Complete Your Profile"
      subtitle="Just a few details to get you started on VR Marketplace"
    >
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="text-center bg-primary-50 rounded-lg p-4">
          <Sparkles className="w-8 h-8 text-primary-600 mx-auto mb-2" />
          <h3 className="text-sm font-medium text-primary-900">
            You're almost ready!
          </h3>
          <p className="text-xs text-primary-700 mt-1">
            Complete your profile to start exploring and creating VR assets
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choose a Username *
            </label>
            <input
              {...register('username')}
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your username"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              This is how other users will see you. Choose something unique!
            </p>
          </div>

          {/* Email (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address (Optional)
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter your email address"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              We'll use this for important notifications (kept private)
            </p>
          </div>

          {/* Bio (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tell us about yourself (Optional)
            </label>
            <textarea
              {...register('bio')}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Share your interests, experience with VR, or what you plan to create..."
            />
            {errors.bio && (
              <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              This will appear on your public profile
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            disabled={!isValid}
            icon={ArrowRight}
            iconPosition="right"
          >
            {loading ? 'Creating Profile...' : 'Complete Setup'}
          </Button>
        </form>

        {/* Account Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Account Information</h4>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Authentication:</span>
              <span className="font-medium">Internet Identity</span>
            </div>
            <div className="flex justify-between">
              <span>Principal ID:</span>
              <span className="font-mono">{principal?.toString().slice(0, 16)}...</span>
            </div>
            <div className="flex justify-between">
              <span>Blockchain:</span>
              <span className="font-medium">Internet Computer</span>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">What you can do next:</h4>
          <div className="space-y-2">
            {[
              {
                icon: CheckCircle,
                text: 'Browse and purchase VR assets from creators worldwide',
              },
              {
                icon: CheckCircle,
                text: 'Upload your own VR creations and earn ICP',
              },
              {
                icon: CheckCircle,
                text: 'Build your reputation in the VR community',
              },
              {
                icon: CheckCircle,
                text: 'Track your assets and earnings in real-time',
              },
            ].map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <feature.icon className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-600">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By creating your profile, you agree to our{' '}
            <a href="/legal/terms" className="text-primary-600 hover:text-primary-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/legal/privacy" className="text-primary-600 hover:text-primary-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ProfileSetupPage;

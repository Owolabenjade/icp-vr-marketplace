import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  User,
  Save,
  Upload,
  Camera,
  X,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

import { PageLayout } from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import { useAuth, useProfile } from '../../hooks';
import { updateUserSchema } from '../../utils/validation';
import { ROUTES } from '../../utils/constants';
import { authUtils } from '../../utils/helpers';

/**
 * Profile Edit Page Component
 */
const ProfileEditPage = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { updateProfile, loading } = useProfile();

  // State
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid, isDirty }
  } = useForm({
    resolver: zodResolver(updateUserSchema),
    mode: 'onChange',
    defaultValues: {
      username: '',
      email: '',
      bio: '',
      avatar: '',
    }
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(router.asPath));
    }
  }, [isAuthenticated, router]);

  // Populate form with current user data
  useEffect(() => {
    if (user) {
      setValue('username', user.username || '');
      setValue('email', user.email || '');
      setValue('bio', user.bio || '');
      setValue('avatar', user.avatar || '');
      setAvatarPreview(user.avatar || null);
    }
  }, [user, setValue]);

  // Handle avatar file change
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setAvatarFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // Upload avatar image
  const uploadAvatar = async () => {
    if (!avatarFile) return null;

    try {
      setUploading(true);
      
      // TODO: Implement actual image upload to storage service
      // For now, we'll use a placeholder URL
      const avatarUrl = URL.createObjectURL(avatarFile);
      
      return avatarUrl;
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw new Error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      let avatarUrl = data.avatar;

      // Upload new avatar if selected
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }

      const updateData = {
        ...data,
        avatar: avatarUrl,
      };

      const result = await updateProfile(updateData);

      if (result.success) {
        toast.success('Profile updated successfully!');
        router.push(ROUTES.myProfile);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    }
  };

  // Remove avatar
  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setValue('avatar', '');
  };

  if (!isAuthenticated) {
    return <LoadingSpinner size="lg" />;
  }

  if (!user) {
    return (
      <PageLayout title="Edit Profile">
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Not Found</h3>
          <p className="text-gray-600 mb-4">Unable to load your profile information</p>
          <Button variant="primary" onClick={() => router.push('/')}>
            Go Home
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Edit Profile"
      subtitle="Update your profile information"
      breadcrumbs={[
        { label: 'Profile', href: ROUTES.myProfile },
        { label: 'Edit' },
      ]}
    >
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Profile Picture */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Picture</h3>
            
            <div className="flex items-center space-x-6">
              <div className="relative">
                <img
                  src={avatarPreview || authUtils.getAvatarUrl(user)}
                  alt="Profile picture"
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                />
                {avatarPreview && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex space-x-3">
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <label htmlFor="avatar-upload">
                      <Button
                        as="span"
                        variant="outline"
                        icon={Camera}
                        loading={uploading}
                        className="cursor-pointer"
                      >
                        {uploading ? 'Uploading...' : 'Change Photo'}
                      </Button>
                    </label>
                  </div>
                  
                  {avatarPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={removeAvatar}
                      icon={X}
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  JPG, PNG or WebP. Max size 5MB.
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            
            <div className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  {...register('username')}
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your username"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  This is how other users will see you on the platform
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter your email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Your email will be kept private and used for notifications
                </p>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  {...register('bio')}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="Tell others about yourself, your interests, and your VR creations..."
                />
                {errors.bio && (
                  <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Brief description for your profile. Maximum 500 characters.
                </p>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <span className="text-sm font-medium text-gray-900">Principal ID</span>
                  <p className="text-sm text-gray-500">Your unique Internet Computer identity</p>
                </div>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                  {user.id?.toString().slice(0, 20)}...
                </code>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <span className="text-sm font-medium text-gray-900">Account Status</span>
                  <p className="text-sm text-gray-500">Your account verification status</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.isVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.isVerified ? 'Verified' : 'Unverified'}
                </span>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <span className="text-sm font-medium text-gray-900">Member Since</span>
                  <p className="text-sm text-gray-500">When you joined the platform</p>
                </div>
                <span className="text-sm text-gray-900">
                  {new Date(Number(user.createdAt) / 1_000_000).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Privacy & Security</h3>
                <p className="mt-1 text-sm text-blue-700">
                  Your profile information is stored securely on the Internet Computer blockchain. 
                  Only information you choose to make public will be visible to other users.
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              icon={ArrowLeft}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={!isDirty || !isValid}
              icon={Save}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default ProfileEditPage;

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import {
  Upload,
  Image,
  FileText,
  Tag,
  DollarSign,
  Eye,
  Save,
  ArrowLeft,
  AlertCircle,
  Check,
  X,
  Plus,
  Trash2
} from 'lucide-react';

import { PageLayout } from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';

import { useAuth, useAssetActions, useAssetUpload, usePriceRecommendations } from '../../hooks';
import { createAssetSchema, validateFormData } from '../../utils/validation';
import { ASSET_CATEGORIES, VR_PLATFORMS, VR_FILE_FORMATS, ROUTES } from '../../utils/constants';

/**
 * Asset Upload Page Component
 */
const AssetUploadPage = () => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { createAsset, loading: creatingAsset } = useAssetActions();
  const { 
    uploadAssetFile, 
    uploadPreviewImage, 
    uploading, 
    uploadProgress,
    resetUpload 
  } = useAssetUpload();

  // Form state
  const [step, setStep] = useState(1); // 1: Asset File, 2: Preview Image, 3: Details, 4: Pricing, 5: Review
  const [assetFile, setAssetFile] = useState(null);
  const [assetUpload, setAssetUpload] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewUpload, setPreviewUpload] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Form setup
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(createAssetSchema),
    mode: 'onChange',
    defaultValues: {
      tags: [],
      compatibility: [],
      price: 5,
    }
  });

  const watchedData = watch();
  
  // Price recommendations
  const { recommendations, loading: loadingRecommendations } = usePriceRecommendations({
    category: watchedData.category
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=' + encodeURIComponent(router.asPath));
    }
  }, [isAuthenticated, router]);

  // Handle asset file upload
  const handleAssetFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setAssetFile(file);
    
    try {
      const result = await uploadAssetFile(file);
      if (result.success) {
        setAssetUpload(result.upload);
        setStep(2);
        toast.success('Asset file uploaded successfully!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to upload asset file');
    }
  };

  // Handle preview image upload
  const handlePreviewImageChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setPreviewImage(file);
    
    try {
      const result = await uploadPreviewImage(file);
      if (result.success) {
        setPreviewUpload(result.upload);
        setValue('previewImage', result.upload.url);
        setStep(3);
        toast.success('Preview image uploaded successfully!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to upload preview image');
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      if (!assetUpload) {
        toast.error('Please upload an asset file first');
        return;
      }

      const assetData = {
        ...data,
        fileHash: assetUpload.fileHash,
        downloadUrl: assetUpload.downloadUrl,
        fileSize: assetUpload.fileSize,
        fileFormat: assetFile.name.split('.').pop().toLowerCase(),
      };

      const result = await createAsset(assetData);
      
      if (result.success) {
        toast.success('Asset created successfully!');
        router.push(ROUTES.creatorDashboard);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Failed to create asset');
    }
  };

  // Add tag
  const addTag = (newTag) => {
    if (!newTag.trim()) return;
    
    const currentTags = watchedData.tags || [];
    if (currentTags.includes(newTag)) return;
    
    setValue('tags', [...currentTags, newTag.trim()]);
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    const currentTags = watchedData.tags || [];
    setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  // Add compatibility platform
  const addCompatibility = (platform) => {
    const currentPlatforms = watchedData.compatibility || [];
    if (currentPlatforms.includes(platform)) return;
    
    setValue('compatibility', [...currentPlatforms, platform]);
  };

  // Remove compatibility platform
  const removeCompatibility = (platform) => {
    const currentPlatforms = watchedData.compatibility || [];
    setValue('compatibility', currentPlatforms.filter(p => p !== platform));
  };

  // Use price recommendation
  const usePriceRecommendation = (price) => {
    setValue('price', price);
  };

  if (!isAuthenticated) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <PageLayout
      title="Upload VR Asset"
      subtitle="Share your VR creation with the world"
      breadcrumbs={[
        { label: 'Creator Dashboard', href: ROUTES.creatorDashboard },
        { label: 'Upload Asset' },
      ]}
    >
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { step: 1, label: 'Asset File', icon: Upload },
              { step: 2, label: 'Preview Image', icon: Image },
              { step: 3, label: 'Details', icon: FileText },
              { step: 4, label: 'Pricing', icon: DollarSign },
              { step: 5, label: 'Review', icon: Eye },
            ].map(({ step: stepNum, label, icon: Icon }) => (
              <div
                key={stepNum}
                className={`flex items-center ${stepNum < 5 ? 'flex-1' : ''}`}
              >
                <div className={`flex items-center space-x-2 ${
                  step >= stepNum ? 'text-primary-600' : 'text-gray-400'
                }`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step >= stepNum 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > stepNum ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-sm font-medium">{label}</span>
                </div>
                {stepNum < 5 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    step > stepNum ? 'bg-primary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Step 1: Asset File Upload */}
          {step === 1 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Upload Your VR Asset</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Choose your VR asset file
                </h3>
                <p className="text-gray-600 mb-4">
                  Supports: {VR_FILE_FORMATS.map(f => f.label).join(', ')}
                </p>
                <input
                  type="file"
                  accept={VR_FILE_FORMATS.map(f => `.${f.value}`).join(',')}
                  onChange={handleAssetFileChange}
                  className="hidden"
                  id="asset-file"
                />
                <label htmlFor="asset-file">
                  <Button
                    as="span"
                    variant="primary"
                    loading={uploading}
                    className="cursor-pointer"
                  >
                    {uploading ? `Uploading... ${uploadProgress}%` : 'Choose File'}
                  </Button>
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Maximum file size: 100MB
                </p>
              </div>

              {assetFile && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">{assetFile.name}</p>
                      <p className="text-sm text-green-700">
                        {(assetFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Preview Image Upload */}
          {step === 2 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Add Preview Image</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload a preview image
                </h3>
                <p className="text-gray-600 mb-4">
                  Help buyers visualize your asset with a compelling preview
                </p>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePreviewImageChange}
                  className="hidden"
                  id="preview-image"
                />
                <label htmlFor="preview-image">
                  <Button
                    as="span"
                    variant="primary"
                    loading={uploading}
                    className="cursor-pointer"
                  >
                    {uploading ? `Uploading... ${uploadProgress}%` : 'Choose Image'}
                  </Button>
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG, WebP up to 5MB
                </p>
              </div>

              {previewImage && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">{previewImage.name}</p>
                      <p className="text-sm text-green-700">
                        {(previewImage.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6 flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(1)}
                  icon={ArrowLeft}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(3)}
                  disabled={!previewUpload}
                >
                  Skip Preview
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Asset Details */}
          {step === 3 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Asset Details</h2>
              
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset Title *
                  </label>
                  <input
                    {...register('title')}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter a descriptive title for your VR asset"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Describe your VR asset, its features, and potential use cases"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    {...register('category')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {Object.entries(ASSET_CATEGORIES).map(([key, category]) => (
                      <option key={key} value={key}>
                        {category.label} - {category.description}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Add a tag"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addTag(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={(e) => {
                          const input = e.target.parentElement.querySelector('input');
                          addTag(input.value);
                          input.value = '';
                        }}
                        icon={Plus}
                      >
                        Add
                      </Button>
                    </div>
                    
                    {watchedData.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {watchedData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center space-x-1 bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
                          >
                            <Tag className="w-3 h-3" />
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="text-primary-600 hover:text-primary-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* VR Platform Compatibility */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VR Platform Compatibility *
                  </label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {VR_PLATFORMS.map((platform) => (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => {
                            if (watchedData.compatibility?.includes(platform)) {
                              removeCompatibility(platform);
                            } else {
                              addCompatibility(platform);
                            }
                          }}
                          className={`px-3 py-2 text-sm rounded-lg border text-center transition-colors ${
                            watchedData.compatibility?.includes(platform)
                              ? 'bg-primary-100 border-primary-300 text-primary-800'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {platform}
                        </button>
                      ))}
                    </div>
                    
                    {errors.compatibility && (
                      <p className="mt-1 text-sm text-red-600">{errors.compatibility.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(2)}
                  icon={ArrowLeft}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setStep(4)}
                  disabled={!watchedData.title || !watchedData.description || !watchedData.category || !watchedData.compatibility?.length}
                >
                  Continue to Pricing
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Pricing */}
          {step === 4 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Set Your Price</h2>
              
              <div className="space-y-6">
                {/* Price Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (ICP) *
                  </label>
                  <div className="relative">
                    <input
                      {...register('price', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>

                {/* Price Recommendations */}
                {recommendations && !loadingRecommendations && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-900 mb-3">
                      💡 Pricing Recommendations
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-700">Recommended:</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-blue-900">
                            {recommendations.recommended} ICP
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => usePriceRecommendation(recommendations.recommended)}
                          >
                            Use
                          </Button>
                        </div>
                      </div>
                      <div className="text-xs text-blue-600">
                        {recommendations.reason} (Confidence: {recommendations.confidence})
                      </div>
                    </div>
                  </div>
                )}

                {/* Pricing Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Your Earnings Breakdown
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Asset Price:</span>
                      <span className="font-medium">{watchedData.price || 0} ICP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Marketplace Fee (2.5%):</span>
                      <span className="text-red-600">
                        -{((watchedData.price || 0) * 0.025).toFixed(3)} ICP
                      </span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-medium">
                      <span>You Earn:</span>
                      <span className="text-green-600">
                        {((watchedData.price || 0) * 0.975).toFixed(3)} ICP
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(3)}
                  icon={ArrowLeft}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setStep(5)}
                  disabled={!watchedData.price || watchedData.price <= 0}
                >
                  Review & Submit
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-6">Review Your Asset</h2>
              
              <div className="space-y-6">
                {/* Asset Preview */}
                <div className="border rounded-lg p-4">
                  <div className="flex space-x-4">
                    {previewUpload ? (
                      <img
                        src={previewUpload.url}
                        alt="Asset preview"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Image className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{watchedData.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{watchedData.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Category: {ASSET_CATEGORIES[watchedData.category]?.label}</span>
                        <span>Price: {watchedData.price} ICP</span>
                        <span>File: {assetFile?.name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags and Compatibility */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {watchedData.tags?.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">VR Compatibility</h4>
                    <div className="flex flex-wrap gap-2">
                      {watchedData.compatibility?.map((platform, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Before you submit
                      </h3>
                      <ul className="mt-2 text-sm text-yellow-700 space-y-1">
                        <li>• Ensure you own all rights to this VR asset</li>
                        <li>• Verify that your asset follows our community guidelines</li>
                        <li>• Your asset will be reviewed before going live</li>
                        <li>• You'll keep 97.5% of all sales revenue</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(4)}
                  icon={ArrowLeft}
                >
                  Back
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(true)}
                  icon={Eye}
                >
                  Preview
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={creatingAsset}
                  icon={Save}
                  disabled={!isValid}
                >
                  {creatingAsset ? 'Creating Asset...' : 'Create Asset'}
                </Button>
              </div>
            </div>
          )}
        </form>

        {/* Preview Modal */}
        <Modal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title="Asset Preview"
          size="lg"
        >
          <div className="space-y-4">
            {previewUpload && (
              <img
                src={previewUpload.url}
                alt="Asset preview"
                className="w-full h-64 object-cover rounded-lg"
              />
            )}
            
            <div>
              <h3 className="text-xl font-semibold">{watchedData.title}</h3>
              <p className="text-gray-600 mt-2">{watchedData.description}</p>
            </div>
            
            <div className="flex items-center justify-between py-4 border-t">
              <span className="text-2xl font-bold text-primary-600">
                {watchedData.price} ICP
              </span>
              <Button variant="primary" disabled>
                Add to Cart
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </PageLayout>
  );
};

export default AssetUploadPage;

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
 Download, 
 Star, 
 Heart, 
 Share2, 
 Flag, 
 User,
 Calendar,
 HardDrive,
 Monitor,
 Tag,
 ShoppingCart,
 Eye,
 MessageCircle
} from 'lucide-react';
import { PageLayout } from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import AssetGrid from '../../components/marketplace/AssetGrid';
import { useAsset, useAuth, usePurchase } from '../../hooks';
import { dateUtils, fileUtils, icpUtils } from '../../utils/helpers';
import { ASSET_CATEGORIES } from '../../utils/constants';

/**
* Asset Detail Page Component
*/
const AssetDetailPage = () => {
 const router = useRouter();
 const { id } = router.query;
 const { isAuthenticated } = useAuth();
 const { purchaseAsset, purchasing } = usePurchase();
 
 const [showPurchaseModal, setShowPurchaseModal] = useState(false);
 const [showImageModal, setShowImageModal] = useState(false);
 const [selectedImageIndex, setSelectedImageIndex] = useState(0);

 // Fetch asset data
 const { asset, loading, error } = useAsset(id, true);

 if (loading) {
   return (
     <PageLayout title="Loading Asset...">
       <div className="animate-pulse">
         <div className="h-96 bg-gray-200 rounded-xl mb-8"></div>
         <div className="grid md:grid-cols-3 gap-8">
           <div className="md:col-span-2 space-y-4">
             <div className="h-8 bg-gray-200 rounded w-3/4"></div>
             <div className="h-4 bg-gray-200 rounded"></div>
             <div className="h-4 bg-gray-200 rounded w-5/6"></div>
           </div>
           <div className="space-y-4">
             <div className="h-32 bg-gray-200 rounded-xl"></div>
           </div>
         </div>
       </div>
     </PageLayout>
   );
 }

 if (error || !asset) {
   return (
     <PageLayout title="Asset Not Found">
       <div className="text-center py-12">
         <h1 className="text-2xl font-bold text-gray-900 mb-4">Asset Not Found</h1>
         <p className="text-gray-600 mb-8">The asset you're looking for doesn't exist or has been removed.</p>
         <Button onClick={() => router.push('/marketplace')}>
           Back to Marketplace
         </Button>
       </div>
     </PageLayout>
   );
 }

 const category = ASSET_CATEGORIES[asset.metadata.category];
 const isOwned = asset.isOwned || false;
 const isFree = asset.price === 0;
 const canPurchase = isAuthenticated && !isOwned && asset.isForSale;

 const handlePurchase = async () => {
   if (!isAuthenticated) {
     // Redirect to login
     router.push('/login');
     return;
   }

   const result = await purchaseAsset({
     listingId: asset.id, // This would be the listing ID in a real implementation
     paymentMethod: 'ICP',
   });

   if (result.success) {
     setShowPurchaseModal(false);
     // Refresh asset data to show ownership
     window.location.reload();
   }
 };

 const handleShare = async () => {
   if (navigator.share) {
     try {
       await navigator.share({
         title: asset.metadata.title,
         text: asset.metadata.description,
         url: window.location.href,
       });
     } catch (err) {
       console.log('Error sharing:', err);
     }
   } else {
     // Fallback: copy to clipboard
     navigator.clipboard.writeText(window.location.href);
     // Show toast notification
   }
 };

 const handleAddToWishlist = () => {
   // TODO: Implement wishlist functionality
   console.log('Add to wishlist');
 };

 const breadcrumbs = [
   { label: 'Marketplace', href: '/marketplace' },
   { label: category?.label || 'Asset', href: `/marketplace?category=${asset.metadata.category}` },
   { label: asset.metadata.title },
 ];

 const images = asset.metadata.previewImage ? [asset.metadata.previewImage] : ['/demo-assets/placeholder.jpg'];

 return (
   <PageLayout
     title={asset.metadata.title}
     description={asset.metadata.description}
     breadcrumbs={breadcrumbs}
   >
     <div className="space-y-8">
       {/* Asset Hero */}
       <div className="grid lg:grid-cols-2 gap-8">
         {/* Images */}
         <div className="space-y-4">
           <div 
             className="aspect-video bg-gray-100 rounded-xl overflow-hidden cursor-pointer group"
             onClick={() => setShowImageModal(true)}
           >
             <img
               src={images[selectedImageIndex]}
               alt={asset.metadata.title}
               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
               onError={(e) => {
                 e.target.src = '/demo-assets/placeholder.jpg';
               }}
             />
             <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
               <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
             </div>
           </div>
           
           {/* Thumbnail gallery */}
           {images.length > 1 && (
             <div className="flex space-x-2 overflow-x-auto">
               {images.map((image, index) => (
                 <button
                   key={index}
                   onClick={() => setSelectedImageIndex(index)}
                   className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                     index === selectedImageIndex ? 'border-primary-500' : 'border-gray-200'
                   }`}
                 >
                   <img
                     src={image}
                     alt={`Preview ${index + 1}`}
                     className="w-full h-full object-cover"
                   />
                 </button>
               ))}
             </div>
           )}
         </div>

         {/* Asset Info */}
         <div className="space-y-6">
           {/* Title and Category */}
           <div>
             <div className="flex items-center space-x-2 mb-2">
               <span className={`vr-badge ${category?.color}`}>
                 {category?.label}
               </span>
               {isOwned && (
                 <span className="vr-badge vr-badge-success">Owned</span>
               )}
             </div>
             <h1 className="text-3xl font-bold text-gray-900 mb-2">
               {asset.metadata.title}
             </h1>
             <div className="flex items-center space-x-4 text-sm text-gray-600">
               <div className="flex items-center space-x-1">
                 <User className="w-4 h-4" />
                 <span>by {asset.creator?.username || 'Anonymous'}</span>
               </div>
               <div className="flex items-center space-x-1">
                 <Calendar className="w-4 h-4" />
                 <span>{dateUtils.format(asset.metadata.createdAt)}</span>
               </div>
             </div>
           </div>

           {/* Price and Actions */}
           <div className="space-y-4">
             <div>
               <div className="text-3xl font-bold text-primary-600">
                 {asset.priceFormatted || 'Free'}
               </div>
               {asset.price > 0 && (
                 <div className="text-sm text-gray-600">
                   ≈ ${(icpUtils.fromE8s(asset.price) * 12).toFixed(2)} USD
                 </div>
               )}
             </div>

             <div className="flex flex-col sm:flex-row gap-3">
               {isOwned ? (
                 <Button
                   variant="success"
                   size="lg"
                   icon={Download}
                   fullWidth
                 >
                   Download Asset
                 </Button>
               ) : canPurchase ? (
                 <Button
                   variant="primary"
                   size="lg"
                   icon={ShoppingCart}
                   onClick={() => setShowPurchaseModal(true)}
                   loading={purchasing}
                   fullWidth
                 >
                   {isFree ? 'Get Free Asset' : 'Purchase Asset'}
                 </Button>
               ) : !isAuthenticated ? (
                 <Button
                   variant="primary"
                   size="lg"
                   onClick={() => router.push('/login')}
                   fullWidth
                 >
                   Sign In to Purchase
                 </Button>
               ) : (
                 <Button
                   variant="secondary"
                   size="lg"
                   disabled
                   fullWidth
                 >
                   Not Available
                 </Button>
               )}

               <div className="flex space-x-2">
                 <Button
                   variant="outline"
                   size="lg"
                   icon={Heart}
                   onClick={handleAddToWishlist}
                 />
                 <Button
                   variant="outline"
                   size="lg"
                   icon={Share2}
                   onClick={handleShare}
                 />
                 <Button
                   variant="outline"
                   size="lg"
                   icon={Flag}
                 />
               </div>
             </div>
           </div>

           {/* Stats */}
           <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-200">
             <div className="text-center">
               <div className="text-2xl font-bold text-gray-900">
                 {asset.downloads || 0}
               </div>
               <div className="text-sm text-gray-600">Downloads</div>
             </div>
             <div className="text-center">
               <div className="flex items-center justify-center space-x-1">
                 <Star className="w-5 h-5 text-yellow-400 fill-current" />
                 <span className="text-2xl font-bold text-gray-900">
                   {asset.rating ? asset.rating.toFixed(1) : '--'}
                 </span>
               </div>
               <div className="text-sm text-gray-600">Rating</div>
             </div>
             <div className="text-center">
               <div className="text-2xl font-bold text-gray-900">
                 {asset.reviewCount || 0}
               </div>
               <div className="text-sm text-gray-600">Reviews</div>
             </div>
           </div>
         </div>
       </div>

       {/* Content Tabs */}
       <div className="border-b border-gray-200">
         <nav className="flex space-x-8">
           <button className="py-2 px-1 border-b-2 border-primary-500 text-primary-600 font-medium">
             Description
           </button>
           <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
             Specifications
           </button>
           <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
             Reviews ({asset.reviewCount || 0})
           </button>
         </nav>
       </div>

       {/* Tab Content */}
       <div className="grid lg:grid-cols-3 gap-8">
         {/* Main Content */}
         <div className="lg:col-span-2 space-y-6">
           {/* Description */}
           <div>
             <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
             <div className="prose max-w-none">
               <p className="text-gray-700 leading-relaxed">
                 {asset.metadata.description}
               </p>
             </div>
           </div>

           {/* Tags */}
           {asset.metadata.tags && asset.metadata.tags.length > 0 && (
             <div>
               <h3 className="text-xl font-semibold text-gray-900 mb-4">Tags</h3>
               <div className="flex flex-wrap gap-2">
                 {asset.metadata.tags.map((tag) => (
                   <span
                     key={tag}
                     className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 cursor-pointer"
                     onClick={() => router.push(`/marketplace?search=${encodeURIComponent(tag)}`)}
                   >
                     #{tag}
                   </span>
                 ))}
               </div>
             </div>
           )}
         </div>

         {/* Sidebar */}
         <div className="space-y-6">
           {/* Technical Specifications */}
           <div className="vr-card p-6">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">
               Technical Details
             </h3>
             <div className="space-y-3">
               <div className="flex items-center justify-between">
                 <span className="text-gray-600 flex items-center space-x-2">
                   <HardDrive className="w-4 h-4" />
                   <span>File Size</span>
                 </span>
                 <span className="font-medium">
                   {fileUtils.formatSize(asset.metadata.fileSize)}
                 </span>
               </div>
               
               <div className="flex items-center justify-between">
                 <span className="text-gray-600 flex items-center space-x-2">
                   <Tag className="w-4 h-4" />
                   <span>Format</span>
                 </span>
                 <span className="font-medium uppercase">
                   {asset.metadata.fileFormat}
                 </span>
               </div>

               <div className="flex items-center justify-between">
                 <span className="text-gray-600">Created</span>
                 <span className="font-medium">
                   {dateUtils.format(asset.metadata.createdAt)}
                 </span>
               </div>

               <div className="flex items-center justify-between">
                 <span className="text-gray-600">Updated</span>
                 <span className="font-medium">
                   {dateUtils.format(asset.metadata.updatedAt)}
                 </span>
               </div>
             </div>
           </div>

           {/* VR Platform Compatibility */}
           {asset.metadata.compatibility && asset.metadata.compatibility.length > 0 && (
             <div className="vr-card p-6">
               <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                 <Monitor className="w-5 h-5" />
                 <span>VR Platform Support</span>
               </h3>
               <div className="space-y-2">
                 {asset.metadata.compatibility.map((platform) => (
                   <div key={platform} className="flex items-center space-x-2">
                     <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                     <span className="text-sm text-gray-700">{platform}</span>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {/* Creator Info */}
           <div className="vr-card p-6">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">Creator</h3>
             <div className="flex items-center space-x-3">
               <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                 <User className="w-6 h-6 text-white" />
               </div>
               <div>
                 <div className="font-medium text-gray-900">
                   {asset.creator?.username || 'Anonymous'}
                 </div>
                 <div className="text-sm text-gray-600">
                   {asset.creator?.totalAssetsCreated || 0} assets created
                 </div>
               </div>
             </div>
             <Button
               variant="outline"
               size="sm"
               className="w-full mt-4"
               onClick={() => router.push(`/creator/${asset.creator?.id}`)}
             >
               View Profile
             </Button>
           </div>
         </div>
       </div>

       {/* Related Assets */}
       <div>
         <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Assets</h2>
         <AssetGrid
           assets={[]} // TODO: Implement related assets
           loading={false}
           onAssetView={(asset) => router.push(`/asset/${asset.metadata.id}`)}
           onAssetPurchase={handlePurchase}
           emptyMessage="No related assets found"
           className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
         />
       </div>
     </div>

     {/* Purchase Confirmation Modal */}
     <Modal
       isOpen={showPurchaseModal}
       onClose={() => setShowPurchaseModal(false)}
       title="Confirm Purchase"
       footer={
         <div className="flex space-x-3">
           <Button
             variant="secondary"
             onClick={() => setShowPurchaseModal(false)}
             disabled={purchasing}
             fullWidth
           >
             Cancel
           </Button>
           <Button
             variant="primary"
             onClick={handlePurchase}
             loading={purchasing}
             fullWidth
           >
             {isFree ? 'Get Asset' : `Purchase for ${asset.priceFormatted}`}
           </Button>
         </div>
       }
     >
       <div className="space-y-4">
         <div className="flex items-center space-x-4">
           <img
             src={images[0]}
             alt={asset.metadata.title}
             className="w-16 h-16 rounded-lg object-cover"
           />
           <div>
             <h3 className="font-medium text-gray-900">{asset.metadata.title}</h3>
             <p className="text-sm text-gray-600">by {asset.creator?.username}</p>
           </div>
         </div>
         
         <div className="border-t border-gray-200 pt-4">
           <div className="flex justify-between items-center">
             <span className="text-gray-600">Price:</span>
             <span className="font-bold text-primary-600">
               {asset.priceFormatted || 'Free'}
             </span>
           </div>
           {asset.price > 0 && (
             <>
               <div className="flex justify-between items-center">
                 <span className="text-gray-600">Marketplace Fee (2.5%):</span>
                 <span className="text-gray-900">
                   {icpUtils.format(Math.floor(asset.price * 0.025))}
                 </span>
               </div>
               <div className="flex justify-between items-center font-semibold border-t pt-2">
                 <span>Total:</span>
                 <span>{asset.priceFormatted}</span>
               </div>
             </>
           )}
         </div>
         
         <div className="bg-gray-50 p-4 rounded-lg">
           <p className="text-sm text-gray-600">
             {isFree 
               ? 'This asset is free to download. You will get immediate access after confirming.'
               : 'After purchase, you will have permanent access to download this asset.'
             }
           </p>
         </div>
       </div>
     </Modal>

     {/* Image Modal */}
     <Modal
       isOpen={showImageModal}
       onClose={() => setShowImageModal(false)}
       size="xl"
       showCloseButton={true}
     >
       <div className="aspect-video">
         <img
           src={images[selectedImageIndex]}
           alt={asset.metadata.title}
           className="w-full h-full object-contain"
         />
       </div>
     </Modal>
   </PageLayout>
 );
};

export default AssetDetailPage;

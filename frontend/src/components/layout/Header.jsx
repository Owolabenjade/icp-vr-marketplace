import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
 Menu,
 X,
 Search,
 User,
 ShoppingCart,
 Heart,
 Plus,
 LogOut,
 Settings,
 BarChart3
} from 'lucide-react';
import clsx from 'clsx';
import Button from '../common/Button';
import SearchBar from '../marketplace/SearchBar';
import { ROUTES } from '../../utils/constants';

/**
* Header Component
*/
const Header = () => {
 const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
 const [profileMenuOpen, setProfileMenuOpen] = useState(false);
 const [searchQuery, setSearchQuery] = useState('');

 const router = useRouter();
 const profileMenuRef = useRef(null);

 // Mock auth state - in production, this would come from a hook
 const isAuthenticated = false; // useAuth()
 const user = null; // { username: 'creator123', avatar: '/avatar.jpg' }

 const handleSearch = (query) => {
   if (query.trim()) {
     router.push(`${ROUTES.marketplace}?search=${encodeURIComponent(query)}`);
   } else {
     router.push(ROUTES.marketplace);
   }
   setSearchQuery('');
 };

 const handleLogin = () => {
   // In production, this would trigger the auth flow
   console.log('Login clicked');
 };

 const handleLogout = () => {
   // In production, this would logout the user
   console.log('Logout clicked');
   setProfileMenuOpen(false);
 };

 // Close profile menu when clicking outside
 useEffect(() => {
   const handleClickOutside = (event) => {
     if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
       setProfileMenuOpen(false);
     }
   };

   document.addEventListener('mousedown', handleClickOutside);
   return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 // Close mobile menu on route change
 useEffect(() => {
   setMobileMenuOpen(false);
 }, [router.pathname]);

 const navigation = [
   { name: 'Marketplace', href: ROUTES.marketplace },
   { name: 'Categories', href: '/categories' },
   { name: 'Creators', href: '/creators' },
   { name: 'About', href: '/about' },
 ];

 return (
   <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
       <div className="flex items-center justify-between h-16">
         {/* Logo and main navigation */}
         <div className="flex items-center space-x-8">
           {/* Logo */}
           <Link href={ROUTES.home} className="flex items-center space-x-2">
             <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
               <span className="text-white font-bold text-sm">VR</span>
             </div>
             <span className="font-bold text-xl text-gray-900 hidden sm:block">
               VR Marketplace
             </span>
           </Link>

           {/* Desktop navigation */}
           <nav className="hidden lg:flex space-x-6">
             {navigation.map((item) => (
               <Link 
                 key={item.name} 
                 href={item.href}
                 className={clsx(
                   'text-sm font-medium transition-colors hover:text-primary-600',
                   router.pathname === item.href
                     ? 'text-primary-600'
                     : 'text-gray-700'
                 )}
               >
                 {item.name}
               </Link>
             ))}
           </nav>
         </div>

         {/* Search bar - Desktop */}
         <div className="hidden md:block flex-1 max-w-lg mx-8">
           <SearchBar
             value={searchQuery}
             onChange={setSearchQuery}
             onSearch={handleSearch}
             placeholder="Search VR assets..."
             showFilterButton={false}
             className="w-full"
           />
         </div>

         {/* Right side actions */}
         <div className="flex items-center space-x-4">
           {/* Search button - Mobile */}
           <button
             className="md:hidden p-2 text-gray-600 hover:text-gray-900"
             onClick={() => router.push('/search')}
           >
             <Search className="w-5 h-5" />
           </button>

           {isAuthenticated ? (
             <>
               {/* Creator actions */}
               <Link href="/creator/upload">
                 <Button
                   variant="outline"
                   size="sm"
                   icon={Plus}
                   className="hidden sm:flex"
                 >
                   Upload
                 </Button>
               </Link>

               {/* Wishlist */}
               <Link href="/wishlist">
                 <button className="relative p-2 text-gray-600 hover:text-gray-900">
                   <Heart className="w-5 h-5" />
                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                     3
                   </span>
                 </button>
               </Link>

               {/* Profile menu */}
               <div className="relative" ref={profileMenuRef}>
                 <button
                   onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                   className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                 >
                   {user?.avatar ? (
                     <img
                       src={user.avatar}
                       alt={user.username}
                       className="w-8 h-8 rounded-full"
                     />
                   ) : (
                     <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                       <User className="w-4 h-4 text-gray-600" />
                     </div>
                   )}
                   <span className="hidden sm:block text-sm font-medium text-gray-700">
                     {user?.username || 'User'}
                   </span>
                 </button>

                 {/* Profile dropdown */}
                 {profileMenuOpen && (
                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                     <Link 
                       href="/profile/me"
                       className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                     >
                       <User className="w-4 h-4" />
                       <span>My Profile</span>
                     </Link>

                     <Link 
                       href="/creator/dashboard"
                       className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                     >
                       <BarChart3 className="w-4 h-4" />
                       <span>Creator Dashboard</span>
                     </Link>

                     <Link 
                       href="/transactions"
                       className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                     >
                       <ShoppingCart className="w-4 h-4" />
                       <span>My Purchases</span>
                     </Link>

                     <Link 
                       href="/settings"
                       className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                     >
                       <Settings className="w-4 h-4" />
                       <span>Settings</span>
                     </Link>

                     <hr className="my-2" />

                     <button
                       onClick={handleLogout}
                       className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                     >
                       <LogOut className="w-4 h-4" />
                       <span>Sign Out</span>
                     </button>
                   </div>
                 )}
               </div>
             </>
           ) : (
             /* Guest actions */
             <div className="flex items-center space-x-2">
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={handleLogin}
               >
                 Sign In
               </Button>
               <Button
                 variant="primary"
                 size="sm"
                 onClick={handleLogin}
               >
                 Get Started
               </Button>
             </div>
           )}

           {/* Mobile menu button */}
           <button
             onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
             className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
           >
             {mobileMenuOpen ? (
               <X className="w-5 h-5" />
             ) : (
               <Menu className="w-5 h-5" />
             )}
           </button>
         </div>
       </div>
     </div>

     {/* Mobile menu */}
     {mobileMenuOpen && (
       <div className="lg:hidden border-t border-gray-200 bg-white">
         <div className="px-4 pt-4 pb-6 space-y-4">
           {/* Mobile search */}
           <div className="md:hidden">
             <SearchBar
               value={searchQuery}
               onChange={setSearchQuery}
               onSearch={handleSearch}
               placeholder="Search VR assets..."
               showFilterButton={false}
             />
           </div>

           {/* Mobile navigation */}
           <nav className="space-y-2">
             {navigation.map((item) => (
               <Link 
                 key={item.name} 
                 href={item.href}
                 className={clsx(
                   'block px-3 py-2 text-base font-medium rounded-lg',
                   router.pathname === item.href
                     ? 'bg-primary-50 text-primary-600'
                     : 'text-gray-700 hover:bg-gray-50'
                 )}
               >
                 {item.name}
               </Link>
             ))}
           </nav>

           {/* Mobile authenticated actions */}
           {isAuthenticated && (
             <div className="pt-4 border-t border-gray-200 space-y-2">
               <Link 
                 href="/creator/upload"
                 className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-50"
               >
                 <Plus className="w-5 h-5" />
                 <span>Upload Asset</span>
               </Link>

               <Link 
                 href="/wishlist"
                 className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-50"
               >
                 <Heart className="w-5 h-5" />
                 <span>Wishlist</span>
               </Link>

               <Link 
                 href="/creator/dashboard"
                 className="flex items-center space-x-3 px-3 py-2 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-50"
               >
                 <BarChart3 className="w-5 h-5" />
                 <span>Dashboard</span>
               </Link>
             </div>
           )}
         </div>
       </div>
     )}
   </header>
 );
};

export default Header;

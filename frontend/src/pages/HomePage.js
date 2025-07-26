import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Search,
  Upload,
  Shield,
  Globe,
  ArrowRight,
  Star,
  Download,
  TrendingUp,
  Users,
  Zap,
  Eye,
  Heart,
  PlayCircle,
  Box,
  Headphones,
  Palette,
  Gamepad2,
  Sparkles,
  Activity
} from 'lucide-react';

import Layout from '../components/layout/Layout';
import Button from '../components/common/Button';
import { ROUTES, ASSET_CATEGORIES, FEATURES } from '../utils/constants';

/**
 * Enhanced Modern Homepage with Refined VR Aesthetics
 */
const HomePage = () => {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (query) => {
    router.push(`${ROUTES.marketplace}?search=${encodeURIComponent(query)}`);
  };

  const handleGetStarted = () => {
    router.push('/login');
  };

  const handleBrowseMarketplace = () => {
    router.push(ROUTES.marketplace);
  };

  // Enhanced hero statistics with beautiful animations
  const heroStats = [
    {
      label: 'Total Assets',
      value: '12,847',
      icon: Box,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Creators',
      value: '3,247',
      icon: Star,
      color: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Total Sales',
      value: '₿847K ICP',
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-500'
    },
  ];

  // Enhanced categories with modern icons and descriptions
  const categories = [
    { 
      name: "Environments", 
      icon: Box, 
      count: "2,847 assets", 
      key: "Environment",
      description: "Immersive VR worlds and spaces",
      gradient: "from-blue-500 to-indigo-600"
    },
    { 
      name: "Characters", 
      icon: Gamepad2, 
      count: "1,923 assets", 
      key: "Character",
      description: "3D avatars and NPCs",
      gradient: "from-purple-500 to-violet-600"
    },
    { 
      name: "Audio", 
      icon: Headphones, 
      count: "967 assets", 
      key: "Audio",
      description: "Spatial audio and soundscapes",
      gradient: "from-pink-500 to-rose-600"
    },
    { 
      name: "Textures", 
      icon: Palette, 
      count: "4,125 assets", 
      key: "Object",
      description: "Materials and visual effects",
      gradient: "from-emerald-500 to-green-600"
    }
  ];

  const trustFeatures = [
    {
      icon: Shield,
      title: "Blockchain Security",
      description: "True ownership with blockchain verification. Your assets are yours forever.",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Zap,
      title: "Instant Payments",
      description: "Get paid instantly with ICP tokens. No waiting, no delays, no middlemen.",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: TrendingUp,
      title: "Creator First",
      description: "97.5% revenue goes to creators. The most creator-friendly marketplace in VR.",
      gradient: "from-emerald-500 to-green-500"
    }
  ];

  const featuredAssets = [
    {
      id: 1,
      title: "Cyberpunk City Environment",
      creator: "DigitalVisions",
      price: "12.5 ICP",
      rating: 4.9,
      downloads: 2847,
      category: "Environment",
      gradient: "from-purple-600 to-blue-600"
    },
    {
      id: 2,
      title: "Animated Robot Character",
      creator: "TechCreator",
      price: "8.2 ICP",
      rating: 4.8,
      downloads: 1923,
      category: "Character",
      gradient: "from-pink-600 to-purple-600"
    },
    {
      id: 3,
      title: "VR Interface Elements Pack",
      creator: "UIExpert",
      price: "15.0 ICP",
      rating: 5.0,
      downloads: 3564,
      category: "UI/UX",
      gradient: "from-blue-600 to-cyan-600"
    }
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Modern Header */}
      <header className="relative border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
        <div className="relative container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-gradient-vr">
                ICP VR Nexus
              </h1>
              <nav className="hidden md:flex space-x-8">
                <Link href={ROUTES.marketplace} className="text-gray-300 hover:text-white transition-colors duration-300 font-medium">
                  Marketplace
                </Link>
                <Link href="/creator" className="text-gray-300 hover:text-white transition-colors duration-300 font-medium">
                  Create
                </Link>
                <Link href="/community" className="text-gray-300 hover:text-white transition-colors duration-300 font-medium">
                  Community
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn-outline-vr px-6 py-2.5 text-sm">Connect Wallet</button>
              <button className="btn-vr px-6 py-2.5 text-sm text-white">Get Started</button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Enhanced Design */}
      <section className="relative py-24 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative container mx-auto px-6 text-center">
          <div className="animate-fade-in">
            <h2 className="text-6xl md:text-8xl font-black mb-8 text-gradient-vr leading-tight">
              The Future of VR
              <br />
              <span className="text-white">Asset Trading</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              Discover, buy, and sell premium VR assets on the first fully decentralized marketplace.
              True blockchain ownership, instant payments, and 97.5% creator revenue.
            </p>

            {/* Enhanced Search Bar */}
            <div className="max-w-3xl mx-auto mb-16 animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="relative glass-card rounded-3xl p-2">
                <div className="flex items-center">
                  <Search className="absolute left-6 text-gray-400 w-6 h-6" />
                  <input
                    type="text"
                    placeholder="Search VR environments, characters, audio..."
                    className="w-full pl-16 pr-6 py-4 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch(e.target.value);
                      }
                    }}
                  />
                  <button 
                    className="btn-vr px-8 py-3 text-white font-semibold"
                    onClick={() => {
                      const input = document.querySelector('input[placeholder*="Search VR"]');
                      if (input) handleSearch(input.value);
                    }}
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20 animate-slide-up" style={{animationDelay: '0.4s'}}>
              <button 
                className="btn-vr px-10 py-4 text-lg text-white font-semibold"
                onClick={handleBrowseMarketplace}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Explore Marketplace
              </button>
              <button 
                className="btn-outline-vr px-10 py-4 text-lg font-semibold"
                onClick={handleGetStarted}
              >
                <Upload className="w-5 h-5 mr-2" />
                Start Creating
              </button>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-slide-up" style={{animationDelay: '0.6s'}}>
              {heroStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="stats-card group">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                    <div className="text-gray-400 font-medium">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Categories Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h3 className="text-5xl font-bold text-white mb-6">Browse by Category</h3>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Discover amazing VR content across different categories
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div 
                  key={index} 
                  className="category-card group animate-scale-in" 
                  style={{animationDelay: `${index * 0.1}s`}}
                >
                  <div className={`icon bg-gradient-to-r ${category.gradient}`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">{category.name}</h4>
                  <p className="text-sm text-gray-400 mb-3">{category.description}</p>
                  <p className="text-sm font-semibold text-gradient-vr">{category.count}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Featured Assets Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-16 animate-fade-in">
            <div>
              <h3 className="text-5xl font-bold text-white mb-4">Featured Assets</h3>
              <p className="text-xl text-gray-400">Hand-picked VR assets from top creators</p>
            </div>
            <button 
              className="btn-outline-vr px-6 py-3 font-semibold"
              onClick={handleBrowseMarketplace}
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredAssets.map((asset, index) => (
              <div 
                key={asset.id} 
                className="asset-card group animate-slide-up" 
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className={`image-container bg-gradient-to-br ${asset.gradient} relative`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlayCircle className="w-16 h-16 text-white/70 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-black/30 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/20">
                      {asset.category}
                    </span>
                  </div>
                  <button className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-sm rounded-full text-white/70 hover:text-red-400 transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="p-6">
                  <h4 className="text-xl font-bold text-white mb-2 group-hover:text-gradient-vr transition-colors">
                    {asset.title}
                  </h4>
                  <p className="text-gray-400 mb-4">by {asset.creator}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{asset.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download className="w-4 h-4" />
                        <span>{asset.downloads.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-gradient-vr">{asset.price}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Trust Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="relative container mx-auto px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h3 className="text-5xl font-bold text-white mb-6">Why Choose ICP VR Nexus?</h3>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience the next generation of digital asset trading with cutting-edge technology
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trustFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="text-center p-8 rounded-3xl glass-card group animate-scale-in hover:scale-105 transition-all duration-500"
                style={{animationDelay: `${index * 0.2}s`}}
              >
                <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-10 w-10 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-4">{feature.title}</h4>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center glass-card rounded-3xl p-12 animate-fade-in">
            <div className="mb-8">
              <Activity className="w-16 h-16 mx-auto mb-6 text-gradient-vr" />
              <h3 className="text-4xl font-bold text-white mb-4">Stay in the loop</h3>
              <p className="text-xl text-gray-400">
                Get the latest VR assets, creator spotlights, and marketplace updates delivered to your inbox.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 transition-colors backdrop-blur-sm"
              />
              <button className="btn-vr px-8 py-4 text-white font-semibold">
                Subscribe
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              No spam. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="relative border-t border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="relative container mx-auto px-6 py-16">
          {/* Footer Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="text-white font-bold mb-4">MARKETPLACE</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">Browse Assets</Link>
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">Categories</Link>
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">Featured</Link>
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">New Releases</Link>
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">Free Assets</Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">CREATORS</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">Start Selling</Link>
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">Creator Guide</Link>
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">Upload Assets</Link>
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">Creator Dashboard</Link>
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">Pricing Guide</Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">SUPPORT</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">Help Center</Link>
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">Getting Started</Link>
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">Buying Guide</Link>
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">Contact Us</Link>
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">API Documentation</Link>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-4">COMPANY</h4>
              <div className="space-y-2">
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">About Us</Link>
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">Blog</Link>
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">Careers</Link>
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">Press Kit</Link>
                <Link href="#" className="block text-gray-400 hover:text-white transition-colors">Partner Program</Link>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-white/10">
            <div className="text-center">
              <div className="text-4xl font-black text-gradient-vr mb-2">10K+</div>
              <div className="text-gray-400">VR Assets</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-gradient-vr mb-2">2K+</div>
              <div className="text-gray-400">Creators</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-gradient-vr mb-2">50K+</div>
              <div className="text-gray-400">Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-gradient-vr mb-2">100%</div>
              <div className="text-gray-400">Decentralized</div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-8">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold">VR</span>
              </div>
              <div>
                <div className="text-white font-bold">VR Marketplace</div>
                <div className="text-sm text-gray-400">The decentralized marketplace for VR assets</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-400">
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Community Guidelines</Link>
              <div className="flex items-center space-x-2">
                <span>Built on</span>
                <Link href="#" className="text-gradient-vr font-semibold hover:underline">Internet Computer</Link>
              </div>
            </div>
          </div>

          <div className="text-center pt-8 border-t border-white/10 mt-8">
            <p className="text-gray-500">
              © 2025 VR Marketplace. All rights reserved. | 
              <span className="text-gradient-vr"> Made with ❤️ by Benjamin Owolabi & Edozie Obidile</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;

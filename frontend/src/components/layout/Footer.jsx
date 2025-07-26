import React from 'react';
import Link from 'next/link';
import {
  Twitter,
  Github,
  MessageCircle,
  Mail,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import Button from '../common/Button';
import { ROUTES, SOCIAL_LINKS } from '../../utils/constants';

/**
 * Footer Component
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Marketplace',
      links: [
        { name: 'Browse Assets', href: ROUTES.marketplace },
        { name: 'Categories', href: '/categories' },
        { name: 'Featured', href: '/featured' },
        { name: 'New Releases', href: '/new' },
        { name: 'Free Assets', href: '/free' },
      ],
    },
    {
      title: 'Creators',
      links: [
        { name: 'Start Selling', href: '/creator/upload' },
        { name: 'Creator Guide', href: '/help/selling-guide' },
        { name: 'Upload Assets', href: '/creator/upload' },
        { name: 'Creator Dashboard', href: '/creator/dashboard' },
        { name: 'Pricing Guide', href: '/pricing-guide' },
      ],
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help/faq' },
        { name: 'Getting Started', href: '/help/getting-started' },
        { name: 'Buying Guide', href: '/help/buying-guide' },
        { name: 'Contact Us', href: '/help/support' },
        { name: 'API Documentation', href: '/help/api' },
      ],
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Blog', href: '/blog' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press Kit', href: '/press' },
        { name: 'Partner Program', href: '/partners' },
      ],
    },
  ];

  const socialLinks = [
    {
      name: 'Twitter',
      href: SOCIAL_LINKS.twitter,
      icon: Twitter,
    },
    {
      name: 'Discord',
      href: SOCIAL_LINKS.discord,
      icon: MessageCircle,
    },
    {
      name: 'GitHub',
      href: SOCIAL_LINKS.github,
      icon: Github,
    },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div>
              <h3 className="text-2xl font-bold">Stay in the loop</h3>
              <p className="mt-2 text-gray-400 max-w-md">
                Get the latest VR assets, creator spotlights, and marketplace updates delivered to your inbox.
              </p>
            </div>

            <div className="mt-6 lg:mt-0 lg:ml-8">
              <form className="flex max-w-md">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="rounded-l-none"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Subscribe
                </Button>
              </form>
              <p className="mt-2 text-xs text-gray-500">
                No spam. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* VR Platform stats */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-primary-400">10K+</div>
              <div className="text-sm text-gray-400">VR Assets</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-400">2K+</div>
              <div className="text-sm text-gray-400">Creators</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-400">50K+</div>
              <div className="text-sm text-gray-400">Downloads</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary-400">100%</div>
              <div className="text-sm text-gray-400">Decentralized</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="md:flex md:items-center md:justify-between">
            {/* Logo and description */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">VR</span>
                </div>
                <span className="font-bold text-lg">VR Marketplace</span>
              </div>
              <div className="hidden sm:block text-gray-400 text-sm">
                The decentralized marketplace for VR assets
              </div>
            </div>

            {/* Social links */}
            <div className="mt-4 md:mt-0 flex items-center space-x-6">
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={social.name}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>

              {/* ICP Badge */}
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <span>Built on</span>
                <a
                  href="https://internetcomputer.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-primary-400 hover:text-primary-300 transition-colors"
                >
                  <span className="font-medium">Internet Computer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright and legal */}
          <div className="mt-6 pt-6 border-t border-gray-800 md:flex md:items-center md:justify-between text-sm text-gray-400">
            <div className="flex flex-wrap space-x-6">
              <span>&copy; {currentYear} VR Marketplace. All rights reserved.</span>
              <Link 
                href="/legal/terms"
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link 
                href="/legal/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/legal/community-guidelines"
                className="hover:text-white transition-colors"
              >
                Community Guidelines
              </Link>
            </div>

            <div className="mt-4 md:mt-0 flex items-center space-x-4 text-xs">
              <span>Made with ❤️ by Benjamin Owolabi & Edozie Obidile</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

/**
 * Minimal Footer for focused pages
 */
export const MinimalFooter = () => (
  <footer className="bg-white border-t border-gray-200">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-primary-500 to-accent-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-xs">VR</span>
          </div>
          <span className="font-medium text-gray-900">VR Marketplace</span>
        </div>

        <div className="text-sm text-gray-500">
          &copy; {new Date().getFullYear()} VR Marketplace
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;

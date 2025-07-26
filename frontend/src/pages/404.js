import React from 'react';
import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { ErrorLayout } from '../components/layout/Layout';
import Button from '../components/common/Button';

/**
 * 404 Error Page
 */
const Custom404 = () => {
  return (
    <ErrorLayout
      statusCode={404}
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="primary" icon={Home}>
              Go Home
            </Button>
          </Link>
          
          <Link href="/marketplace">
            <Button variant="outline" icon={Search}>
              Browse Marketplace
            </Button>
          </Link>
        </div>
        
        <div className="text-center">
          <button 
            onClick={() => window.history.back()}
            className="inline-flex items-center space-x-1 text-primary-600 hover:text-primary-500 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go back</span>
          </button>
        </div>
      </div>
    </ErrorLayout>
  );
};

export default Custom404;

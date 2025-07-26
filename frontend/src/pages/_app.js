import '../styles/globals.css';
import { AuthProvider } from '../hooks/useAuth';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isClientSide, setIsClientSide] = useState(false);

  // Ensure we're on the client side before initializing ICP services
  useEffect(() => {
    setIsClientSide(true);
    
    // Initialize ICP service in development only after client-side hydration
    if (process.env.NODE_ENV === 'development') {
      // Dynamic import to avoid SSR issues
      import('../services/icp').then(({ dev }) => {
        if (dev && typeof dev.enableDebug === 'function') {
          dev.enableDebug();
        }
      }).catch(error => {
        console.warn('Failed to enable ICP debug mode:', error);
      });
    }
  }, []);

  // Handle route changes for analytics (placeholder)
  useEffect(() => {
    const handleRouteChange = (url) => {
      // Analytics tracking would go here
      console.log('Route changed to:', url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  // Don't render until client-side hydration is complete
  // This prevents SSR/hydration mismatches with ICP services
  if (!isClientSide) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;

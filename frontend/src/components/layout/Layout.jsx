import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Toaster } from 'react-hot-toast';
import Header from './Header';
import Footer, { MinimalFooter } from './Footer';
import { APP_METADATA } from '../../utils/constants';

/**
* Main Layout Component
*/
const Layout = ({
 children,
 title,
 description,
 keywords,
 image,
 canonical,
 noIndex = false,
 minimal = false,
 hideHeader = false,
 hideFooter = false,
 className,
}) => {
 const siteTitle = title ? `${title} | ${APP_METADATA.name}` : APP_METADATA.name;
 const siteDescription = description || APP_METADATA.description;
 const siteImage = image || APP_METADATA.image;
 const siteUrl = typeof window !== 'undefined' ? window.location.origin : APP_METADATA.url;
 const canonicalUrl = canonical || (typeof window !== 'undefined' ? window.location.href : siteUrl);

 return (
   <>
     <Head>
       {/* Primary Meta Tags */}
       <title>{siteTitle}</title>
       <meta name="title" content={siteTitle} />
       <meta name="description" content={siteDescription} />
       <meta name="keywords" content={keywords || APP_METADATA.keywords.join(', ')} />
       <meta name="author" content={APP_METADATA.author} />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />

       {/* Canonical URL */}
       <link rel="canonical" href={canonicalUrl} />

       {/* Robots */}
       {noIndex && <meta name="robots" content="noindex, nofollow" />}

       {/* Open Graph / Facebook */}
       <meta property="og:type" content="website" />
       <meta property="og:url" content={canonicalUrl} />
       <meta property="og:title" content={siteTitle} />
       <meta property="og:description" content={siteDescription} />
       <meta property="og:image" content={siteImage} />
       <meta property="og:site_name" content={APP_METADATA.name} />

       {/* Twitter */}
       <meta property="twitter:card" content="summary_large_image" />
       <meta property="twitter:url" content={canonicalUrl} />
       <meta property="twitter:title" content={siteTitle} />
       <meta property="twitter:description" content={siteDescription} />
       <meta property="twitter:image" content={siteImage} />

       {/* Favicons */}
       <link rel="icon" type="image/x-icon" href="/favicon.ico" />
       <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
       <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
       <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />

       {/* Theme */}
       <meta name="theme-color" content="#3B82F6" />
       <meta name="msapplication-TileColor" content="#3B82F6" />

       {/* Preconnect to external domains */}
       <link rel="preconnect" href="https://fonts.googleapis.com" />
       <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
     </Head>

     <div className="min-h-screen flex flex-col bg-gray-50">
       {/* Header */}
       {!hideHeader && <Header />}

       {/* Main Content */}
       <main className={`flex-1 ${className || ''}`}>
         {children}
       </main>

       {/* Footer */}
       {!hideFooter && (minimal ? <MinimalFooter /> : <Footer />)}

       {/* Toast Notifications */}
       <Toaster
         position="top-right"
         toastOptions={{
           duration: 4000,
           style: {
             background: '#fff',
             color: '#374151',
             border: '1px solid #E5E7EB',
             borderRadius: '8px',
             fontSize: '14px',
           },
           success: {
             style: {
               border: '1px solid #10B981',
             },
             iconTheme: {
               primary: '#10B981',
               secondary: '#fff',
             },
           },
           error: {
             style: {
               border: '1px solid #EF4444',
             },
             iconTheme: {
               primary: '#EF4444',
               secondary: '#fff',
             },
           },
         }}
       />
     </div>
   </>
 );
};

/**
* Page Layout with common page structure
*/
export const PageLayout = ({
 children,
 title,
 subtitle,
 actions,
 breadcrumbs,
 className,
 ...layoutProps
}) => (
 <Layout {...layoutProps}>
   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
     {/* Breadcrumbs */}
     {breadcrumbs && (
       <nav className="mb-6">
         <ol className="flex items-center space-x-2 text-sm text-gray-600">
           {breadcrumbs.map((crumb, index) => (
             <li key={index} className="flex items-center">
               {index > 0 && <span className="mx-2">/</span>}
               {crumb.href ? (
                 <Link 
                   href={crumb.href}
                   className="hover:text-primary-600"
                 >
                   {crumb.label}
                 </Link>
               ) : (
                 <span className="text-gray-900">{crumb.label}</span>
               )}
             </li>
           ))}
         </ol>
       </nav>
     )}

     {/* Page header */}
     {(title || subtitle || actions) && (
       <div className="mb-8">
         <div className="flex items-center justify-between">
           <div>
             {title && (
               <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
             )}
             {subtitle && (
               <p className="mt-2 text-lg text-gray-600">{subtitle}</p>
             )}
           </div>
           {actions && <div className="flex space-x-3">{actions}</div>}
         </div>
       </div>
     )}

     {/* Page content */}
     <div className={className}>{children}</div>
   </div>
 </Layout>
);

/**
* Dashboard Layout for creator/admin pages
*/
export const DashboardLayout = ({
 children,
 title,
 sidebar,
 className,
 ...layoutProps
}) => (
 <Layout {...layoutProps}>
   <div className="flex h-full">
     {/* Sidebar */}
     {sidebar && (
       <div className="hidden lg:flex lg:flex-shrink-0">
         <div className="flex flex-col w-64 bg-white border-r border-gray-200">
           {sidebar}
         </div>
       </div>
     )}

     {/* Main content */}
     <div className="flex-1 overflow-hidden">
       <div className="h-full overflow-y-auto">
         {title && (
           <div className="bg-white border-b border-gray-200 px-6 py-4">
             <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
           </div>
         )}
         <div className={`p-6 ${className || ''}`}>
           {children}
         </div>
       </div>
     </div>
   </div>
 </Layout>
);

/**
* Auth Layout for login/signup pages
*/
export const AuthLayout = ({
 children,
 title,
 subtitle,
 showBackLink = false,
 className,
 ...layoutProps
}) => (
 <Layout
   minimal
   hideHeader
   hideFooter
   className="bg-gray-50"
   {...layoutProps}
 >
   <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
     {/* Header */}
     <div className="sm:mx-auto sm:w-full sm:max-w-md">
       <div className="flex justify-center">
         <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
           <span className="text-white font-bold text-lg">VR</span>
         </div>
       </div>

       {title && (
         <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
           {title}
         </h2>
       )}

       {subtitle && (
         <p className="mt-2 text-center text-sm text-gray-600">
           {subtitle}
         </p>
       )}

       {showBackLink && (
         <div className="mt-4 text-center">
           <Link 
             href="/"
             className="text-sm text-primary-600 hover:text-primary-500"
           >
             ← Back to homepage
           </Link>
         </div>
       )}
     </div>

     {/* Content */}
     <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
       <div className={`bg-white py-8 px-4 shadow rounded-lg sm:px-10 ${className || ''}`}>
         {children}
       </div>
     </div>

     {/* Footer */}
     <div className="mt-8 text-center text-sm text-gray-600">
       <p>&copy; {new Date().getFullYear()} VR Marketplace. All rights reserved.</p>
     </div>
   </div>
 </Layout>
);

/**
* Error Layout for error pages
*/
export const ErrorLayout = ({
 children,
 statusCode,
 title,
 message,
 showHomeLink = true,
 className,
 ...layoutProps
}) => (
 <Layout
   title={`${statusCode ? `${statusCode} - ` : ''}${title || 'Error'}`}
   noIndex
   className="bg-white"
   {...layoutProps}
 >
   <div className="min-h-screen flex flex-col justify-center items-center px-4">
     <div className={`text-center max-w-lg ${className || ''}`}>
       {statusCode && (
         <div className="text-6xl font-bold text-primary-600 mb-4">
           {statusCode}
         </div>
       )}

       {title && (
         <h1 className="text-3xl font-bold text-gray-900 mb-4">
           {title}
         </h1>
       )}

       {message && (
         <p className="text-lg text-gray-600 mb-8">
           {message}
         </p>
       )}

       <div className="space-y-4">
         {children}

         {showHomeLink && (
           <div>
             <Link 
               href="/"
               className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
             >
               Go back home
             </Link>
           </div>
         )}
       </div>
     </div>
   </div>
 </Layout>
);

/**
* Fullscreen Layout for immersive experiences
*/
export const FullscreenLayout = ({
 children,
 className,
 ...layoutProps
}) => (
 <Layout
   hideHeader
   hideFooter
   className={`bg-black ${className || ''}`}
   {...layoutProps}
 >
   <div className="h-screen w-screen overflow-hidden">
     {children}
   </div>
 </Layout>
);

export default Layout;

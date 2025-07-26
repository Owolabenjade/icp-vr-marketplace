import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          as="style"
          onLoad="this.onload=null;this.rel='stylesheet'"
        />
        <noscript>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          />
        </noscript>
        
        {/* Critical CSS for loading states */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .loading-screen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: #f9fafb;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
              }
              .loading-spinner {
                width: 40px;
                height: 40px;
                border: 4px solid #e5e7eb;
                border-top: 4px solid #3b82f6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
              }
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `,
          }}
        />
      </Head>
      <body>
        {/* Loading screen for initial load */}
        <div id="loading-screen" className="loading-screen">
          <div className="loading-spinner"></div>
        </div>
        
        <Main />
        <NextScript />
        
        {/* Remove loading screen after page loads */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.addEventListener('DOMContentLoaded', function() {
                const loadingScreen = document.getElementById('loading-screen');
                if (loadingScreen) {
                  setTimeout(() => {
                    loadingScreen.style.opacity = '0';
                    setTimeout(() => {
                      loadingScreen.remove();
                    }, 300);
                  }, 500);
                }
              });
            `,
          }}
        />
      </body>
    </Html>
  );
}

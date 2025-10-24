import type React from "react"
import "./theme.css"
import "@coinbase/onchainkit/styles.css"
import type { Viewport } from "next"
import "./globals.css"
import { Providers } from "./providers"
import { Toaster } from "./components/ui/toaster" // 👈 add this

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const title = process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "Random Character Generator"
  const description = process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Mint Your Random Parts. Collect. Make collections. Exchange. Get License Fees"
  const URL = process.env.NEXT_PUBLIC_URL || "https://deedisco-minikit-app.vercel.app"
  const heroImage = process.env.NEXT_PUBLIC_APP_HERO_IMAGE || "https://deedisco-minikit-app.vercel.app/hero.png"
  const splashImage = process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE || "https://deedisco-minikit-app.vercel.app/splash.png"
  const splashBackground = process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "#1a1a1a"

  const frameEmbed = {
    version: "next",
    imageUrl: heroImage,
    button: {
      title: "Start",
      action: {
        type: "launch_frame",
        name: title,
        url: URL,
        splashImageUrl: splashImage,
        splashBackgroundColor: splashBackground,
      },
    },
  }

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,100..900;1,9..144,100..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <title>{title}</title>
        <meta name="description" content={description} />

        {/* ✅ CORRECT Frame Embed Meta Tag for Farcaster */}
        <meta name="fc:frame" content={JSON.stringify(frameEmbed)} />
        
        {/* Additional Farcaster Frame meta tags */}
        <meta property="fc:frame" content={JSON.stringify(frameEmbed)} />
        <meta name="farcaster:frame" content={JSON.stringify(frameEmbed)} />

        {/* Open Graph tags */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={process.env.NEXT_PUBLIC_APP_OG_IMAGE || heroImage} />
        <meta property="og:url" content={URL} />
        <meta property="og:type" content="website" />

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={process.env.NEXT_PUBLIC_APP_OG_IMAGE || heroImage} />
      </head>
      <body className="bg-[#1a1a1a]">
        <Providers>{children}</Providers>
        <Toaster /> {/* 👈 mount once so useToast() toasts are visible */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Farcaster Frame SDK ready() call
              (function() {
                console.log('🚀 Initializing Farcaster Frame ready() call');
                
                function callReady() {
                  console.log('🚀 Attempting to call ready() for Farcaster');
                  
                  // Method 1: Try window.farcaster.ready()
                  if (window.farcaster && typeof window.farcaster.ready === 'function') {
                    window.farcaster.ready();
                    console.log('✅ Called window.farcaster.ready()');
                    return;
                  }
                  
                  // Method 2: Try parent.farcaster.ready()
                  if (window.parent && window.parent.farcaster && typeof window.parent.farcaster.ready === 'function') {
                    window.parent.farcaster.ready();
                    console.log('✅ Called parent.farcaster.ready()');
                    return;
                  }
                  
                  // Method 3: PostMessage approach
                  try {
                    window.parent.postMessage({ type: 'ready', source: 'farcaster-frame' }, '*');
                    console.log('✅ Sent ready postMessage');
                  } catch (e) {
                    console.log('❌ PostMessage failed:', e);
                  }
                  
                  // Method 4: Try to access global SDK
                  if (typeof window !== 'undefined' && window.farcaster) {
                    try {
                      window.farcaster.ready();
                      console.log('✅ Called global farcaster.ready()');
                    } catch (e) {
                      console.log('❌ Global farcaster.ready() failed:', e);
                    }
                  }
                }
                
                // Call ready immediately and on load
                callReady();
                window.addEventListener('load', callReady);
                document.addEventListener('DOMContentLoaded', callReady);
                
                // Also try after a short delay
                setTimeout(callReady, 100);
                setTimeout(callReady, 500);
                setTimeout(callReady, 1000);
              })();
            `,
          }}
        />
      </body>
    </html>
  )
}

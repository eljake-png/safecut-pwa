### File `src/app/providers.tsx`

```tsx
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { ChainId, EmbeddedWalletConnector } from "@thirdweb-dev/sdk";
import React from "react";

const activeChainIds = [ChainId.PolygonAmoyTestnet, ChainId.PolygonMainnet];

const embeddedWalletOptions = {
  authUrl: "/api/auth", // Your backend authentication URL
};

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThirdwebProvider
      activeChain={activeChainIds}
      clientId="YOUR_CLIENT_ID" // Replace with your Thirdweb Client ID
      supportedWallets={[
        new EmbeddedWalletConnector(embeddedWalletOptions),
      ]}
      theme={{
        isDarkMode: true, // Enable dark mode
      }}
    >
      {children}
    </ThirdwebProvider>
  );
}
```

### File `src/app/layout.tsx`

```tsx
import Providers from "./providers";
import "../styles/globals.css"; // Ensure you have a global CSS file for styling

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Safecut PWA</title>
        <meta name="description" content="Safecut PWA with Thirdweb Integration" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-gray-900 text-white"> {/* Dark mode styling */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

### Explanation:
1. **`providers.tsx`**:
   - The `ThirdwebProvider` is configured to support both Polygon Amoy Testnet and Polygon Mainnet.
   - An `EmbeddedWalletConnector` is set up for seamless login via email/Google.
   - Dark mode is enabled by setting `isDarkMode: true` in the theme configuration.

2. **`layout.tsx`**:
   - The `Providers` component wraps the entire application, ensuring that all components have access to the Thirdweb context.
   - Basic HTML structure with a dark mode background and white text for consistency with the dark theme.

Ensure you replace `"YOUR_CLIENT_ID"` with your actual Thirdweb Client ID. Also, make sure your backend is set up to handle authentication at the specified `authUrl`.
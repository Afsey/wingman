import type { Metadata } from "next";
import "./globals.css";
import FluidBackground from "./components/FluidBackground";

export const metadata: Metadata = {
  title: "Project Wingman",
  description: "A platform to unify day-to-day activities with AI integration",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="theme-initializer"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('wingman_theme') || 'default';
                document.documentElement.setAttribute('data-theme', theme);
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body>
        <FluidBackground />
        {children}
      </body>
    </html>
  );
}


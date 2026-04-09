// PURPOSE: Root HTML shell with fonts, theme, auth session, and global toasts.

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { authSafe } from "@/lib/auth";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Nexus Commerce";

export const metadata: Metadata = {
  title: appName,
  description: "Multi-tenant ecommerce, admin dashboard, and point of sale.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await authSafe();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} min-h-screen bg-background font-sans antialiased`} suppressHydrationWarning>
        <SessionProvider session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="top-center" />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from '@/contexts/LanguageContext';
import { CartProvider } from '@/contexts/CartContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ClientLayout } from '@/components/layout/ClientLayout';
import SessionProvider from '@/components/providers/SessionProvider';
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sultan Store - Your Online Store",
  description: "Discover amazing products at great prices. Shop electronics, fashion, home goods and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <RootContent>{children}</RootContent>
    </LanguageProvider>
  );
}

function RootContent({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <AuthProvider>
            <CartProvider>
              <ClientLayout>
                {children}
              </ClientLayout>
            </CartProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

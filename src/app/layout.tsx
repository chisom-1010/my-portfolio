// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthButton } from "@/src/components/auth-button";
import { ThemeProvider } from "@/src/components/theme-provider";
import { Toaster } from "react-hot-toast";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "My Awesome Portfolio",
  description: "A portfolio built with Next.js and Supabase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center px-4">
              <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
                <Link href="/" className="text-lg font-bold">
                  My Portfolio
                </Link>
                {/* Add other global nav links here if any */}
              </nav>
              <div className="flex flex-1 items-center justify-end space-x-2">
                <AuthButton />
              </div>
            </div>
          </header>
          <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
          <Toaster position="top-center" reverseOrder={false} />{" "}
          {/* <-- Add Toaster here */}
        </ThemeProvider>
      </body>
    </html>
  );
}

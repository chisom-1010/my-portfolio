// src/app/layout.tsx
import { GeistSans } from "geist/font/sans";
import "./globals.css"; // Your global styles
import { createClient } from "@/src/lib/supabase/server";
import { AuthButton } from "@/src/components/auth-button";
import AuthGuard from "@/src/components/auth-guard";
import Link from "next/link";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Obiajulu Chisom Chikamso - Full-Stack Portfolio",
  description: "A dynamic portfolio showcasing my projects and skills.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch user on the server to pass to AuthGuard if needed
  // (This fetch is primarily for the AuthButton and initial server render)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" className={GeistSans.className}>
      <body className="bg-background text-foreground min-h-screen flex flex-col">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
            <Link href="/" className="font-bold text-lg">
              Obiajulu Chisom Chikamso
            </Link>
            <AuthButton />
          </div>
        </nav>
        <main className="flex-1 flex flex-col items-center">{children}</main>
        <AuthGuard serverUser={user} />
      </body>
    </html>
  );
}

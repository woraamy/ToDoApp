// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import Navbar from "@/components/Navbar";// Import the Navbar component
import "./globals.css"; // Assuming Tailwind setup

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Todo App",
  description: "A simple todo application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} flex flex-col min-h-screen`}> {/* Make body flex column */}
          <Navbar /> {/* Add the Navbar here */}
          <main className="flex-grow container mx-auto p-4"> {/* Add main tag for content, allow it to grow */}
            {children}
          </main>
          {/* Optional Footer could go here */}
        </body>
      </html>
    </ClerkProvider>
  );
}
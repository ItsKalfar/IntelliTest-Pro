import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ReactQueryProviders from "@/components/ReactQueryProvider";

const inter = Inter({ subsets: ["latin"] });
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "IntelliTest Pro",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ReactQueryProviders>
        <html lang="en" className="light">
          <body
            className={cn(
              "min-h-screen font-sans antialiased grainy",
              inter.className
            )}
          >
            <Navbar />
            <main>{children}</main>
            <Toaster />
          </body>
        </html>
      </ReactQueryProviders>
    </ClerkProvider>
  );
}

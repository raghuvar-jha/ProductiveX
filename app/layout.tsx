import type { Metadata } from "next";
import { Geist, Geist_Mono,Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/component/Providers";
import DashboardLayout from "@/component/DashboardLayout";

export const instant = false;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ProductiveX - All Productive Tool at a Place!",
  description: "Organise your life with ProductiveX — build habits, manage tasks, focus with countdown sessions, and study smarter with flashcards.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
        {children}
        </Providers>
        
        </body>
    </html>
  );
}

// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css"; // Make sure this exists and includes your CSS
import { Outfit } from "next/font/google";
import Navbar from "./components/Navbar";

const outfit = Outfit({
  weight: '400',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: "UBC Cubing Club - Speedcubing at UBC",
  description:
    "UBC Cubing Club: Join the University of British Columbia's speedcubing community. Practice, compete, and improve your skills.",
  icons: {
    icon: "/ubc-cubing-logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
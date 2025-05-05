"use client";

import { usePathname } from "next/navigation";
import Navbar from "./components/Navbar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div>
      {(pathname !== "/signin" && pathname !== "/signup") && <Navbar />}
      {children}
    </div>
  );
}

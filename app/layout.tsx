import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Meta x Amazon Attribution Dashboard",
  description: "Live ROAS view joining Meta ad spend with Amazon Attribution sales",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

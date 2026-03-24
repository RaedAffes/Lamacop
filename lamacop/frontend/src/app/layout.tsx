import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "LaMaCoP | Laboratory of Ceramic and Polymer Composites",
  description:
    "LaMaCoP is a research laboratory specialized in ceramic and polymer composite testing, innovation, and industrial consulting.",
  keywords: ["LaMaCoP", "ceramic composites", "polymer composites", "materials testing", "laboratory"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

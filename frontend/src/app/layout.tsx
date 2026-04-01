import type { Metadata } from "next"
import "./globals.css"
import SiteHeader from "@/components/SiteHeader"
import SiteFooter from "@/components/SiteFooter"

export const metadata: Metadata = {
  title: "LaMaCoP",
  description:
    "LaMaCoP — Ceramic and Polymer Composite Materials. Research Laboratory — University of Sfax.",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  )
}

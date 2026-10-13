import type { Metadata } from "next";
import { Archivo, Source_Serif_4 } from "next/font/google";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import "./globals.css";

// Variable fonts: next/font only ships the wght axis unless extra axes are
// requested, and the design leans on Archivo width and Source Serif optical size.
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-source-serif",
});

export const metadata: Metadata = {
  // Placeholder: the current site's domain, until the launch domain is confirmed.
  metadataBase: new URL("https://infintin.in"),
  title: {
    default: "Infintin",
    template: "%s · Infintin",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${archivo.variable} ${sourceSerif.variable} antialiased`}
    >
      <body>
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-foreground focus:px-4 focus:py-2 focus:text-background"
        >
          Skip to content
        </a>
        <SmoothScroll>
          <main id="content">{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}

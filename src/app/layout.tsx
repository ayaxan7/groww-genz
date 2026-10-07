import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ServiceWorker } from "@/components/layout/ServiceWorker";
import { Logo } from "@/components/ui/Logo";
import { AppStoreProvider } from "@/hooks/useAppStore";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Groww Gen Z · Learn. Invest. Grow.",
  description:
    "A mobile-first prototype for first-time investors: personalised learning reels, guided investing and goal tracking. Demo only — no real transactions.",
  applicationName: "Groww Gen Z",
  appleWebApp: { capable: true, title: "Groww Gen Z", statusBarStyle: "default" },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body>
        <div className="app-stage">
          <aside className="app-caption" aria-hidden>
            <Logo size={30} />
            <p className="mt-5 text-[28px] font-extrabold leading-tight tracking-tight">Investing, made understandable.</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              A mobile-first case-study prototype. Use it like an app, or add it to your phone&apos;s home screen.
            </p>
            <p className="mt-6 inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted">Demo data · No real money</p>
          </aside>
          <div className="app-frame">
            <div id="app-scroll" className="app-scroll">
              <AppStoreProvider>{children}</AppStoreProvider>
            </div>
            <div id="modal-root" />
          </div>
        </div>
        <ServiceWorker />
      </body>
    </html>
  );
}

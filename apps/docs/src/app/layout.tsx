import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "skeehn — ASCII Native AI Components",
    template: "%s | skeehn",
  },
  description:
    "32 components. 7 themes. Zero dependencies. Build AI interfaces with real ASCII dither texture, CRT effects, and copy-paste ownership.",
  keywords: [
    "AI components",
    "ASCII",
    "dither",
    "React",
    "web components",
    "chat UI",
    "CRT",
    "retro",
    "design system",
  ],
  authors: [{ name: "skeehn" }],
  openGraph: {
    title: "skeehn — ASCII Native AI Components",
    description:
      "32 components. 7 themes. Zero dependencies. Every surface a canvas for ASCII texture.",
    type: "website",
    siteName: "skeehn",
  },
  twitter: {
    card: "summary_large_image",
    title: "skeehn — ASCII Native AI Components",
    description:
      "32 components. 7 themes. Zero dependencies. Every surface a canvas for ASCII texture.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* System color scheme detection — prevents flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('sk-theme');if(t){document.documentElement.setAttribute('data-theme',t)}else if(window.matchMedia('(prefers-color-scheme:dark)').matches){document.documentElement.setAttribute('data-theme','dark')}}catch(e){}})()`,
          }}
        />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="min-h-dvh font-mono antialiased">
        {children}
      </body>
    </html>
  );
}

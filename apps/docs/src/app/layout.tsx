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
  metadataBase: new URL("https://ui.skeehn.com"),
  title: {
    default: "skeehn — ASCII Native AI Components",
    template: "%s | skeehn",
  },
  description:
    "The open-source React component library for AI products — chat, streaming, reasoning, tool calls, agents. Copy the components in, theme them to your brand, own every line. 32 components, 7 themes, zero dependencies.",
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
      data-theme="light"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Clean light docs chrome; localStorage can still override the theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('sk-theme');document.documentElement.setAttribute('data-theme',t||'light')}catch(e){}})()`,
          }}
        />
        <meta name="color-scheme" content="light" />
      </head>
      <body className="min-h-dvh bg-background text-foreground font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

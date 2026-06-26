import type { Metadata } from "next";
import Link from "next/link";
import "@skeehn/core/styles.css";

export const metadata: Metadata = {
  title: "skeehn starter",
  description: "Chat, voice, and site — built with skeehn + the AI SDK.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body
        style={{
          minHeight: "100dvh",
          margin: 0,
          background: "hsl(var(--sk-background))",
          color: "hsl(var(--sk-foreground))",
          fontFamily: "var(--sk-font-sans)",
        }}
      >
        <nav
          style={{
            display: "flex",
            gap: 18,
            alignItems: "center",
            padding: "12px 20px",
            borderBottom: "1px solid hsl(var(--sk-border-color))",
            fontSize: 14,
          }}
        >
          <Link href="/" style={{ fontWeight: 600, textDecoration: "none", color: "inherit" }}>
            ▚ skeehn starter
          </Link>
          <Link href="/chat" style={{ textDecoration: "none", color: "inherit", opacity: 0.75 }}>Chat</Link>
          <Link href="/voice" style={{ textDecoration: "none", color: "inherit", opacity: 0.75 }}>Voice</Link>
          <Link href="/site" style={{ textDecoration: "none", color: "inherit", opacity: 0.75 }}>Site</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}

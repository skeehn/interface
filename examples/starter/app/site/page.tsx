import Link from "next/link";
import { HeroSection } from "@skeehn/react/blocks";
import { Button, Card, CardBody } from "@skeehn/react";

const FEATURES: [string, string][] = [
  ["Own the code", "Copy components into your repo — no black box, no lock-in."],
  ["Theme it", "Eight themes, or generate one from your brand color."],
  ["AI-native", "Chat, streaming, reasoning, tool calls, and voice."],
];

export default function SitePage() {
  return (
    <main>
      <HeroSection
        eyebrow="skeehn · sites too"
        title="Build the whole product, not just the chat."
        subtitle="Hero, features, and UI from the same themeable foundation. The chat and voice surfaces in this starter use the very same tokens."
        actions={
          <>
            <Link href="/chat"><Button variant="solid" size="lg">Open the chat</Button></Link>
            <a href="https://ui.skeehn.com" target="_blank" rel="noreferrer">
              <Button variant="outline" size="lg">Docs</Button>
            </a>
          </>
        }
      />
      <section
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "0 20px 80px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {FEATURES.map(([title, body]) => (
          <Card key={title}>
            <CardBody>
              <h3 style={{ margin: "0 0 6px", fontSize: 16 }}>{title}</h3>
              <p style={{ margin: 0, opacity: 0.7, fontSize: 14, lineHeight: 1.5 }}>{body}</p>
            </CardBody>
          </Card>
        ))}
      </section>
    </main>
  );
}

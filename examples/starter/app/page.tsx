import Link from "next/link";
import { HeroSection } from "@skeehn/react/blocks";
import { Button } from "@skeehn/react";

export default function Home() {
  return (
    <HeroSection
      eyebrow="skeehn starter"
      title="Chat, voice, and site — one foundation."
      subtitle="A minimal skeehn + AI SDK starter. Pick a surface to explore, then re-theme it with one data-theme attribute."
      actions={
        <>
          <Link href="/chat"><Button variant="solid" size="lg">Chat</Button></Link>
          <Link href="/voice"><Button variant="outline" size="lg">Voice</Button></Link>
          <Link href="/site"><Button variant="ghost" size="lg">Site</Button></Link>
        </>
      }
    />
  );
}

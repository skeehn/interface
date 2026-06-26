import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@skeehn/react";

export const metadata: Metadata = {
  title: "CLI",
  description:
    "The skeehn CLI: init a project, add components from the live registry, switch themes, and validate your setup — npx skeehn.",
};

const QUICK = `npx skeehn init                    # set up engine CSS + a theme in your project
npx skeehn add chat-bubble         # copy a component in (you own the source)
npx skeehn add --all               # copy all 32 components
npx skeehn theme terminal          # switch the active theme
npx skeehn doctor                  # validate your setup`;

const INIT = `npx skeehn init                    # current directory, neutral light theme
npx skeehn init --theme terminal   # start on a flagship theme`;

const ADD = `npx skeehn add button
npx skeehn add chat-bubble
npx skeehn add --all               # everything
npx skeehn add button --css-only   # CSS only, skip the React wrapper`;

const FLAGS = `-p, --path <dir>          Target directory
-t, --theme <name>        Theme for init
    --component-dir <dir>  Custom component output directory
    --css-dir <dir>        Custom CSS output directory
    --no-css               Skip CSS files (React wrapper only)
    --css-only             Skip the React wrapper (CSS only)`;

function Section({ label, title, children }: { label: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <p className="docs-label mb-2">{label}</p>
      <h2 className="docs-heading text-xl sm:text-2xl tracking-tight mb-3">{title}</h2>
      <div className="text-[0.95rem] text-muted-fg leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function CliPage() {
  return (
    <div className="max-w-3xl">
      <p className="docs-label mb-3">Reference</p>
      <h1 className="docs-heading text-3xl sm:text-4xl tracking-tight mb-4">CLI</h1>
      <p className="text-lg text-muted-fg leading-relaxed mb-10">
        <code className="sk-code-inline">npx skeehn</code> scaffolds skeehn into your project and copies
        component source from the live registry — so you own every line. No install required.
      </p>

      <Section label="Common" title="Quick reference">
        <div data-theme="default"><CodeBlock language="bash" code={QUICK} /></div>
      </Section>

      <Section label="init" title="Set up a project">
        <p>Writes the engine CSS + a theme and wires your global stylesheet.</p>
        <div data-theme="default"><CodeBlock language="bash" code={INIT} /></div>
      </Section>

      <Section label="add" title="Copy components in">
        <p>Fetches the component&rsquo;s source (CSS + optional React wrapper) from the registry into your project.</p>
        <div data-theme="default"><CodeBlock language="bash" code={ADD} /></div>
      </Section>

      <Section label="theme · doctor" title="Switch + validate">
        <p>
          <code className="sk-code-inline">npx skeehn theme &lt;name&gt;</code> swaps the active theme
          (light, dark, default, terminal, brutal, grain, print, mardi-gras).{" "}
          <code className="sk-code-inline">npx skeehn doctor</code> checks your setup and flags anything missing.
        </p>
      </Section>

      <Section label="Flags" title="Options">
        <div data-theme="default"><CodeBlock language="text" code={FLAGS} /></div>
      </Section>

      <p className="text-sm text-muted-fg mt-2">
        Prefer shadcn? Every component is also at <code className="sk-code-inline">https://ui.skeehn.com/r/&lt;name&gt;.json</code> —
        see <Link className="text-accent hover:underline" href="/docs/installation">Installation</Link>.
      </p>
    </div>
  );
}

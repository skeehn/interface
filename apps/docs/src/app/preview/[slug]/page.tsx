import { PreviewRender } from "./PreviewRender";

/** /preview/<slug>?theme=<theme> — chrome-free component preview for the visual QA sweep. */
export default async function PreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ theme?: string }>;
}) {
  const { slug } = await params;
  const { theme = "light" } = await searchParams;
  return <PreviewRender slug={slug} theme={theme} />;
}

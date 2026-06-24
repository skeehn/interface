import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mardi Gras AI",
  description:
    "An AI chat interface built with skeehn and the Mardi Gras theme — purple, gold, and green.",
};

export default function MardiGrasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

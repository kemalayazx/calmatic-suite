import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Word & Character Counter — Text Analyzer",
  description: "Count words, characters, sentences, paragraphs, and lines. Calculate reading and speaking time. Keyword density analysis and case converter tools.",
  keywords: ["word counter", "character counter", "text analyzer", "reading time calculator", "keyword density", "case converter"],
};
export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }

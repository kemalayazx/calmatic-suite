import type { Metadata } from "next";

const SITE_URL = "https://calmatic.webzip.studio";

export const metadata: Metadata = {
  title: "Word & Character Counter — Text Analyzer | Calmatic Suite",
  description: "Count words, characters, sentences, and paragraphs. Calculate reading and speaking time. Keyword density analysis and case converter tools.",
  keywords: ["word counter", "character counter", "text analyzer", "reading time calculator", "keyword density", "case converter"],
  openGraph: {
    title: "Word & Character Counter — Text Analyzer | Calmatic Suite",
    description: "Count words, characters, sentences, and paragraphs. Calculate reading and speaking time. Keyword density analysis and case converter tools.",
    url: `${SITE_URL}/text`,
  },
  twitter: {
    title: "Word & Character Counter — Text Analyzer | Calmatic Suite",
    description: "Count words, characters, sentences, and paragraphs. Calculate reading and speaking time. Keyword density analysis and case converter tools.",
  },
  alternates: {
    canonical: `${SITE_URL}/text`,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) { return <>{children}</>; }

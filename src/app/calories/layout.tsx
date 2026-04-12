import type { Metadata } from "next";

const SITE_URL = "https://calmatic.webzip.studio";

export const metadata: Metadata = {
  title: "Food Calorie Calculator — Track Calories & Macros | Calmatic Suite",
  description:
    "Search 80+ foods, track calories, fat, carbs, and protein. Meal planner with daily targets and macronutrient breakdown chart.",
  keywords: [
    "calorie calculator",
    "food calories",
    "macro calculator",
    "nutrition calculator",
    "meal planner",
    "calorie counter",
  ],
  openGraph: {
    title: "Food Calorie Calculator — Track Calories & Macros | Calmatic Suite",
    description:
      "Search 80+ foods, track calories, fat, carbs, and protein. Meal planner with daily targets and macronutrient breakdown chart.",
    url: `${SITE_URL}/calories`,
  },
  twitter: {
    title: "Food Calorie Calculator — Track Calories & Macros | Calmatic Suite",
    description:
      "Search 80+ foods, track calories, fat, carbs, and protein. Meal planner with daily targets and macronutrient breakdown chart.",
  },
  alternates: {
    canonical: `${SITE_URL}/calories`,
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

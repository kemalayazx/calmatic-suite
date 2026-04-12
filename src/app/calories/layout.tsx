import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Food Calorie Calculator — Track Calories & Macros",
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
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

import type { Metadata } from "next";
import { AuthPage } from "@/sections/AuthPage";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in or create a free Heritage Shapes account to save AI Studio designs, download mockups and track quotes.",
  alternates: { canonical: "/login" },
  robots: { index: false },
};

export default function LoginPage() {
  return <AuthPage />;
}

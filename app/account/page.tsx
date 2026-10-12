import type { Metadata } from "next";
import { AccountPage } from "@/sections/AccountPage";

export const metadata: Metadata = {
  title: "My account",
  description: "Your Heritage Shapes account: profile, AI Studio credits and quote requests.",
  alternates: { canonical: "/account" },
  robots: { index: false },
};

export default function Account() {
  return <AccountPage />;
}

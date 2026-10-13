import type { Metadata } from "next";
import { AdminOverview } from "@/sections/AdminOverview";

export const metadata: Metadata = {
  title: "Overview",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminOverview />;
}

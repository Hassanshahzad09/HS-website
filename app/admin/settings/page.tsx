import type { Metadata } from "next";
import { AdminSettings } from "@/sections/AdminSettings";

export const metadata: Metadata = {
  title: "Settings",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminSettings />;
}

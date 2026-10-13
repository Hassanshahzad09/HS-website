import type { Metadata } from "next";
import { AdminLeads } from "@/sections/AdminLeads";

export const metadata: Metadata = {
  title: "Leads",
  robots: { index: false, follow: false },
};

export default function Admin() {
  return <AdminLeads />;
}

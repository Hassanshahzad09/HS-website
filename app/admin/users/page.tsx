import type { Metadata } from "next";
import { AdminUsers } from "@/sections/AdminUsers";

export const metadata: Metadata = {
  title: "Users",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminUsers />;
}

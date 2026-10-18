// Single integration point for the quote builder, contact form and newsletter.
// Posts to the /api/enquiry route, which validates the request and saves it to the
// Supabase database (enquiries, plus leads and quotes for quote requests).

import { site } from "@/data/site";
import { accessToken } from "@/lib/supabase/client";

export type EnquiryPayload = {
  type: "quote" | "contact" | "newsletter";
  name?: string;
  company?: string;
  email: string;
  country?: string;
  product?: string;
  quantity?: string | number;
  material?: string;
  finishes?: string[];
  colour?: string;
  size?: string;
  logoType?: string;
  fileName?: string;
  message?: string;
};

export type EnquiryResult = { ok: boolean; reference?: string; error?: string };

export async function submitEnquiry(payload: EnquiryPayload): Promise<EnquiryResult> {
  try {
    const token = await accessToken().catch(() => null);
    const res = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch {
    return { ok: false, error: `We couldn't reach the server. Please try again, or email us at ${site.email}.` };
  }
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

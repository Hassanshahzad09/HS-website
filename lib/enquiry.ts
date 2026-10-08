// Single integration point for the quote builder, contact form and newsletter.
// Today it posts to the local /api/enquiry route, which only validates and
// acknowledges. Point it at your CRM, email service or backend when ready.

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
  fileName?: string;
  message?: string;
};

export type EnquiryResult = { ok: boolean; reference?: string; error?: string };

export async function submitEnquiry(payload: EnquiryPayload): Promise<EnquiryResult> {
  try {
    const res = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch {
    return { ok: false, error: "We couldn't reach the server. Please try again, or message us on WhatsApp." };
  }
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

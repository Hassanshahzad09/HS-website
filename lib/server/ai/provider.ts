import "server-only";
import sharp from "sharp";
import type { Product } from "@/data/products";
import { sampleImage, type StudioConfig } from "@/lib/studio";
import { downloadFile, uploadFile } from "../storage";

// The one seam between the Studio and an image model (PRD: "AIProvider abstraction").
// Everything else (credits, limits, records) is independent of which provider runs.

export type GenerateInput = {
  product: Product;
  config: StudioConfig;
  mode: string;
  /** The full text built from the database; an image model sends it together with the logo. */
  prompt?: { text: string } | null;
  /** Where the customer's normalised logo is stored. */
  logoPath?: string | null;
  /** Where the finished image should be stored (private "generations" bucket). */
  outputPath: string;
  model: string;
};

/** `stored` is true when imagePath is a private storage path, false when it is a public site image. */
export type GenerateOutput = { imagePath: string; stored: boolean; model: string; width?: number; height?: number; bytes?: number };

export interface AIProvider {
  name: string;
  generate(input: GenerateInput): Promise<GenerateOutput>;
}

/** Used while AI is switched off: returns the closest sample photo. */
export const sampleProvider: AIProvider = {
  name: "sample",
  async generate({ product, config }) {
    return { imagePath: sampleImage(product, config), stored: false, model: "sample-photo" };
  },
};

/** Google Gemini image models ("Nano Banana"). Sends the prompt and the logo in one request. */
export const geminiProvider: AIProvider = {
  name: "gemini",
  async generate({ prompt, logoPath, outputPath, model }) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Gemini is not configured");
    if (!prompt?.text) throw new Error("No prompt was built for this design");
    if (!logoPath) throw new Error("No logo was uploaded for this design");

    // The logo travels inside the request itself, never through a public link.
    const logo = await downloadFile("logos", logoPath);
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": key, "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt.text }, { inlineData: { mimeType: "image/png", data: logo.toString("base64") } }] }],
        generationConfig: { responseModalities: ["IMAGE"], imageConfig: { aspectRatio: "1:1", imageSize: "1K" } },
      }),
      signal: AbortSignal.timeout(55_000),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${String(body?.error?.message ?? "request failed").split("\n")[0].slice(0, 300)}`);

    const parts: { inlineData?: { data: string } }[] = body?.candidates?.[0]?.content?.parts ?? [];
    const data = parts.find((p) => p.inlineData?.data)?.inlineData?.data;
    if (!data) throw new Error(`Gemini returned no image (${body?.candidates?.[0]?.finishReason ?? body?.promptFeedback?.blockReason ?? "unknown reason"})`);

    const webp = await sharp(Buffer.from(data, "base64")).webp({ quality: 90 }).toBuffer({ resolveWithObject: true });
    await uploadFile("generations", outputPath, webp.data, "image/webp");
    return { imagePath: outputPath, stored: true, model, width: webp.info.width, height: webp.info.height, bytes: webp.info.size };
  },
};

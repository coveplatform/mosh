import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

/**
 * POST /api/extract-url
 *
 * Scrapes a URL (Google Maps, clinic website, restaurant page, etc.)
 * and extracts business name, phone number, address, and category.
 * Works for any type of business — not just restaurants.
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Fetch the page HTML
    let html = "";
    const fetchHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9,ja;q=0.8",
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(parsedUrl.toString(), {
        headers: fetchHeaders,
        signal: controller.signal,
        redirect: "follow",
      });
      clearTimeout(timeout);
      if (res.ok) {
        html = await res.text();
      }
    } catch {
      clearTimeout(timeout);
    }

    // Extract useful parts from HTML
    const extracted = html.length > 200
      ? extractPageData(html, parsedUrl.hostname)
      : `URL: ${parsedUrl.toString()}\nSource: ${parsedUrl.hostname}\nNote: Could not fetch page. Use training knowledge if you recognize this business.`;

    // Use GPT to parse into structured business info
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are extracting business contact information from a webpage. This could be ANY type of business — doctor, restaurant, salon, government office, utility company, school, etc.

Return JSON:
{
  "name": "Business name",
  "phone": "Phone with country code (e.g. +81 3-1234-5678) or null",
  "address": "Full address or null",
  "category": "one of: medical, restaurant, salon, government, finance, utility, school, delivery, maintenance, other",
  "image": "Main image URL or null",
  "hours": "Opening hours as short string or null"
}

RULES:
- Always include country code in phone numbers. Infer from the site's country.
- Japanese sites: +81. Australian: +61. US: +1. UK: +44. French: +33. German: +49. Korean: +82. Chinese: +86.
- If phone has leading 0, replace with country code (e.g. 03-1234-5678 → +81 3-1234-5678).
- For Google Maps URLs, extract the business name from the URL path if possible.
- Return null for any field you cannot determine. Never make up data.`,
        },
        {
          role: "user",
          content: `URL: ${parsedUrl.toString()}\nHostname: ${parsedUrl.hostname}\n\n${extracted}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 400,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json({
      name: result.name || null,
      phone: result.phone || null,
      address: result.address || null,
      category: result.category || "other",
      image: result.image || null,
      hours: result.hours || null,
      url: parsedUrl.toString(),
    });
  } catch (error) {
    console.error("URL extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract business details" },
      { status: 500 }
    );
  }
}

function extractPageData(html: string, hostname: string): string {
  const parts: string[] = [];

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) parts.push(`Title: ${titleMatch[1].trim()}`);

  const metas: string[] = [];
  const allMetaTags = html.match(/<meta\s[^>]*>/gi) || [];
  for (const tag of allMetaTags) {
    const propMatch = tag.match(/(?:property|name)=["']([^"']+)["']/i);
    const contentMatch = tag.match(/content=["']([^"']*?)["']/i);
    if (propMatch && contentMatch) {
      const key = propMatch[1].toLowerCase();
      if (
        key.includes("og:") ||
        key.includes("twitter:") ||
        key === "description" ||
        key.includes("phone") ||
        key.includes("address")
      ) {
        metas.push(`${propMatch[1]}: ${contentMatch[1]}`);
      }
    }
  }
  if (metas.length) parts.push(`Meta tags:\n${metas.join("\n")}`);

  const jsonLdRegex =
    /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let jsonLdMatch;
  while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(jsonLdMatch[1].trim());
      const str = JSON.stringify(data, null, 2);
      parts.push(str.length < 3000 ? `JSON-LD:\n${str}` : `JSON-LD (truncated):\n${str.substring(0, 3000)}`);
    } catch {
      // skip
    }
  }

  const phonePatterns = html.match(/(?:tel:|href=["']tel:)([^"'<\s]+)/gi);
  if (phonePatterns) {
    const phones = phonePatterns
      .map((p) => p.replace(/.*tel:/i, ""))
      .filter((v, i, a) => a.indexOf(v) === i);
    parts.push(`Phone links: ${phones.join(", ")}`);
  }

  const visiblePhones = html.match(
    /(?:\+\d{1,3}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{2,4}[\s-]?\d{3,4}/g
  );
  if (visiblePhones) {
    const unique = [...new Set(visiblePhones)].slice(0, 5);
    parts.push(`Phone-like patterns: ${unique.join(", ")}`);
  }

  parts.push(`Source site: ${hostname}`);

  const combined = parts.join("\n\n");
  return combined.length > 5000 ? combined.substring(0, 5000) : combined;
}

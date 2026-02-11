import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";

/**
 * Extract restaurant details from a URL.
 * Fetches the page HTML, extracts metadata + structured data,
 * then uses GPT to parse out restaurant name, phone, image, and address.
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Fetch the page HTML — try multiple strategies for sites that block bots
    let html = "";
    const fetchHeaders: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9,ja;q=0.8,fr;q=0.7",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
      "Cache-Control": "max-age=0",
    };

    // Strategy 1: Direct fetch
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

    // Check if we got useful content (not a CAPTCHA/empty shell)
    const hasUsefulMeta = html.length > 500 && (
      (html.includes("og:image") && html.includes("content=")) ||
      html.includes("ld+json")
    );

    // Strategy 2: For Yelp, use Fusion API (free, 5000 req/day)
    // Yelp aggressively blocks all server-side HTML fetches
    if (!hasUsefulMeta && parsedUrl.hostname.includes("yelp.com")) {
      const bizMatch = parsedUrl.pathname.match(/\/biz\/([^/?]+)/);
      if (bizMatch) {
        const yelpData = await fetchYelpFusionData(bizMatch[1]);
        if (yelpData) {
          return NextResponse.json({
            ...yelpData,
            url: parsedUrl.toString(),
          });
        }
      }
    }

    // Strategy 3: If still no useful content, try Google webcache
    const hasUsefulContent = html.length > 500 && (
      html.includes("og:") || html.includes("ld+json") || html.includes("<title")
    );
    if (!hasUsefulContent) {
      const cacheUrl = `https://webcache.googleusercontent.com/search?q=cache:${encodeURIComponent(parsedUrl.toString())}`;
      const ctrl3 = new AbortController();
      const t3 = setTimeout(() => ctrl3.abort(), 8000);
      try {
        const cRes = await fetch(cacheUrl, {
          headers: fetchHeaders,
          signal: ctrl3.signal,
          redirect: "follow",
        });
        clearTimeout(t3);
        if (cRes.ok) {
          const cacheHtml = await cRes.text();
          if (cacheHtml.length > html.length) html = cacheHtml;
        }
      } catch {
        clearTimeout(t3);
      }
    }

    // Strategy 4: If all fetches failed, give GPT just the URL to work with
    // GPT has training knowledge about many restaurants
    const urlOnly = !html || html.length < 200;

    // Extract useful parts from HTML (meta tags, title, JSON-LD, phone patterns)
    const extracted = urlOnly
      ? `URL: ${parsedUrl.toString()}\nSource site: ${parsedUrl.hostname}\nNote: Could not fetch page HTML. Use your training knowledge about this restaurant if you recognize it from the URL. For any field you cannot determine, return null.`
      : extractPageData(html, parsedUrl.hostname);

    // Use GPT to parse the extracted data into structured restaurant info
    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a data extraction assistant. Given metadata and content from a restaurant webpage, extract the restaurant details.

Return JSON in this exact format:
{
  "name": "Restaurant Name",
  "phone": "Phone number with country code (e.g. +81 3-1234-5678) or null if not found",
  "image": "URL of the restaurant's main image or null",
  "address": "Full address or null",
  "cuisine": "Type of cuisine (e.g. Japanese, French, Italian) or null",
  "priceRange": "Price range indicator (e.g. $$$$, ¥¥¥) or null",
  "rating": "Rating if available (e.g. 3.85) or null",
  "source": "Name of the platform (e.g. Tabelog, OpenTable, Google Maps, Yelp)",
  "openingHours": "Opening hours as a short string like '11:30-14:00, 17:30-22:00' or 'Lunch 11:30-14:00 / Dinner 17:30-22:00' or null if not found",
  "seatingTypes": ["Array of available seating types found on the page. Use these exact values where applicable: 'counter', 'table', 'private', 'outdoor', 'tatami', 'bar'. Return empty array [] if not determinable."],
  "menuTypes": ["Array of menu/course options found. E.g. 'Omakase ¥33,000', 'Lunch Course ¥8,800', 'Set Menu A ¥5,500', 'À la carte'. Return empty array [] if not found."],
  "lunchService": true,
  "dinnerService": true
}

RULES:
- Always include country code in phone numbers. Infer from the site's country if not explicit.
- For Japanese sites (tabelog.com, etc), phone numbers start with +81.
- For French sites, +33. For US sites, +1. For UK sites, +44. Etc.
- If the phone has a leading 0, replace it with the country code (e.g. 03-1234-5678 → +81 3-1234-5678).
- For images, prefer og:image or the main restaurant photo URL. Return the full absolute URL.
- For seatingTypes: include types you can confirm OR reasonably infer from the page. Look for clues like: photos of counter seating, "sushi" cuisine (almost always has counter), mentions of private rooms/個室, terrace/テラス, tatami/座敷, bar seats. For small sushi restaurants, include 'counter' even if not explicitly stated. For izakayas, include 'table' and possibly 'tatami'. Only return types that are very likely available.
- For menuTypes: extract specific course/menu names with prices if available. Include omakase, set menus, tasting menus, prix fixe, course menus. For Japanese restaurants check for おまかせ, コース, セット. For French: menu dégustation, formule.
- For openingHours: extract the actual times. Distinguish lunch vs dinner if separate seatings.
- lunchService/dinnerService: set to true/false based on hours. If unknown, default both to true.
- If data is not found, return null for strings, [] for arrays, true for booleans. Never make up data.`,
        },
        {
          role: "user",
          content: `URL: ${parsedUrl.toString()}\nHostname: ${parsedUrl.hostname}\n\n${extracted}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
      max_tokens: 800,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");

    return NextResponse.json({
      name: result.name || null,
      phone: result.phone || null,
      image: result.image || null,
      address: result.address || null,
      cuisine: result.cuisine || null,
      priceRange: result.priceRange || null,
      rating: result.rating || null,
      source: result.source || null,
      openingHours: result.openingHours || null,
      seatingTypes: Array.isArray(result.seatingTypes) ? result.seatingTypes : [],
      menuTypes: Array.isArray(result.menuTypes) ? result.menuTypes : [],
      lunchService: result.lunchService !== false,
      dinnerService: result.dinnerService !== false,
      url: parsedUrl.toString(),
    });
  } catch (error) {
    console.error("Restaurant lookup error:", error);
    return NextResponse.json({ error: "Failed to extract restaurant details" }, { status: 500 });
  }
}

/**
 * Extract useful data from HTML for GPT parsing.
 * Grabs meta tags, JSON-LD structured data, title, and phone number patterns.
 */
function extractPageData(html: string, hostname: string): string {
  const parts: string[] = [];

  // Title
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) parts.push(`Title: ${titleMatch[1].trim()}`);

  // Meta tags (og:, twitter:, description, etc.)
  // Use a broad regex to grab all <meta> tags, then parse property/name + content from each
  const metas: string[] = [];
  const allMetaTags = html.match(/<meta\s[^>]*>/gi) || [];
  for (const tag of allMetaTags) {
    const propMatch = tag.match(/(?:property|name)=["']([^"']+)["']/i);
    const contentMatch = tag.match(/content=["']([^"']*?)["']/i);
    if (propMatch && contentMatch) {
      const key = propMatch[1].toLowerCase();
      if (key.includes("og:") || key.includes("twitter:") || key === "description" || key.includes("phone") || key.includes("address")) {
        metas.push(`${propMatch[1]}: ${contentMatch[1]}`);
      }
    }
  }
  if (metas.length) parts.push(`Meta tags:\n${metas.join("\n")}`);

  // JSON-LD structured data
  const jsonLdRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let jsonLdMatch;
  while ((jsonLdMatch = jsonLdRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(jsonLdMatch[1].trim());
      const str = JSON.stringify(data, null, 2);
      if (str.length < 3000) {
        parts.push(`JSON-LD:\n${str}`);
      } else {
        parts.push(`JSON-LD (truncated):\n${str.substring(0, 3000)}`);
      }
    } catch {
      // Skip invalid JSON-LD
    }
  }

  // Phone number patterns
  const phonePatterns = html.match(/(?:tel:|href=["']tel:)([^"'<\s]+)/gi);
  if (phonePatterns) {
    const phones = phonePatterns.map((p) => p.replace(/.*tel:/i, "")).filter((v, i, a) => a.indexOf(v) === i);
    parts.push(`Phone links: ${phones.join(", ")}`);
  }

  // Visible phone-like patterns (Japanese, international)
  const visiblePhones = html.match(/(?:\+\d{1,3}[\s-]?)?\(?\d{1,4}\)?[\s-]?\d{2,4}[\s-]?\d{3,4}/g);
  if (visiblePhones) {
    const unique = [...new Set(visiblePhones)].slice(0, 5);
    parts.push(`Phone-like patterns in page: ${unique.join(", ")}`);
  }

  // Hostname context
  parts.push(`Source site: ${hostname}`);

  // Limit total size
  const combined = parts.join("\n\n");
  return combined.length > 5000 ? combined.substring(0, 5000) : combined;
}

/**
 * Fetch restaurant data from Yelp Fusion API v3.
 * Free tier: 5000 requests/day. Get key at https://fusion.yelp.com/
 * Falls back to GPT knowledge if no API key is configured.
 */
async function fetchYelpFusionData(bizAlias: string) {
  const apiKey = process.env.YELP_API_KEY;
  if (!apiKey) {
    // No API key — return null so we fall through to GPT-knowledge fallback
    return null;
  }

  try {
    const res = await fetch(`https://api.yelp.com/v3/businesses/${bizAlias}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return null;

    const biz = await res.json();

    // Map Yelp categories to cuisine string
    const cuisine = biz.categories
      ?.map((c: { title: string }) => c.title)
      .join(", ") || null;

    // Map Yelp hours to readable string
    let openingHours: string | null = null;
    let lunchService = true;
    let dinnerService = true;
    if (biz.hours?.[0]?.open) {
      const dayMap: Record<number, string> = { 0: "Mon", 1: "Tue", 2: "Wed", 3: "Thu", 4: "Fri", 5: "Sat", 6: "Sun" };
      const hourStrings: string[] = [];
      const grouped: Record<string, number[]> = {};
      for (const h of biz.hours[0].open) {
        const timeStr = `${h.start.slice(0, 2)}:${h.start.slice(2)}-${h.end.slice(0, 2)}:${h.end.slice(2)}`;
        if (!grouped[timeStr]) grouped[timeStr] = [];
        grouped[timeStr].push(h.day);
      }
      for (const [time, days] of Object.entries(grouped)) {
        const dayLabels = days.map((d) => dayMap[d] || "").filter(Boolean);
        if (dayLabels.length === 7) {
          hourStrings.push(`Daily ${time}`);
        } else {
          hourStrings.push(`${dayLabels.join(", ")} ${time}`);
        }
      }
      openingHours = hourStrings.join(" / ");

      // Check if any hours start before 15:00 (lunch) or after 16:00 (dinner)
      const starts = biz.hours[0].open.map((h: { start: string }) => parseInt(h.start));
      lunchService = starts.some((s: number) => s < 1500);
      dinnerService = starts.some((s: number) => s >= 1600) || starts.some((s: number) => s < 500);
    }

    // Price mapping
    const priceMap: Record<string, string> = { "$": "$", "$$": "$$", "$$$": "$$$", "$$$$": "$$$$" };

    // Infer seating from categories
    const seatingTypes: string[] = [];
    const catTitles = (biz.categories || []).map((c: { alias: string }) => c.alias).join(",");
    if (catTitles.includes("sushi") || catTitles.includes("ramen")) seatingTypes.push("counter");
    if (catTitles.includes("bars") || catTitles.includes("cocktail")) seatingTypes.push("bar");
    if (!catTitles.includes("foodstands") && !catTitles.includes("foodtrucks")) seatingTypes.push("table");

    return {
      name: biz.name || null,
      phone: biz.display_phone || biz.phone || null,
      image: biz.image_url || null,
      address: biz.location?.display_address?.join(", ") || null,
      cuisine,
      priceRange: priceMap[biz.price] || biz.price || null,
      rating: biz.rating ? String(biz.rating) : null,
      source: "Yelp",
      openingHours,
      seatingTypes,
      menuTypes: [] as string[],
      lunchService,
      dinnerService,
    };
  } catch {
    return null;
  }
}

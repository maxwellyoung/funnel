import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { error: "URL parameter is required" },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; KnowledgeFunnel/1.0)",
        Accept: "text/html",
      },
      timeout: 5000,
      maxRedirects: 5,
    });

    const html = response.data;

    // Simple regex-based extraction as a fallback if cheerio isn't installed
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descriptionMatch =
      html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i) ||
      html.match(/<meta[^>]*content="([^"]*)"[^>]*name="description"[^>]*>/i);

    const title = titleMatch ? titleMatch[1].trim() : url;
    const description = descriptionMatch ? descriptionMatch[1].trim() : "";

    return NextResponse.json({
      title,
      description,
    });
  } catch (error) {
    console.error("Error fetching metadata:", error);

    // Return a graceful fallback
    return NextResponse.json(
      {
        title: url,
        description: "",
      },
      { status: 200 }
    ); // Return 200 to handle gracefully on client
  }
}

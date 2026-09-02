import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const universeIds = searchParams.get("universeIds");

    if (!universeIds) {
      return NextResponse.json(
        { error: "Missing universeIds" },
        { status: 400 }
      );
    }

    const ids = universeIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
      .slice(0, 50);

    const response = await fetch(
      `https://games.roblox.com/v1/games?universeIds=${ids.join(",")}`,
      {
        next: { revalidate: 30 },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Roblox API returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Roblox API error:", error);

    return NextResponse.json(
      { error: "Failed to fetch Roblox game data" },
      { status: 500 }
    );
  }
}

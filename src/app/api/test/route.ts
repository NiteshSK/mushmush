import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: "API route working",
    method: "GET",
    timestamp: new Date().toISOString(),
    url: request.url
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({
      message: "POST method working",
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to parse JSON",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 400 });
  }
}

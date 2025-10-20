// app/api/notify/route.ts
import { NextResponse } from "next/server";
import { sendFrameNotification } from "@/lib/notification-client";

type NotificationDetails = { url: string; token: string };

function parseNotificationDetails(input: unknown): NotificationDetails | undefined | null {
  if (input == null) return undefined; // treat null/missing as undefined
  if (typeof input === "object") {
    const v = input as Record<string, unknown>;
    if (typeof v.url === "string" && typeof v.token === "string") {
      return { url: v.url, token: v.token };
    }
  }
  // If shape is wrong, ignore it instead of failing type-checks
  return undefined;
}

export async function POST(req: Request) {
  try {
    // Ensure JSON
    const ctype = req.headers.get("content-type") || "";
    if (!ctype.includes("application/json")) {
      return NextResponse.json(
        { error: "Expected 'Content-Type: application/json'." },
        { status: 415 }
      );
    }

    const body = await req.json();
    const { fid, notification } = body ?? {};

    // Basic shape checks
    if (fid == null || typeof notification !== "object" || notification == null) {
      return NextResponse.json(
        { error: "Missing 'fid' or 'notification' in request body." },
        { status: 400 }
      );
    }

    const fidNum = typeof fid === "string" ? Number(fid) : fid;
    if (!Number.isFinite(fidNum)) {
      return NextResponse.json(
        { error: "'fid' must be a number or numeric string." },
        { status: 400 }
      );
    }

    const { title, body: notifBody, notificationDetails } = notification as {
      title?: unknown;
      body?: unknown;
      notificationDetails?: unknown;
    };

    if (typeof title !== "string" || typeof notifBody !== "string") {
      return NextResponse.json(
        { error: "'notification.title' and 'notification.body' must be strings." },
        { status: 400 }
      );
    }

    const details = parseNotificationDetails(notificationDetails);

    const result = await sendFrameNotification({
      fid: fidNum,
      title,
      body: notifBody,
      notificationDetails: details, // now typed correctly
    });

    if (!result || result.state === "error") {
      return NextResponse.json(
        { error: result?.error ?? "Failed to send notification." },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, result }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}

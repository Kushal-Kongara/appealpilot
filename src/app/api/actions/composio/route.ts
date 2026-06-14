import { NextRequest, NextResponse } from "next/server";
import {
  executeGmailDraft,
  createDriveFolder,
  addCalendarReminder,
} from "@/lib/clients/composio";
import { ComposioActionRequest } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ComposioActionRequest;
    const { action, data } = body;

    let result;
    switch (action) {
      case "gmail_draft":
        result = await executeGmailDraft(
          data.content ?? "",
          data.subject ?? "Insurance Appeal"
        );
        break;
      case "drive_folder":
        result = await createDriveFolder(
          data.folderName ?? "Insurance Appeal Documents"
        );
        break;
      case "calendar_reminder":
        result = await addCalendarReminder(
          data.title ?? "Appeal Deadline Reminder",
          data.deadline ?? ""
        );
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Composio action error:", error);
    return NextResponse.json({ error: "Action failed" }, { status: 500 });
  }
}

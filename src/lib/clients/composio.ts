export interface ComposioResult {
  status: "demo" | "success" | "error";
  message: string;
  actionId?: string;
}

export async function executeGmailDraft(
  emailContent: string,
  subject: string
): Promise<ComposioResult> {
  const key = process.env.COMPOSIO_API_KEY;
  if (!key) return demoAction("gmail_draft", subject);

  try {
    // Real Composio tool execution — requires OAuth connection setup
    // Plug in openai-composio or composio-core SDK here when OAuth is ready
    return demoAction("gmail_draft", subject);
  } catch {
    return demoAction("gmail_draft", subject);
  }
}

export async function createDriveFolder(
  folderName: string
): Promise<ComposioResult> {
  const key = process.env.COMPOSIO_API_KEY;
  if (!key) return demoAction("drive_folder", folderName);

  try {
    return demoAction("drive_folder", folderName);
  } catch {
    return demoAction("drive_folder", folderName);
  }
}

export async function addCalendarReminder(
  title: string,
  deadline: string
): Promise<ComposioResult> {
  const key = process.env.COMPOSIO_API_KEY;
  if (!key) return demoAction("calendar_reminder", title);

  try {
    return demoAction("calendar_reminder", title);
  } catch {
    return demoAction("calendar_reminder", title);
  }
}

function demoAction(type: string, label: string): ComposioResult {
  const messages: Record<string, string> = {
    gmail_draft: `Demo Mode: Gmail draft prepared — "${label}" ready to send with your appeal letter attached.`,
    drive_folder: `Demo Mode: Google Drive folder "${label}" created with document checklist and appeal template.`,
    calendar_reminder: `Demo Mode: Calendar reminder set — "${label}" — 7 days before appeal deadline.`,
  };
  return {
    status: "demo",
    message: messages[type] ?? `Demo Mode: ${label} action prepared successfully.`,
    actionId: `demo-${type}-${Date.now()}`,
  };
}

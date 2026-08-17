import { google } from "googleapis";
import { Readable } from "node:stream";

function getDriveClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  if (!email || !rawKey) {
    throw new Error(
      "Google Drive is not configured. Set GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY."
    );
  }

  const privateKey = rawKey.replace(/\\n/g, "\n");
  const auth = new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
}

export type UploadedImage = {
  fileId: string;
  url: string;
};

export async function uploadImageToDrive(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<UploadedImage> {
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    throw new Error(
      "Google Drive is not configured. Set GOOGLE_DRIVE_FOLDER_ID."
    );
  }

  const drive = getDriveClient();

  const res = await drive.files.create({
    requestBody: {
      name: filename,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: "id",
  });

  const fileId = res.data.id;
  if (!fileId) {
    throw new Error("Google Drive upload did not return a file id.");
  }

  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
  });

  return {
    fileId,
    url: `https://lh3.googleusercontent.com/d/${fileId}=s1600`,
  };
}

export async function deleteImageFromDrive(fileId: string): Promise<void> {
  try {
    const drive = getDriveClient();
    await drive.files.delete({ fileId });
  } catch {
    // Best-effort cleanup; ignore failures (e.g. already deleted).
  }
}

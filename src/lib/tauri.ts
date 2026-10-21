import { open, save } from "@tauri-apps/plugin-dialog";
import { readFile, writeFile } from "@tauri-apps/plugin-fs";
import {
  defaultExportName,
  extensionForFormat,
  guessMimeFromPath,
  type ExportFormat,
} from "./file";

const IMAGE_FILTER = {
  name: "Images",
  extensions: ["png", "jpg", "jpeg", "webp", "gif", "bmp"],
};

export async function openImagePath(): Promise<string | null> {
  const selected = await open({
    multiple: false,
    directory: false,
    filters: [IMAGE_FILTER],
    title: "Open image",
  });

  if (selected === null) {
    return null;
  }

  return typeof selected === "string" ? selected : selected[0] ?? null;
}

export async function readImageAsObjectUrl(path: string): Promise<string> {
  const bytes = await readFile(path);
  const blob = new Blob([bytes], { type: guessMimeFromPath(path) });
  return URL.createObjectURL(blob);
}

export async function saveImageBlob(
  blob: Blob,
  format: ExportFormat,
): Promise<boolean> {
  const ext = extensionForFormat(format);
  const path = await save({
    title: "Export cropped image",
    defaultPath: defaultExportName(format),
    filters: [
      {
        name: format === "png" ? "PNG" : "JPEG",
        extensions: [ext],
      },
    ],
  });

  if (!path) {
    return false;
  }

  const buffer = new Uint8Array(await blob.arrayBuffer());
  await writeFile(path, buffer);
  return true;
}

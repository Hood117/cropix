export type ExportFormat = "png" | "jpeg";

const IMAGE_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "webp",
  "gif",
  "bmp",
]);

const IMAGE_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/x-ms-bmp",
]);

export const ACCEPTED_IMAGE_LABEL = "PNG, JPEG, WebP, GIF, or BMP";

export function isImageFile(file: File): boolean {
  if (file.type && IMAGE_MIMES.has(file.type.toLowerCase())) {
    return true;
  }
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext !== undefined && IMAGE_EXTENSIONS.has(ext);
}

export function isImagePath(path: string): boolean {
  const normalized = path.replace(/\\/g, "/");
  const name = normalized.split("/").pop() ?? normalized;
  const ext = name.split(".").pop()?.toLowerCase();
  return ext !== undefined && IMAGE_EXTENSIONS.has(ext);
}

export function mimeForFormat(format: ExportFormat): string {
  return format === "png" ? "image/png" : "image/jpeg";
}

export function extensionForFormat(format: ExportFormat): string {
  return format === "png" ? "png" : "jpg";
}

export function defaultExportName(format: ExportFormat): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const stamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    "-",
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");
  return `cropix-${stamp}.${extensionForFormat(format)}`;
}

export function revokeObjectUrl(url: string | null): void {
  if (url?.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export function guessMimeFromPath(path: string): string {
  const normalized = path.replace(/\\/g, "/");
  const name = normalized.split("/").pop() ?? normalized;
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "bmp":
      return "image/bmp";
    default:
      return "application/octet-stream";
  }
}

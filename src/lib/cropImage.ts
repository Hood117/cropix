import type { PixelCrop } from "react-image-crop";
import type { ExportFormat } from "./file";
import { mimeForFormat } from "./file";

export async function getCroppedImg(
  image: HTMLImageElement,
  pixelCrop: PixelCrop,
  format: ExportFormat,
  quality = 0.92,
): Promise<Blob> {
  if (pixelCrop.width < 1 || pixelCrop.height < 1) {
    throw new Error("Crop area is empty.");
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const width = Math.max(1, Math.round(pixelCrop.width * scaleX));
  const height = Math.max(1, Math.round(pixelCrop.height * scaleY));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create canvas context.");
  }

  if (format === "jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    width,
    height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to encode cropped image."));
          return;
        }
        resolve(blob);
      },
      mimeForFormat(format),
      format === "jpeg" ? quality : undefined,
    );
  });
}

/** Create an initial free-form crop covering most of the image. */
export function initialPercentCrop(): {
  unit: "%";
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const width = 80;
  const height = 80;
  return {
    unit: "%",
    x: (100 - width) / 2,
    y: (100 - height) / 2,
    width,
    height,
  };
}

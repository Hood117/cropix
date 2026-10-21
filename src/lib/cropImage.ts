import {
  centerCrop,
  convertToPercentCrop,
  convertToPixelCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import type { ExportFormat } from "./file";
import { mimeForFormat } from "./file";

export type NaturalCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

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

export function initialPercentCrop(): Crop {
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

export function centerAspectPercentCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
): Crop {
  return centerCrop(
    makeAspectCrop(
      { unit: "%", width: 80 },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export function toNaturalCrop(
  pixelCrop: PixelCrop,
  image: HTMLImageElement,
): NaturalCrop {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  return {
    x: Math.round(pixelCrop.x * scaleX),
    y: Math.round(pixelCrop.y * scaleY),
    width: Math.max(1, Math.round(pixelCrop.width * scaleX)),
    height: Math.max(1, Math.round(pixelCrop.height * scaleY)),
  };
}

export function naturalToPercentCrop(
  natural: NaturalCrop,
  image: HTMLImageElement,
): Crop {
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const pixel: PixelCrop = {
    unit: "px",
    x: natural.x / scaleX,
    y: natural.y / scaleY,
    width: Math.max(1, natural.width / scaleX),
    height: Math.max(1, natural.height / scaleY),
  };
  return convertToPercentCrop(pixel, image.width, image.height);
}

export function clampNaturalCrop(
  next: NaturalCrop,
  image: HTMLImageElement,
): NaturalCrop {
  const maxW = image.naturalWidth;
  const maxH = image.naturalHeight;
  const width = Math.min(Math.max(1, Math.round(next.width)), maxW);
  const height = Math.min(Math.max(1, Math.round(next.height)), maxH);
  const x = Math.min(Math.max(0, Math.round(next.x)), Math.max(0, maxW - width));
  const y = Math.min(Math.max(0, Math.round(next.y)), Math.max(0, maxH - height));
  return { x, y, width, height };
}

export function applyPercentCrop(
  crop: Crop,
  image: HTMLImageElement,
): { crop: Crop; pixelCrop: PixelCrop } {
  const pixelCrop = convertToPixelCrop(crop, image.width, image.height);
  return { crop, pixelCrop };
}

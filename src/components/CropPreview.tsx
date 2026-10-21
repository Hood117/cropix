import { useEffect, useRef, useState } from "react";
import type { PixelCrop } from "react-image-crop";
import { getCroppedImg } from "@/lib/cropImage";
import type { ExportFormat } from "@/lib/file";
import { revokeObjectUrl } from "@/lib/file";

type CropPreviewProps = {
  imageElement: HTMLImageElement | null;
  pixelCrop: PixelCrop | null;
  format: ExportFormat;
};

export function CropPreview({
  imageElement,
  pixelCrop,
  format,
}: CropPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      if (!imageElement || !pixelCrop || pixelCrop.width < 1) {
        revokeObjectUrl(previewUrlRef.current);
        previewUrlRef.current = null;
        setPreviewUrl(null);
        return;
      }

      try {
        const blob = await getCroppedImg(imageElement, pixelCrop, format, 0.85);
        if (cancelled) {
          return;
        }
        const url = URL.createObjectURL(blob);
        revokeObjectUrl(previewUrlRef.current);
        previewUrlRef.current = url;
        setPreviewUrl(url);
      } catch {
        if (!cancelled) {
          revokeObjectUrl(previewUrlRef.current);
          previewUrlRef.current = null;
          setPreviewUrl(null);
        }
      }
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [format, imageElement, pixelCrop]);

  useEffect(() => {
    return () => {
      revokeObjectUrl(previewUrlRef.current);
    };
  }, []);

  return (
    <div className="space-y-1.5" aria-live="polite">
      <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
        Preview
      </span>
      <div className="flex h-24 w-full items-center justify-center overflow-hidden rounded-md border border-border bg-muted/60">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Live crop preview"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span className="text-[10px] text-muted-foreground">—</span>
        )}
      </div>
    </div>
  );
}

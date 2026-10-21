import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Crop, PixelCrop } from "react-image-crop";
import { aspectValue, type AspectPreset } from "@/lib/aspect";
import {
  applyPercentCrop,
  centerAspectPercentCrop,
  clampNaturalCrop,
  getCroppedImg,
  naturalToPercentCrop,
  toNaturalCrop,
  type NaturalCrop,
} from "@/lib/cropImage";
import {
  ACCEPTED_IMAGE_LABEL,
  isImageFile,
  isImagePath,
  revokeObjectUrl,
  type ExportFormat,
} from "@/lib/file";
import { openImagePath, readImageAsObjectUrl, saveImageBlob } from "@/lib/tauri";

export function useCropSession() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop | undefined>(undefined);
  const [pixelCrop, setPixelCrop] = useState<PixelCrop | null>(null);
  const [aspect, setAspect] = useState<AspectPreset>("free");
  const [format, setFormat] = useState<ExportFormat>("png");
  const [quality, setQuality] = useState(92);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [cropKey, setCropKey] = useState(0);
  const [imageVersion, setImageVersion] = useState(0);
  const imageUrlRef = useRef<string | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const replaceImage = useCallback((url: string) => {
    revokeObjectUrl(imageUrlRef.current);
    imageUrlRef.current = url;
    imageElementRef.current = null;
    setImageUrl(url);
    setCrop(undefined);
    setPixelCrop(null);
    setAspect("free");
    setCropKey((k) => k + 1);
    setImageVersion((v) => v + 1);
    setError(null);
    setStatus(null);
  }, []);

  const loadFromFile = useCallback(
    (file: File) => {
      if (!isImageFile(file)) {
        setError(`Unsupported file. Use ${ACCEPTED_IMAGE_LABEL}.`);
        return;
      }
      replaceImage(URL.createObjectURL(file));
    },
    [replaceImage],
  );

  const loadFromPath = useCallback(
    async (path: string) => {
      if (!isImagePath(path)) {
        setError(`Unsupported file. Use ${ACCEPTED_IMAGE_LABEL}.`);
        return;
      }
      setBusy(true);
      setStatus("Opening image…");
      try {
        const url = await readImageAsObjectUrl(path);
        replaceImage(url);
      } catch {
        setError("Could not open that image.");
      } finally {
        setBusy(false);
        setStatus(null);
      }
    },
    [replaceImage],
  );

  const loadFromPaths = useCallback(
    async (paths: string[]) => {
      if (!paths.length) {
        return;
      }
      const imagePath = paths.find(isImagePath);
      if (!imagePath) {
        setError(`Unsupported file. Use ${ACCEPTED_IMAGE_LABEL}.`);
        return;
      }
      if (paths.length > 1 && paths.filter(isImagePath).length > 1) {
        setStatus("Opened the first image from the drop.");
      }
      await loadFromPath(imagePath);
    },
    [loadFromPath],
  );

  const openImage = useCallback(async () => {
    setBusy(true);
    clearError();
    setStatus("Waiting for file…");
    try {
      const path = await openImagePath();
      if (!path) {
        return;
      }
      await loadFromPath(path);
    } catch {
      setError("Could not open the file dialog.");
    } finally {
      setBusy(false);
      setStatus(null);
    }
  }, [clearError, loadFromPath]);

  const resetCrop = useCallback(() => {
    if (!imageUrl) {
      return;
    }
    setCrop(undefined);
    setPixelCrop(null);
    setCropKey((k) => k + 1);
    clearError();
    setStatus("Crop reset");
    window.setTimeout(() => {
      setStatus((current) => (current === "Crop reset" ? null : current));
    }, 1800);
  }, [clearError, imageUrl]);

  const cancelImage = useCallback(() => {
    if (!imageUrlRef.current && !imageUrl) {
      return;
    }
    revokeObjectUrl(imageUrlRef.current);
    imageUrlRef.current = null;
    imageElementRef.current = null;
    setImageUrl(null);
    setCrop(undefined);
    setPixelCrop(null);
    setAspect("free");
    setCropKey((k) => k + 1);
    setImageVersion((v) => v + 1);
    clearError();
    setStatus(null);
  }, [clearError, imageUrl]);

  const onImageReady = useCallback((image: HTMLImageElement) => {
    imageElementRef.current = image;
    setImageVersion((v) => v + 1);
  }, []);

  const changeAspect = useCallback((next: AspectPreset) => {
    setAspect(next);
    const image = imageElementRef.current;
    const ratio = aspectValue(next);
    // Freeform keeps the current selection; locked ratios recenter to fit.
    if (!image || !ratio) {
      return;
    }
    const centered = centerAspectPercentCrop(image.width, image.height, ratio);
    const applied = applyPercentCrop(centered, image);
    setCrop(applied.crop);
    setPixelCrop(applied.pixelCrop);
  }, []);

  const updateNaturalCrop = useCallback((patch: Partial<NaturalCrop>) => {
    const image = imageElementRef.current;
    if (!image || !pixelCrop) {
      return;
    }

    const current = toNaturalCrop(pixelCrop, image);
    let next = clampNaturalCrop({ ...current, ...patch }, image);
    const ratio = aspectValue(aspect);

    if (ratio && patch.width !== undefined && patch.height === undefined) {
      next = clampNaturalCrop(
        {
          ...next,
          height: Math.max(1, Math.round(next.width / ratio)),
        },
        image,
      );
    } else if (ratio && patch.height !== undefined && patch.width === undefined) {
      next = clampNaturalCrop(
        {
          ...next,
          width: Math.max(1, Math.round(next.height * ratio)),
        },
        image,
      );
    }

    const percent = naturalToPercentCrop(next, image);
    const applied = applyPercentCrop(percent, image);
    setCrop(applied.crop);
    setPixelCrop(applied.pixelCrop);
  }, [aspect, pixelCrop]);

  const exportImage = useCallback(async () => {
    const image = imageElementRef.current;
    if (!image || !pixelCrop) {
      setError("Nothing to export yet. Adjust the crop first.");
      return;
    }
    setBusy(true);
    clearError();
    setStatus("Exporting…");
    try {
      const encodeQuality = Math.min(1, Math.max(0.01, quality / 100));
      const blob = await getCroppedImg(image, pixelCrop, format, encodeQuality);
      const saved = await saveImageBlob(blob, format);
      if (!saved) {
        setStatus(null);
        return;
      }
      setStatus("Exported successfully");
      window.setTimeout(() => {
        setStatus((current) =>
          current === "Exported successfully" ? null : current,
        );
      }, 2200);
    } catch {
      setError("Could not export the cropped image.");
      setStatus(null);
    } finally {
      setBusy(false);
    }
  }, [clearError, format, pixelCrop, quality]);

  const naturalCrop = useMemo(() => {
    const image = imageElementRef.current;
    if (!image || !pixelCrop) {
      return null;
    }
    return toNaturalCrop(pixelCrop, image);
    // imageVersion forces recompute when the displayed image element is ready
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pixelCrop, imageVersion]);

  const imageNaturalSize = useMemo(() => {
    const image = imageElementRef.current;
    if (!image) {
      return null;
    }
    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageVersion]);

  useEffect(() => {
    return () => {
      revokeObjectUrl(imageUrlRef.current);
    };
  }, []);

  return {
    imageUrl,
    crop,
    setCrop,
    pixelCrop,
    setPixelCrop,
    aspect,
    aspectRatio: aspectValue(aspect),
    changeAspect,
    updateNaturalCrop,
    naturalCrop,
    imageNaturalSize,
    format,
    setFormat,
    quality,
    setQuality,
    error,
    clearError,
    busy,
    status,
    cropKey,
    hasImage: Boolean(imageUrl),
    imageElementRef,
    openImage,
    loadFromFile,
    loadFromPath,
    loadFromPaths,
    resetCrop,
    cancelImage,
    onImageReady,
    exportImage,
  };
}

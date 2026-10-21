import { useCallback, useEffect, useRef, useState } from "react";
import type { Crop, PixelCrop } from "react-image-crop";
import { getCroppedImg } from "@/lib/cropImage";
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
  const [format, setFormat] = useState<ExportFormat>("png");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [cropKey, setCropKey] = useState(0);
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
    setCropKey((k) => k + 1);
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
    setCropKey((k) => k + 1);
    clearError();
    setStatus(null);
  }, [clearError, imageUrl]);

  const onImageReady = useCallback((image: HTMLImageElement) => {
    imageElementRef.current = image;
  }, []);

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
      const blob = await getCroppedImg(image, pixelCrop, format);
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
  }, [clearError, format, pixelCrop]);

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
    format,
    setFormat,
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

import { useCallback, useEffect, useRef, useState } from "react";
import type { Crop, PixelCrop } from "react-image-crop";
import { getCroppedImg } from "@/lib/cropImage";
import {
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
  }, []);

  const loadFromFile = useCallback(
    (file: File) => {
      if (!isImageFile(file)) {
        setError("That file is not a supported image.");
        return;
      }
      replaceImage(URL.createObjectURL(file));
    },
    [replaceImage],
  );

  const loadFromPath = useCallback(
    async (path: string) => {
      if (!isImagePath(path)) {
        setError("That file is not a supported image.");
        return;
      }
      setBusy(true);
      try {
        const url = await readImageAsObjectUrl(path);
        replaceImage(url);
      } catch {
        setError("Could not open that image.");
      } finally {
        setBusy(false);
      }
    },
    [replaceImage],
  );

  const openImage = useCallback(async () => {
    setBusy(true);
    clearError();
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
  }, [clearError, imageUrl]);

  const onImageReady = useCallback((image: HTMLImageElement) => {
    imageElementRef.current = image;
  }, []);

  const exportImage = useCallback(async () => {
    const image = imageElementRef.current;
    if (!image || !pixelCrop) {
      setError("Nothing to export yet.");
      return;
    }
    setBusy(true);
    clearError();
    try {
      const blob = await getCroppedImg(image, pixelCrop, format);
      const saved = await saveImageBlob(blob, format);
      if (!saved) {
        return;
      }
    } catch {
      setError("Could not export the cropped image.");
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
    cropKey,
    hasImage: Boolean(imageUrl),
    imageElementRef,
    openImage,
    loadFromFile,
    loadFromPath,
    resetCrop,
    cancelImage,
    onImageReady,
    exportImage,
  };
}

import { useEffect, useState } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";

type UseTauriFileDropOptions = {
  enabled?: boolean;
  onDropPaths: (paths: string[]) => void;
};

/**
 * Uses Tauri's native file-drop events for reliable desktop DnD.
 * Also blocks the browser from navigating on file drop.
 */
export function useTauriFileDrop({
  enabled = true,
  onDropPaths,
}: UseTauriFileDropOptions) {
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const preventBrowserFileOpen = (event: DragEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };

    window.addEventListener("dragover", preventBrowserFileOpen);
    window.addEventListener("drop", preventBrowserFileOpen);

    return () => {
      window.removeEventListener("dragover", preventBrowserFileOpen);
      window.removeEventListener("drop", preventBrowserFileOpen);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsDragging(false);
      return;
    }

    let unlisten: (() => void) | undefined;
    let cancelled = false;

    void getCurrentWebview()
      .onDragDropEvent((event) => {
        const { type } = event.payload;
        if (type === "enter" || type === "over") {
          setIsDragging(true);
          return;
        }
        if (type === "leave") {
          setIsDragging(false);
          return;
        }
        if (type === "drop") {
          setIsDragging(false);
          onDropPaths(event.payload.paths);
        }
      })
      .then((fn) => {
        if (cancelled) {
          fn();
          return;
        }
        unlisten = fn;
      })
      .catch(() => {
        // Running outside Tauri (e.g. vite-only) — browser preventDefault still applies.
      });

    return () => {
      cancelled = true;
      unlisten?.();
      setIsDragging(false);
    };
  }, [enabled, onDropPaths]);

  return { isDragging };
}

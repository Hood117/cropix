import { useCallback, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { CropCanvas } from "@/components/CropCanvas";
import { CropPreview } from "@/components/CropPreview";
import { DropZone } from "@/components/DropZone";
import { ErrorBanner } from "@/components/ErrorBanner";
import { useCropSession } from "@/hooks/useCropSession";
import { useTauriFileDrop } from "@/hooks/useTauriFileDrop";
import { cn } from "@/lib/utils";

function App() {
  const session = useCropSession();
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(
    null,
  );

  const onImageReady = useCallback(
    (image: HTMLImageElement) => {
      session.onImageReady(image);
      setImageElement(image);
    },
    [session.onImageReady],
  );

  const onDropPaths = useCallback(
    (paths: string[]) => {
      setImageElement(null);
      void session.loadFromPaths(paths);
    },
    [session.loadFromPaths],
  );

  const { isDragging } = useTauriFileDrop({
    enabled: !session.busy,
    onDropPaths,
  });

  return (
    <div
      className={cn(
        "flex h-full flex-col transition-colors duration-200",
        isDragging && "bg-accent/[0.03]",
      )}
    >
      <AppHeader
        hasImage={session.hasImage}
        busy={session.busy}
        format={session.format}
        onFormatChange={session.setFormat}
        onOpen={() => {
          setImageElement(null);
          void session.openImage();
        }}
        onReset={session.resetCrop}
        onCancel={() => {
          setImageElement(null);
          session.cancelImage();
        }}
        onExport={session.exportImage}
      />

      <main className="relative flex min-h-0 flex-1 flex-col gap-3 p-4 sm:p-5">
        {isDragging && (
          <div
            className="pointer-events-none absolute inset-3 z-20 rounded-xl border-2 border-dashed border-accent/70 bg-accent/5 sm:inset-4"
            aria-hidden
          />
        )}

        <div className="min-h-0 flex-1">
          {session.imageUrl ? (
            <CropCanvas
              imageUrl={session.imageUrl}
              crop={session.crop}
              cropKey={session.cropKey}
              onCropChange={session.setCrop}
              onPixelCropChange={session.setPixelCrop}
              onImageReady={onImageReady}
            />
          ) : (
            <DropZone
              onOpen={session.openImage}
              disabled={session.busy}
              isDragging={isDragging}
            />
          )}
        </div>

        {(session.hasImage || session.error || session.status || session.busy) && (
          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-3">
            {session.hasImage ? (
              <CropPreview
                imageElement={imageElement}
                pixelCrop={session.pixelCrop}
                format={session.format}
              />
            ) : (
              <div />
            )}

            <div className="flex min-w-0 flex-1 flex-col items-stretch gap-2 sm:max-w-md sm:items-end">
              <ErrorBanner
                message={session.error}
                onDismiss={session.clearError}
              />
              {(session.busy || session.status) && !session.error && (
                <p
                  className="flex items-center justify-end gap-2 text-xs text-muted-foreground"
                  role="status"
                  aria-live="polite"
                >
                  {session.busy && (
                    <LoaderCircle
                      className="size-3.5 animate-spin text-accent"
                      aria-hidden
                    />
                  )}
                  {session.status ?? "Working…"}
                </p>
              )}
              {session.hasImage && !session.error && !session.busy && !session.status && (
                <p className="text-right text-xs text-muted-foreground">
                  Drag edges or corners to crop
                </p>
              )}
            </div>
          </footer>
        )}
      </main>
    </div>
  );
}

export default App;

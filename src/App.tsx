import { useCallback, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { CropCanvas } from "@/components/CropCanvas";
import { CropPanel } from "@/components/CropPanel";
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
        onOpen={() => {
          setImageElement(null);
          void session.openImage();
        }}
        onCancel={() => {
          setImageElement(null);
          session.cancelImage();
        }}
      />

      <main className="relative flex min-h-0 flex-1 flex-col">
        {isDragging && (
          <div
            className="pointer-events-none absolute inset-3 z-20 rounded-xl border-2 border-dashed border-accent/70 bg-accent/5 sm:inset-4"
            aria-hidden
          />
        )}

        {!session.hasImage ? (
          <div className="flex min-h-0 flex-1 p-4 sm:p-5">
            <DropZone
              onOpen={session.openImage}
              disabled={session.busy}
              isDragging={isDragging}
            />
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            <CropPanel
              naturalCrop={session.naturalCrop}
              imageNaturalSize={session.imageNaturalSize}
              aspect={session.aspect}
              format={session.format}
              busy={session.busy}
              imageElement={imageElement}
              pixelCrop={session.pixelCrop}
              onAspectChange={session.changeAspect}
              onNaturalCropChange={session.updateNaturalCrop}
              onFormatChange={session.setFormat}
              onReset={session.resetCrop}
              onExport={session.exportImage}
            />

            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 p-4 sm:p-5">
              <div className="min-h-0 flex-1">
                <CropCanvas
                  imageUrl={session.imageUrl!}
                  crop={session.crop}
                  cropKey={session.cropKey}
                  aspect={session.aspectRatio}
                  onCropChange={session.setCrop}
                  onPixelCropChange={session.setPixelCrop}
                  onImageReady={onImageReady}
                />
              </div>

              <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Drag handles to resize · drag inside to move
                </p>
                <div className="min-w-0 flex-1 sm:max-w-md sm:flex-none">
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
                </div>
              </div>
            </div>
          </div>
        )}

        {!session.hasImage && (session.error || session.status || session.busy) && (
          <div className="border-t border-border/80 px-4 py-3 sm:px-5">
            <ErrorBanner
              message={session.error}
              onDismiss={session.clearError}
            />
            {(session.busy || session.status) && !session.error && (
              <p
                className="flex items-center gap-2 text-xs text-muted-foreground"
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
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

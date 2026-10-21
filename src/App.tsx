import { useCallback, useState, type DragEvent } from "react";
import { AppHeader } from "@/components/AppHeader";
import { CropCanvas } from "@/components/CropCanvas";
import { CropPreview } from "@/components/CropPreview";
import { DropZone } from "@/components/DropZone";
import { ErrorBanner } from "@/components/ErrorBanner";
import { useCropSession } from "@/hooks/useCropSession";

function App() {
  const session = useCropSession();
  // Force preview re-render when the displayed image element is ready
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

  const onWorkspaceDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
  }, []);

  const onWorkspaceDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      const file = event.dataTransfer.files?.[0];
      if (file) {
        setImageElement(null);
        session.loadFromFile(file);
      }
    },
    [session.loadFromFile],
  );

  return (
    <div className="flex h-full flex-col">
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

      <main
        className="flex min-h-0 flex-1 flex-col gap-3 p-4"
        onDragOver={onWorkspaceDragOver}
        onDrop={onWorkspaceDrop}
      >
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
              onFile={session.loadFromFile}
              onOpen={session.openImage}
              disabled={session.busy}
            />
          )}
        </div>

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <CropPreview
            imageElement={imageElement}
            pixelCrop={session.pixelCrop}
            format={session.format}
          />
          <div className="min-w-0 flex-1 sm:max-w-md sm:flex-none">
            <ErrorBanner
              message={session.error}
              onDismiss={session.clearError}
            />
          </div>
          {session.hasImage && !session.error && (
            <p className="text-xs text-muted-foreground">
              Drag edges or corners to crop
            </p>
          )}
        </footer>
      </main>
    </div>
  );
}

export default App;

import { useCallback, useState, type DragEvent } from "react";
import { ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

type DropZoneProps = {
  onFile: (file: File) => void;
  onOpen: () => void;
  disabled?: boolean;
};

export function DropZone({ onFile, onOpen, disabled }: DropZoneProps) {
  const [active, setActive] = useState(false);

  const onDragOver = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      if (!disabled) {
        setActive(true);
      }
    },
    [disabled],
  );

  const onDragLeave = useCallback((event: DragEvent) => {
    event.preventDefault();
    setActive(false);
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      setActive(false);
      if (disabled) {
        return;
      }
      const file = event.dataTransfer.files?.[0];
      if (file) {
        onFile(file);
      }
    },
    [disabled, onFile],
  );

  return (
    <button
      type="button"
      onClick={onOpen}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      disabled={disabled}
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-muted/30 px-8 text-center transition-colors",
        active && "border-accent bg-accent/5",
        disabled && "opacity-50",
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full border border-border bg-card">
        <ImagePlus className="size-6 text-accent" />
      </div>
      <div className="space-y-1">
        <p className="text-base font-medium text-foreground">
          Drop an image or Open
        </p>
        <p className="text-sm text-muted-foreground">
          PNG, JPEG, WebP, GIF, or BMP — processed locally
        </p>
      </div>
    </button>
  );
}

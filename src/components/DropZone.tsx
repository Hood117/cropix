import { FolderOpen, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACCEPTED_IMAGE_LABEL } from "@/lib/file";
import { cn } from "@/lib/utils";

type DropZoneProps = {
  onOpen: () => void;
  disabled?: boolean;
  isDragging?: boolean;
};

export function DropZone({ onOpen, disabled, isDragging }: DropZoneProps) {
  return (
    <div
      role="region"
      aria-label="Image drop zone"
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-6 rounded-xl border border-dashed px-8 py-10 text-center transition-all duration-200",
        isDragging
          ? "border-accent bg-accent/10 shadow-[inset_0_0_0_1px_rgb(45_212_191_/_0.25)]"
          : "border-border/80 bg-muted/20 hover:border-border hover:bg-muted/30",
        disabled && "pointer-events-none opacity-50",
      )}
    >
      <div
        className={cn(
          "flex size-16 items-center justify-center rounded-2xl border bg-card transition-colors",
          isDragging ? "border-accent/50 text-accent" : "border-border text-accent",
        )}
        aria-hidden
      >
        <ImagePlus className="size-7" />
      </div>

      <div className="max-w-sm space-y-2">
        <p className="text-lg font-semibold tracking-tight text-foreground">
          {isDragging ? "Drop to open" : "Drop an image here"}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {ACCEPTED_IMAGE_LABEL}. Everything stays on your computer — no
          uploads, no accounts.
        </p>
      </div>

      <Button
        type="button"
        onClick={onOpen}
        disabled={disabled}
        aria-label="Open image from disk"
        className="min-w-[8.5rem]"
      >
        <FolderOpen />
        Open image
      </Button>
    </div>
  );
}

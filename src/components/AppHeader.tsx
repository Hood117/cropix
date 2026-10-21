import { FolderOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type AppHeaderProps = {
  hasImage: boolean;
  busy: boolean;
  onOpen: () => void;
  onCancel: () => void;
};

export function AppHeader({
  hasImage,
  busy,
  onOpen,
  onCancel,
}: AppHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border/80 px-5 sm:px-6">
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          className="flex size-7 items-center justify-center rounded-md border border-border bg-card"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none">
            <rect
              x="3.5"
              y="3.5"
              width="11"
              height="11"
              rx="1.5"
              stroke="currentColor"
              className="text-accent"
              strokeWidth="1.75"
            />
            <rect
              x="9.5"
              y="9.5"
              width="11"
              height="11"
              rx="1.5"
              stroke="currentColor"
              className="text-muted-foreground"
              strokeWidth="1.75"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <h1 className="text-[1.05rem] font-semibold tracking-tight text-foreground">
            Cropix
          </h1>
          {!hasImage && (
            <p className="hidden text-[11px] text-muted-foreground sm:block">
              Local image crop
            </p>
          )}
        </div>
      </div>

      {hasImage && (
        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpen}
            disabled={busy}
            aria-label="Open another image"
          >
            <FolderOpen />
            <span className="hidden sm:inline">Open</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={busy}
            aria-label="Cancel editing and clear image"
          >
            <X />
            Cancel
          </Button>
        </div>
      )}
    </header>
  );
}

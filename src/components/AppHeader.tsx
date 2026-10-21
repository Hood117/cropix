import { FolderOpen, RotateCcw, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { ExportFormat } from "@/lib/file";

type AppHeaderProps = {
  hasImage: boolean;
  busy: boolean;
  format: ExportFormat;
  onFormatChange: (format: ExportFormat) => void;
  onOpen: () => void;
  onReset: () => void;
  onCancel: () => void;
  onExport: () => void;
};

export function AppHeader({
  hasImage,
  busy,
  format,
  onFormatChange,
  onOpen,
  onReset,
  onCancel,
  onExport,
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
            onClick={onReset}
            disabled={busy}
            aria-label="Reset crop selection"
          >
            <RotateCcw />
            <span className="hidden sm:inline">Reset</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={busy}
            aria-label="Cancel editing and clear image"
          >
            <X />
            <span className="hidden sm:inline">Cancel</span>
          </Button>

          <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />

          <Select
            value={format}
            onValueChange={(value) => onFormatChange(value as ExportFormat)}
            disabled={busy}
          >
            <SelectTrigger aria-label="Export format">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="png">PNG</SelectItem>
              <SelectItem value="jpeg">JPEG</SelectItem>
            </SelectContent>
          </Select>

          <Button
            size="sm"
            onClick={onExport}
            disabled={busy}
            aria-label="Export cropped image"
          >
            <Download />
            Export
          </Button>
        </div>
      )}
    </header>
  );
}

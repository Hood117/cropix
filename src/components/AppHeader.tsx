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
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-5">
      <div className="flex min-w-0 items-baseline gap-2">
        <h1 className="text-lg font-semibold tracking-tight text-foreground">
          Cropix
        </h1>
        <span className="hidden text-xs text-muted-foreground sm:inline">
          Local image crop
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpen}
          disabled={busy}
          aria-label="Open image"
        >
          <FolderOpen />
          Open
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={!hasImage || busy}
          aria-label="Reset crop"
        >
          <RotateCcw />
          Reset
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={!hasImage || busy}
          aria-label="Cancel and clear image"
        >
          <X />
          Cancel
        </Button>

        <Separator orientation="vertical" className="mx-1 h-6" />

        <Select
          value={format}
          onValueChange={(value) => onFormatChange(value as ExportFormat)}
          disabled={!hasImage || busy}
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
          disabled={!hasImage || busy}
          aria-label="Export cropped image"
        >
          <Download />
          Export
        </Button>
      </div>
    </header>
  );
}

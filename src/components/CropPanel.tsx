import { Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ASPECT_OPTIONS, type AspectPreset } from "@/lib/aspect";
import type { NaturalCrop } from "@/lib/cropImage";
import type { ExportFormat } from "@/lib/file";
import { CropPreview } from "@/components/CropPreview";
import type { PixelCrop } from "react-image-crop";

type CropPanelProps = {
  naturalCrop: NaturalCrop | null;
  imageNaturalSize: { width: number; height: number } | null;
  aspect: AspectPreset;
  format: ExportFormat;
  busy: boolean;
  imageElement: HTMLImageElement | null;
  pixelCrop: PixelCrop | null;
  onAspectChange: (aspect: AspectPreset) => void;
  onNaturalCropChange: (patch: Partial<NaturalCrop>) => void;
  onFormatChange: (format: ExportFormat) => void;
  onReset: () => void;
  onExport: () => void;
};

function Field({
  label,
  id,
  value,
  onChange,
  disabled,
  max,
}: {
  label: string;
  id: string;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  max?: number;
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5" htmlFor={id}>
      <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </span>
      <Input
        id={id}
        type="number"
        min={0}
        max={max}
        step={1}
        value={Number.isFinite(value) ? value : 0}
        disabled={disabled}
        onChange={(event) => {
          const next = Number(event.target.value);
          if (Number.isFinite(next)) {
            onChange(Math.round(next));
          }
        }}
        aria-label={label}
      />
    </label>
  );
}

export function CropPanel({
  naturalCrop,
  imageNaturalSize,
  aspect,
  format,
  busy,
  imageElement,
  pixelCrop,
  onAspectChange,
  onNaturalCropChange,
  onFormatChange,
  onReset,
  onExport,
}: CropPanelProps) {
  const width = naturalCrop?.width ?? 0;
  const height = naturalCrop?.height ?? 0;
  const x = naturalCrop?.x ?? 0;
  const y = naturalCrop?.y ?? 0;

  return (
    <aside
      className="flex w-full shrink-0 flex-col border-border/80 bg-card/40 md:w-[17.5rem] md:border-r"
      aria-label="Crop controls"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4 sm:p-5">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Crop rectangle
          </h2>
          <div className="flex gap-2.5">
            <Field
              id="crop-width"
              label="Width"
              value={width}
              max={imageNaturalSize?.width}
              disabled={busy || !naturalCrop}
              onChange={(value) => onNaturalCropChange({ width: value })}
            />
            <Field
              id="crop-height"
              label="Height"
              value={height}
              max={imageNaturalSize?.height}
              disabled={busy || !naturalCrop || aspect !== "free"}
              onChange={(value) => onNaturalCropChange({ height: value })}
            />
          </div>
          <label className="flex flex-col gap-1.5" htmlFor="crop-aspect">
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              Aspect ratio
            </span>
            <Select
              value={aspect}
              onValueChange={(value) => onAspectChange(value as AspectPreset)}
              disabled={busy}
            >
              <SelectTrigger id="crop-aspect" className="w-full" aria-label="Aspect ratio">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASPECT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Crop position
          </h2>
          <div className="flex gap-2.5">
            <Field
              id="crop-x"
              label="Position X"
              value={x}
              max={imageNaturalSize?.width}
              disabled={busy || !naturalCrop}
              onChange={(value) => onNaturalCropChange({ x: value })}
            />
            <Field
              id="crop-y"
              label="Position Y"
              value={y}
              max={imageNaturalSize?.height}
              disabled={busy || !naturalCrop}
              onChange={(value) => onNaturalCropChange({ y: value })}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={onReset}
            disabled={busy}
            aria-label="Reset crop selection"
          >
            <RotateCcw />
            Reset
          </Button>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Export
          </h2>
          <label className="flex flex-col gap-1.5" htmlFor="export-format">
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              Format
            </span>
            <Select
              value={format}
              onValueChange={(value) => onFormatChange(value as ExportFormat)}
              disabled={busy}
            >
              <SelectTrigger id="export-format" className="w-full" aria-label="Export format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpeg">JPEG</SelectItem>
              </SelectContent>
            </Select>
          </label>
          <CropPreview
            imageElement={imageElement}
            pixelCrop={pixelCrop}
            format={format}
          />
          {imageNaturalSize && (
            <p className="text-xs text-muted-foreground">
              Image {imageNaturalSize.width} × {imageNaturalSize.height}px
            </p>
          )}
        </section>
      </div>

      <div className="border-t border-border/80 p-4 sm:p-5">
        <Button
          type="button"
          className="w-full"
          size="lg"
          onClick={onExport}
          disabled={busy || !naturalCrop}
          aria-label="Export cropped image"
        >
          <Download />
          Export crop
        </Button>
      </div>
    </aside>
  );
}

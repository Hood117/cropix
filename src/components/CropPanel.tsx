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
  quality: number;
  busy: boolean;
  imageElement: HTMLImageElement | null;
  pixelCrop: PixelCrop | null;
  onAspectChange: (aspect: AspectPreset) => void;
  onNaturalCropChange: (patch: Partial<NaturalCrop>) => void;
  onFormatChange: (format: ExportFormat) => void;
  onQualityChange: (quality: number) => void;
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
    <label className="flex min-w-0 flex-1 flex-col gap-1" htmlFor={id}>
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
        className="h-8 px-2.5 text-sm"
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
  quality,
  busy,
  imageElement,
  pixelCrop,
  onAspectChange,
  onNaturalCropChange,
  onFormatChange,
  onQualityChange,
  onReset,
  onExport,
}: CropPanelProps) {
  const width = naturalCrop?.width ?? 0;
  const height = naturalCrop?.height ?? 0;
  const x = naturalCrop?.x ?? 0;
  const y = naturalCrop?.y ?? 0;
  const jpegExport = format === "jpeg";

  return (
    <aside
      className="flex w-full shrink-0 flex-col overflow-hidden border-border/80 bg-card/40 md:w-[17rem] md:border-r"
      aria-label="Crop controls"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-3.5">
        <section className="space-y-2.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Crop rectangle
          </h2>
          <div className="flex gap-2">
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
          <label className="flex flex-col gap-1" htmlFor="crop-aspect">
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              Aspect ratio
            </span>
            <Select
              value={aspect}
              onValueChange={(value) => onAspectChange(value as AspectPreset)}
              disabled={busy}
            >
              <SelectTrigger
                id="crop-aspect"
                className="h-8 w-full"
                aria-label="Aspect ratio"
              >
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

        <section className="space-y-2.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Crop position
          </h2>
          <div className="flex gap-2">
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
            size="sm"
            className="w-full"
            onClick={onReset}
            disabled={busy}
            aria-label="Reset crop selection"
          >
            <RotateCcw />
            Reset
          </Button>
        </section>

        <section className="space-y-2.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Export
          </h2>
          <label className="flex flex-col gap-1" htmlFor="export-format">
            <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              Format
            </span>
            <Select
              value={format}
              onValueChange={(value) => onFormatChange(value as ExportFormat)}
              disabled={busy}
            >
              <SelectTrigger
                id="export-format"
                className="h-8 w-full"
                aria-label="Export format"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpeg">JPEG</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="export-quality"
                className="text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground"
              >
                Quality
              </label>
              <span className="text-xs tabular-nums text-foreground">
                {jpegExport ? `${quality}%` : "Lossless"}
              </span>
            </div>
            <input
              id="export-quality"
              type="range"
              min={1}
              max={100}
              step={1}
              value={quality}
              disabled={busy || !jpegExport}
              onChange={(event) => onQualityChange(Number(event.target.value))}
              aria-label="Export quality"
              aria-valuemin={1}
              aria-valuemax={100}
              aria-valuenow={quality}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-accent disabled:cursor-not-allowed disabled:opacity-40"
            />
            {!jpegExport && (
              <p className="text-[11px] leading-snug text-muted-foreground">
                PNG keeps full quality. Switch to JPEG to choose compression.
              </p>
            )}
          </div>

          <CropPreview
            imageElement={imageElement}
            pixelCrop={pixelCrop}
            format={format}
            quality={quality}
          />
        </section>

        <div className="mt-auto pt-1">
          <Button
            type="button"
            className="w-full"
            onClick={onExport}
            disabled={busy || !naturalCrop}
            aria-label="Export cropped image"
          >
            <Download />
            Export crop
          </Button>
        </div>
      </div>
    </aside>
  );
}

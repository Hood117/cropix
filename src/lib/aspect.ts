export type AspectPreset =
  | "free"
  | "1:1"
  | "4:3"
  | "3:2"
  | "16:9"
  | "9:16";

export const ASPECT_OPTIONS: { value: AspectPreset; label: string }[] = [
  { value: "free", label: "Freeform" },
  { value: "1:1", label: "1 : 1" },
  { value: "4:3", label: "4 : 3" },
  { value: "3:2", label: "3 : 2" },
  { value: "16:9", label: "16 : 9" },
  { value: "9:16", label: "9 : 16" },
];

export function aspectValue(preset: AspectPreset): number | undefined {
  switch (preset) {
    case "1:1":
      return 1;
    case "4:3":
      return 4 / 3;
    case "3:2":
      return 3 / 2;
    case "16:9":
      return 16 / 9;
    case "9:16":
      return 9 / 16;
    default:
      return undefined;
  }
}

import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACCEPTED_IMAGE_LABEL } from "@/lib/file";
import { cn } from "@/lib/utils";

type WelcomeHeroProps = {
  onOpen: () => void;
  disabled?: boolean;
  isDragging?: boolean;
};

function CropHandles() {
  const handles = [
    "left-0 top-0 -translate-x-1/2 -translate-y-1/2",
    "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2",
    "right-0 top-0 translate-x-1/2 -translate-y-1/2",
    "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
    "right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
    "left-0 bottom-0 -translate-x-1/2 translate-y-1/2",
    "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2",
    "right-0 bottom-0 translate-x-1/2 translate-y-1/2",
  ];

  return (
    <>
      {handles.map((pos) => (
        <span
          key={pos}
          className={cn(
            "absolute size-2.5 rounded-[2px] bg-white shadow-[0_0_0_1px_rgb(15_17_21_/_0.45)]",
            pos,
          )}
        />
      ))}
    </>
  );
}

export function WelcomeHero({ onOpen, disabled, isDragging }: WelcomeHeroProps) {
  return (
    <section
      role="region"
      aria-label="Welcome — drop or open an image"
      className={cn(
        "relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-background",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      {/* Brand-matched atmosphere */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_30%,rgb(45_212_191_/_0.12),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_85%_85%,rgb(45_212_191_/_0.05),transparent)]" />
      </div>

      {/* Centered crop preview — same chrome language as the editor */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-5 pb-4 pt-16 sm:px-8">
        <div
          className={cn(
            "relative w-full max-w-3xl transition-transform duration-500 ease-out",
            isDragging && "scale-[1.015]",
          )}
        >
          <div
            className={cn(
              "relative overflow-hidden rounded-xl border bg-card transition-colors duration-300",
              isDragging ? "border-accent/70" : "border-border/80",
            )}
          >
            <div className="relative aspect-[16/10] w-full">
              <img
                src="/welcome-hero.svg"
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 bg-black/40" />

              {/* Active crop window */}
              <div
                className={cn(
                  "absolute left-[14%] top-[16%] h-[64%] w-[58%] transition-shadow duration-300",
                  isDragging && "shadow-[0_0_0_1px_rgb(45_212_191_/_0.35)]",
                )}
              >
                <div className="absolute inset-0 overflow-hidden rounded-[2px] shadow-[0_0_0_9999px_rgb(0_0_0_/_0.48)]">
                  <img
                    src="/welcome-hero.svg"
                    alt=""
                    className="absolute left-1/2 top-1/2 h-[175%] w-[175%] max-w-none -translate-x-[42%] -translate-y-[42%] object-cover"
                    draggable={false}
                  />
                </div>
                <div
                  className={cn(
                    "absolute inset-0 rounded-[2px] border-2",
                    isDragging ? "border-accent" : "border-accent/85",
                  )}
                >
                  <CropHandles />
                </div>
              </div>
            </div>
          </div>

          {/* Drop affordance ring when dragging */}
          <div
            className={cn(
              "pointer-events-none absolute -inset-3 rounded-2xl border-2 border-dashed border-accent/60 transition-opacity duration-200",
              isDragging ? "opacity-100" : "opacity-0",
            )}
            aria-hidden
          />
        </div>

        <div className="cropix-fade-up mt-8 max-w-lg text-center">
          <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {isDragging ? "Drop to open" : "Drop an image to start"}
          </h2>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
            Or click Open image. Works with {ACCEPTED_IMAGE_LABEL}.
          </p>
        </div>

        <div className="cropix-fade-up cropix-fade-up--delay-1 mt-6">
          <Button
            type="button"
            size="lg"
            onClick={onOpen}
            disabled={disabled}
            aria-label="Open image from disk"
            className="min-w-[10.5rem] px-6"
          >
            <FolderOpen />
            Open image
          </Button>
        </div>
      </div>
    </section>
  );
}

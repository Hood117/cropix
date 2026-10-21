import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorBannerProps = {
  message: string | null;
  onDismiss: () => void;
};

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className="flex items-center gap-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      <p className="flex-1">{message}</p>
      <Button
        variant="ghost"
        size="icon"
        className="size-7 text-destructive hover:bg-destructive/15 hover:text-destructive"
        onClick={onDismiss}
        aria-label="Dismiss error"
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}

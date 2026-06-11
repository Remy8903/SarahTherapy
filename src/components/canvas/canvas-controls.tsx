import { Button } from "@/components/ui/button";
import { RotateCcw, Maximize, Minimize } from "lucide-react";

type CanvasControlsProps = {
  revealedCount: number;
  totalCount: number;
  isSyncing: boolean;
  onReset: () => void;
  onFullscreen: () => void;
};

export function CanvasControls({
  revealedCount,
  totalCount,
  isSyncing,
  onReset,
  onFullscreen,
}: CanvasControlsProps) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">
          {revealedCount} / {totalCount} revealed
        </span>
        <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: totalCount > 0 ? `${(revealedCount / totalCount) * 100}%` : "0%",
            }}
          />
        </div>
        {isSyncing && (
          <span className="text-xs text-muted-foreground">Syncing...</span>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcw className="mr-1 h-4 w-4" />
          Reset
        </Button>
        <Button variant="outline" size="sm" onClick={onFullscreen}>
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
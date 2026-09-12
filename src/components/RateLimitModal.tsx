import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Clock, AlertTriangle } from "lucide-react";

interface RateLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionName: string;
  initialSeconds: number;
}

export function RateLimitModal({
  isOpen,
  onClose,
  actionName,
  initialSeconds,
}: RateLimitModalProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);

  useEffect(() => {
    setSecondsRemaining(initialSeconds);
  }, [initialSeconds, isOpen]);

  useEffect(() => {
    if (!isOpen || secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, secondsRemaining]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <div className="mx-auto size-12 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2">
            <ShieldAlert className="size-6" />
          </div>
          <DialogTitle className="text-lg font-bold text-foreground">
            HTTP 429 Too Many Requests
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            To prevent spam and protect server performance, rate limits are enforced on {actionName}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-1">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              Cooldown Timer Active
            </p>
            <p className="text-3xl font-mono font-black text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1.5 mt-1">
              <Clock className="size-6 animate-pulse" /> {secondsRemaining}s
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Please wait until the countdown finishes before trying again.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            size="sm"
            disabled={secondsRemaining > 0}
            onClick={onClose}
            className="text-xs font-bold w-full sm:w-auto px-6"
          >
            {secondsRemaining > 0 ? `Wait ${secondsRemaining}s` : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


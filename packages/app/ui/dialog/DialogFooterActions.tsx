import { Button } from "@/ui/buttons";
import { useRef, forwardRef, Ref, RefObject } from "react";

interface DialogFooterActionsProps {
  primaryAction?: () => void;
  primaryText?: string;
  secondaryAction?: () => void;
  secondaryText?: string;
  ref?: RefObject<HTMLButtonElement>;
}

export const DialogFooterActions = forwardRef<
  HTMLButtonElement,
  DialogFooterActionsProps
>(({ primaryAction, primaryText, secondaryAction, secondaryText }, ref) => {
  console.log("ref:", ref);
  return (
    <div className="flex w-full pt-4 space-x-2">
      {secondaryAction && (
        <Button
          size="sm"
          width="full"
          action="tertiary"
          onClick={secondaryAction}
          className="text-white border-none bg-opacity-20 hover:bg-opacity-30 focus:bg-opacity-30 focus:ring-gray-600 active:ring-gray-700"
        >
          {secondaryText}
        </Button>
      )}
      {primaryAction && (
        <Button ref={ref} size="sm" width="full" onClick={primaryAction}>
          {primaryText}
        </Button>
      )}
    </div>
  );
});

DialogFooterActions.displayName = "DialogFooterActions";

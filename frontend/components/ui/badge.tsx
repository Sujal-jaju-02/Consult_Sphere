import * as React from "react";

import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-sage-50 px-3 py-1 text-xs font-medium text-sage-700 ring-1 ring-sage-100",
        className
      )}
      {...props}
    />
  );
}

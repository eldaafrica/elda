import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        default:
          "border-gray-200 bg-white text-gray-900",

        destructive:
          "border-red-200 bg-red-50 text-red-700",
      },
    },

    defaultVariants: {
      variant: "default",
    },
  }
);

/* =========================================================
   ALERT
========================================================= */

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));

Alert.displayName = "Alert";

/* =========================================================
   TITLE
========================================================= */

const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      "mb-1 font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));

AlertTitle.displayName = "AlertTitle";

/* =========================================================
   DESCRIPTION
========================================================= */

const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-sm leading-relaxed",
      className
    )}
    {...props}
  />
));

AlertDescription.displayName = "AlertDescription";

/* =========================================================
   EXPORTS
========================================================= */

export {
  Alert,
  AlertTitle,
  AlertDescription,
};
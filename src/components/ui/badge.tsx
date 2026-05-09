import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-amber-600 text-zinc-950",
        secondary: "border-transparent bg-zinc-800 text-zinc-300",
        destructive: "border-transparent bg-red-700 text-zinc-50",
        outline: "border-zinc-700 text-zinc-300",
        legendary: "border-amber-500/50 bg-amber-500/10 text-amber-400",
        profession: "border-zinc-700 bg-zinc-800/80 text-zinc-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

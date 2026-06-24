import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import { ButtonProps, buttonVariants } from "@/components/ui/button";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    role="navigation"
    aria-label="pagination"
    className={cn("mx-auto flex w-full justify-center py-4", className)}
    {...props}
  />
);

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<"ul">>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={cn("flex flex-row items-center gap-1.5", className)} {...props} />
  ),
);

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<"li">>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn("list-none", className)} {...props} />,
);

type PaginationLinkProps = {
  isActive?: boolean;
  isDisabled?: boolean;
} & Pick<ButtonProps, "size"> &
  React.ComponentProps<"a">;

const PaginationLink = ({ 
  className, 
  isActive, 
  isDisabled,
  size = "icon", 
  ...props 
}: PaginationLinkProps) => (
  <a
    aria-current={isActive ? "page" : undefined}
    aria-disabled={isDisabled}
    className={cn(
      buttonVariants({
        variant: isActive ? "outline" : "ghost",
        size,
      }),
      "transition-all duration-200", // Animation douce
      isActive && "border-primary/50 shadow-sm font-bold text-primary ring-1 ring-primary/10", // État actif plus riche
      isDisabled && "pointer-events-none opacity-50 grayscale", // Gestion du disabled
      !isActive && !isDisabled && "hover:bg-accent hover:text-accent-foreground active:scale-95", // Effet de clic
      className,
    )}
    {...props}
  />
);

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Page précédente"
    size="default"
    className={cn("gap-1.5 pl-2.5", className)}
    {...props}
  >
    <ChevronLeft className="size-4" />
    <span className="hidden sm:inline">Précédent</span> 
  </PaginationLink>
);

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Page suivante"
    size="default"
    className={cn("gap-1.5 pr-2.5", className)}
    {...props}
  >
    <span className="hidden sm:inline">Suivant</span>
    <ChevronRight className="size-4" />
  </PaginationLink>
);

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center text-muted-foreground", className)}
    {...props}
  >
    <MoreHorizontal className="size-4" />
    <span className="sr-only">Plus de pages</span>
  </span>
);

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
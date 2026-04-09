// UI: Previous/next pagination controls for data tables.

import { Button } from "@/components/ui/button";

export interface DataTablePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}

export function DataTablePagination({
  page,
  totalPages,
  onPageChange,
}: DataTablePaginationProps) {
  return (
    <div className="flex items-center justify-end gap-2 py-4">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Previous page"
      >
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        aria-label="Next page"
      >
        Next
      </Button>
    </div>
  );
}

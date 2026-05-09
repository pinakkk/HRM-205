import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-8 text-center">
      <div className="text-sm font-medium">{title}</div>
      {description && (
        <div className="max-w-sm text-xs text-neutral-500">{description}</div>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

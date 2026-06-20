export default function SkeletonCard() {
  return (
    <div className="flex flex-col overflow-hidden bg-white dark:bg-neutral-900 animate-pulse">
      <div className="aspect-square w-full bg-neutral-100 dark:bg-neutral-800 rounded-lg" />
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-neutral-100 dark:bg-neutral-800 rounded w-1/3" />
        <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-3/4" />
        <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-1/2 mt-3" />
      </div>
    </div>
  );
}

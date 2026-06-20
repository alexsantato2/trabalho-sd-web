export default function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3 pr-4">
          <div className="h-4 bg-neutral-100 dark:bg-neutral-800 rounded w-full max-w-32" />
        </td>
      ))}
    </tr>
  );
}

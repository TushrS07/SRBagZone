import Skeleton from './Skeleton'

/** A stack of full-width row placeholders — used for admin tables/lists
 *  in place of "Loading…" text. */
export default function RowsSkeleton({ rows = 6, className = '' }) {
  return (
    <div className={`flex flex-col gap-2.5 ${className}`} aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} rounded="rounded-[10px]" className="h-14 w-full" />
      ))}
    </div>
  )
}

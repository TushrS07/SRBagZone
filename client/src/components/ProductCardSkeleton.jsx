import Skeleton from './Skeleton'

/** Placeholder that mirrors ProductCard's layout so the grid doesn't shift
 *  when real cards replace the skeletons. */
function ProductCardSkeleton() {
  return (
    <article className="bg-surface rounded-md overflow-hidden border border-line flex flex-col">
      <Skeleton rounded="rounded-none" className="w-full aspect-square" />
      <div className="px-[18px] pt-[18px] pb-5 flex flex-col gap-3 flex-1 max-sm:px-[14px] max-sm:pt-[14px] max-sm:pb-4">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-5 w-3/4" />
        <div className="mt-auto flex items-center justify-between gap-[10px] pt-[10px] max-sm:flex-col max-sm:items-start max-sm:gap-[10px]">
          <Skeleton className="h-6 w-16" />
          <Skeleton rounded="rounded-full" className="h-9 w-[68px] max-sm:w-20" />
        </div>
      </div>
    </article>
  )
}

/** A full product grid of skeleton cards (same grid classes as the real one). */
export default function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-4 gap-[22px] max-lg:grid-cols-3 max-sm:grid-cols-2 max-sm:gap-3 max-xs:grid-cols-1">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

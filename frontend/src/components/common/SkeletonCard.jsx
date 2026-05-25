// src/components/common/SkeletonCard.jsx
export default function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-sm border border-gray-100">
      <div className="h-44 bg-gray-200 animate-skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-skeleton w-3/4" />
        <div className="h-3 bg-gray-200 rounded animate-skeleton w-1/2" />
        <div className="flex gap-3">
          <div className="h-5 bg-gray-200 rounded-full animate-skeleton w-12" />
          <div className="h-5 bg-gray-200 rounded animate-skeleton w-16" />
          <div className="h-5 bg-gray-200 rounded animate-skeleton w-20" />
        </div>
      </div>
    </div>
  )
}
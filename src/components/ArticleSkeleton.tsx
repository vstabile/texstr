export default function ArticleSkeleton() {
  return (
    <div class="flex flex-col items-center justify-center space-y-4">
      <div class="w-4/5 h-8 bg-gray-200 animate-pulse rounded"></div>
      <div class="w-64 h-8 bg-gray-100 animate-pulse rounded"></div>
      <div class="space-y-2 w-full max-w-2xl pt-4">
        <div class="h-4 bg-gray-100 animate-pulse rounded"></div>
        <div class="h-4 bg-gray-100 animate-pulse rounded"></div>
        <div class="h-4 bg-gray-100 animate-pulse rounded"></div>
        <div class="h-4 bg-gray-100 animate-pulse rounded"></div>
        <div class="h-4 bg-gray-100 animate-pulse rounded w-5/6"></div>
      </div>
      <div class="space-y-2 w-full max-w-2xl pt-4">
        <div class="h-4 bg-gray-100 animate-pulse rounded"></div>
        <div class="h-4 bg-gray-100 animate-pulse rounded"></div>
        <div class="h-4 bg-gray-100 animate-pulse rounded"></div>
        <div class="h-4 bg-gray-100 animate-pulse rounded w-5/6"></div>
      </div>
    </div>
  );
}

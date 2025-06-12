export default function ArticleSkeleton() {
  return (
    <div class="flex-1 max-w-[800px] mx-auto px-6 py-16 w-full animate-pulse">
      <div class="space-y-8">
        <div class="text-center space-y-4">
          <div class="h-8 bg-muted rounded-lg w-3/4 mx-auto" />
          <div class="h-4 bg-muted rounded w-1/4 mx-auto" />
        </div>
        <div class="space-y-6">
          <div class="h-4 bg-muted rounded w-full" />
          <div class="h-4 bg-muted rounded w-5/6" />
          <div class="h-4 bg-muted rounded w-4/6" />
        </div>
        <div class="space-y-6">
          <div class="h-4 bg-muted rounded w-full" />
          <div class="h-4 bg-muted rounded w-5/6" />
          <div class="h-4 bg-muted rounded w-4/6" />
        </div>
      </div>
    </div>
  );
}

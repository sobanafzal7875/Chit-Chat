export function ChatLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="h-16 border-b border-border/50 bg-card animate-pulse" />
      <div className="flex-1 max-w-6xl w-full mx-auto p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border/50 bg-card h-[calc(100vh-120px)] animate-pulse" />
        <div className="md:col-span-3 rounded-xl border border-border/50 bg-card h-[calc(100vh-120px)] animate-pulse" />
      </div>
    </div>
  );
}

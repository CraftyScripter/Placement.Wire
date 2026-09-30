import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas p-4 text-center">
      <div className="relative flex items-center justify-center">
        <div className="h-16 w-16 rounded-full border-4 border-line border-t-primary animate-spin" />
        <Loader2 className="absolute h-6 w-6 text-primary animate-pulse" />
      </div>
      <p className="mt-4 text-sm font-normal text-muted">Loading PlacementWire...</p>
    </div>
  );
}

import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0c10] p-4 text-center">
      <div className="relative flex items-center justify-center">
        <div className="h-16 w-16 rounded-full border-4 border-white/10 border-t-indigo-500 animate-spin" />
        <Loader2 className="absolute h-6 w-6 text-indigo-400 animate-pulse" />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-400">Loading PlacementWire...</p>
    </div>
  );
}

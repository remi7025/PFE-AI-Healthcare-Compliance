import { Sparkles } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="loading-screen flex min-h-screen flex-col items-center justify-center gap-8">
      <div className="relative">
        <div className="loading-ring absolute inset-0 rounded-full border-2 border-transparent border-t-[#f2c811] border-r-[#118dff]" />
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f2c811] to-[#ffd54f] shadow-2xl shadow-yellow-500/30">
          <Sparkles className="h-9 w-9 text-[#1a2332]" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-white">AI Healthcare Compliance</p>
        <p className="mt-1 text-sm text-white/50">Loading regulatory intelligence…</p>
      </div>
      <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10">
        <div className="loading-bar h-full w-full rounded-full" />
      </div>
    </div>
  );
}

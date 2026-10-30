import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#EDEDED] border border-[#DCDCDC] flex items-center justify-center text-xl font-bold text-[#262626] mb-2">
        404
      </div>
      <h2 className="text-3xl font-extrabold text-[#262626] tracking-tight">Page Not Found</h2>
      <p className="text-sm text-[#666666] max-w-sm">The requested resource could not be found in the autonomous workspace.</p>
      <Link
        href="/"
        className="px-6 py-3 rounded-full bg-[#74D96F] hover:bg-[#62CE5C] text-[#262626] text-xs font-bold shadow-xs transition active:translate-y-0.5"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}

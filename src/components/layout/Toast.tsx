import { CheckCircle2 } from "lucide-react";
import type { Workspace } from "../../hooks/useWorkspace";
export function Toast({ workspace }: { workspace: Workspace }) {
  const { toast } = workspace;
  return (
    <>
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl bg-[#1D1D1F]/95 text-white shadow-[0_12px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl flex items-center gap-3 max-w-md">
          <CheckCircle2 className="w-4 h-4 text-[#34C759] shrink-0" />
          <div className="text-xs">
            <div className="font-bold">{toast.title}</div>
            {toast.message && (
              <div className="text-white/75 mt-0.5">{toast.message}</div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-bg-shell px-4 py-12">
      <div className="ambient-light pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

      <div className="stage-fade-in relative z-10 flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[17px] font-semibold text-text-1">LOOP</span>
          <span className="text-[13px] text-text-3">Entre falando. Nada mais.</span>
        </div>

        <div className="w-full rounded-[20px] border border-stroke bg-glass-dark p-6 backdrop-blur-2xl">{children}</div>
      </div>
    </div>
  );
}

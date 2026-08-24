export function HomeHero({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center gap-4 pt-4 pb-2 text-center">
      <span
        className="orb-pulse h-12 w-12 rounded-full"
        style={{ background: "radial-gradient(circle at 35% 30%, var(--amb-1), var(--amb-2) 60%, var(--amb-3))" }}
        aria-hidden="true"
      />
      <div className="flex flex-col gap-1">
        <h1 className="text-[20px] font-semibold text-text-1">Bem-vindo de volta, {name}</h1>
        <p className="text-[14px] text-text-3">Pronto pra entrar numa sala?</p>
      </div>
    </div>
  );
}

import { Clock, Hash, MonitorUp, Sparkles, Users, Zap } from "lucide-react";

// Fictional data only — nothing here touches Supabase or LiveKit.
// Avatars come from i.pravatar.cc (free public placeholder photos, tiny 64px
// requests) so this costs nothing and needs no real accounts.

const PEOPLE = [
  { id: "1", name: "Marina Souza", photo: 12, online: true, pro: true },
  { id: "2", name: "Thiago Alves", photo: 33, online: true, pro: false },
  { id: "3", name: "Camila Rocha", photo: 47, online: true, pro: false },
  { id: "4", name: "Diego Fontes", photo: 5, online: false, pro: true },
  { id: "5", name: "Larissa Prado", photo: 65, online: false, pro: false },
  { id: "6", name: "Rafael Nunes", photo: 22, online: true, pro: false },
  { id: "7", name: "Beatriz Lima", photo: 9, online: false, pro: false },
  { id: "8", name: "Gustavo Reis", photo: 51, online: false, pro: false },
  { id: "9", name: "Isabela Cruz", photo: 38, online: true, pro: false },
  { id: "10", name: "Pedro Salles", photo: 60, online: false, pro: false },
];

const CONVERSATIONS = [
  { roomId: "avisos", roomName: "avisos", author: "Marina Souza", photo: 12, content: "deploy novo saiu, dá uma olhada: loop-app.vercel.app/changelog", time: "há 8 min" },
  { roomId: "duvidas", roomName: "dúvidas", author: "Thiago Alves", photo: 33, content: "alguém sabe configurar o webhook do LiveKit?", time: "há 41 min" },
  { roomId: "random", roomName: "random", author: "Camila Rocha", photo: 47, content: "bom dia! café tá pronto ☕", time: "há 2h" },
];

const VOICE_ROOMS = [
  { roomId: "geral", roomName: "geral", people: [{ name: "Diego Fontes", photo: 5 }, { name: "Larissa Prado", photo: 65 }, { name: "Rafael Nunes", photo: 22 }], sharing: true, joins: 22, unique: 6, lastActive: "agora mesmo" },
  { roomId: "foco", roomName: "foco", people: [{ name: "Isabela Cruz", photo: 38 }], sharing: false, joins: 7, unique: 2, lastActive: "há 3h" },
  { roomId: "pausa", roomName: "pausa", people: [], sharing: false, joins: 4, unique: 3, lastActive: "há 1d" },
];

const CHAT_MESSAGES = [
  { id: "1", author: "Marina Souza", photo: 12, own: false, time: "09:14", text: "consegui replicar o bug, vou mandar um print" },
  { id: "2", author: "Marina Souza", photo: 12, own: false, time: "09:14", image: "https://picsum.photos/seed/loopbug/220/130" },
  { id: "3", author: "Você", own: true, time: "09:16", text: "boa, valeu! olha esse artigo sobre o assunto: https://web.dev/articles/render-blocking-resources" },
  { id: "4", author: "Thiago Alves", photo: 33, own: false, time: "09:22", text: "lendo agora 👀" },
];

export default function DemoPage() {
  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="relative flex flex-1 flex-col overflow-y-auto">
        <div className="ambient-light pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
        <div className="relative flex flex-col gap-8 px-8 py-6">
          <div className="flex items-center gap-2 rounded-[10px] border border-supporter/30 bg-supporter-bg px-3 py-2 text-[12.5px] text-supporter">
            <Sparkles size={14} strokeWidth={1.5} className="shrink-0" />
            Prévia com dados fictícios — nada aqui é real, nada consome LiveKit ou Supabase.
          </div>

          <div className="flex flex-col items-center gap-4 pt-2 pb-2 text-center">
            <span
              className="orb-pulse h-12 w-12 rounded-full"
              style={{ background: "radial-gradient(circle at 35% 30%, var(--amb-1), var(--amb-2) 60%, var(--amb-3))" }}
              aria-hidden="true"
            />
            <div className="flex flex-col gap-1">
              <h1 className="text-[20px] font-semibold text-text-1">Assim que o LOOP fica com uso de verdade</h1>
              <p className="text-[14px] text-text-3">10 pessoas fictícias, conversas e salas de voz preenchidas.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="px-1 text-[13px] font-medium text-text-2">Salas de voz esta semana</h2>
            <div className="grid w-full grid-cols-1 gap-4 [@media(min-width:700px)]:grid-cols-2">
              {VOICE_ROOMS.map((room) => (
                <div
                  key={room.roomId}
                  className="flex flex-col gap-4 rounded-[20px] border border-stroke bg-glass-dark p-5 backdrop-blur-2xl"
                  style={{ boxShadow: "0 18px 50px rgba(0,0,0,.45)" }}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-[15px] font-medium text-text-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${room.people.length > 0 ? "bg-live" : "bg-text-3/50"}`} />
                      {room.roomName}
                    </span>
                    {room.sharing && (
                      <span className="flex items-center gap-1 rounded-full bg-glass-1 px-2.5 py-1 text-[11px] text-text-2">
                        <MonitorUp size={12} strokeWidth={1.5} />
                        Compartilhando
                      </span>
                    )}
                  </div>

                  {room.people.length > 0 ? (
                    <div className="flex items-center">
                      {room.people.map((p, i) => (
                        // eslint-disable-next-line @next/next/no-img-element -- fictional demo avatar, not part of the real app's image pipeline
                        <img
                          key={p.name}
                          src={`https://i.pravatar.cc/64?img=${p.photo}`}
                          alt={p.name}
                          title={p.name}
                          className="h-9 w-9 rounded-full border-2 border-bg-shell object-cover"
                          style={{ marginLeft: i === 0 ? 0 : -10, zIndex: room.people.length - i }}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-[13px] text-text-3">Ninguém aqui agora.</p>
                  )}

                  <div className="mt-auto flex items-center justify-between border-t border-stroke-soft pt-3 text-[12px] text-text-3">
                    <span className="flex items-center gap-1.5">
                      <Users size={13} strokeWidth={1.5} />
                      {room.joins} entradas · {room.unique} pessoas essa semana
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} strokeWidth={1.5} />
                      {room.lastActive}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="px-1 text-[13px] font-medium text-text-2">Conversas</h2>
            <div className="grid grid-cols-1 gap-3 [@media(min-width:700px)]:grid-cols-3">
              {CONVERSATIONS.map((c) => (
                <div
                  key={c.roomId}
                  className="flex flex-col gap-2 rounded-[16px] border border-stroke bg-glass-dark p-4 backdrop-blur-2xl"
                >
                  <span className="flex items-center gap-1.5 text-[13px] font-medium text-text-1">
                    <Hash size={13} strokeWidth={1.5} className="text-text-3" />
                    {c.roomName}
                  </span>
                  <div className="flex items-start gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element -- fictional demo avatar */}
                    <img
                      src={`https://i.pravatar.cc/64?img=${c.photo}`}
                      alt={c.author}
                      className="mt-0.5 h-6 w-6 shrink-0 rounded-full object-cover"
                    />
                    <p className="line-clamp-2 text-[12.5px] text-text-2">
                      <span className="text-text-1">{c.author}:</span> {c.content}
                    </p>
                  </div>
                  <span className="text-[11px] text-text-3">{c.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="px-1 text-[13px] font-medium text-text-2">Pessoas</h2>
            <div className="grid grid-cols-2 gap-3 [@media(min-width:560px)]:grid-cols-3 [@media(min-width:900px)]:grid-cols-5">
              {PEOPLE.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col items-center gap-2 rounded-[16px] border border-stroke bg-glass-dark p-4 text-center backdrop-blur-2xl"
                >
                  <span className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element -- fictional demo avatar */}
                    <img
                      src={`https://i.pravatar.cc/64?img=${p.photo}`}
                      alt={p.name}
                      className={`h-12 w-12 rounded-full object-cover ${p.online ? "" : "opacity-40"}`}
                    />
                    <span
                      className={`absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-bg-shell ${
                        p.online ? "bg-live" : "border-text-3 bg-transparent"
                      }`}
                    />
                  </span>
                  <span className="flex flex-wrap items-center justify-center gap-1">
                    <span className="truncate text-[13px] font-medium text-text-1">{p.name.split(" ")[0]}</span>
                    {p.pro && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-supporter/40 bg-supporter-bg px-2 py-0.5 text-[10px] font-medium text-supporter">
                        <Zap size={10} strokeWidth={1.5} />
                        PRO
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] text-text-3">{p.online ? "Online" : "Offline"}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="px-1 text-[13px] font-medium text-text-2">Chat de exemplo — #avisos</h2>
            <div className="flex flex-col gap-4 rounded-[20px] border border-stroke bg-glass-dark p-5 backdrop-blur-2xl">
              {CHAT_MESSAGES.map((m) => (
                <div key={m.id} className={`flex items-end gap-2 ${m.own ? "flex-row-reverse" : ""}`}>
                  {m.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- fictional demo avatar
                    <img src={`https://i.pravatar.cc/64?img=${m.photo}`} alt={m.author} className="h-8 w-8 shrink-0 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-[11px] font-medium text-white">
                      {m.author.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <div className={`flex max-w-[62%] flex-col gap-1 ${m.own ? "items-end" : "items-start"}`}>
                    {!m.own && <span className="px-1 text-[12px] font-medium text-text-2">{m.author}</span>}
                    {m.image ? (
                      // eslint-disable-next-line @next/next/no-img-element -- fictional demo attachment
                      <img src={m.image} alt="" className="max-w-[220px] rounded-2xl border border-stroke" />
                    ) : (
                      <p
                        className={`rounded-2xl px-3.5 py-2 text-[13.5px] break-words whitespace-pre-wrap backdrop-blur-2xl ${
                          m.own ? "bg-glass-2 text-text-1" : "bg-glass-dark text-text-1"
                        }`}
                      >
                        {m.text}
                      </p>
                    )}
                    <span className="px-1 text-[11px] text-text-3">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

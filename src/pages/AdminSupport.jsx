import { useEffect, useMemo, useRef, useState } from "react";
import supabase from "../lib/supabase";

const ADMIN_EMAIL = "dragonarc977@gmail.com";

const formatTime = (value) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export default function AdminSupport() {
  const bottomRef = useRef(null);

  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const active = useMemo(
    () => tickets.find((t) => t.id === activeTicket),
    [tickets, activeTicket]
  );

  // 🔐 AUTH + LOAD TICKETS
  useEffect(() => {
    let channel;

    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUser = session?.user;
      if (!currentUser || currentUser.email !== ADMIN_EMAIL) {
        alert("Not authorized");
        return;
      }

      setUser(currentUser);

      const { data } = await supabase
        .from("support_tickets")
        .select("*")
        .order("last_message_at", { ascending: false });

      setTickets(data || []);
      setActiveTicket(data?.[0]?.id);

      // realtime tickets
      channel = supabase
        .channel("admin-tickets")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "support_tickets" },
          () => loadTickets()
        )
        .subscribe();
    };

    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // 🔄 LOAD MESSAGES
  useEffect(() => {
    if (!activeTicket) return;

    let channel;

    const load = async () => {
      const { data } = await supabase
        .from("support_messages")
        .select("*")
        .eq("ticket_id", activeTicket)
        .order("created_at");

      setMessages(data || []);

      channel = supabase
        .channel(`admin-msg-${activeTicket}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "support_messages",
            filter: `ticket_id=eq.${activeTicket}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new]);
            loadTickets();
          }
        )
        .subscribe();
    };

    load();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [activeTicket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadTickets() {
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .order("last_message_at", { ascending: false });

    setTickets(data || []);
  }

  // ✉️ SEND MESSAGE
  async function sendMessage(e) {
    e.preventDefault();
    if (!text.trim() || !activeTicket) return;

    const body = text;
    setText("");

    await supabase.from("support_messages").insert({
      ticket_id: activeTicket,
      sender_id: user.id,
      sender_role: "agent", // ✅ FIXED
      body,
    });
  }

  // ✅ RESOLVE / REOPEN
  async function updateStatus(status) {
    if (!activeTicket) return;

    await supabase
      .from("support_tickets")
      .update({ status }) // open / resolved
      .eq("id", activeTicket);

    loadTickets();
  }

  return (
    <div className="h-[calc(100vh-160px)] flex bg-[#0b0b0f] text-white font-sans">

      {/* SIDEBAR */}
      <aside className="w-[320px] border-r border-white/5 bg-[#0f0f14] flex flex-col">

        <div className="p-4 border-b border-white/5">
          <h2 className="text-lg font-semibold">Support Inbox</h2>
          <p className="text-xs text-gray-400">Live conversations</p>
        </div>

        <div className="p-3">
          <input
            className="w-full px-3 py-2 rounded-lg bg-[#181820] border border-white/5 text-sm outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30"
            placeholder="Search..."
          />
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-2">
          {tickets.map((t) => (
            <div
              key={t.id}
              onClick={() => setActiveTicket(t.id)}
              className={`p-3 rounded-xl cursor-pointer transition border ${
                activeTicket === t.id
                  ? "bg-yellow-400/10 border-yellow-400/40"
                  : "bg-[#16161d] border-white/5 hover:border-yellow-400/40"
              }`}
            >
              <div className="flex justify-between">
                <span className="text-sm font-semibold">{t.subject}</span>
                <span
                  className={`text-[10px] px-2 rounded-full ${
                    t.status === "open"
                      ? "bg-yellow-400 text-black"
                      : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {t.status}
                </span>
              </div>

              <p className="text-xs text-gray-400 mt-1">
                {t.buyer_email}
              </p>
            </div>
          ))}
        </div>
      </aside>

      {/* CHAT */}
      <section className="flex-1 flex flex-col">

        {/* HEADER */}
        {active && (
          <div className="p-4 border-b border-white/5 flex justify-between bg-gradient-to-r from-[#0f0f14] to-[#12121a]">
            <div>
              <h2 className="font-semibold">{active.subject}</h2>
              <p className="text-xs text-gray-400">{active.buyer_email}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => updateStatus("resolved")}
                className="px-4 py-1 text-xs bg-red-500 rounded"
              >
                Resolve
              </button>
              <button
                onClick={() => updateStatus("open")}
                className="px-4 py-1 text-xs bg-green-500 rounded"
              >
                Reopen
              </button>
            </div>
          </div>
        )}

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[800px] mx-auto space-y-5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.sender_role === "agent"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[60%] shadow-md ${
                    m.sender_role === "agent"
                      ? "bg-yellow-400 text-black"
                      : "bg-[#1c1c24]"
                  }`}
                >
                  {m.body}
                  <div className="text-[10px] opacity-60 mt-1">
                    {formatTime(m.created_at)}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* INPUT */}
        {active && (
          <form
            onSubmit={sendMessage}
            className="p-4 border-t border-white/5 flex gap-2"
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 bg-[#181820] px-4 py-2 rounded-lg outline-none border border-white/5 focus:border-yellow-400"
              placeholder="Type reply..."
              disabled={active.status !== "open"}
            />
            <button className="bg-yellow-400 text-black px-5 rounded-lg font-semibold">
              Send
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
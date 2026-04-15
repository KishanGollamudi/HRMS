import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Wifi, WifiOff, Search, ChevronLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useMessengerContext } from "@/context/MessengerContext";
import { statusColor } from "@/hooks/useMessenger";

const ROLE_COLOR = {
  MANAGER: "#374151",
  HR:      "#D45769",
  TRAINER: "#0d9488",
};

export default function MessengerPanel() {
  const { user } = useAuth();
  const {
    connected, conversations, contacts,
    presence, myStatus, updateMyStatus,
    unread, totalUnread,
    send, loadHistory, searchUsers, markRead,
  } = useMessengerContext();

  const [open,        setOpen]        = useState(false);
  const [activeEmail, setActiveEmail] = useState(null); // currently open chat
  const [text,        setText]        = useState("");
  const [query,       setQuery]       = useState("");
  const [results,     setResults]     = useState([]);
  const bottomRef = useRef(null);

  const myEmail    = (user?.email ?? "").toLowerCase();
  const roleColor  = ROLE_COLOR[user?.role?.toUpperCase()] ?? "#0d9488";
  const messages   = activeEmail ? (conversations[activeEmail] ?? []) : [];

  // Load history when opening a chat
  useEffect(() => {
    if (activeEmail) {
      loadHistory(activeEmail);
      markRead(activeEmail);
    }
  }, [activeEmail, loadHistory, markRead]);

  // Auto-scroll
  useEffect(() => {
    if (open && activeEmail) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, activeEmail]);

  // Search users
  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    searchUsers(query).then(setResults);
  }, [query, searchUsers]);

  if (!user) return null;

  const handleSend = () => {
    if (!text.trim() || !activeEmail) return;
    send(activeEmail, text.trim());
    setText("");
  };

  const openChat = (email) => {
    setActiveEmail(email.toLowerCase());
    setQuery("");
    setResults([]);
  };

  // All contacts + search results merged
  const allContacts = [
    ...contacts,
    ...results.filter((r) => !contacts.some((c) => c.email === r.email)),
  ];

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 1000,
          width: 52, height: 52, borderRadius: "50%",
          background: roleColor, border: "none", cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        {open ? <X size={20} color="#fff" /> : <MessageSquare size={20} color="#fff" />}
        {!open && totalUnread > 0 && (
          <span style={{
            position: "absolute", top: 4, right: 4,
            minWidth: 18, height: 18, borderRadius: 9,
            background: "#ef4444", border: "2px solid #fff",
            color: "#fff", fontSize: 10, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 3px",
          }}>
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 20,  scale: 0.95 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed", bottom: 88, right: 24, zIndex: 1000,
              width: 360, height: 500,
              background: "#fff", borderRadius: 16,
              boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
              display: "flex", flexDirection: "column",
              overflow: "hidden", border: "1px solid #e5e7eb",
            }}
          >
            {/* Header */}
            <div style={{
              padding: "12px 16px", background: roleColor,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexShrink: 0,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {activeEmail && (
                  <button onClick={() => setActiveEmail(null)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                    <ChevronLeft size={18} color="#fff" />
                  </button>
                )}
                <MessageSquare size={16} color="#fff" />
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
                  {activeEmail
                    ? (allContacts.find((c) => c.email === activeEmail)?.name ?? activeEmail)
                    : "Messages"}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {connected
                  ? <Wifi size={14} color="rgba(255,255,255,0.8)" title="Connected" />
                  : <WifiOff size={14} color="rgba(255,255,255,0.5)" title="Disconnected" />}
                <button onClick={() => setOpen(false)}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                  <X size={16} color="rgba(255,255,255,0.8)" />
                </button>
              </div>
            </div>

            {/* Contact list */}
            {!activeEmail && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* Search */}
                <div style={{ padding: "10px 12px", borderBottom: "1px solid #f3f4f6" }}>
                  <div style={{ position: "relative" }}>
                    <Search size={13} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }} />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search users..."
                      style={{
                        width: "100%", boxSizing: "border-box",
                        padding: "7px 10px 7px 28px", borderRadius: 8,
                        border: "1px solid #e5e7eb", fontSize: 13,
                        outline: "none", background: "#f9fafb",
                      }}
                    />
                  </div>
                </div>

                {/* Contacts */}
                <div style={{ flex: 1, overflowY: "auto" }}>
                  {allContacts.length === 0 && (
                    <p style={{ color: "#9ca3af", fontSize: 12, textAlign: "center", marginTop: 40 }}>
                      {query.length >= 2 ? "No users found" : "Search to start a conversation"}
                    </p>
                  )}
                  {allContacts.map((c) => {
                    const unreadCount = unread[c.email] ?? 0;
                    const lastMsg = (conversations[c.email] ?? []).slice(-1)[0];
                    return (
                      <div key={c.email} onClick={() => openChat(c.email)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "10px 14px", cursor: "pointer",
                          borderBottom: "1px solid #f9fafb",
                          background: unreadCount > 0 ? "#f0fdf4" : "#fff",
                          transition: "background 0.12s",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                        onMouseLeave={(e) => e.currentTarget.style.background = unreadCount > 0 ? "#f0fdf4" : "#fff"}
                      >
                        {/* Avatar */}
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: "50%",
                            background: ROLE_COLOR[c.role] ?? "#6b7280",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontSize: 12, fontWeight: 700,
                          }}>
                            {(c.name ?? c.email).slice(0, 2).toUpperCase()}
                          </div>
                          <span style={{
                            position: "absolute", bottom: 1, right: 1,
                            width: 9, height: 9, borderRadius: "50%",
                            background: statusColor(presence[c.email] ?? "offline"),
                            border: "1.5px solid #fff",
                          }} />
                        </div>
                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontWeight: unreadCount > 0 ? 700 : 500, fontSize: 13, color: "#111827" }}>
                              {c.name ?? c.email}
                            </span>
                            {unreadCount > 0 && (
                              <span style={{
                                minWidth: 18, height: 18, borderRadius: 9,
                                background: "#ef4444", color: "#fff",
                                fontSize: 10, fontWeight: 700,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                padding: "0 4px",
                              }}>{unreadCount}</span>
                            )}
                          </div>
                          <p style={{ fontSize: 11, color: "#9ca3af", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {lastMsg ? lastMsg.content : c.role?.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chat view */}
            {activeEmail && (
              <>
                <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {messages.length === 0 && (
                    <p style={{ color: "#9ca3af", fontSize: 12, textAlign: "center", marginTop: 40 }}>
                      No messages yet. Say hello!
                    </p>
                  )}
                  {messages.map((msg, i) => {
                    const isOwn = msg.senderEmail === myEmail;
                    return (
                      <div key={msg.id ?? i} style={{ alignSelf: isOwn ? "flex-end" : "flex-start", maxWidth: "80%" }}>
                        {!isOwn && (
                          <p style={{ fontSize: 10, color: ROLE_COLOR[msg.senderRole] ?? "#6b7280", fontWeight: 700, margin: "0 0 2px 4px" }}>
                            {msg.senderName ?? msg.senderEmail}
                          </p>
                        )}
                        <div style={{
                          padding: "8px 12px",
                          borderRadius: isOwn ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                          background: isOwn ? roleColor : "#f3f4f6",
                          color: isOwn ? "#fff" : "#111827",
                          fontSize: 13, lineHeight: 1.45,
                        }}>
                          {msg.content}
                        </div>
                        <p style={{ fontSize: 10, color: "#9ca3af", margin: "2px 4px 0", textAlign: isOwn ? "right" : "left" }}>
                          {msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                          {isOwn && msg.readAt && " · Seen"}
                        </p>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div style={{ padding: "10px 12px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 8, flexShrink: 0 }}>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder={connected ? "Type a message… (Enter to send)" : "Connecting…"}
                    disabled={!connected}
                    rows={2}
                    style={{
                      flex: 1, resize: "none", fontSize: 13, padding: "8px 10px",
                      borderRadius: 10, border: "1px solid #e5e7eb",
                      outline: "none", fontFamily: "inherit",
                      background: connected ? "#fff" : "#f9fafb", color: "#111827",
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!connected || !text.trim()}
                    style={{
                      width: 38, height: 38, borderRadius: 10, border: "none",
                      background: connected && text.trim() ? roleColor : "#e5e7eb",
                      cursor: connected && text.trim() ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      alignSelf: "flex-end", flexShrink: 0,
                    }}
                  >
                    <Send size={15} color={connected && text.trim() ? "#fff" : "#9ca3af"} />
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

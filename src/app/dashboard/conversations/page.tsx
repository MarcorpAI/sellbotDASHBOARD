"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDateTime, statusColor } from "@/lib/utils";
import { Conversation, Message } from "@/types";

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    api
      .get<Conversation[]>("/api/conversations")
      .then(setConversations)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  async function loadMessages(id: string) {
    setSelectedId(id);
    try {
      const msgs = await api.get<Message[]>(
        `/api/conversations/${id}/messages`
      );
      setMessages(msgs);
    } catch { }
  }

  async function sendReply() {
    if (!selectedId || !reply.trim()) return;
    setSending(true);
    try {
      await api.post(`/api/conversations/${selectedId}/reply`, {
        message: reply,
      });
      setReply("");
      await loadMessages(selectedId);
    } catch { }
    setSending(false);
  }

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Conversations</h1>

      <div className="flex gap-4">
        {/* Conversation list */}
        <div className="w-80 shrink-0 rounded-lg bg-white shadow-sm">
          {loading ? (
            <p className="p-4 text-gray-500">Loading...</p>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-gray-500">No conversations yet.</p>
          ) : (
            <div className="divide-y max-h-[70vh] overflow-y-auto">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => loadMessages(conv.id)}
                  className={`w-full p-3 text-left hover:bg-gray-50 ${selectedId === conv.id ? "bg-primary-50" : ""
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {conv.customer_id.slice(0, 8)}...
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(
                        conv.status
                      )}`}
                    >
                      {conv.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {conv.last_message_at
                      ? formatDateTime(conv.last_message_at)
                      : formatDateTime(conv.started_at)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message thread */}
        <div className="flex-1 rounded-lg bg-white shadow-sm">
          {selectedId ? (
            <div className="flex h-[70vh] flex-col">
              <div className="flex items-center justify-between border-b p-4">
                <div>
                  <h3 className="text-sm font-semibold">
                    Conversation {selectedId.slice(0, 8)}...
                  </h3>
                  {selectedConversation && (
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(
                        selectedConversation.status
                      )}`}
                    >
                      {selectedConversation.status}
                    </span>
                  )}
                </div>
                <button
                  onClick={async () => {
                    if (confirm("Are you sure you want to reset this chat? All AI memory for this customer will be cleared.")) {
                      await api.delete(`/api/conversations/${selectedId}/reset`);
                      setMessages([]);
                      await loadMessages(selectedId);
                    }
                  }}
                  className="text-xs text-red-600 hover:text-red-800 font-medium"
                >
                  Reset Chat
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[80%] rounded-lg p-3 text-sm ${msg.role === "customer"
                        ? "bg-gray-100 self-start"
                        : msg.role === "agent"
                          ? "bg-primary-100 ml-auto"
                          : "bg-yellow-50 mx-auto text-center text-xs"
                      }`}
                  >
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      {msg.role}
                    </p>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {formatDateTime(msg.sent_at)}
                    </p>
                  </div>
                ))}
              </div>

              {selectedConversation?.status === "escalated" && (
                <div className="border-t p-3 flex gap-2">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="Type a reply..."
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendReply();
                      }
                    }}
                  />
                  <button
                    onClick={sendReply}
                    disabled={sending || !reply.trim()}
                    className="rounded-md bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-[70vh] items-center justify-center text-gray-500">
              Select a conversation
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

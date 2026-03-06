"use client";

import React, { useState, useEffect } from "react";
import { Mail, Loader2, Trash2, CheckCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

type MessageStatus = "unread" | "read" | "replied";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
}

export default function ManagerMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/manager/messages");
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(data.messages);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent row click
    if (
      !confirm(
        "Are you sure you want to delete this message? This action cannot be undone.",
      )
    ) {
      return;
    }

    setIsDeleting(id);
    try {
      const res = await fetch(`/api/manager/messages/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete message");

      toast.success("Message deleted successfully");
      setMessages((prev) => prev.filter((msg) => msg._id !== id));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleMarkAsRead = async (
    id: string,
    currentStatus: MessageStatus,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation(); // prevent row click
    if (currentStatus === "read") return;

    try {
      const res = await fetch(`/api/manager/messages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "read" }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      setMessages((prev) =>
        prev.map((msg) => (msg._id === id ? { ...msg, status: "read" } : msg)),
      );
      toast.success("Marked as read");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(d);
  };

  return (
    <div className="space-y-8 relative z-10">
      {/* Header section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-[2.5rem] p-8 md:p-12 mb-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-white/10 text-white/90 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20 backdrop-blur-md">
                Caissa Course Platform
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-white font-[family-name:var(--font-outfit)] tracking-tight mb-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/30 border border-white/10">
                <Mail className="w-7 h-7 text-white" />
              </div>
              Contact Messages
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl leading-relaxed">
              View and manage inquiries sent through the public Contact Us form.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm font-bold text-gray-300 bg-white/5 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
            <Mail className="w-4 h-4 text-purple-400" />
            <span>{messages.length} Total Messages</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 h-64">
          <Loader2 className="w-8 h-8 text-primary-red animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            No Messages Yet
          </h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            You don't have any contact inquiries at the moment. When users fill
            out the contact form, they will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left bg-white text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="py-4 px-6 font-semibold text-gray-600">
                    Sender
                  </th>
                  <th className="py-4 px-6 font-semibold text-gray-600">
                    Subject
                  </th>
                  <th className="py-4 px-6 font-semibold text-gray-600 whitespace-nowrap">
                    Date
                  </th>
                  <th className="py-4 px-6 font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="py-4 px-6 font-semibold text-transparent text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {messages.map((message) => {
                  const isUnread = message.status === "unread";
                  const isExpanded = expandedId === message._id;

                  return (
                    <React.Fragment key={message._id}>
                      <tr
                        onClick={() => toggleExpand(message._id)}
                        className={`hover:bg-gray-50/80 cursor-pointer transition-colors ${
                          isUnread ? "bg-red-50/20" : ""
                        }`}
                      >
                        <td className="py-4 px-6 font-medium text-gray-900">
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              {message.name}
                            </span>
                            <span className="text-gray-500 text-xs font-normal">
                              {message.email}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600 truncate max-w-xs">
                          {message.subject || "No Subject"}
                        </td>
                        <td className="py-4 px-6 text-gray-500 whitespace-nowrap text-xs">
                          {formatDate(message.createdAt)}
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              isUnread
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {isUnread ? "Unread" : "Read"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {isUnread && (
                              <button
                                onClick={(e) =>
                                  handleMarkAsRead(
                                    message._id,
                                    message.status,
                                    e,
                                  )
                                }
                                className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Mark as read"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={(e) => handleDelete(message._id, e)}
                              disabled={isDeleting === message._id}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete message"
                            >
                              {isDeleting === message._id ? (
                                <Loader2 className="w-5 h-5 animate-spin text-red-600" />
                              ) : (
                                <Trash2 className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                      {/* Expanded View */}
                      {isExpanded && (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-0 border-b border-gray-100 bg-gray-50/50"
                          >
                            <div className="p-6">
                              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                                  <div>
                                    <h4 className="font-bold text-gray-900 mb-1">
                                      {message.subject || "No Subject"}
                                    </h4>
                                    <p className="text-sm text-gray-500">
                                      From:{" "}
                                      <span className="text-gray-900 font-medium">
                                        {message.name}
                                      </span>{" "}
                                      &lt;{message.email}&gt;
                                    </p>
                                    {message.phone && (
                                      <p className="text-sm text-gray-500 mt-1">
                                        Phone:{" "}
                                        <span className="text-gray-900 font-medium">
                                          {message.phone}
                                        </span>
                                      </p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Clock className="w-4 h-4" />
                                    {formatDate(message.createdAt)}
                                  </div>
                                </div>
                                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                  {message.message}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

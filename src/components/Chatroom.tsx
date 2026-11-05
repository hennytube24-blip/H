/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Send, Users, ShieldAlert, MessageSquare } from 'lucide-react';

export const Chatroom: React.FC = () => {
  const { chatMessages, sendChatMessage, currentUser } = useApp();
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsSending(true);
    try {
      await sendChatMessage(inputText);
      setInputText('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            <span>Inter-Departmental Comms</span>
            <span>·</span>
            <span>Internal Secure Room</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            EPSS Internal Chatroom
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Direct operational dialogue for authorized leadership & department coordinators.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <Users className="w-4 h-4 text-sky-500" />
          <span>Active Session: <strong>{currentUser?.fullName}</strong></span>
        </div>
      </div>

      {/* Strict Requirement Notice: No automated bots or system posts */}
      <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-sky-500 shrink-0" />
          <span>
            Strict User-Authored Mandate: Only verified messages written by actual authenticated users appear here. No system notifications or bot spam.
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Real-Time Sync</span>
      </div>

      {/* Main Chat Box Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[560px] overflow-hidden">
        {/* Messages Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/30">
          {chatMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs space-y-2">
              <MessageSquare className="w-8 h-8 opacity-40" />
              <p>No messages yet in this conversation.</p>
              <p className="text-[11px]">Start the operational discussion below.</p>
            </div>
          ) : (
            chatMessages.map((msg) => {
              const isMe = msg.senderId === currentUser?.id;
              const isSuperAdmin = msg.senderRole === 'SUPER_ADMIN';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                >
                  {/* Sender Metadata (as message metadata, not separate post) */}
                  <div className="flex items-center gap-2 px-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {msg.senderName}
                    </span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {msg.senderDepartment}
                    </span>
                    {isSuperAdmin && (
                      <span className="text-[9px] uppercase font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 px-1.5 py-0.2 rounded border border-sky-400/20">
                        Admin
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`max-w-md sm:max-w-lg rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-sky-600 text-white rounded-tr-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message colleagues as ${currentUser?.fullName}...`}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={isSending || !inputText.trim()}
              className="bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

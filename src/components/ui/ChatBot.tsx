'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const GREETING: Message = {
  id: 'greeting',
  text: "Hi! I'm your HR Assistant. Ask me about your attendance, KPIs, leaves, rewards, or feedback — I'll answer using your latest data.",
  sender: 'bot',
  timestamp: new Date(),
};

export const ChatBot = ({ isOpen, setIsOpen }: ChatBotProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [mounted, setMounted] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => abortRef.current?.abort();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || sending) return;

    const userMessage: Message = {
      id: `u-${Date.now()}`,
      text: trimmed,
      sender: 'user',
      timestamp: new Date(),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setMessage('');
    setSending(true);

    const history = nextMessages
      .filter((m) => m.id !== 'greeting')
      .map((m) => ({
        role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
        content: m.text,
      }));

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/me/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });
      const data = (await res.json().catch(() => null)) as { reply?: string; title?: string } | null;
      const replyText = res.ok && data?.reply
        ? data.reply
        : data?.title
          ? `Sorry — ${data.title.toLowerCase()}.`
          : "Sorry, I couldn't reach the assistant. Please try again.";
      setMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, text: replyText, sender: 'bot', timestamp: new Date() },
      ]);
    } catch (err) {
      if ((err as { name?: string })?.name === 'AbortError') return;
      setMessages((prev) => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          text: 'Network error — please check your connection and try again.',
          sender: 'bot',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "fixed bottom-5 right-5 p-3 rounded-full shadow-xl transition-all duration-300 z-50 group bg-[#FF4D4D] hover:bg-[#E63E3E] text-white animate-in zoom-in fade-in"
          )}
        >
          <MessageCircle className="h-5 w-5 group-hover:rotate-12 transition-transform" />
        </button>
      )}

      {/* Chat Panel */}
      <div
        className={cn(
          "fixed md:relative top-0 right-0 h-full bg-white dark:bg-neutral-900 shadow-2xl z-[70] transition-all duration-500 ease-in-out flex flex-col overflow-hidden",
          isOpen ? "w-full sm:w-[400px] opacity-100" : "w-0 opacity-0"
        )}
      >
        {/* Header */}
        <div className="p-6 bg-[#111111] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#FF4D4D] flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">HR Assistant</h3>
              <p className="text-xs text-neutral-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                Always online
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-50 dark:bg-neutral-950">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex w-full whitespace-normal",
                msg.sender === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] p-4 rounded-2xl text-sm shadow-sm",
                  msg.sender === 'user'
                    ? "bg-[#FF4D4D] text-white rounded-tr-none"
                    : "bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-tl-none border border-neutral-100 dark:border-neutral-700"
                )}
              >
                {msg.text}
                <p className={cn(
                  "text-[10px] mt-1 opacity-70",
                  msg.sender === 'user' ? "text-right" : "text-left"
                )}>
                  {mounted ? msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex w-full justify-start">
              <div className="max-w-[85%] p-4 rounded-2xl rounded-tl-none bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSend}
          className="p-6 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 shrink-0"
        >
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={sending ? 'Thinking…' : 'Type your message...'}
              disabled={sending}
              className="w-full bg-neutral-100 dark:bg-neutral-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#FF4D4D] transition-all outline-none disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!message.trim() || sending}
              className="p-3 rounded-xl bg-[#111111] dark:bg-[#FF4D4D] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="text-[10px] text-center text-neutral-400 mt-4">
            Powered by FairReward AI • Personalized to your profile
          </p>
        </form>
      </div>
    </>
  );
};

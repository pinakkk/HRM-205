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

export const ChatBot = ({ isOpen, setIsOpen }: ChatBotProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your HR Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [mounted, setMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I've received your message. An HR representative will get back to you shortly, or you can check the FAQ for common queries.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
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
              placeholder="Type your message..."
              className="w-full bg-neutral-100 dark:bg-neutral-800 border-none rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-[#FF4D4D] transition-all outline-none"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="p-3 rounded-xl bg-[#111111] dark:bg-[#FF4D4D] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <p className="text-[10px] text-center text-neutral-400 mt-4">
            Powered by FairReward AI • Standard response time &lt; 2h
          </p>
        </form>
      </div>
    </>
  );
};

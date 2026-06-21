'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  room_id: string;
  sender: string;
  text: string;
  created_at: string;
}

function generateRoomId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getOrCreateSenderId(): string {
  if (typeof window === 'undefined') return 'anon';
  let id = sessionStorage.getItem('burner-sender-id');
  if (!id) {
    id = Math.random().toString(36).slice(2, 8).toUpperCase();
    sessionStorage.setItem('burner-sender-id', id);
  }
  return id;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function BurnerApp({ roomId }: { roomId: string }) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(900);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [senderId] = useState(getOrCreateSenderId);
  const [copied, setCopied] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isBurningRef = useRef(false);
  // Ref so timer effect never goes stale without re-subscribing
  const handleBurnRef = useRef<() => Promise<void>>();

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages + subscribe to realtime changes and burn broadcasts
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (!mounted) return;

      if (data && data.length > 0) {
        setMessages(data);
      } else {
        // First visitor — insert a welcome message
        await supabase.from('messages').insert({
          room_id: roomId,
          sender: 'System',
          text: `Room #${roomId} created. Share the link above to invite someone.`,
        });
      }
    };

    init();

    const channel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          if (!mounted) return;
          setMessages((prev) => {
            const incoming = payload.new as Message;
            if (prev.find((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
        }
      )
      // Burn broadcast: someone triggered burn, navigate everyone to the new room
      .on('broadcast', { event: 'burn' }, ({ payload }) => {
        if (!mounted || isBurningRef.current) return;
        router.push(`/burner/${payload.newRoomId}`);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [roomId, router]);

  const handleBurn = useCallback(async () => {
    if (isBurningRef.current) return;
    isBurningRef.current = true;

    const newRoomId = generateRoomId();

    // Notify everyone else in the room before we delete
    if (channelRef.current) {
      await channelRef.current.send({
        type: 'broadcast',
        event: 'burn',
        payload: { newRoomId },
      });
    }

    await supabase.from('messages').delete().eq('room_id', roomId);
    router.push(`/burner/${newRoomId}`);
  }, [roomId, router]);

  // Keep the ref current so the timer can call the latest version
  useEffect(() => {
    handleBurnRef.current = handleBurn;
  });

  // Countdown — depends only on timeLeft so interval never double-registers
  useEffect(() => {
    if (timeLeft <= 0) {
      handleBurnRef.current?.();
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [timeLeft]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    await supabase.from('messages').insert({ room_id: roomId, sender: senderId, text });
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: 'Burner Chat', url }); return; } catch { /* fall through */ }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displaySender = (sender: string) => {
    if (sender === 'System') return 'System';
    if (sender === senderId) return 'Me';
    return sender.slice(0, 4);
  };

  const urgencyColor =
    timeLeft <= 60 ? 'text-red-400 animate-pulse' :
    timeLeft <= 180 ? 'text-orange-400' :
    'text-yellow-500';

  return (
    <div className="flex flex-col h-[100dvh] md:h-[700px] md:max-w-md md:mx-auto md:my-10 md:rounded-2xl md:shadow-2xl md:border md:border-gray-800 bg-gray-900 text-white font-sans overflow-hidden">

      {/* Header */}
      <div className="flex-shrink-0 bg-gradient-to-r from-red-900 to-black p-4 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400">Room</p>
            <h1 className="text-2xl font-mono font-bold text-red-400 mt-0.5">#{roomId}</h1>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-gray-400">Self-Destruct</p>
            <p className={`text-2xl font-mono font-bold mt-0.5 ${urgencyColor}`}>{formatTime(timeLeft)}</p>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleShare}
            className="flex-1 bg-gray-800 hover:bg-gray-700 active:scale-95 text-white font-semibold py-2 px-3 rounded-xl transition text-sm"
          >
            {copied ? '✓ Copied!' : '🔗 Share Link'}
          </button>
          <button
            onClick={handleBurn}
            className="flex-1 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold py-2 px-3 rounded-xl transition text-sm uppercase tracking-wide shadow-lg shadow-red-900/40"
          >
            💥 Burn
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-gray-950">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === senderId ? 'items-end' :
              msg.sender === 'System' ? 'items-center' :
              'items-start'
            }`}
          >
            <span className="text-xs text-gray-500 mb-1">{displaySender(msg.sender)}</span>
            <div className={`p-3 rounded-xl max-w-[80%] text-sm ${
              msg.sender === senderId
                ? 'bg-red-600 text-white rounded-tr-none'
                : msg.sender === 'System'
                ? 'bg-gray-800 text-gray-400 text-xs italic text-center w-full'
                : 'bg-gray-800 text-gray-200 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input — safe-area padding keeps it above iPhone home bar */}
      <form
        onSubmit={handleSend}
        className="flex-shrink-0 flex gap-2 p-3 bg-gray-900 border-t border-gray-800"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type an anonymous message..."
          className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-base text-gray-200 focus:outline-none focus:border-red-500 transition"
        />
        <button
          type="submit"
          className="flex-shrink-0 bg-gray-800 hover:bg-gray-700 active:scale-95 text-white px-4 py-2 rounded-xl text-sm transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: number;
  sender: string;
  text: string;
}

export default function BurnerApp() {
  const [burnerId, setBurnerId] = useState('#BXT-742');
  const [timeLeft, setTimeLeft] = useState(900);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'System', text: 'Secure chat initiated. Total privacy active.' },
    { id: 2, sender: 'Guest', text: 'Hey, is this line secure?' },
  ]);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleBurn();
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const generateRandomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '#';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleBurn = () => {
    setMessages([{ id: Date.now(), sender: 'System', text: 'Previous identity destroyed. All logs wiped.' }]);
    setBurnerId(generateRandomId());
    setTimeLeft(900);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), sender: 'Me', text: inputText }]);
    setInputText('');
  };

  const urgencyColor = timeLeft <= 60 ? 'text-red-400 animate-pulse' : timeLeft <= 180 ? 'text-orange-400' : 'text-yellow-500';

  return (
    <div className="max-w-md mx-auto my-10 bg-gray-900 text-white rounded-2xl shadow-2xl border border-gray-800 overflow-hidden font-sans">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-black p-6 border-b border-gray-800">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400">Active Identity</p>
            <h1 className="text-3xl font-mono font-bold text-red-400 mt-1">{burnerId}</h1>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-gray-400">Self-Destruct</p>
            <p className={`text-2xl font-mono font-bold mt-1 ${urgencyColor}`}>{formatTime(timeLeft)}</p>
          </div>
        </div>
        <button
          onClick={handleBurn}
          className="w-full mt-4 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold py-2 px-4 rounded-xl transition duration-200 uppercase tracking-wide shadow-lg shadow-red-900/40"
        >
          💥 Burn This Identity Now
        </button>
      </div>

      {/* Chat History */}
      <div className="h-80 overflow-y-auto p-4 space-y-3 bg-gray-950">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'Me' ? 'items-end' : msg.sender === 'System' ? 'items-center' : 'items-start'
            }`}
          >
            <span className="text-xs text-gray-500 mb-1">{msg.sender}</span>
            <div
              className={`p-3 rounded-xl max-w-[80%] text-sm ${
                msg.sender === 'Me'
                  ? 'bg-red-600 text-white rounded-tr-none'
                  : msg.sender === 'System'
                  ? 'bg-gray-800 text-gray-400 text-xs italic text-center w-full'
                  : 'bg-gray-800 text-gray-200 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 bg-gray-900 border-t border-gray-800 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type an anonymous message..."
          className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-sm text-gray-200 focus:outline-none focus:border-red-500 transition"
        />
        <button
          type="submit"
          className="bg-gray-800 hover:bg-gray-700 active:scale-95 text-white px-4 py-2 rounded-xl text-sm transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}

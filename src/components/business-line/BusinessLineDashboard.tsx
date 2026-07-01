'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

type Tab = 'overview' | 'calls' | 'sms' | 'settings';

interface Call {
  sid: string;
  from: string;
  to: string;
  status: string;
  direction: string;
  duration: string;
  startTime: string;
}

interface Message {
  sid: string;
  from: string;
  to: string;
  body: string;
  status: string;
  direction: string;
  dateSent: string;
}

function formatPhone(num: string) {
  const d = num.replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('1')) {
    return `(${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  }
  return num;
}

function formatDuration(seconds: string) {
  const s = parseInt(seconds || '0');
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    completed: 'bg-green-900/60 text-green-400',
    'no-answer': 'bg-yellow-900/60 text-yellow-400',
    busy: 'bg-orange-900/60 text-orange-400',
    failed: 'bg-red-900/60 text-red-400',
    delivered: 'bg-green-900/60 text-green-400',
    sent: 'bg-blue-900/60 text-blue-400',
    received: 'bg-purple-900/60 text-purple-400',
  };
  return map[status] || 'bg-gray-800 text-gray-400';
}

export default function BusinessLineDashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const [calls, setCalls] = useState<Call[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [smsTo, setSmsTo] = useState('');
  const [smsBody, setSmsBody] = useState('');
  const [smsSending, setSmsSending] = useState(false);
  const [smsResult, setSmsResult] = useState<string | null>(null);
  const [forwardNumber, setForwardNumber] = useState('');

  const BUSINESS_NUMBER = '+16823993238';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [callsRes, msgsRes] = await Promise.all([
        fetch('/api/twilio/calls'),
        fetch('/api/twilio/messages'),
      ]);
      const callsData = await callsRes.json();
      const msgsData = await msgsRes.json();
      if (callsData.calls) setCalls(callsData.calls);
      if (msgsData.messages) setMessages(msgsData.messages);
    } catch {
      // silently fail
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsTo || !smsBody) return;
    setSmsSending(true);
    setSmsResult(null);
    try {
      const res = await fetch('/api/twilio/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: smsTo, body: smsBody }),
      });
      const data = await res.json();
      if (data.sid) {
        setSmsResult('Message sent!');
        setSmsBody('');
        fetchData();
      } else {
        setSmsResult(`Error: ${data.error}`);
      }
    } catch {
      setSmsResult('Failed to send message.');
    }
    setSmsSending(false);
  };

  const completedCalls = calls.filter((c) => c.status === 'completed').length;
  const missedCalls = calls.filter((c) => ['no-answer', 'busy'].includes(c.status)).length;
  const totalSms = messages.length;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <div className="border-b border-blue-900/40 bg-black/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Image
              src="/aibeast-logo.png"
              alt="AI Beast Automation"
              width={56}
              height={56}
              className="rounded-xl"
            />
            <div>
              <h1 className="text-xl font-bold tracking-wide bg-gradient-to-r from-blue-400 to-gray-200 bg-clip-text text-transparent">
                AI BEAST AUTOMATION
              </h1>
              <p className="text-xs text-gray-500 tracking-widest uppercase">Business Line</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-mono font-bold text-blue-400 tracking-wider">
              {formatPhone(BUSINESS_NUMBER)}
            </p>
            <p className="text-xs text-green-400 flex items-center justify-end gap-1">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse" />
              Active
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto px-4 flex gap-1 pb-0">
          {(['overview', 'calls', 'sms', 'settings'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 text-sm font-semibold uppercase tracking-wider rounded-t-lg transition-all ${
                tab === t
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:text-blue-400'
              }`}
            >
              {t}
            </button>
          ))}
          <button
            onClick={fetchData}
            disabled={loading}
            className="ml-auto mb-1 px-3 py-1 text-xs text-gray-400 hover:text-blue-400 border border-gray-800 hover:border-blue-800 rounded-lg transition"
          >
            {loading ? '...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard label="Total Calls" value={calls.length} icon="📞" color="blue" />
              <StatCard label="Completed" value={completedCalls} icon="✅" color="green" />
              <StatCard label="Missed" value={missedCalls} icon="⚠️" color="yellow" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard label="Total Messages" value={totalSms} icon="💬" color="purple" />
              <div className="bg-gray-900 border border-blue-900/30 rounded-2xl p-5 flex flex-col gap-3">
                <p className="text-xs uppercase tracking-widest text-gray-500">Webhook URLs</p>
                <p className="text-xs text-gray-400">Set these in your Twilio console:</p>
                <WebhookRow label="Voice" path="/api/twilio/voice" />
                <WebhookRow label="SMS" path="/api/twilio/sms" />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {[...calls.slice(0, 3).map((c) => ({ ...c, type: 'call' })),
                  ...messages.slice(0, 3).map((m) => ({ ...m, type: 'sms' }))]
                  .sort((a: any, b: any) =>
                    new Date(b.startTime || b.dateSent).getTime() -
                    new Date(a.startTime || a.dateSent).getTime()
                  )
                  .slice(0, 5)
                  .map((item: any) => (
                    <div key={item.sid} className="flex items-center gap-3 p-3 bg-black/40 rounded-xl">
                      <span className="text-xl">{item.type === 'call' ? '📞' : '💬'}</span>
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium">
                          {formatPhone(item.direction?.includes('inbound') ? item.from : item.to)}
                        </p>
                        {item.body && <p className="text-xs text-gray-400 truncate max-w-xs">{item.body}</p>}
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(item.status)}`}>
                          {item.status}
                        </span>
                        <p className="text-xs text-gray-600 mt-1">
                          {timeAgo(item.startTime || item.dateSent)}
                        </p>
                      </div>
                    </div>
                  ))}
                {calls.length === 0 && messages.length === 0 && !loading && (
                  <p className="text-sm text-gray-600 text-center py-4">No activity yet. Configure webhooks to start receiving calls and messages.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CALLS */}
        {tab === 'calls' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-gray-800">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Call Log</h2>
            </div>
            <div className="divide-y divide-gray-800">
              {calls.map((call) => (
                <div key={call.sid} className="flex items-center gap-4 p-4 hover:bg-black/30 transition">
                  <div className="text-2xl">
                    {call.direction?.includes('inbound') ? '📲' : '📤'}
                  </div>
                  <div className="flex-1">
                    <p className="font-mono text-white text-sm">
                      {formatPhone(call.direction?.includes('inbound') ? call.from : call.to)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {call.direction?.includes('inbound') ? 'Incoming' : 'Outgoing'} · {formatDuration(call.duration)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusBadge(call.status)}`}>
                      {call.status}
                    </span>
                    <p className="text-xs text-gray-600 mt-1">{timeAgo(call.startTime)}</p>
                  </div>
                </div>
              ))}
              {calls.length === 0 && (
                <p className="text-sm text-gray-600 text-center py-10">No calls yet.</p>
              )}
            </div>
          </div>
        )}

        {/* SMS */}
        {tab === 'sms' && (
          <div className="space-y-6">
            {/* Send SMS */}
            <div className="bg-gray-900 border border-blue-900/40 rounded-2xl p-5">
              <h2 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-4">Send Message</h2>
              <form onSubmit={sendSms} className="space-y-3">
                <input
                  type="tel"
                  value={smsTo}
                  onChange={(e) => setSmsTo(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 font-mono"
                />
                <textarea
                  value={smsBody}
                  onChange={(e) => setSmsBody(e.target.value)}
                  placeholder="Type your message..."
                  rows={3}
                  className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={smsSending || !smsTo || !smsBody}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-6 py-2.5 rounded-xl text-sm transition"
                  >
                    {smsSending ? 'Sending...' : 'Send SMS'}
                  </button>
                  {smsResult && (
                    <p className={`text-sm ${smsResult.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
                      {smsResult}
                    </p>
                  )}
                </div>
              </form>
            </div>

            {/* Message History */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-gray-800">
                <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Message History</h2>
              </div>
              <div className="divide-y divide-gray-800">
                {messages.map((msg) => (
                  <div key={msg.sid} className="p-4 hover:bg-black/30 transition">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-mono text-sm text-white">
                        {formatPhone(msg.direction?.includes('inbound') ? msg.from : msg.to)}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusBadge(msg.status)}`}>
                          {msg.direction?.includes('inbound') ? 'In' : 'Out'}
                        </span>
                        <span className="text-xs text-gray-600">{timeAgo(msg.dateSent)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">{msg.body}</p>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-sm text-gray-600 text-center py-10">No messages yet.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'settings' && (
          <div className="space-y-6 max-w-xl">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Call Routing</h2>
              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Forward Calls To</label>
                <input
                  type="tel"
                  value={forwardNumber}
                  onChange={(e) => setForwardNumber(e.target.value)}
                  placeholder="+1 (xxx) xxx-xxxx"
                  className="w-full bg-black border border-gray-700 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-600 mt-1">Update FORWARD_TO_NUMBER in .env.local to save.</p>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">Twilio Webhook Setup</h2>
              <p className="text-xs text-gray-500">
                In your <span className="text-blue-400">Twilio Console</span> → Phone Numbers → (682) 399-3238, set:
              </p>
              <WebhookRow label="Voice Webhook" path="/api/twilio/voice" method="HTTP POST" />
              <WebhookRow label="SMS Webhook" path="/api/twilio/sms" method="HTTP POST" />
              <WebhookRow label="Voicemail Callback" path="/api/twilio/voicemail" method="HTTP POST" />
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">IVR Menu</h2>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-3 bg-black/40 rounded-xl p-3">
                  <span className="text-blue-400 font-mono font-bold text-lg">1</span>
                  <span>Forward to owner</span>
                </div>
                <div className="flex items-center gap-3 bg-black/40 rounded-xl p-3">
                  <span className="text-blue-400 font-mono font-bold text-lg">2</span>
                  <span>Leave voicemail</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'border-blue-900/40 text-blue-400',
    green: 'border-green-900/40 text-green-400',
    yellow: 'border-yellow-900/40 text-yellow-400',
    purple: 'border-purple-900/40 text-purple-400',
  };
  return (
    <div className={`bg-gray-900 border ${colors[color]} rounded-2xl p-5`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <p className={`text-3xl font-bold font-mono ${colors[color]}`}>{value}</p>
      </div>
      <p className="text-xs text-gray-500 uppercase tracking-widest">{label}</p>
    </div>
  );
}

function WebhookRow({ label, path, method }: { label: string; path: string; method?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(`https://your-domain.com${path}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-center justify-between bg-black/40 rounded-xl p-3">
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-xs font-mono text-blue-400">{path}</p>
        {method && <p className="text-xs text-gray-600">{method}</p>}
      </div>
      <button
        onClick={copy}
        className="text-xs text-gray-500 hover:text-blue-400 transition px-2 py-1 border border-gray-800 rounded-lg"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

import React, { useState } from 'react';
import {
  X,
  Radio,
  Server,
  Zap,
  CheckCircle2,
  RefreshCw,
  Copy,
  Trash2,
  Code2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AsyncMessageEvent } from '../types';
import { pushAsyncEvent, resetAllData } from '../utils/storage';

interface IntegrationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  events: AsyncMessageEvent[];
  onRefreshData: () => void;
}

export const IntegrationDrawer: React.FC<IntegrationDrawerProps> = ({
  isOpen,
  onClose,
  events,
  onRefreshData
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [testSentToast, setTestSentToast] = useState(false);

  if (!isOpen) return null;

  const handleSendTestMessage = () => {
    pushAsyncEvent('ihsancloud.ping.exchange', 'SYSTEM_HEALTH_PING', {
      serviceOrigin: 'React Mobile Teacher App',
      destination: 'Go Core Education API / RabbitMQ Broker',
      timestamp: new Date().toISOString(),
      latencyMs: Math.floor(Math.random() * 15) + 5
    });
    onRefreshData();
    setTestSentToast(true);
    setTimeout(() => setTestSentToast(false), 2000);
  };

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0];

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex justify-end animate-fade-in">
      <div className="bg-slate-900 text-slate-100 w-full max-w-md h-full overflow-y-auto p-4 flex flex-col justify-between shadow-2xl border-l border-slate-800">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <Radio className="w-4 h-4 animate-ping" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white">RabbitMQ & Supabase Event Hub</h2>
                <p className="text-[10px] text-slate-400">Asynchronous Message Bus Integrator</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Architecture Pipeline Map Card */}
          <div className="my-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800 text-[10px] font-mono space-y-2">
            <div className="flex items-center justify-between text-indigo-400 font-bold border-b border-slate-900 pb-1">
              <span>ALUR ARSITEKTUR PLATFORM</span>
              <span className="text-[9px] bg-indigo-950/80 px-1.5 py-0.5 rounded text-indigo-300 border border-indigo-700/60">
                CONNECTED
              </span>
            </div>

            <div className="flex items-center justify-between gap-1 text-slate-300 text-center">
              <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800 flex-1">
                <span className="block font-bold text-indigo-300">React App</span>
                <span className="text-[9px] text-slate-500">Mobile UI</span>
              </div>
              <ArrowRight className="w-3 h-3 text-indigo-500 flex-shrink-0 animate-pulse" />
              <div className="bg-amber-950/60 p-1.5 rounded-lg border border-amber-800/60 flex-1">
                <span className="block font-bold text-amber-300">RabbitMQ</span>
                <span className="text-[9px] text-amber-400/80">Message Queue</span>
              </div>
              <ArrowRight className="w-3 h-3 text-indigo-500 flex-shrink-0 animate-pulse" />
              <div className="bg-indigo-950/60 p-1.5 rounded-lg border border-indigo-800/60 flex-1">
                <span className="block font-bold text-indigo-300">Go API & Supabase</span>
                <span className="text-[9px] text-indigo-400/80">Microservices</span>
              </div>
            </div>
          </div>

          {testSentToast && (
            <div className="bg-indigo-900 text-indigo-100 p-2 rounded-xl text-xs font-bold text-center animate-fade-in mb-2">
              Pesan Uji Coba Terkirim ke Exchange RabbitMQ!
            </div>
          )}

          {/* Queue Controls */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Message Event Stream ({events.length})
            </span>
            <button
              onClick={handleSendTestMessage}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer shadow-sm"
            >
              <Zap className="w-3 h-3 text-amber-300" /> Ping RabbitMQ
            </button>
          </div>

          {/* Event Logs List */}
          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-xs">
            {events.map((e) => {
              const isSelected = selectedEvent?.id === e.id;
              return (
                <div
                  key={e.id}
                  onClick={() => setSelectedEventId(e.id)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-950/80 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-indigo-400 font-bold">{e.eventType}</span>
                    <span className="text-slate-500">
                      {new Date(e.timestamp).toLocaleTimeString('id-ID')}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                    Topic: {e.topic}
                  </p>
                </div>
              );
            })}

            {events.length === 0 && (
              <p className="text-slate-500 text-center py-6 text-xs">Belum ada event tercatat.</p>
            )}
          </div>

          {/* Selected Event Payload JSON Viewer */}
          {selectedEvent && (
            <div className="mt-4 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-1 border-b border-slate-900">
                <span className="flex items-center gap-1 text-indigo-400 font-bold">
                  <Code2 className="w-3.5 h-3.5" /> Event Payload (JSON)
                </span>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-indigo-300">
                  {selectedEvent?.status || 'PENDING'}
                </span>
              </div>

              <pre className="p-2.5 bg-slate-900 rounded-xl text-[10px] font-mono text-indigo-300 overflow-x-auto max-h-[160px] leading-snug">
                {JSON.stringify(selectedEvent, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Reset & Close */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={() => {
              if (confirm('Reset seluruh data lokal ke kondisi awal?')) {
                resetAllData();
                onRefreshData();
                onClose();
              }
            }}
            className="text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Reset Demo Data
          </button>

          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

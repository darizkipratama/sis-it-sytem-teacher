import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, ShieldCheck, Zap, Radio } from 'lucide-react';

interface MobileContainerProps {
  children: React.ReactNode;
  activeTab: string;
  asyncQueueCount: number;
  onOpenIntegrationDrawer: () => void;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  activeTab,
  asyncQueueCount,
  onOpenIntegrationDrawer
}) => {
  const [isFrameMode, setIsFrameMode] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hrs}:${mins}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans flex flex-col items-center justify-start py-0 md:py-6 px-0 md:px-4 selection:bg-indigo-600 selection:text-white relative overflow-hidden">
      {/* Background Radial Grid Accent Pattern */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }}
      ></div>

      {/* Side Decorative System Badge on Desktop */}
      <div className="hidden lg:block absolute right-8 top-16 text-slate-400 max-w-xs pointer-events-none space-y-3">
        <h3 className="text-xl font-black text-slate-200 uppercase tracking-tight">
          System Dashboard Guru
        </h3>
        <p className="text-xs leading-relaxed opacity-75">
          Arsitektur Microservices dengan Go, React & Supabase. Integrasi RabbitMQ untuk sinkronisasi data real-time antar layanan Pendidikan.
        </p>
        <div className="flex space-x-2 pt-2">
          <div className="px-2.5 py-1 bg-slate-800/80 border border-slate-700/60 rounded text-[10px] font-mono text-indigo-300">
            SUPABASE
          </div>
          <div className="px-2.5 py-1 bg-slate-800/80 border border-slate-700/60 rounded text-[10px] font-mono text-amber-300">
            RABBITMQ
          </div>
          <div className="px-2.5 py-1 bg-slate-800/80 border border-slate-700/60 rounded text-[10px] font-mono text-emerald-300">
            GOLANG
          </div>
        </div>
      </div>

      {/* Desktop Bar Controls */}
      <div className="w-full max-w-[390px] hidden md:flex items-center justify-between bg-slate-900/90 text-slate-200 px-4 py-2.5 rounded-t-2xl border-b border-slate-800 text-xs shadow-md backdrop-blur-md z-10">
        <div className="flex items-center gap-2 font-medium text-indigo-400">
          <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span className="font-bold">Ihsan Cloud Engine v2.4</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenIntegrationDrawer}
            className="flex items-center gap-1.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 hover:text-indigo-200 px-2.5 py-1 rounded-full border border-indigo-700/50 transition text-[11px] font-mono cursor-pointer"
            title="Klik untuk melihat Message Queue RabbitMQ & Supabase Realtime"
          >
            <Radio className="w-3 h-3 text-indigo-400 animate-ping" />
            <span>Event ({asyncQueueCount})</span>
          </button>
          <button
            onClick={() => setIsFrameMode(!isFrameMode)}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-full transition cursor-pointer"
          >
            {isFrameMode ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span>{isFrameMode ? 'Full' : 'Frame'}</span>
          </button>
        </div>
      </div>

      {/* Main Mobile Frame Container */}
      <div
        className={`w-full transition-all duration-300 ease-in-out flex flex-col bg-slate-50 text-slate-900 z-10 ${
          isFrameMode
            ? 'max-w-[390px] md:h-[820px] md:max-h-[94vh] md:rounded-[48px] md:border-[10px] md:border-slate-900 md:shadow-2xl md:shadow-indigo-950/60 overflow-hidden relative'
            : 'max-w-full min-h-screen rounded-none shadow-none overflow-x-hidden'
        }`}
      >
        {/* Simulated Mobile Device Notch / Top Status Bar */}
        <div className="bg-white text-slate-900 px-7 pt-3 pb-1 flex items-center justify-between text-xs font-bold select-none z-50 border-b border-slate-100">
          <span>{currentTime}</span>
          {/* Simulated Notch */}
          <div className="w-24 h-5 bg-slate-900 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            <div className="w-8 h-1 bg-slate-700 rounded-full mx-1.5"></div>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3.5 h-2.5 bg-slate-900 rounded-[2px]"></div>
            <div className="w-4 h-2.5 bg-slate-300 rounded-[2px]"></div>
          </div>
        </div>

        {/* Inner Mobile Screen Content */}
        <div className="flex-1 flex flex-col overflow-y-auto relative bg-slate-50">
          {children}
        </div>

        {/* Home Indicator Bar */}
        <div className="bg-white pt-1 pb-2 flex justify-center items-center">
          <div className="w-32 h-1.5 bg-slate-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

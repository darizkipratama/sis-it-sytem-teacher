import React from 'react';
import { Zap, Radio } from 'lucide-react';

interface MobileContainerProps {
  children: React.ReactNode;
  activeTab: string;
  asyncQueueCount: number;
  onOpenIntegrationDrawer: () => void;
}

export const MobileContainer: React.FC<MobileContainerProps> = ({
  children,
  asyncQueueCount,
  onOpenIntegrationDrawer
}) => {
  return (
    <div className="h-dvh w-full bg-slate-950 antialiased">
      <div className="h-full max-w-[460px] mx-auto flex flex-col overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden sm:rounded-[32px] sm:border sm:border-slate-200/10 sm:bg-white sm:shadow-lg sm:shadow-slate-950/10">
          {children}
        </div>
      </div>
    </div>
  );
};

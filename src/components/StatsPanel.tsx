import React from 'react';
import { Incident } from '../types';
import { Shield, Activity, Globe, Zap } from 'lucide-react';

interface StatsPanelProps {
  incidents: Incident[];
}

const StatsPanel: React.FC<StatsPanelProps> = ({ incidents }) => {
  const criticalCount = incidents.filter(i => i.severity === 'critical').length;
  const militaryCount = incidents.filter(i => i.category === 'military').length;
  const uniqueRegions = new Set(incidents.map(i => i.location.name.split(',').pop()?.trim())).size;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-[#0a0a0a] border-b border-white/5">
      <StatCard
        icon={<Activity size={16} className="text-red-500" />}
        label="Active Incidents"
        value={incidents.length}
        subValue={`${criticalCount} Critical Signals`}
      />
      <StatCard
        icon={<Shield size={16} className="text-blue-500" />}
        label="Military Actions"
        value={militaryCount}
        subValue="Detected Last 24h"
      />
      <StatCard
        icon={<Globe size={16} className="text-emerald-500" />}
        label="Active Regions"
        value={uniqueRegions}
        subValue="Global Monitoring"
      />
      <StatCard
        icon={<Zap size={16} className="text-yellow-500" />}
        label="Signal Integrity"
        value="98.4%"
        subValue="Encrypted Uplink"
      />
    </div>
  );
};

const StatCard = ({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string | number, subValue: string }) => (
  <div className="bg-[#111] p-4 rounded-lg border border-white/5 flex flex-col gap-1">
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-[10px] font-mono uppercase tracking-widest text-white/40">{label}</span>
    </div>
    <div className="text-2xl font-bold text-white/90">{value}</div>
    <div className="text-[10px] font-mono text-white/30 uppercase tracking-wider">{subValue}</div>
  </div>
);

export default StatsPanel;

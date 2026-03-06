import React from 'react';
import { Incident } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Shield, MapPin, ExternalLink } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface IncidentFeedProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  selectedIncidentId?: string;
}

const IncidentFeed: React.FC<IncidentFeedProps> = ({ incidents, onSelectIncident, selectedIncidentId }) => {
  return (
    <div className="flex flex-col h-full bg-[#0d0d0d] border-r border-white/5">
      <div className="p-4 border-b border-white/5 bg-[#111] flex justify-between items-center">
        <h2 className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 flex items-center gap-2">
          <AlertTriangle size={12} className="text-red-500" />
          Intelligence Stream
        </h2>
        <div className="flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[8px] font-mono text-red-500 uppercase">Live</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {incidents.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-white/10 border-t-white/40 rounded-full animate-spin mx-auto mb-4" />
            <div className="text-white/20 font-mono text-[10px] uppercase tracking-widest">Establishing Uplink...</div>
          </div>
        ) : (
          incidents.map((incident) => {
            const isStatement = incident.title.toLowerCase().includes('says') || 
                               incident.title.toLowerCase().includes('warns') || 
                               incident.title.toLowerCase().includes('statement');
            
            return (
              <div
                key={incident.id}
                onClick={() => onSelectIncident(incident)}
                className={cn(
                  "p-4 border-b border-white/5 cursor-pointer transition-all hover:bg-white/5 group relative",
                  selectedIncidentId === incident.id && "bg-white/10 border-l-2 border-l-red-500"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-tighter",
                      incident.severity === 'critical' ? "bg-red-500/20 text-red-400" :
                      incident.severity === 'high' ? "bg-orange-500/20 text-orange-400" :
                      "bg-yellow-500/20 text-yellow-400"
                    )}>
                      {incident.severity}
                    </span>
                    {isStatement && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-tighter bg-blue-500/20 text-blue-400">
                        Diplomatic
                      </span>
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-white/20 group-hover:text-white/40 transition-colors">
                    {formatDistanceToNow(new Date(incident.timestamp), { addSuffix: true })}
                  </span>
                </div>
                <h3 className={cn(
                  "text-xs font-bold mb-1 leading-tight tracking-tight",
                  isStatement ? "text-blue-100/90 italic" : "text-white/90"
                )}>
                  {incident.title}
                </h3>
                <div className="flex items-center gap-1 text-[10px] text-white/30 mb-2 font-mono uppercase tracking-tighter">
                  <MapPin size={8} />
                  {incident.location.name}
                </div>
                <p className="text-[11px] text-white/50 line-clamp-2 font-light leading-snug">
                  {incident.description}
                </p>
                
                {/* Scanline effect on hover */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 bg-gradient-to-b from-transparent via-white/5 to-transparent h-1/2 animate-scan" />
              </div>
            );
          })
        )}
      </div>
      <style>{`
        @keyframes scan {
          from { transform: translateY(-100%); }
          to { transform: translateY(200%); }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default IncidentFeed;

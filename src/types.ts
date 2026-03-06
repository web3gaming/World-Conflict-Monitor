export interface Incident {
  id: string;
  timestamp: string;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'military' | 'cyber' | 'diplomatic' | 'other';
  sourceUrl?: string;
  isTweet?: boolean;
}

export interface MonitoredSource {
  id: string;
  url: string;
  handle: string;
  label: string;
}

export interface ConflictStats {
  activeConflicts: number;
  incidentsLast24h: number;
  highAlertZones: string[];
}

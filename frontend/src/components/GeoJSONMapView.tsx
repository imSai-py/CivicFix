import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import { Search, Navigation, Compass, ShieldCheck, Radio } from 'lucide-react';
import { issuesApi, getAttachmentUrl } from '../services/api';
import { Issue } from '../types';

// Custom Neon Map Marker Icons
const createNeonIcon = (color: string, glowColor: string) => {
  return L.divIcon({
    className: 'custom-neon-pin',
    html: `<div style="
      width: 24px;
      height: 24px;
      background: #0f0f1a;
      border: 2px solid ${color};
      border-radius: 50%;
      box-shadow: 0 0 14px ${glowColor};
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 8px; height: 8px; background: ${color}; border-radius: 50%;"></div>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

const pinkNeonIcon = createNeonIcon('#ff2d78', 'rgba(255,45,120,0.8)');
const cyanNeonIcon = createNeonIcon('#00ffcc', 'rgba(0,255,204,0.8)');
const goldNeonIcon = createNeonIcon('#ffe04a', 'rgba(255,224,74,0.8)');

export const GeoJSONMapView: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mode, setMode] = useState<'all' | 'nearby'>('all');

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const fetchIssues = async () => {
    try {
      const res = await issuesApi.list({ limit: 100 });
      const fetched = res.data.items || [];
      setIssues(fetched);
      if (fetched.length > 0) {
        setSelectedIssue(fetched[0]);
      }
    } catch (err) {
      console.error('Failed to load map points:', err);
    }
  };

  useEffect(() => {
    fetchIssues();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(loc);
        },
        (err) => console.log('Geolocation disabled:', err.message)
      );
    }
  }, []);

  // Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
      const initialCenter: [number, number] = userLocation || [37.7749, -122.4194];
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 13,
        zoomControl: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }
  }, [userLocation]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const filtered = issues.filter(
      (i) =>
        i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.location.address && i.location.address.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    filtered.forEach((issue) => {
      const icon =
        issue.priority === 'CRITICAL' || issue.priority === 'HIGH'
          ? pinkNeonIcon
          : issue.status === 'RESOLVED'
          ? cyanNeonIcon
          : goldNeonIcon;

      const marker = L.marker([issue.location.latitude, issue.location.longitude], { icon }).addTo(map);

      const popupContent = `
        <div style="padding: 4px; color: #e8e0f0;">
          <span style="font-size: 10px; font-weight: bold; color: #00ffcc; text-transform: uppercase;">
            ${issue.status} • ${issue.priority}
          </span>
          <h4 style="font-size: 14px; font-weight: bold; margin: 4px 0;">${issue.title}</h4>
          <p style="font-size: 12px; color: #a098b0;">${issue.description}</p>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        setSelectedIssue(issue);
        map.setView([issue.location.latitude, issue.location.longitude], 15);
      });

      markersRef.current.push(marker);
    });

    if (filtered.length > 0 && mode === 'all') {
      const bounds = L.latLngBounds(filtered.map((i) => [i.location.latitude, i.location.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [issues, searchQuery, mode]);

  return (
    <div className="space-y-6">
      {/* Top Header Banner matching Stitch Screen 3 */}
      <div className="bg-[#0e101d] rounded-3xl p-6 border border-[#00ffcc]/30 flex flex-wrap items-center justify-between gap-4 shadow-[0_0_20px_rgba(0,255,204,0.15)]">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00ffcc]/10 border border-[#00ffcc]/30 text-[#00ffcc] font-label text-xs font-bold uppercase tracking-wider mb-2">
            <Radio className="w-3.5 h-3.5 text-[#00ffcc] animate-pulse" />
            <span>Cyberpunk Vector GeoMap</span>
          </div>
          <h1 className="font-headline font-bold text-2xl text-white">Neon Live Infrastructure Map</h1>
          <p className="font-body text-xs text-slate-400 mt-1">Real-time geospatial vector stream of reported community hazards & fixes.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setMode('all');
              if (mapInstanceRef.current && issues.length > 0) {
                const bounds = L.latLngBounds(issues.map((i) => [i.location.latitude, i.location.longitude]));
                mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
              }
            }}
            className={`font-label text-xs uppercase tracking-wider px-4 py-2 rounded-xl font-bold transition-all ${
              mode === 'all'
                ? 'bg-[#00ffcc] text-slate-950 shadow-[0_0_12px_#00ffcc]'
                : 'bg-[#141629] text-slate-300 hover:text-white border border-[#232745]'
            }`}
          >
            All Reports ({issues.length})
          </button>
          <button
            onClick={() => {
              if (userLocation && mapInstanceRef.current) {
                mapInstanceRef.current.setView(userLocation, 15);
                setMode('nearby');
              } else {
                alert('Locating device position...');
              }
            }}
            className={`font-label text-xs uppercase tracking-wider px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-1.5 ${
              mode === 'nearby'
                ? 'bg-[#ff2d78] text-white shadow-[0_0_12px_#ff2d78]'
                : 'bg-[#141629] text-slate-300 hover:text-white border border-[#232745]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Nearby GPS</span>
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative rounded-3xl overflow-hidden border border-[#00ffcc]/30 h-[600px] shadow-2xl bg-slate-950">
        {/* Floating Search Bar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-11/12 max-w-md z-30">
          <div className="bg-[#0e101d]/90 backdrop-blur-xl border border-[#00ffcc]/40 rounded-full flex items-center px-4 py-2.5 shadow-[0_0_20px_rgba(0,255,204,0.15)] focus-within:border-[#00ffcc] transition-all">
            <Search className="w-4 h-4 text-[#00ffcc] mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Search address or issue title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white placeholder-slate-400 w-full font-body text-xs focus:ring-0"
            />
            {userLocation && (
              <button
                type="button"
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setView(userLocation, 15);
                  }
                }}
                className="text-[#00ffcc] hover:text-[#ff2d78] transition-colors ml-2 p-1"
                title="Recenter on GPS Location"
              >
                <Navigation className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Leaflet Map Div */}
        <div ref={mapContainerRef} className="w-full h-full z-10"></div>

        {/* Floating Bottom Sheet Preview Card */}
        {selectedIssue && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-lg z-30">
            <div className="bg-[#0e101d]/95 backdrop-blur-xl border-t-2 border-[#ff2d78] border-x border-b border-[#1b1e34] rounded-2xl p-5 shadow-[0_-10px_30px_rgba(0,0,0,0.85)] flex flex-col gap-3">
              <div className="w-12 h-1 bg-slate-700 rounded-full mx-auto opacity-60"></div>

              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#ff2d78]/15 border border-[#ff2d78]/30 flex items-center justify-center text-[#ff2d78] shrink-0 shadow-[0_0_12px_rgba(255,45,120,0.4)]">
                    <ShieldCheck className="w-6 h-6 text-[#ff2d78]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-label uppercase tracking-widest font-bold bg-[#ff2d78]/20 text-[#ff2d78] border border-[#ff2d78]/30">
                        {selectedIssue.priority}
                      </span>
                      <span className="text-xs font-label text-slate-400 font-mono">
                        ID: {selectedIssue.id.substring(0, 8)}
                      </span>
                    </div>
                    <h3 className="font-headline font-bold text-base text-white mt-0.5 truncate">{selectedIssue.title}</h3>
                  </div>
                </div>
                <span className="text-xs font-label text-[#00ffcc] font-bold shrink-0">
                  👍 {selectedIssue.upvote_count} Upvotes
                </span>
              </div>

              <p className="text-xs font-body text-slate-300 line-clamp-2">{selectedIssue.description}</p>

              {selectedIssue.attachments && selectedIssue.attachments.length > 0 && (
                <img
                  src={getAttachmentUrl(selectedIssue.attachments[0].file_path)}
                  alt={selectedIssue.title}
                  className="w-full h-28 object-cover rounded-xl border border-slate-800"
                />
              )}

              <div className="flex gap-3 mt-1">
                <a
                  href={`https://www.google.com/maps?q=${selectedIssue.location.latitude},${selectedIssue.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#141629] border border-[#00ffcc]/40 text-[#00ffcc] font-label uppercase tracking-wider text-xs py-2.5 rounded-xl font-bold hover:bg-[#00ffcc]/10 hover:border-[#00ffcc] transition-all flex items-center justify-center gap-2"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Navigate</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

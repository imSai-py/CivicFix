import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { RefreshCw, Layers, Navigation } from 'lucide-react';
import { Issue } from '../types';
import { issuesApi, getAttachmentUrl } from '../services/api';

// Fix default Leaflet marker icon paths broken by bundlers
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = defaultIcon;

export const GeoJSONMapView: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [center, setCenter] = useState<{ lat: number; lng: number }>({ lat: 12.9632, lng: 80.2380 });
  const [radiusKm, setRadiusKm] = useState<number>(50);
  const [fetchAll, setFetchAll] = useState<boolean>(true);
  const [issuesList, setIssuesList] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userLocationFound, setUserLocationFound] = useState<boolean>(false);

  // 1. Auto-detect user geolocation on component mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setUserLocationFound(true);
        },
        (err) => {
          console.log('[GeoMap] Geolocation permission or lookup fallback:', err.message);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  }, []);

  // 2. Fetch issues from API (All issues vs Proximity GeoJSON)
  const fetchMapData = async () => {
    setIsLoading(true);
    try {
      if (fetchAll) {
        const res = await issuesApi.list({ limit: 100 });
        setIssuesList(res.data.items);
        // If center is default and issues exist, center around the latest issue
        if (!userLocationFound && res.data.items.length > 0) {
          const first = res.data.items[0];
          setCenter({ lat: first.location.latitude, lng: first.location.longitude });
        }
      } else {
        const res = await issuesApi.getNearbyGeoJSON(center.lat, center.lng, radiusKm);
        const mappedIssues: Issue[] = res.data.features.map((f) => ({
          id: f.properties.id,
          title: f.properties.title,
          description: f.properties.description,
          status: f.properties.status,
          priority: f.properties.priority,
          category_id: f.properties.category_id,
          assigned_department_id: f.properties.assigned_department_id || '',
          reporter_id: f.properties.reporter_id || '',
          location: {
            latitude: f.geometry.coordinates[1],
            longitude: f.geometry.coordinates[0],
            address: f.properties.address || ''
          },
          upvote_count: f.properties.upvote_count,
          created_at: f.properties.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString(),
          attachments: []
        }));
        setIssuesList(mappedIssues);
      }
    } catch (err) {
      console.error('Failed to load map data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, [fetchAll, radiusKm, center.lat, center.lng]);

  // 3. Initialize & update Leaflet interactive map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom: 12,
        zoomControl: false
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([center.lat, center.lng]);
    }
  }, [center]);

  // 4. Render markers on map when issuesList updates
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    markersGroupRef.current.clearLayers();

    if (issuesList.length === 0) return;

    const bounds = L.latLngBounds([]);

    issuesList.forEach((issue) => {
      const lat = issue.location.latitude;
      const lng = issue.location.longitude;

      if (typeof lat !== 'number' || typeof lng !== 'number') return;

      bounds.extend([lat, lng]);

      const statusColor =
        issue.status === 'RESOLVED' ? '#10b981' :
        issue.status === 'IN_PROGRESS' ? '#6366f1' :
        issue.status === 'ACKNOWLEDGED' ? '#3b82f6' :
        issue.status === 'REJECTED' ? '#f43f5e' : '#f59e0b';

      const customHtmlIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="
            background-color: ${statusColor};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 15px ${statusColor};
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="width: 6px; height: 6px; background: white; border-radius: 50%;"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([lat, lng], { icon: customHtmlIcon });

      const photoHtml = issue.attachments && issue.attachments.length > 0
        ? `<div style="margin-top: 8px; max-width: 200px; height: 100px; border-radius: 8px; overflow: hidden; background: #0f172a;">
            <img src="${getAttachmentUrl(issue.attachments[0].file_path)}" style="width: 100%; height: 100%; object-fit: cover;" />
           </div>`
        : '';

      const popupContent = `
        <div style="font-family: sans-serif; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; background: rgba(99, 102, 241, 0.2); color: #818cf8; padding: 2px 6px; border-radius: 4px;">${issue.status}</span>
            <span style="font-size: 10px; color: #94a3b8;">👍 ${issue.upvote_count} Upvotes</span>
          </div>
          <h4 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0 0 4px 0;">${issue.title}</h4>
          <p style="font-size: 12px; color: #cbd5e1; margin: 0 0 8px 0; max-height: 48px; overflow: hidden; text-overflow: ellipsis;">${issue.description}</p>
          <div style="font-size: 10px; color: #64748b; font-family: monospace;">📍 ${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
          ${photoHtml}
        </div>
      `;

      marker.bindPopup(popupContent);
      markersGroupRef.current?.addLayer(marker);
    });

    if (bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [issuesList]);

  // Recenter to current user location
  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCenter = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCenter(newCenter);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setView([newCenter.lat, newCenter.lng], 13);
          }
        },
        (err) => alert('Could not retrieve device location: ' + err.message)
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Map Control Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Geospatial Issue Map</h2>
            <p className="text-xs text-slate-400">Interactive live civic report heat map with real-time location pins</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Mode Switcher: All vs Radius */}
          <div className="flex items-center bg-slate-900/90 rounded-xl border border-slate-800 p-1">
            <button
              onClick={() => setFetchAll(true)}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                fetchAll ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Reports ({issuesList.length})
            </button>
            <button
              onClick={() => setFetchAll(false)}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                !fetchAll ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Nearby Radius
            </button>
          </div>

          {!fetchAll && (
            <div className="flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <span className="text-slate-400">Radius:</span>
              <input
                type="number"
                min={5}
                max={500}
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-14 bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-white text-center font-mono"
              />
              <span className="text-slate-500">km</span>
            </div>
          )}

          <button
            onClick={handleLocateMe}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all font-medium"
            title="Recenter to my location"
          >
            <Navigation className="w-3.5 h-3.5 text-indigo-400" />
            <span>Locate Me</span>
          </button>

          <button
            onClick={fetchMapData}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="glass-panel rounded-3xl p-3 min-h-[480px] h-[520px] relative overflow-hidden flex flex-col">
        <div ref={mapContainerRef} className="w-full h-full rounded-2xl overflow-hidden shadow-inner" />

        {isLoading && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm z-20 flex items-center justify-center">
            <div className="flex items-center space-x-3 bg-slate-900 px-4 py-2.5 rounded-2xl border border-slate-800 text-slate-200 text-xs font-semibold shadow-xl">
              <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Loading map pins...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

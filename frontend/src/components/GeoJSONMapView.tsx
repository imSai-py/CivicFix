import React, { useEffect, useState } from 'react';
import { MapPin, RefreshCw, Layers } from 'lucide-react';
import { GeoJSONFeatureCollection } from '../types';
import { issuesApi } from '../services/api';

export const GeoJSONMapView: React.FC = () => {
  const [centerLat] = useState(37.7749);
  const [centerLng] = useState(-122.4194);
  const [radiusKm, setRadiusKm] = useState(25);
  const [geoData, setGeoData] = useState<GeoJSONFeatureCollection | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNearbyGeoJSON = async () => {
    setIsLoading(true);
    try {
      const res = await issuesApi.getNearbyGeoJSON(centerLat, centerLng, radiusKm);
      setGeoData(res.data);
    } catch (err) {
      console.error('Failed to load GeoJSON map features:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNearbyGeoJSON();
  }, [centerLat, centerLng, radiusKm]);

  return (
    <div className="space-y-6">
      {/* Map Control Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-bold text-white">Geospatial Issue Heatmap (GeoJSON)</h2>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Radius (km):</span>
            <input
              type="number"
              min={1}
              max={100}
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-16 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-white text-center"
            />
          </div>

          <button
            onClick={fetchNearbyGeoJSON}
            disabled={isLoading}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Map</span>
          </button>
        </div>
      </div>

      {/* Visual Map Grid Canvas */}
      <div className="glass-panel rounded-3xl p-6 min-h-[420px] flex flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="relative z-10 flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-slate-300 font-mono">Center: [{centerLng.toFixed(4)}, {centerLat.toFixed(4)}]</span>
          </div>

          <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            {geoData?.meta?.count || 0} Features Found
          </span>
        </div>

        {/* Feature Pin Cards */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-auto">
          {isLoading ? (
            <div className="col-span-full py-12 text-center text-slate-500 text-sm">
              Loading GeoJSON coordinates...
            </div>
          ) : !geoData || geoData.features.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 text-sm">
              No civic issues reported within {radiusKm} km radius of center point.
            </div>
          ) : (
            geoData.features.map((feature) => (
              <div key={feature.properties.id} className="glass-card p-4 rounded-2xl border border-indigo-500/20 hover:border-indigo-500/60 transition-all">
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                    [{feature.geometry.coordinates[0].toFixed(3)}, {feature.geometry.coordinates[1].toFixed(3)}]
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1 truncate">{feature.properties.title}</h4>
                <p className="text-xs text-slate-400 line-clamp-2 mb-2">{feature.properties.description}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/60 pt-2">
                  <span className="uppercase font-semibold text-amber-400">{feature.properties.status}</span>
                  <span>👍 {feature.properties.upvote_count} Upvotes</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

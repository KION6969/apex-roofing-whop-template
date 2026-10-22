import React, { useState, useEffect } from 'react';
import { subscribeToPixelEvents, TrackedPixelEvent } from '../lib/whop-tracking';
import { Activity, ChevronDown, ChevronUp, Check, Eye } from 'lucide-react';

export const LivePixelDebugger: React.FC = () => {
  const [events, setEvents] = useState<TrackedPixelEvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [flashCount, setFlashCount] = useState(0);

  useEffect(() => {
    return subscribeToPixelEvents(newEvents => {
      setEvents(newEvents);
      setFlashCount(prev => prev + 1);
    });
  }, []);

  return (
    <aside aria-label="Whop Pixel Debugger" className="fixed bottom-4 right-4 z-50 font-sans">
      {/* Floating Pill Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-900/90 hover:bg-slate-900 text-white rounded-full border border-amber-500/40 shadow-xl backdrop-blur-md text-xs font-semibold transition hover:scale-105"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>
        <Activity className="w-3.5 h-3.5 text-amber-400" />
        <span>Whop Pixel Stream</span>
        <span className="bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full text-[10px]">
          {events.length}
        </span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {/* Expanded Pixel Stream Tray */}
      {isOpen && (
        <div className="mt-2 w-80 sm:w-96 max-h-96 bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-lg flex flex-col">
          <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                Live whop.track Events
              </span>
              <span className="text-[10px] text-slate-400">whop.app scoped</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <Check className="w-3 h-3" /> Listening
            </span>
          </div>

          <div className="p-2 overflow-y-auto space-y-2 text-xs flex-1 max-h-72">
            {events.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-[11px]">
                No custom events fired yet. Try viewing a service, requesting an estimate, or clicking a deposit button!
              </div>
            ) : (
              events.map(evt => (
                <div
                  key={evt.id}
                  className="p-2 rounded-lg bg-slate-900/80 border border-slate-800/80 font-mono text-[11px]"
                >
                  <div className="flex items-center justify-between text-amber-400 font-bold mb-1">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      whop.track("{evt.name}")
                    </span>
                    <span className="text-[10px] text-slate-400">{evt.timestamp}</span>
                  </div>
                  <pre className="text-[10px] text-slate-300 bg-slate-950 p-1.5 rounded overflow-x-auto">
                    {JSON.stringify(evt.data, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>

          <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-400 text-center">
            Standard events (PageViews, CheckoutViews) fire automatically on whop.app
          </div>
        </div>
      )}
    </aside>
  );
};

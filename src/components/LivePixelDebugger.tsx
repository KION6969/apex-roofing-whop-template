import React, { useEffect, useState } from 'react';
import {
  subscribeToPixelEvents,
  isPixelLive,
  type TrackedPixelEvent,
} from '../lib/whop-tracking';
import { whopRuntime, isRealAccountId, environmentLabel } from '../lib/whop-runtime';
import { Activity, ChevronDown, ChevronUp, Check, ExternalLink, Radio } from 'lucide-react';

const deliveryLabel: Record<TrackedPixelEvent['delivery'], string> = {
  pixel: 'delivered',
  queued: 'queued',
  'local-shim': 'local only',
};

export const LivePixelDebugger: React.FC = () => {
  const [events, setEvents] = useState<TrackedPixelEvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => subscribeToPixelEvents(setEvents), []);

  const live = isPixelLive();
  const scoped = isRealAccountId(whopRuntime.accountId);

  return (
    <aside aria-label="Whop pixel event inspector" className="pixel-debugger">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pixel-debugger-toggle"
        aria-expanded={isOpen}
      >
        <span className="pixel-dot">
          <span className="pixel-dot-ping" />
          <span className="pixel-dot-core" />
        </span>
        <Activity className="w-3.5 h-3.5" />
        <span>Whop Pixel</span>
        <span className="pixel-count">{events.length}</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {isOpen && (
        <div className="pixel-debugger-tray">
          <div className="pixel-debugger-head">
            <div>
              <span className="pixel-debugger-title">whop.track events</span>
              <span className="pixel-debugger-sub">
                {environmentLabel()} · {scoped ? whopRuntime.accountId : 'no account scope set'}
              </span>
            </div>
            <span className={`pixel-status ${live ? 'is-live' : 'is-pending'}`}>
              {live ? <Check className="w-3 h-3" /> : <Radio className="w-3 h-3" />}
              {live ? 'pixel live' : 'not delivered yet'}
            </span>
          </div>

          <div className="pixel-debugger-body">
            {events.length === 0 ? (
              <div className="pixel-empty">
                No events yet. Open a service, submit the estimate form, or start a checkout.
              </div>
            ) : (
              events.map(event => (
                <div key={event.id} className="pixel-event">
                  <div className="pixel-event-head">
                    <span className="pixel-event-name">
                      <span className={`pixel-event-dot ${event.delivery}`} />
                      whop.track(&quot;{event.name}&quot;)
                    </span>
                    <span className="pixel-event-meta">
                      <span className={`pixel-delivery ${event.delivery}`}>
                        {deliveryLabel[event.delivery]}
                      </span>
                      {event.timestamp}
                    </span>
                  </div>
                  <pre className="pixel-event-data">{JSON.stringify(event.data, null, 2)}</pre>
                </div>
              ))
            )}
          </div>

          <a
            className="pixel-debugger-foot"
            href="https://whop.com/dashboard/events"
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink className="w-3 h-3" />
            Verify the same events in Whop Dashboard → Events
          </a>
        </div>
      )}
    </aside>
  );
};

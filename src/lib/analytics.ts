// ---------------------------------------------------------------------------
// Ruby AI Platform — In-Memory Analytics Tracker
// Singleton module: import { analytics } from "@/lib/analytics"
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GenerationEvent {
  kind: "generation";
  timestamp: number;
  agreementType: string;
  jurisdiction: string;
  tier: string;
  durationMs: number;
  tokenUsage: number;
}

interface ErrorEvent {
  kind: "error";
  timestamp: number;
  endpoint: string;
  errorType: string;
  statusCode: number;
}

interface PageViewEvent {
  kind: "pageview";
  timestamp: number;
  path: string;
}

type AnalyticsEvent = GenerationEvent | ErrorEvent | PageViewEvent;

interface HourlyBucket {
  hour: string; // ISO hour string, e.g. "2026-04-04T14"
  generations: number;
  errors: number;
  pageViews: number;
  totalDurationMs: number;
}

interface AggregateStats {
  totalGenerations: number;
  totalErrors: number;
  totalPageViews: number;
  averageGenerationTimeMs: number;
  errorRate: number; // errors / (generations + errors)
  popularAgreements: { type: string; count: number }[];
  hourlyActivity: HourlyBucket[];
  uptimeMs: number;
}

// ---------------------------------------------------------------------------
// Circular buffer
// ---------------------------------------------------------------------------

const MAX_EVENTS = 1000;

class CircularBuffer<T> {
  private buffer: (T | undefined)[];
  private head = 0;
  private _size = 0;

  constructor(private capacity: number) {
    this.buffer = new Array(capacity);
  }

  push(item: T): void {
    this.buffer[this.head] = item;
    this.head = (this.head + 1) % this.capacity;
    if (this._size < this.capacity) this._size++;
  }

  /** Iterate from oldest to newest */
  toArray(): T[] {
    if (this._size < this.capacity) {
      return this.buffer.slice(0, this._size) as T[];
    }
    // Buffer is full — head points to the oldest entry
    return [
      ...this.buffer.slice(this.head),
      ...this.buffer.slice(0, this.head),
    ] as T[];
  }

  get size(): number {
    return this._size;
  }
}

// ---------------------------------------------------------------------------
// Hourly aggregation (keeps at most 168 hours = 7 days)
// ---------------------------------------------------------------------------

const MAX_HOURLY_BUCKETS = 168;

function hourKey(ts: number): string {
  const d = new Date(ts);
  return d.toISOString().slice(0, 13); // "2026-04-04T14"
}

// ---------------------------------------------------------------------------
// Analytics class
// ---------------------------------------------------------------------------

class Analytics {
  private events = new CircularBuffer<AnalyticsEvent>(MAX_EVENTS);
  private hourlyMap = new Map<string, HourlyBucket>();
  private startedAt = Date.now();

  // Lifetime counters (not bounded by the circular buffer)
  private lifetimeGenerations = 0;
  private lifetimeErrors = 0;
  private lifetimePageViews = 0;
  private lifetimeDurationMs = 0;

  // ------------------------------------------------------------------
  // Public tracking methods
  // ------------------------------------------------------------------

  trackGeneration(
    agreementType: string,
    jurisdiction: string,
    tier: string,
    durationMs: number,
    tokenUsage: number,
  ): void {
    const event: GenerationEvent = {
      kind: "generation",
      timestamp: Date.now(),
      agreementType,
      jurisdiction,
      tier,
      durationMs,
      tokenUsage,
    };
    this.events.push(event);
    this.lifetimeGenerations++;
    this.lifetimeDurationMs += durationMs;
    this.touchBucket(event.timestamp, (b) => {
      b.generations++;
      b.totalDurationMs += durationMs;
    });
  }

  trackError(endpoint: string, errorType: string, statusCode: number): void {
    const event: ErrorEvent = {
      kind: "error",
      timestamp: Date.now(),
      endpoint,
      errorType,
      statusCode,
    };
    this.events.push(event);
    this.lifetimeErrors++;
    this.touchBucket(event.timestamp, (b) => {
      b.errors++;
    });
  }

  trackPageView(path: string): void {
    const event: PageViewEvent = {
      kind: "pageview",
      timestamp: Date.now(),
      path,
    };
    this.events.push(event);
    this.lifetimePageViews++;
    this.touchBucket(event.timestamp, (b) => {
      b.pageViews++;
    });
  }

  // ------------------------------------------------------------------
  // Query methods
  // ------------------------------------------------------------------

  getStats(): AggregateStats {
    const totalOps = this.lifetimeGenerations + this.lifetimeErrors;
    return {
      totalGenerations: this.lifetimeGenerations,
      totalErrors: this.lifetimeErrors,
      totalPageViews: this.lifetimePageViews,
      averageGenerationTimeMs: this.getAverageGenerationTime(),
      errorRate: totalOps > 0 ? this.lifetimeErrors / totalOps : 0,
      popularAgreements: this.getPopularAgreements(10),
      hourlyActivity: this.getHourlyActivity(),
      uptimeMs: Date.now() - this.startedAt,
    };
  }

  getPopularAgreements(limit = 5): { type: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const event of this.events.toArray()) {
      if (event.kind === "generation") {
        counts.set(event.agreementType, (counts.get(event.agreementType) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getAverageGenerationTime(): number {
    if (this.lifetimeGenerations === 0) return 0;
    return Math.round(this.lifetimeDurationMs / this.lifetimeGenerations);
  }

  // ------------------------------------------------------------------
  // Internal helpers
  // ------------------------------------------------------------------

  private touchBucket(ts: number, updater: (bucket: HourlyBucket) => void): void {
    const key = hourKey(ts);
    let bucket = this.hourlyMap.get(key);
    if (!bucket) {
      bucket = { hour: key, generations: 0, errors: 0, pageViews: 0, totalDurationMs: 0 };
      this.hourlyMap.set(key, bucket);
      this.pruneHourlyBuckets();
    }
    updater(bucket);
  }

  private pruneHourlyBuckets(): void {
    if (this.hourlyMap.size <= MAX_HOURLY_BUCKETS) return;
    // Remove oldest buckets
    const sorted = [...this.hourlyMap.keys()].sort();
    const toRemove = sorted.length - MAX_HOURLY_BUCKETS;
    for (let i = 0; i < toRemove; i++) {
      this.hourlyMap.delete(sorted[i]);
    }
  }

  private getHourlyActivity(): HourlyBucket[] {
    return [...this.hourlyMap.values()].sort((a, b) => a.hour.localeCompare(b.hour));
  }
}

// ---------------------------------------------------------------------------
// Singleton export
// ---------------------------------------------------------------------------

export const analytics = new Analytics();

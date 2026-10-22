-- Apply explicitly with `npm run analytics:migrate`. Never recreate data on deployment.
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS analytics_sessions (
 id TEXT PRIMARY KEY, started_at INTEGER NOT NULL, last_seen INTEGER NOT NULL,
 channel TEXT NOT NULL, source TEXT NOT NULL, medium TEXT NOT NULL, campaign TEXT NOT NULL,
 entry_path TEXT NOT NULL, device TEXT NOT NULL,
 product_at INTEGER, product_contact_at INTEGER, funnel_success_at INTEGER
);
CREATE TABLE IF NOT EXISTS analytics_events (
 id TEXT PRIMARY KEY, sid TEXT NOT NULL REFERENCES analytics_sessions(id), at INTEGER NOT NULL,
 day TEXT NOT NULL, kind TEXT NOT NULL CHECK(kind IN ('pageview','impression','click','inquiry')),
 path TEXT NOT NULL, module TEXT NOT NULL, action TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS analytics_events_age ON analytics_events(at);
CREATE TABLE IF NOT EXISTS analytics_daily (
 day TEXT NOT NULL, sid TEXT NOT NULL REFERENCES analytics_sessions(id), kind TEXT NOT NULL,
 path TEXT NOT NULL, module TEXT NOT NULL, action TEXT NOT NULL, count INTEGER NOT NULL,
 PRIMARY KEY(day,sid,kind,path,module,action)
);
CREATE INDEX IF NOT EXISTS analytics_daily_date ON analytics_daily(day,kind,path);
CREATE INDEX IF NOT EXISTS analytics_daily_session ON analytics_daily(sid,kind,path,day);
CREATE INDEX IF NOT EXISTS analytics_sessions_age ON analytics_sessions(started_at);
CREATE TRIGGER IF NOT EXISTS analytics_event_rollup AFTER INSERT ON analytics_events BEGIN
 INSERT INTO analytics_daily VALUES(NEW.day,NEW.sid,NEW.kind,NEW.path,NEW.module,NEW.action,1)
 ON CONFLICT(day,sid,kind,path,module,action) DO UPDATE SET count=count+1;
 UPDATE analytics_sessions SET last_seen=MAX(last_seen,NEW.at),
 product_at=CASE WHEN NEW.kind='pageview' AND NEW.path LIKE '/products/%' THEN COALESCE(product_at,NEW.at) ELSE product_at END,
 product_contact_at=CASE WHEN NEW.kind='pageview' AND NEW.path='/contact' AND product_at IS NOT NULL THEN COALESCE(product_contact_at,NEW.at) ELSE product_contact_at END,
 funnel_success_at=CASE WHEN NEW.kind='inquiry' AND product_contact_at IS NOT NULL THEN COALESCE(funnel_success_at,NEW.at) ELSE funnel_success_at END
 WHERE id=NEW.sid;
END;
CREATE TABLE IF NOT EXISTS analytics_limits (key TEXT PRIMARY KEY, hits INTEGER NOT NULL, expires INTEGER NOT NULL);

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const { getDb, initDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'gtu-bus-tracking-secret-key';

app.use(cors());
app.use(express.json());

// =============================================
// AUTH MIDDLEWARE
// =============================================
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const token = header.split(' ')[1];
    req.driver = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// =============================================
// AUTH ROUTES
// =============================================
app.post('/api/auth/login', async (req, res) => {
  const { driverId, password } = req.body;
  if (!driverId || !password) {
    return res.status(400).json({ error: 'Driver ID and password required' });
  }

  const db = await getDb();
  const driver = db.get('SELECT * FROM routes WHERE driver_id = ?', [driverId]);

  if (!driver) {
    return res.status(401).json({ error: 'Invalid Driver ID' });
  }

  const valid = bcrypt.compareSync(password, driver.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = jwt.sign(
    { driverId: driver.driver_id, routeId: driver.id, driverName: driver.driver_name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    driver: {
      driverId: driver.driver_id,
      driverName: driver.driver_name,
      busNumber: driver.bus_number,
      routeId: driver.id,
      routeName: driver.name,
    },
  });
});

app.post('/api/auth/verify', authenticate, (req, res) => {
  res.json({ valid: true, driver: req.driver });
});

// =============================================
// ROUTES
// =============================================
app.get('/api/routes', async (req, res) => {
  const db = await getDb();
  const routes = db.all('SELECT id, name, from_name, to_name, bus_number, driver_name, driver_id, color FROM routes ORDER BY id');

  const result = routes.map(r => ({
    id: r.id,
    name: r.name,
    from: r.from_name,
    to: r.to_name,
    busNumber: r.bus_number,
    driverName: r.driver_name,
    driverId: r.driver_id,
    color: r.color,
    coords: db.all('SELECT lat, lng FROM route_coords WHERE route_id = ? ORDER BY seq_order', [r.id]).map(c => [c.lng, c.lat]),
    stops: db.all('SELECT name, lat, lng FROM stops WHERE route_id = ? ORDER BY seq_order', [r.id]).map(s => ({ name: s.name, coords: [s.lng, s.lat] })),
  }));

  res.json(result);
});

app.get('/api/routes/:id', async (req, res) => {
  const db = await getDb();
  const route = db.get('SELECT * FROM routes WHERE id = ?', [req.params.id]);
  if (!route) return res.status(404).json({ error: 'Route not found' });

  const coords = db.all('SELECT lat, lng FROM route_coords WHERE route_id = ? ORDER BY seq_order', [req.params.id]);
  const stops = db.all('SELECT name, lat, lng FROM stops WHERE route_id = ? ORDER BY seq_order', [req.params.id]);

  res.json({
    id: route.id,
    name: route.name,
    from: route.from_name,
    to: route.to_name,
    busNumber: route.bus_number,
    driverName: route.driver_name,
    driverId: route.driver_id,
    color: route.color,
    coords: coords.map(c => [c.lng, c.lat]),
    stops: stops.map(s => ({ name: s.name, coords: [s.lng, s.lat] })),
  });
});

// =============================================
// DRIVER LOCATIONS
// =============================================
app.get('/api/drivers', async (req, res) => {
  const db = await getDb();
  const locations = db.all(`
    SELECT l.route_id, l.driver_id, l.lat, l.lng, l.speed, l.heading, l.accuracy, l.online, l.timestamp,
           r.driver_name, r.bus_number, r.name as route_name, r.color
    FROM locations l
    JOIN routes r ON r.id = l.route_id
    ORDER BY l.route_id
  `);

  const result = {};
  locations.forEach(l => {
    result[l.route_id] = {
      routeId: l.route_id,
      driverId: l.driver_id,
      driverName: l.driver_name,
      busNumber: l.bus_number,
      routeName: l.route_name,
      color: l.color,
      lat: l.lat,
      lng: l.lng,
      speed: l.speed,
      heading: l.heading,
      accuracy: l.accuracy,
      online: !!l.online,
      timestamp: l.timestamp,
    };
  });

  res.json(result);
});

app.get('/api/drivers/:routeId', async (req, res) => {
  const db = await getDb();
  const loc = db.get(`
    SELECT l.*, r.driver_name, r.bus_number, r.name as route_name, r.color
    FROM locations l
    JOIN routes r ON r.id = l.route_id
    WHERE l.route_id = ?
  `, [req.params.routeId]);

  if (!loc) return res.status(404).json({ error: 'No data for this route' });

  res.json({
    routeId: loc.route_id,
    driverId: loc.driver_id,
    driverName: loc.driver_name,
    busNumber: loc.bus_number,
    routeName: loc.route_name,
    color: loc.color,
    lat: loc.lat,
    lng: loc.lng,
    speed: loc.speed,
    heading: loc.heading,
    accuracy: loc.accuracy,
    online: !!loc.online,
    timestamp: loc.timestamp,
  });
});

app.put('/api/drivers/:routeId/location', authenticate, async (req, res) => {
  const { routeId } = req.params;
  const { lat, lng, speed, heading, accuracy, online } = req.body;

  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'lat and lng required' });
  }

  if (parseInt(routeId) !== req.driver.routeId) {
    return res.status(403).json({ error: 'Can only update your own route' });
  }

  const db = await getDb();
  const existing = db.get('SELECT id FROM locations WHERE route_id = ?', [routeId]);

  if (existing) {
    db.run(`UPDATE locations SET lat = ?, lng = ?, speed = ?, heading = ?, accuracy = ?, online = ?, timestamp = datetime('now') WHERE route_id = ?`,
      [lat, lng, speed || 0, heading || 0, accuracy || 0, online ? 1 : 0, routeId]);
  } else {
    db.run(`INSERT INTO locations (route_id, driver_id, lat, lng, speed, heading, accuracy, online, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      [routeId, req.driver.driverId, lat, lng, speed || 0, heading || 0, accuracy || 0, online ? 1 : 0]);
  }

  db.save();
  res.json({ success: true });
});

// =============================================
// NOTIFICATIONS
// =============================================
app.get('/api/notifications', async (req, res) => {
  const db = await getDb();
  const notifs = db.all('SELECT * FROM notifications ORDER BY timestamp DESC LIMIT 50');
  res.json(notifs.map(n => ({
    id: n.id,
    message: n.message,
    type: n.type,
    timestamp: n.timestamp,
    read: !!n.read,
  })));
});

app.post('/api/notifications', authenticate, async (req, res) => {
  const { message, type } = req.body;
  if (!message) return res.status(400).json({ error: 'Message required' });

  const db = await getDb();
  db.run('INSERT INTO notifications (message, type) VALUES (?, ?)', [message, type || 'info']);
  db.save();
  res.json({ success: true });
});

app.put('/api/notifications/read', authenticate, async (req, res) => {
  const db = await getDb();
  db.run('UPDATE notifications SET read = 1 WHERE read = 0');
  db.save();
  res.json({ success: true });
});

app.delete('/api/notifications', authenticate, async (req, res) => {
  const db = await getDb();
  db.run('DELETE FROM notifications');
  db.save();
  res.json({ success: true });
});

// =============================================
// STATIC FILES (frontend)
// =============================================
app.use(express.static(__dirname));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return;
  res.sendFile(path.join(__dirname, 'index.html'));
});

// =============================================
// START
// =============================================
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`\n  🚍  GTU-ITR Bus Tracking System`);
    console.log(`  ─────────────────────────────`);
    console.log(`  Server:   http://localhost:${PORT}`);
    console.log(`  API:      http://localhost:${PORT}/api/routes`);
    console.log(`\n  Demo Drivers:`);
    console.log(`    DRV001 (Rahul)  | password: 1234`);
    console.log(`    DRV002 (Vikram) | password: 1234`);
    console.log(`    DRV003 (Suresh) | password: 1234`);
    console.log(`    DRV004 (Arjun)  | password: 1234\n`);
  });
});

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'data.db');

let db;

class DbWrapper {
  constructor(database) {
    this.db = database;
  }

  run(sql, params = []) {
    this.db.run(sql, params);
  }

  get(sql, params = []) {
    const stmt = this.db.prepare(sql);
    stmt.bind(params);
    let row = null;
    if (stmt.step()) row = stmt.getAsObject();
    stmt.free();
    return row;
  }

  all(sql, params = []) {
    const stmt = this.db.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return rows;
  }

  transaction(fn) {
    this.db.run('BEGIN');
    try {
      fn();
      this.db.run('COMMIT');
    } catch (e) {
      this.db.run('ROLLBACK');
      throw e;
    }
  }

  save() {
    const data = this.db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }
}

async function getDb() {
  if (!db) await initDb();
  return db;
}

async function initDb() {
  const SQL = await initSqlJs();

  let database;
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    database = new SQL.Database(buffer);
  } else {
    database = new SQL.Database();
  }

  db = new DbWrapper(database);

  db.run(`CREATE TABLE IF NOT EXISTS routes (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    from_name TEXT NOT NULL,
    to_name TEXT NOT NULL,
    bus_number TEXT NOT NULL,
    driver_name TEXT NOT NULL,
    driver_id TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    color TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS route_coords (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    route_id INTEGER NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    seq_order INTEGER NOT NULL,
    FOREIGN KEY (route_id) REFERENCES routes(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS stops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    route_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    seq_order INTEGER NOT NULL,
    FOREIGN KEY (route_id) REFERENCES routes(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    route_id INTEGER NOT NULL,
    driver_id TEXT NOT NULL,
    lat REAL,
    lng REAL,
    speed REAL DEFAULT 0,
    heading REAL DEFAULT 0,
    accuracy REAL DEFAULT 0,
    online INTEGER DEFAULT 0,
    timestamp TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (route_id) REFERENCES routes(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    timestamp TEXT DEFAULT (datetime('now')),
    read INTEGER DEFAULT 0
  )`);

  const count = db.get('SELECT COUNT(*) as c FROM routes');
  if (count.c === 0) seedDb();

  db.save();
}

function seedDb() {
  const hash = bcrypt.hashSync('1234', 10);

  const routes = [
    {
      id: 1, name: 'Mehsana → GTU-ITR', from_name: 'Mehsana', to_name: 'GTU-ITR College',
      bus_number: 'GTU-101', driver_name: 'Rahul Sharma', driver_id: 'DRV001', color: '#2563EB',
      coords: [[72.3693,23.5880],[72.3750,23.5940],[72.3850,23.6060],[72.3950,23.6150],[72.4080,23.6200],[72.4215,23.6257]],
      stops: [{name:'Mehsana Bus Stand',coords:[72.3693,23.5880]},{name:'Mehsana City Circle',coords:[72.3750,23.5940]},{name:'Mevad Toll Booth',coords:[72.4080,23.6200]},{name:'GTU-ITR College',coords:[72.4215,23.6257]}],
    },
    {
      id: 2, name: 'Palanpur → GTU-ITR', from_name: 'Palanpur', to_name: 'GTU-ITR College',
      bus_number: 'GTU-202', driver_name: 'Vikram Patel', driver_id: 'DRV002', color: '#22C55E',
      coords: [[72.4386,24.1719],[72.4500,24.1200],[72.4500,24.0800],[72.4400,24.0000],[72.4300,23.9000],[72.4100,23.8300],[72.3950,23.8030],[72.3900,23.7500],[72.3850,23.7000],[72.3900,23.6500],[72.4080,23.6250],[72.4215,23.6257]],
      stops: [{name:'Palanpur Bus Stand',coords:[72.4386,24.1719]},{name:'Deesa',coords:[72.4500,24.0800]},{name:'Dama',coords:[72.4400,24.0000]},{name:'Unjha',coords:[72.3950,23.8030]},{name:'Mehsana Bypass',coords:[72.3900,23.6500]},{name:'GTU-ITR College',coords:[72.4215,23.6257]}],
    },
    {
      id: 3, name: 'Ahmedabad → GTU-ITR', from_name: 'Ahmedabad', to_name: 'GTU-ITR College',
      bus_number: 'GTU-303', driver_name: 'Suresh Kumar', driver_id: 'DRV003', color: '#F59E0B',
      coords: [[72.5714,23.0225],[72.5700,23.0800],[72.5650,23.1200],[72.5600,23.1600],[72.5200,23.2200],[72.4800,23.2700],[72.4500,23.3100],[72.4300,23.3500],[72.4100,23.4000],[72.4000,23.4500],[72.3950,23.5000],[72.3950,23.5500],[72.4000,23.5900],[72.4080,23.6100],[72.4215,23.6257]],
      stops: [{name:'Ahmedabad Bus Stand',coords:[72.5714,23.0225]},{name:'Adalaj',coords:[72.5600,23.1600]},{name:'Kalol',coords:[72.5200,23.2200]},{name:'Chhatral',coords:[72.4500,23.3100]},{name:'Nandasan',coords:[72.4000,23.4500]},{name:'Mevad Toll Booth',coords:[72.4080,23.6100]},{name:'GTU-ITR College',coords:[72.4215,23.6257]}],
    },
    {
      id: 4, name: 'Patan → GTU-ITR', from_name: 'Patan', to_name: 'GTU-ITR College',
      bus_number: 'GTU-404', driver_name: 'Arjun Singh', driver_id: 'DRV004', color: '#EF4444',
      coords: [[72.1262,23.8493],[72.1500,23.8400],[72.2000,23.8300],[72.2600,23.8200],[72.3200,23.8100],[72.3600,23.8030],[72.3800,23.7800],[72.3850,23.7400],[72.3850,23.7000],[72.3900,23.6600],[72.4000,23.6400],[72.4215,23.6257]],
      stops: [{name:'Patan Bus Stand',coords:[72.1262,23.8493]},{name:'Sidhpur',coords:[72.2000,23.8300]},{name:'Unjha',coords:[72.3600,23.8030]},{name:'Mehsana Bypass',coords:[72.3900,23.6600]},{name:'GTU-ITR College',coords:[72.4215,23.6257]}],
    },
  ];

  db.transaction(() => {
    for (const r of routes) {
      db.run('INSERT INTO routes VALUES (?,?,?,?,?,?,?,?,?)', [r.id, r.name, r.from_name, r.to_name, r.bus_number, r.driver_name, r.driver_id, hash, r.color]);
      r.coords.forEach((c, i) => db.run('INSERT INTO route_coords (route_id, lat, lng, seq_order) VALUES (?,?,?,?)', [r.id, c[1], c[0], i]));
      r.stops.forEach((s, i) => db.run('INSERT INTO stops (route_id, name, lat, lng, seq_order) VALUES (?,?,?,?,?)', [r.id, s.name, s.coords[1], s.coords[0], i]));
    }
  });

  console.log('  ✓ Database seeded with 4 routes and driver accounts');
}

module.exports = { getDb, initDb };

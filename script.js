/**
 * ================================================
 * GTU-ITR Bus Tracking System - Main JavaScript
 * ================================================
 * Architecture: Modular vanilla JS with ES6+ patterns
 * Map Engine: MapLibre GL JS (MapCN core engine)
 * Storage: localStorage (backend simulation)
 * Geolocation: navigator.geolocation API
 * ================================================
 */

(function () {
  'use strict';

  // =============================================
  // 1. CONFIGURATION
  // =============================================
  const CONFIG = {
    storageKey: 'gtu_bus_tracking',
    updateInterval: 2000,
    mapStyle: 'https://tiles.openfreemap.org/styles/positron',
    mapStyleDark: 'https://tiles.openfreemap.org/styles/dark',
    defaultCenter: [72.4215, 23.6257],
    defaultZoom: 11,
    collegeCoords: [72.4215, 23.6257],
  };

  // =============================================
  // 2. ROUTE DATA
  // =============================================
  const ROUTES = [
    {
      id: 1,
      name: 'Mehsana → GTU-ITR',
      from: 'Mehsana',
      to: 'GTU-ITR College',
      busNumber: 'GTU-101',
      driverName: 'Rahul Sharma',
      driverId: 'DRV001',
      password: '1234',
      color: '#2563EB',
      coords: [
        [72.3693, 23.5880],
        [72.3750, 23.5940],
        [72.3850, 23.6060],
        [72.3950, 23.6150],
        [72.4080, 23.6200],
        [72.4215, 23.6257],
      ],
      stops: [
        { name: 'Mehsana Bus Stand', coords: [72.3693, 23.5880] },
        { name: 'Mehsana City Circle', coords: [72.3750, 23.5940] },
        { name: 'Mevad Toll Booth', coords: [72.4080, 23.6200] },
        { name: 'GTU-ITR College', coords: [72.4215, 23.6257] },
      ],
    },
    {
      id: 2,
      name: 'Palanpur → GTU-ITR',
      from: 'Palanpur',
      to: 'GTU-ITR College',
      busNumber: 'GTU-202',
      driverName: 'Vikram Patel',
      driverId: 'DRV002',
      password: '1234',
      color: '#22C55E',
      coords: [
        [72.4386, 24.1719],
        [72.4500, 24.1200],
        [72.4500, 24.0800],
        [72.4400, 24.0000],
        [72.4300, 23.9000],
        [72.4100, 23.8300],
        [72.3950, 23.8030],
        [72.3900, 23.7500],
        [72.3850, 23.7000],
        [72.3900, 23.6500],
        [72.4080, 23.6250],
        [72.4215, 23.6257],
      ],
      stops: [
        { name: 'Palanpur Bus Stand', coords: [72.4386, 24.1719] },
        { name: 'Deesa', coords: [72.4500, 24.0800] },
        { name: 'Dama', coords: [72.4400, 24.0000] },
        { name: 'Unjha', coords: [72.3950, 23.8030] },
        { name: 'Mehsana Bypass', coords: [72.3900, 23.6500] },
        { name: 'GTU-ITR College', coords: [72.4215, 23.6257] },
      ],
    },
    {
      id: 3,
      name: 'Ahmedabad → GTU-ITR',
      from: 'Ahmedabad',
      to: 'GTU-ITR College',
      busNumber: 'GTU-303',
      driverName: 'Suresh Kumar',
      driverId: 'DRV003',
      password: '1234',
      color: '#F59E0B',
      coords: [
        [72.5714, 23.0225],
        [72.5700, 23.0800],
        [72.5650, 23.1200],
        [72.5600, 23.1600],
        [72.5200, 23.2200],
        [72.4800, 23.2700],
        [72.4500, 23.3100],
        [72.4300, 23.3500],
        [72.4100, 23.4000],
        [72.4000, 23.4500],
        [72.3950, 23.5000],
        [72.3950, 23.5500],
        [72.4000, 23.5900],
        [72.4080, 23.6100],
        [72.4215, 23.6257],
      ],
      stops: [
        { name: 'Ahmedabad Bus Stand', coords: [72.5714, 23.0225] },
        { name: 'Adalaj', coords: [72.5600, 23.1600] },
        { name: 'Kalol', coords: [72.5200, 23.2200] },
        { name: 'Chhatral', coords: [72.4500, 23.3100] },
        { name: 'Nandasan', coords: [72.4000, 23.4500] },
        { name: 'Mevad Toll Booth', coords: [72.4080, 23.6100] },
        { name: 'GTU-ITR College', coords: [72.4215, 23.6257] },
      ],
    },
    {
      id: 4,
      name: 'Patan → GTU-ITR',
      from: 'Patan',
      to: 'GTU-ITR College',
      busNumber: 'GTU-404',
      driverName: 'Arjun Singh',
      driverId: 'DRV004',
      password: '1234',
      color: '#EF4444',
      coords: [
        [72.1262, 23.8493],
        [72.1500, 23.8400],
        [72.2000, 23.8300],
        [72.2600, 23.8200],
        [72.3200, 23.8100],
        [72.3600, 23.8030],
        [72.3800, 23.7800],
        [72.3850, 23.7400],
        [72.3850, 23.7000],
        [72.3900, 23.6600],
        [72.4000, 23.6400],
        [72.4215, 23.6257],
      ],
      stops: [
        { name: 'Patan Bus Stand', coords: [72.1262, 23.8493] },
        { name: 'Sidhpur', coords: [72.2000, 23.8300] },
        { name: 'Unjha', coords: [72.3600, 23.8030] },
        { name: 'Mehsana Bypass', coords: [72.3900, 23.6600] },
        { name: 'GTU-ITR College', coords: [72.4215, 23.6257] },
      ],
    },
  ];

  // =============================================
  // 3. UTILITY FUNCTIONS
  // =============================================
  const Utils = {
    /** Format current time as HH:MM:SS */
    getCurrentTime() {
      const now = new Date();
      return now.toLocaleTimeString('en-IN', { hour12: false });
    },

    /** Format timestamp for display */
    formatTime(date) {
      if (!date) return '--';
      const d = new Date(date);
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    },

    /** Calculate distance between two coordinates in km (Haversine) */
    haversineDist(lat1, lon1, lat2, lon2) {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },

    /** Estimate ETA in minutes given remaining distance and average speed */
    estimateETA(km, speed) {
      if (!speed || speed < 5) return '--';
      const mins = (km / speed) * 60;
      if (mins < 1) return '< 1 min';
      return Math.round(mins) + ' min';
    },

    /** Animate counting number */
    animateCounter(el, target, duration = 1000) {
      const start = parseInt(el.textContent) || 0;
      const diff = target - start;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(start + diff * eased);
        if (progress < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    },

    /** Generate a unique ID */
    genId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },

    /** Format duration from seconds */
    formatDuration(seconds) {
      const mins = Math.round(seconds / 60);
      if (mins < 60) return `${mins} min`;
      const hours = Math.floor(mins / 60);
      const rem = mins % 60;
      return `${hours}h ${rem}m`;
    },

    /** Format distance from meters */
    formatDistance(meters) {
      if (meters < 1000) return `${Math.round(meters)} m`;
      return `${(meters / 1000).toFixed(1)} km`;
    },

    /** Debounce function */
    debounce(fn, delay = 300) {
      let timer;
      return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
      };
    },
  };

  // =============================================
  // 4. STORAGE MODULE
  // =============================================
  const Storage = {
    /** Get all data */
    getAll() {
      try {
        const data = localStorage.getItem(CONFIG.storageKey);
        return data ? JSON.parse(data) : this.getDefaults();
      } catch {
        return this.getDefaults();
      }
    },

    /** Default data structure */
    getDefaults() {
      return {
        drivers: {},
        notifications: [],
        settings: { theme: 'light' },
      };
    },

    /** Save all data */
    save(data) {
      localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
    },

    /** Update driver location */
    updateDriverLocation(routeId, lat, lng, speed, heading, accuracy) {
      const data = this.getAll();
      const route = ROUTES.find(r => r.id === routeId);
      if (!route) return;

      data.drivers[routeId] = {
        ...data.drivers[routeId],
        lat,
        lng,
        speed: Math.round(speed || 0),
        heading: Math.round(heading || 0),
        accuracy: Math.round(accuracy || 0),
        timestamp: new Date().toISOString(),
        driverName: route.driverName,
        busNumber: route.busNumber,
        route: routeId,
        online: true,
      };
      this.save(data);
    },

    /** Set driver online status */
    setDriverStatus(routeId, online) {
      const data = this.getAll();
      if (data.drivers[routeId]) {
        data.drivers[routeId].online = online;
        if (!online) {
          data.drivers[routeId].lat = null;
          data.drivers[routeId].lng = null;
          data.drivers[routeId].speed = 0;
        }
        this.save(data);
      }
    },

    /** Get driver data for a route */
    getDriver(routeId) {
      const data = this.getAll();
      return data.drivers[routeId] || null;
    },

    /** Get all drivers */
    getAllDrivers() {
      const data = this.getAll();
      return data.drivers || {};
    },

    /** Add notification */
    addNotification(message, type = 'info') {
      const data = this.getAll();
      data.notifications.unshift({
        id: Utils.genId(),
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false,
      });
      if (data.notifications.length > 50) data.notifications = data.notifications.slice(0, 50);
      this.save(data);
      this.updateNotifBadge();
    },

    /** Update notification badge */
    updateNotifBadge() {
      const data = this.getAll();
      const unread = data.notifications.filter(n => !n.read).length;
      const badge = document.getElementById('notif-badge');
      if (badge) {
        badge.textContent = unread;
        badge.style.display = unread > 0 ? 'flex' : 'none';
      }
    },

    /** Mark notifications as read */
    markNotifRead() {
      const data = this.getAll();
      data.notifications.forEach(n => n.read = true);
      this.save(data);
      this.updateNotifBadge();
    },

    /** Clear all notifications */
    clearAllNotifs() {
      const data = this.getAll();
      data.notifications = [];
      this.save(data);
      this.updateNotifBadge();
    },

    /** Save theme preference */
    saveTheme(theme) {
      const data = this.getAll();
      data.settings.theme = theme;
      this.save(data);
    },

    /** Get theme */
    getTheme() {
      const data = this.getAll();
      return data.settings?.theme || 'light';
    },
  };

  // =============================================
  // 5. TOAST NOTIFICATIONS
  // =============================================
  const Toast = {
    show(message, type = 'info', duration = 4000) {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-circle', info: 'fa-info-circle' };
      toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i> ${message}`;
      container.appendChild(toast);

      setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => toast.remove(), 300);
      }, duration);
    },

    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'error', 6000); },
    warning(msg) { this.show(msg, 'warning'); },
    info(msg) { this.show(msg, 'info'); },
  };

  // =============================================
  // 6. NAVIGATION MODULE
  // =============================================
  const Navigation = {
    currentPage: 'student',

    init() {
      // Sidebar items
      document.querySelectorAll('.sidebar-item[data-page]').forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          this.goTo(item.dataset.page);
          document.getElementById('sidebar').classList.remove('open');
          document.getElementById('sidebar-overlay').classList.remove('open');
        });
      });

      // Dropdown items
      document.querySelectorAll('.dropdown-item[data-page]').forEach(item => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          this.goTo(item.dataset.page);
          document.getElementById('dropdown-menu').classList.remove('open');
        });
      });

      // Profile button toggle
      document.getElementById('profile-btn')?.addEventListener('click', () => {
        document.getElementById('dropdown-menu')?.classList.toggle('open');
      });

      // Close dropdown on outside click
      document.addEventListener('click', (e) => {
        const dd = document.getElementById('dropdown-menu');
        if (dd && !e.target.closest('.profile-dropdown')) dd.classList.remove('open');
      });

      // Sidebar toggle
      document.getElementById('menu-toggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('open');
        document.getElementById('sidebar-overlay').classList.add('open');
      });
      document.getElementById('sidebar-close')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('open');
      });
      document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('open');
      });

      // Logout handler
      document.getElementById('logout-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        const sessionData = sessionStorage.getItem('gtu_driver_session');
        if (sessionData) {
          try {
            const session = JSON.parse(sessionData);
            Storage.setDriverStatus(session.routeId, false);
          } catch (err) { /* ignore */ }
        }
        sessionStorage.removeItem('gtu_driver_session');
        if (DriverDashboard.isTracking) DriverDashboard.stopTracking();
        DriverDashboard.initialized = false;
        Toast.info('Logged out successfully');
        this.goTo('student');
        document.getElementById('dropdown-menu')?.classList.remove('open');
      });

      // Forgot password
      document.getElementById('forgot-password')?.addEventListener('click', (e) => {
        e.preventDefault();
        Toast.show('Use password: 1234 for demo accounts', 'info', 5000);
      });

      // Landing page buttons
      document.getElementById('landing-student-btn')?.addEventListener('click', () => {
        this.goTo('student');
      });
      document.getElementById('landing-driver-btn')?.addEventListener('click', () => {
        this.goTo('driver-login');
      });

      // Handle hash-based navigation
      window.addEventListener('hashchange', () => this.handleHash());
      this.handleHash();
    },

    handleHash() {
      const hash = window.location.hash.slice(1) || 'logo';
      this.goTo(hash);
    },

    goTo(page) {
      // Hide all pages
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

      // Show/hide nav based on page
      const nav = document.getElementById('main-nav');
      const sidebar = document.getElementById('sidebar');
      const sidebarOverlay = document.getElementById('sidebar-overlay');

      if (page === 'logo') {
        nav?.classList.add('hidden');
        sidebar?.classList.remove('open');
        sidebarOverlay?.classList.remove('open');
      } else {
        nav?.classList.remove('hidden');
      }

      // Show target page
      const target = document.getElementById(`page-${page}`);
      if (target) {
        target.classList.add('active');
        this.currentPage = page;
        window.location.hash = page;

        // Update sidebar active state
        document.querySelectorAll('.sidebar-item').forEach(item => {
          item.classList.toggle('active', item.dataset.page === page);
        });

        // Resize maps when switching to a page with a map
        setTimeout(() => {
          if (page === 'student') {
            MapManager.resize('student-map');
            StudentPage.init();
          }
          if (page === 'driver-dashboard') {
            MapManager.resize('driver-map');
            DriverDashboard.init();
          }
          if (page === 'admin') {
            MapManager.resize('admin-map');
            AdminPage.init();
          }
        }, 200);
      }
    },
  };

  // =============================================
  // 7. MAP MODULE
  // =============================================
  const MapManager = {
    maps: {},
    markers: {},
    routes: {},

    /** Create a MapLibre map instance */
    create(containerId, opts = {}) {
      const container = document.getElementById(containerId);
      if (!container) return null;

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const style = isDark ? CONFIG.mapStyleDark : CONFIG.mapStyle;

      const map = new maplibregl.Map({
        container: containerId,
        style: style,
        center: opts.center || CONFIG.defaultCenter,
        zoom: opts.zoom || CONFIG.defaultZoom,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl({
        showCompass: true,
        showZoom: true,
      }), opts.controlsPosition || 'top-right');

      map.addControl(new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserLocation: true,
      }), opts.controlsPosition || 'top-right');

      map.addControl(new maplibregl.FullscreenControl({}), opts.controlsPosition || 'top-right');

      map.on('load', () => {
        const loader = document.getElementById(`${containerId}-loader`);
        if (loader) loader.classList.add('hidden');
      });

      this.maps[containerId] = map;
      return map;
    },

    /** Add a bus marker with custom HTML */
    addBusMarker(mapId, id, coords, color = '#2563EB', label = '', options = {}) {
      const map = this.maps[mapId];
      if (!map) return null;

      const el = document.createElement('div');
      el.className = 'bus-marker';
      el.innerHTML = `<div class="bus-marker-inner" style="background:${color}"><i class="fas fa-bus"></i></div>`;
      if (options.bouncing) el.classList.add('bouncing');

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(coords)
        .addTo(map);

      if (options.popupHtml) {
        marker.setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(options.popupHtml));
      }

      if (!this.markers[mapId]) this.markers[mapId] = {};
      this.markers[mapId][id] = { marker, el, coords };
      return marker;
    },

    /** Add a destination marker */
    addDestinationMarker(mapId, id, coords) {
      const map = this.maps[mapId];
      if (!map) return null;

      const el = document.createElement('div');
      el.className = 'bus-marker';
      el.innerHTML = `<div class="bus-marker-inner destination"><i class="fas fa-flag-checkered"></i></div>`;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(coords)
        .addTo(map);

      marker.setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="font-weight:600">GTU-ITR College</div>
        <div style="font-size:0.8rem;color:#64748b">Destination</div>
      `));

      if (!this.markers[mapId]) this.markers[mapId] = {};
      this.markers[mapId][id] = { marker, el, coords };
      return marker;
    },

    /** Add a stop marker */
    addStopMarker(mapId, id, coords, label = '', completed = false) {
      const map = this.maps[mapId];
      if (!map) return null;

      const el = document.createElement('div');
      el.className = 'bus-marker';
      el.innerHTML = `<div class="bus-marker-inner stop${completed ? ' completed' : ''}"></div>`;

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(coords)
        .addTo(map);

      marker.setPopup(new maplibregl.Popup({ offset: 15 }).setHTML(`
        <div style="font-weight:500;font-size:0.85rem">${label}</div>
      `));

      if (!this.markers[mapId]) this.markers[mapId] = {};
      this.markers[mapId][id] = { marker, el, coords };
      return marker;
    },

    /** Add a college marker */
    addCollegeMarker(mapId, id, coords) {
      const map = this.maps[mapId];
      if (!map) return null;

      const el = document.createElement('div');
      el.className = 'bus-marker';
      el.innerHTML = `<div class="bus-marker-inner college-marker"><i class="fas fa-university"></i></div>`;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat(coords)
        .addTo(map);

      marker.setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div style="font-weight:600">GTU-ITR College</div>
        <div style="font-size:0.8rem;color:#64748b">Main Campus</div>
      `));

      if (!this.markers[mapId]) this.markers[mapId] = {};
      this.markers[mapId][id] = { marker, el, coords };
      return marker;
    },

    /** Draw a route polyline */
    drawRoute(mapId, id, coords, color = '#2563EB', options = {}) {
      const map = this.maps[mapId];
      if (!map) return;

      // Remove existing route layer
      this.removeRoute(mapId, id);

      const sourceId = `route-${id}-${Utils.genId()}`;
      const layerId = `route-layer-${id}-${Utils.genId()}`;

      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: { routeId: id },
          geometry: {
            type: 'LineString',
            coordinates: coords,
          },
        },
      });

      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': color,
          'line-width': options.width || 4,
          'line-opacity': options.opacity !== undefined ? options.opacity : 0.7,
        },
      });

      if (!this.routes[mapId]) this.routes[mapId] = {};
      this.routes[mapId][id] = { layer: layerId, source: sourceId };

      // Add click handler if provided
      if (options.onClick) {
        map.on('click', layerId, (e) => {
          options.onClick(e, id);
        });
        map.on('mouseenter', layerId, () => {
          map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', layerId, () => {
          map.getCanvas().style.cursor = '';
        });
      }

      return { layer: layerId, source: sourceId };
    },

    /** Remove a single route */
    removeRoute(mapId, id) {
      const map = this.maps[mapId];
      if (!map || !this.routes[mapId] || !this.routes[mapId][id]) return;

      const { layer, source } = this.routes[mapId][id];
      try {
        if (map.getLayer(layer)) map.removeLayer(layer);
      } catch (e) { /* ignore */ }
      try {
        if (map.getSource(source)) map.removeSource(source);
      } catch (e) { /* ignore */ }
      delete this.routes[mapId][id];
    },

    /** Update marker position with smooth animation */
    updateMarkerPosition(mapId, id, newCoords) {
      const markerData = this.markers[mapId]?.[id];
      if (!markerData) return;

      const { marker, el } = markerData;
      const oldCoords = markerData.coords;

      marker.setLngLat(newCoords);
      markerData.coords = newCoords;

      // Animate marker bounce
      el.classList.add('bouncing');
      setTimeout(() => el.classList.remove('bouncing'), 600);
    },

    /** Remove all markers from a map */
    clearMarkers(mapId) {
      const markers = this.markers[mapId];
      if (markers) {
        Object.values(markers).forEach(m => m.marker.remove());
        delete this.markers[mapId];
      }
    },

    /** Remove all routes from a map */
    clearRoutes(mapId) {
      const map = this.maps[mapId];
      const routeData = this.routes[mapId];
      if (map && routeData) {
        Object.values(routeData).forEach(({ layer, source }) => {
          try { map.removeLayer(layer); } catch (e) { /* ignore */ }
          try { map.removeSource(source); } catch (e) { /* ignore */ }
        });
        delete this.routes[mapId];
      }
    },

    /** Fly to a location */
    flyTo(mapId, coords, zoom = 14) {
      const map = this.maps[mapId];
      if (map) {
        map.flyTo({ center: coords, zoom, duration: 1000 });
      }
    },

    /** Fit map to bounds */
    fitBounds(mapId, bounds, padding = 50) {
      const map = this.maps[mapId];
      if (map) {
        map.fitBounds(bounds, { padding, duration: 1000 });
      }
    },

    /** Resize map */
    resize(mapId) {
      const map = this.maps[mapId];
      if (map) setTimeout(() => map.resize(), 100);
    },
  };

  // =============================================
  // 8. STUDENT DASHBOARD
  // =============================================
  const StudentPage = {
    mapId: 'student-map',
    initialized: false,
    interval: null,
    animateInterval: null,
    simulatedBusCoords: {},
    simProgress: {},
    osrmRoutes: [],
    osrmSelectedIndex: 0,
    osrmBusy: false,

    init() {
      if (this.initialized) return;

      this.initialized = true;

      // Create map after a short delay (to ensure container is visible)
      setTimeout(() => {
        const map = MapManager.create(this.mapId, {
          center: CONFIG.defaultCenter,
          zoom: 11,
        });

        map.on('load', () => {
          this.drawAllRoutes();
          this.addCollegeMarker();
          this.addStopMarkers();
          this.setupRouteSelector();
          this.startPolling();
          this.startBusAnimation();
          // Fetch OSRM routes for the initially selected route
          const sel = document.getElementById('route-select');
          const routeId = sel ? parseInt(sel.value) : 1;
          const route = ROUTES.find(r => r.id === (routeId || 1));
          if (route) {
            this.fetchOSRMRoutes(route.coords[0], route.coords[route.coords.length - 1]);
          }
        });
      }, 300);

      // Route select change
      document.getElementById('route-select')?.addEventListener('change', () => {
        this.filterRoute();
        this.onRouteSelectChange();
      });

      // Search bus
      const searchInput = document.getElementById('search-bus');
      if (searchInput) {
        searchInput.addEventListener('input', Utils.debounce(() => this.filterRoute(), 300));
      }

      // View live button
      document.getElementById('view-live-btn')?.addEventListener('click', () => {
        this.focusNearestBus();
      });

      // Route selector from hero (duplicate - remove the second one, keep only this one)
      // Already handled above
    },

    drawAllRoutes() {
      ROUTES.forEach(route => {
        MapManager.drawRoute(this.mapId, `route-${route.id}`, route.coords, route.color);
      });
    },

    addCollegeMarker() {
      MapManager.addCollegeMarker(this.mapId, 'college', CONFIG.collegeCoords);
    },

    addStopMarkers() {
      ROUTES.forEach(route => {
        route.stops.forEach((stop, idx) => {
          if (idx === route.stops.length - 1) return; // skip college (already added)
          MapManager.addStopMarker(
            this.mapId,
            `stop-${route.id}-${idx}`,
            stop.coords,
            stop.name,
            false
          );
        });
      });
    },

    /** Fetch OSRM route alternatives between two points */
    async fetchOSRMRoutes(startCoords, endCoords) {
      if (this.osrmBusy) return;
      this.osrmBusy = true;
      const panel = document.getElementById('osrm-panel');
      const body = document.getElementById('osrm-panel-body');
      if (panel) panel.classList.remove('hidden');
      if (body) body.innerHTML = '<div class="osrm-loading"><i class="fas fa-spinner fa-spin"></i> Loading routes...</div>';

      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${startCoords[0]},${startCoords[1]};${endCoords[0]},${endCoords[1]}?overview=full&geometries=geojson&alternatives=true`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.routes?.length > 0) {
          this.osrmRoutes = data.routes.map(r => ({
            coordinates: r.geometry.coordinates,
            duration: r.duration,
            distance: r.distance,
          }));
          this.osrmSelectedIndex = 0;
          this.drawOSRMRoutes();
          this.updateOSRMPanel();
        } else {
          body.innerHTML = '<div class="osrm-loading" style="color:var(--text-muted)">No alternative routes found</div>';
        }
      } catch (e) {
        console.error('OSRM fetch failed:', e);
        if (body) body.innerHTML = '<div class="osrm-loading" style="color:var(--danger)">Failed to load routes</div>';
      } finally {
        this.osrmBusy = false;
      }
    },

    /** Draw OSRM route alternatives on the map */
    drawOSRMRoutes() {
      this.clearOSRMRoutes();
      this.osrmRoutes.forEach((route, index) => {
        const isSelected = index === this.osrmSelectedIndex;
        const routeId = `osrm-alt-${index}`;
        MapManager.drawRoute(this.mapId, routeId, route.coordinates, '#6366f1', {
          width: isSelected ? 6 : 3,
          opacity: isSelected ? 1 : 0.4,
          onClick: () => {
            this.osrmSelectedIndex = index;
            this.drawOSRMRoutes();
            this.updateOSRMPanel();
          },
        });
      });
    },

    /** Clear OSRM routes from the map */
    clearOSRMRoutes() {
      if (!this.osrmRoutes.length) return;
      this.osrmRoutes.forEach((_, i) => {
        MapManager.removeRoute(this.mapId, `osrm-alt-${i}`);
      });
    },

    /** Update the OSRM route panel UI */
    updateOSRMPanel() {
      const body = document.getElementById('osrm-panel-body');
      if (!body) return;
      if (!this.osrmRoutes.length) {
        body.innerHTML = '<div class="osrm-loading" style="color:var(--text-muted)">No routes available</div>';
        return;
      }
      const fastestDuration = Math.min(...this.osrmRoutes.map(r => r.duration));
      body.innerHTML = this.osrmRoutes.map((route, index) => {
        const isActive = index === this.osrmSelectedIndex;
        const isFastest = route.duration === fastestDuration;
        return `
          <button class="osrm-route-btn${isActive ? ' active' : ''}" data-index="${index}">
            <span class="route-color-bar" style="background:${isActive ? '#6366f1' : '#94a3b8'}"></span>
            <span class="route-info">
              <span class="route-duration">
                <i class="far fa-clock"></i>
                ${Utils.formatDuration(route.duration)}
              </span>
              <span class="route-distance">
                <i class="fas fa-road"></i>
                ${Utils.formatDistance(route.distance)}
              </span>
            </span>
            ${isFastest ? '<span class="osrm-fastest-badge">Fastest</span>' : ''}
          </button>
        `;
      }).join('');

      // Attach click handlers
      body.querySelectorAll('.osrm-route-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.index);
          if (idx !== this.osrmSelectedIndex) {
            this.osrmSelectedIndex = idx;
            this.drawOSRMRoutes();
            this.updateOSRMPanel();
          }
        });
      });
    },

    setupRouteSelector() {
      // Additional bus markers for each route's start
      ROUTES.forEach(route => {
        const startCoords = route.coords[0];
        MapManager.addBusMarker(
          this.mapId,
          `start-${route.id}`,
          startCoords,
          route.color,
          route.name,
          {
            popupHtml: `
              <div style="font-weight:600">${route.busNumber}</div>
              <div style="font-size:0.8rem;color:#64748b">${route.name}</div>
              <div style="font-size:0.8rem;color:#64748b">Driver: ${route.driverName}</div>
            `
          }
        );
      });
    },

    /** Handle route select change - fetch OSRM routes for the selected route */
    onRouteSelectChange() {
      const routeId = parseInt(document.getElementById('route-select')?.value);
      if (!routeId) {
        // "All Routes" selected - hide OSRM panel
        document.getElementById('osrm-panel')?.classList.add('hidden');
        this.clearOSRMRoutes();
        return;
      }
      const route = ROUTES.find(r => r.id === routeId);
      if (route) {
        this.fetchOSRMRoutes(route.coords[0], route.coords[route.coords.length - 1]);
      }
    },

    filterRoute() {
      const selected = document.getElementById('route-select')?.value;
      const searchTerm = (document.getElementById('search-bus')?.value || '').toLowerCase();

      // Show/hide route markers based on filter
      ROUTES.forEach(route => {
        const showRoute = (!selected || selected === String(route.id)) &&
          (!searchTerm || route.name.toLowerCase().includes(searchTerm) ||
            route.busNumber.toLowerCase().includes(searchTerm));

        // Toggle route visibility
        const routeData = MapManager.routes[this.mapId]?.[`route-${route.id}`];
        if (routeData) {
          try {
            const map = MapManager.maps[this.mapId];
            if (map) {
              const visibility = showRoute ? 'visible' : 'none';
              map.setLayoutProperty(routeData.layer, 'visibility', visibility);
            }
          } catch (e) { /* ignore */ }
        }
      });
    },

    getSimulatedPosition(routeId) {
      const route = ROUTES.find(r => r.id === parseInt(routeId));
      if (!route) return null;

      if (!this.simProgress[routeId]) this.simProgress[routeId] = 0;

      // Advance progress slowly
      this.simProgress[routeId] += 0.002;
      if (this.simProgress[routeId] > 1) this.simProgress[routeId] = 0;

      const progress = this.simProgress[routeId];
      const totalSegments = route.coords.length - 1;
      const segProgress = progress * totalSegments;
      const segIndex = Math.min(Math.floor(segProgress), totalSegments - 1);
      const segFraction = segProgress - segIndex;

      const start = route.coords[segIndex];
      const end = route.coords[segIndex + 1];

      return {
        lng: start[0] + (end[0] - start[0]) * segFraction,
        lat: start[1] + (end[1] - start[1]) * segFraction,
        speed: 35 + Math.random() * 25,
        heading: 180,
      };
    },

    startPolling() {
      if (this.interval) clearInterval(this.interval);

      this.interval = setInterval(() => {
        this.updateBusLocations();
      }, CONFIG.updateInterval);
    },

    updateBusLocations() {
      const drivers = Storage.getAllDrivers();
      const map = MapManager.maps[this.mapId];
      if (!map) return;

      // Update info card with first active driver
      let activeDriver = null;

      ROUTES.forEach(route => {
        const driver = drivers[route.id];
        let position;
        let isSimulated = false;

        if (driver && driver.online && driver.lat && driver.lng) {
          position = { lat: driver.lat, lng: driver.lng, speed: driver.speed, heading: driver.heading };
        } else {
          // Simulate for demo
          position = this.getSimulatedPosition(route.id);
          isSimulated = true;
        }

        if (position) {
          const markerId = `bus-${route.id}`;
          const coords = [position.lng, position.lat];

          // Create or update marker
          if (!MapManager.markers[this.mapId]?.[markerId]) {
            const status = driver?.online ? 'Active' : 'Simulated';
            const speed = position.speed || 0;
            MapManager.addBusMarker(
              this.mapId,
              markerId,
              coords,
              route.color,
              `${route.busNumber} - ${route.name}`,
              {
                bouncing: true,
                popupHtml: `
                  <div style="font-weight:600">${route.busNumber}</div>
                  <div style="font-size:0.8rem;color:#64748b">${route.name}</div>
                  <div style="font-size:0.8rem;color:#64748b">Driver: ${route.driverName}</div>
                  <div style="font-size:0.8rem;color:#64748b">Speed: ${Math.round(speed)} km/h</div>
                  <div style="font-size:0.8rem;color:#64748b">Status: ${status}</div>
                `
              }
            );
          } else {
            MapManager.updateMarkerPosition(this.mapId, markerId, coords);
          }

          if (!activeDriver) {
            activeDriver = { route, driver, position, isSimulated };
          }
        }
      });

      // Update info card with first bus
      if (activeDriver) {
        this.updateInfoCard(activeDriver);
      }
    },

    updateInfoCard(data) {
      const { route, driver, position, isSimulated } = data;
      const d = driver || {};

      document.getElementById('info-bus-number').textContent = route?.busNumber || 'GTU-101';
      document.getElementById('info-bus-status').textContent = d.online ? 'Active' : 'Simulated';
      document.getElementById('info-bus-status').className = `status-badge ${d.online ? 'active' : 'inactive'}`;
      document.getElementById('info-driver').textContent = route?.driverName || '--';
      document.getElementById('info-route').textContent = route?.name || '--';
      document.getElementById('info-speed').textContent = `${Math.round(position?.speed || 0)} km/h`;

      // Calculate ETA
      if (route && position) {
        const destCoords = route.coords[route.coords.length - 1];
        const dist = Utils.haversineDist(position.lat, position.lng, destCoords[1], destCoords[0]);
        const eta = Utils.estimateETA(dist, position.speed);
        document.getElementById('info-eta').textContent = eta;
        document.getElementById('eta-display').textContent = eta;
        document.getElementById('distance-remaining').textContent = `${dist.toFixed(1)} km`;

        // Journey progress
        const totalDist = Utils.haversineDist(
          route.coords[0][1], route.coords[0][0],
          destCoords[1], destCoords[0]
        );
        const progress = totalDist > 0 ? Math.min(((totalDist - dist) / totalDist) * 100, 100) : 0;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('progress-percent').textContent = `${Math.round(progress)}%`;

        // Find current stop
        const stopsHtml = route.stops.map((stop, idx) => {
          const stopDist = Utils.haversineDist(position.lat, position.lng, stop.coords[1], stop.coords[0]);
          const isCurrent = idx > 0 && stopDist < 3;
          const isPast = stopDist < 1;
          return `
            <li class="stop-item${isCurrent ? ' current' : ''}">
              <span class="stop-dot"></span>
              ${stop.name}
              <span class="stop-dist">${isPast ? 'Passed' : isCurrent ? 'Arriving' : stopDist.toFixed(1) + ' km'}</span>
            </li>
          `;
        }).join('');
        document.getElementById('stops-list').innerHTML = stopsHtml;
      }

      document.getElementById('info-updated').textContent = d.timestamp ? Utils.formatTime(d.timestamp) : 'Just now';

      // Occupancy
      const occ = 15 + Math.floor(Math.random() * 25);
      document.getElementById('occupancy-fill').style.width = `${(occ / 50) * 100}%`;
      document.getElementById('occupancy-text').textContent = `${occ} / 50`;
    },

    startBusAnimation() {
      // Triggered periodically by the polling interval
    },

    focusNearestBus() {
      const drivers = Storage.getAllDrivers();
      const routeId = document.getElementById('route-select')?.value;

      // Find first active bus
      const targetRoute = ROUTES.find(r => {
        if (routeId) return r.id === parseInt(routeId);
        return true;
      });

      if (targetRoute) {
        const driver = drivers[targetRoute.id];
        if (driver && driver.lat && driver.lng) {
          MapManager.flyTo(this.mapId, [driver.lng, driver.lat], 14);
        } else {
          // Fly to route midpoint
          const midIdx = Math.floor(targetRoute.coords.length / 2);
          const mid = targetRoute.coords[midIdx];
          MapManager.flyTo(this.mapId, mid, 12);
        }
      }
    },

    destroy() {
      if (this.interval) clearInterval(this.interval);
      this.clearOSRMRoutes();
      this.initialized = false;
    },
  };

  // =============================================
  // 9. DRIVER LOGIN
  // =============================================
  const DriverLogin = {
    init() {
      const form = document.getElementById('driver-login-form');
      if (!form) return;

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });

      // Password toggle
      document.getElementById('password-toggle')?.addEventListener('click', () => {
        const input = document.getElementById('driver-password');
        const icon = document.querySelector('#password-toggle i');
        if (input.type === 'password') {
          input.type = 'text';
          icon.className = 'fas fa-eye-slash';
        } else {
          input.type = 'password';
          icon.className = 'fas fa-eye';
        }
      });

      // Check remember me
      const remembered = localStorage.getItem('gtu_driver_remember');
      if (remembered) {
        try {
          const data = JSON.parse(remembered);
          document.getElementById('driver-id').value = data.id || '';
          document.getElementById('driver-route-select').value = data.route || '';
          document.getElementById('remember-me').checked = true;
        } catch (e) { /* ignore */ }
      }
    },

    handleLogin() {
      const driverId = document.getElementById('driver-id').value.trim();
      const password = document.getElementById('driver-password').value.trim();
      const routeId = parseInt(document.getElementById('driver-route-select').value);
      const remember = document.getElementById('remember-me').checked;

      if (!driverId || !password || !routeId) {
        Toast.warning('Please fill in all fields');
        return;
      }

      if (password !== '1234') {
        Toast.error('Invalid password. Use: 1234');
        return;
      }

      // Find route by driver ID or any matching route
      const route = ROUTES.find(r => r.driverId === driverId || r.id === routeId);
      if (!route) {
        Toast.error('Invalid Driver ID or Route');
        return;
      }

      // Store current driver session
      const session = {
        driverId: route.driverId,
        driverName: route.driverName,
        busNumber: route.busNumber,
        routeId: route.id,
        loginTime: new Date().toISOString(),
      };
      sessionStorage.setItem('gtu_driver_session', JSON.stringify(session));

      // Remember me
      if (remember) {
        localStorage.setItem('gtu_driver_remember', JSON.stringify({ id: driverId, route: routeId }));
      } else {
        localStorage.removeItem('gtu_driver_remember');
      }

      Toast.success(`Welcome, ${route.driverName}!`);

      // Navigate to driver dashboard
      setTimeout(() => {
        Navigation.goTo('driver-dashboard');
      }, 500);
    },
  };

  // =============================================
  // 10. DRIVER DASHBOARD
  // =============================================
  const DriverDashboard = {
    mapId: 'driver-map',
    initialized: false,
    watchId: null,
    isTracking: false,
    session: null,
    route: null,
    prevPosition: null,

    init() {
      if (this.initialized) return;

      // Get session
      const sessionData = sessionStorage.getItem('gtu_driver_session');
      if (!sessionData) {
        Toast.warning('Please login first');
        Navigation.goTo('driver-login');
        return;
      }

      this.session = JSON.parse(sessionData);
      this.route = ROUTES.find(r => r.id === this.session.routeId);
      if (!this.route) return;

      this.initialized = true;

      // Update driver info
      this.updateDriverInfo();

      // Create map
      setTimeout(() => {
        const startCoords = this.route.coords[0].slice();
        const map = MapManager.create(this.mapId, {
          center: startCoords,
          zoom: 12,
        });

        map.on('load', () => {
          MapManager.drawRoute(this.mapId, 'driver-route', this.route.coords, this.route.color);
          MapManager.addBusMarker(this.mapId, 'driver-bus', startCoords, this.route.color, '', { bouncing: true });
          MapManager.addDestinationMarker(this.mapId, 'driver-dest', CONFIG.collegeCoords);
          this.addRouteStops();
        });

        // Setup controls
        this.setupControls();
      }, 300);

      // Update route info
      document.getElementById('driver-route-from').textContent = this.route.from;
      document.getElementById('driver-route-to').textContent = this.route.to;

      // Check if already tracking (session recovery)
      this.checkExistingTracking();
    },

    updateDriverInfo() {
      document.getElementById('driver-name-display').textContent = this.session.driverName;
      document.getElementById('driver-bus-display').textContent =
        `${this.session.busNumber} · Route ${this.session.routeId}: ${this.route.name}`;
    },

    addRouteStops() {
      this.route.stops.forEach((stop, idx) => {
        if (idx === this.route.stops.length - 1) return;
        MapManager.addStopMarker(
          this.mapId,
          `stop-${idx}`,
          stop.coords,
          stop.name,
          false
        );
      });
    },

    setupControls() {
      const startBtn = document.getElementById('start-tracking-btn');
      const stopBtn = document.getElementById('stop-tracking-btn');
      const shareBtn = document.getElementById('share-location-btn');
      const emergencyBtn = document.getElementById('emergency-btn');

      startBtn?.addEventListener('click', () => this.startTracking());
      stopBtn?.addEventListener('click', () => this.stopTracking());
      shareBtn?.addEventListener('click', () => this.shareLocation());
      emergencyBtn?.addEventListener('click', () => this.triggerEmergency());

      // Keyboard shortcut: Space to toggle tracking
      document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        if (e.key === ' ' && Navigation.currentPage === 'driver-dashboard') {
          e.preventDefault();
          this.isTracking ? this.stopTracking() : this.startTracking();
        }
      });
    },

    checkExistingTracking() {
      const driver = Storage.getDriver(this.session.routeId);
      if (driver && driver.online) {
        Toast.info('Resuming previous tracking session');
        this.isTracking = true;
        this.updateUIForTracking(true);
      }
    },

    startTracking() {
      if (this.isTracking) return;

      // Check geolocation support
      if (!navigator.geolocation) {
        Toast.error('Geolocation is not supported by your browser');
        return;
      }

      Toast.info('Requesting GPS location...');

      this.watchId = navigator.geolocation.watchPosition(
        (position) => this.onPositionUpdate(position),
        (error) => this.onPositionError(error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000,
        }
      );

      this.isTracking = true;
      this.updateUIForTracking(true);

      Storage.setDriverStatus(this.session.routeId, true);
      Storage.addNotification(`${this.session.driverName} started tracking`, 'success');

      Toast.success('GPS tracking started!');
    },

    stopTracking() {
      if (this.watchId !== null) {
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }

      this.isTracking = false;
      this.updateUIForTracking(false);

      Storage.setDriverStatus(this.session.routeId, false);
      Storage.addNotification(`${this.session.driverName} stopped tracking`, 'info');

      document.getElementById('driver-lat').textContent = '--';
      document.getElementById('driver-lng').textContent = '--';
      document.getElementById('driver-speed').textContent = '0 km/h';
      document.getElementById('driver-heading').textContent = '--°';
      document.getElementById('driver-accuracy').textContent = '-- m';

      Toast.info('Tracking stopped');
    },

    onPositionUpdate(position) {
      const { latitude, longitude, speed, heading, accuracy } = position.coords;

      // Update UI
      document.getElementById('driver-lat').textContent = latitude.toFixed(6);
      document.getElementById('driver-lng').textContent = longitude.toFixed(6);
      document.getElementById('driver-speed').textContent = `${Math.round(speed || 0)} km/h`;
      document.getElementById('driver-heading').textContent = heading ? `${Math.round(heading)}°` : '--°';
      document.getElementById('driver-accuracy').textContent = `${Math.round(accuracy || 0)} m`;
      document.getElementById('driver-last-sync').textContent = Utils.getCurrentTime();

      // Store in localStorage
      Storage.updateDriverLocation(
        this.session.routeId,
        latitude,
        longitude,
        speed || 0,
        heading || 0,
        accuracy || 0
      );

      // Update map marker
      const coords = [longitude, latitude];
      MapManager.updateMarkerPosition(this.mapId, 'driver-bus', coords);
      MapManager.flyTo(this.mapId, coords, 15);

      // Update tracking status indicator
      const statusEl = document.getElementById('tracking-status');
      if (statusEl) {
        statusEl.innerHTML = `<span class="dot live"></span> <span>Tracking Live</span>`;
      }

      // Update GPS status
      const gpsEl = document.getElementById('gps-status');
      if (gpsEl) {
        gpsEl.innerHTML = `<span class="dot live"></span> GPS Connected (${Math.round(accuracy || 0)}m)`;
      }

      // Battery (mock)
      const batteryLevel = 60 + Math.floor(Math.random() * 35);
      const batteryIcon = batteryLevel > 75 ? 'fa-battery-full' :
        batteryLevel > 50 ? 'fa-battery-three-quarters' :
          batteryLevel > 25 ? 'fa-battery-half' : 'fa-battery-quarter';
      document.getElementById('driver-battery').innerHTML =
        `<i class="fas ${batteryIcon}"></i> ${batteryLevel}%`;

      this.prevPosition = { lat: latitude, lng: longitude };
    },

    onPositionError(error) {
      const messages = {
        1: 'GPS permission denied. Please enable location access.',
        2: 'GPS unavailable. Check your device settings.',
        3: 'GPS request timed out. Trying again...',
      };
      Toast.warning(messages[error.code] || 'GPS error occurred');
    },

    updateUIForTracking(tracking) {
      document.getElementById('start-tracking-btn').disabled = tracking;
      document.getElementById('stop-tracking-btn').disabled = !tracking;
      document.getElementById('share-location-btn').disabled = !tracking;

      // Update status indicator
      const statusEl = document.getElementById('tracking-status');
      if (statusEl) {
        statusEl.innerHTML = tracking
          ? `<span class="dot live"></span> <span>Live Tracking</span>`
          : `<span class="dot offline"></span> <span>Not Tracking</span>`;
      }
    },

    shareLocation() {
      const driver = Storage.getDriver(this.session.routeId);
      if (!driver || !driver.lat) {
        Toast.warning('No location data available');
        return;
      }

      const shareUrl = `${window.location.origin}${window.location.pathname}#student`;
      const shareText = `GTU-ITR Bus Tracking - ${this.session.busNumber}\nDriver: ${this.session.driverName}\nRoute: ${this.route.name}\nLocation: https://maps.google.com/?q=${driver.lat},${driver.lng}\n\nTrack live at: ${shareUrl}`;

      if (navigator.share) {
        navigator.share({ title: 'Bus Location', text: shareText }).catch(() => { });
      } else {
        navigator.clipboard.writeText(shareText).then(() => {
          Toast.success('Location link copied to clipboard!');
        }).catch(() => {
          Toast.info(`Share this: ${shareUrl}`);
        });
      }
    },

    triggerEmergency() {
      Toast.warning('EMERGENCY alert sent to college administration!');
      Storage.addNotification(`EMERGENCY from ${this.session.driverName} (${this.session.busNumber})`, 'warning');

      // Show emergency modal
      const modal = document.createElement('div');
      modal.style.cssText = `
        position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex;
        align-items:center; justify-content:center; z-index:10000;
        animation:fadeIn 0.3s ease;
      `;
      modal.innerHTML = `
        <div style="
          background:var(--bg-card); border-radius:16px; padding:32px; max-width:400px;
          text-align:center; box-shadow:0 20px 60px rgba(0,0,0,0.3);
          border:2px solid var(--danger);
        ">
          <div style="font-size:3rem; color:var(--danger); margin-bottom:12px">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h2 style="font-size:1.3rem; margin-bottom:8px">Emergency Alert Sent</h2>
          <p style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:20px">
            College administration has been notified. Help is on the way.
          </p>
          <button id="emergency-close-btn" class="btn btn-danger">Close</button>
        </div>
      `;
      document.body.appendChild(modal);
      document.getElementById('emergency-close-btn')?.addEventListener('click', () => modal.remove());

      // Play alert sound (visual only)
      Toast.error('🚨 EMERGENCY ACTIVATED');
    },

    destroy() {
      if (this.watchId !== null) {
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }
      this.initialized = false;
      this.isTracking = false;
    },
  };

  // =============================================
  // 11. ADMIN DASHBOARD
  // =============================================
  const AdminPage = {
    mapId: 'admin-map',
    initialized: false,
    interval: null,
    simProgress: {},

    init() {
      if (this.initialized) return;

      this.initialized = true;

      // Generate bus cards
      this.generateBusCards();

      // Create map
      setTimeout(() => {
        const map = MapManager.create(this.mapId, {
          center: CONFIG.defaultCenter,
          zoom: 9,
          controlsPosition: 'top-right',
        });

        map.on('load', () => {
          // Draw all routes
          ROUTES.forEach(route => {
            MapManager.drawRoute(this.mapId, `route-${route.id}`, route.coords, route.color);
          });

          // Add college marker
          MapManager.addCollegeMarker(this.mapId, 'college', CONFIG.collegeCoords);

          // Start polling
          this.startPolling();
        });
      }, 300);
    },

    generateBusCards() {
      const container = document.getElementById('admin-buses');
      if (!container) return;

      container.innerHTML = ROUTES.map(route => `
        <div class="admin-bus-card route-${route.id}" data-route="${route.id}">
          <div class="admin-bus-header">
            <h4>${route.busNumber}</h4>
            <span class="admin-bus-status" id="admin-status-${route.id}">Simulated</span>
          </div>
          <div class="admin-bus-body">
            <div class="admin-bus-row">
              <span class="label">Driver</span>
              <span class="value" id="admin-driver-${route.id}">${route.driverName}</span>
            </div>
            <div class="admin-bus-row">
              <span class="label">Route</span>
              <span class="value" id="admin-route-${route.id}">${route.name}</span>
            </div>
            <div class="admin-bus-row">
              <span class="label">Speed</span>
              <span class="value" id="admin-speed-${route.id}">0 km/h</span>
            </div>
            <div class="admin-bus-row">
              <span class="label">ETA</span>
              <span class="value" id="admin-eta-${route.id}">--</span>
            </div>
            <div class="admin-bus-row">
              <span class="label">Battery</span>
              <span class="value" id="admin-battery-${route.id}">--</span>
            </div>
            <div class="admin-bus-row">
              <span class="label">Internet</span>
              <span class="value" id="admin-internet-${route.id}">--</span>
            </div>
          </div>
        </div>
      `).join('');
    },

    getSimulatedPosition(routeId) {
      const route = ROUTES.find(r => r.id === parseInt(routeId));
      if (!route) return null;

      if (!this.simProgress[routeId]) this.simProgress[routeId] = Math.random();
      this.simProgress[routeId] += 0.001 + Math.random() * 0.002;
      if (this.simProgress[routeId] > 1) this.simProgress[routeId] = 0;

      const progress = this.simProgress[routeId];
      const totalSegments = route.coords.length - 1;
      const segProgress = progress * totalSegments;
      const segIndex = Math.min(Math.floor(segProgress), totalSegments - 1);
      const segFraction = segProgress - segIndex;

      const start = route.coords[segIndex];
      const end = route.coords[segIndex + 1];

      return {
        lng: start[0] + (end[0] - start[0]) * segFraction,
        lat: start[1] + (end[1] - start[1]) * segFraction,
        speed: 30 + Math.random() * 30,
      };
    },

    startPolling() {
      if (this.interval) clearInterval(this.interval);

      this.interval = setInterval(() => {
        this.updateAllBuses();
      }, CONFIG.updateInterval);
    },

    updateAllBuses() {
      const drivers = Storage.getAllDrivers();

      ROUTES.forEach(route => {
        const driver = drivers[route.id];
        let position;
        let isActive = false;

        if (driver && driver.online && driver.lat && driver.lng) {
          position = { lat: driver.lat, lng: driver.lng, speed: driver.speed };
          isActive = true;
        } else {
          position = this.getSimulatedPosition(route.id);
        }

        if (!position) return;

        const coords = [position.lng, position.lat];
        const markerId = `admin-bus-${route.id}`;

        // Update or create marker
        if (!MapManager.markers[this.mapId]?.[markerId]) {
          MapManager.addBusMarker(
            this.mapId,
            markerId,
            coords,
            route.color,
            `${route.busNumber}`,
            {
              bouncing: true,
              popupHtml: `
                <div style="font-weight:600">${route.busNumber}</div>
                <div style="font-size:0.8rem;color:#64748b">Driver: ${route.driverName}</div>
                <div style="font-size:0.8rem;color:#64748b">Route: ${route.name}</div>
                <div style="font-size:0.8rem;color:#64748b">Speed: ${Math.round(position.speed)} km/h</div>
                <div style="font-size:0.8rem;color:#64748b">Last: ${Utils.formatTime(driver?.timestamp)}</div>
                <div style="font-size:0.8rem;color:${isActive ? '#22C55E' : '#F59E0B'}">
                  Status: ${isActive ? 'Live' : 'Simulated'}
                </div>
              `
            }
          );
        } else {
          MapManager.updateMarkerPosition(this.mapId, markerId, coords);
        }

        // Update bus card
        const statusEl = document.getElementById(`admin-status-${route.id}`);
        if (statusEl) {
          statusEl.textContent = isActive ? 'Live' : 'Simulated';
          statusEl.className = `admin-bus-status ${isActive ? 'active' : 'inactive'}`;
        }

        const speedEl = document.getElementById(`admin-speed-${route.id}`);
        if (speedEl) speedEl.textContent = `${Math.round(position.speed)} km/h`;

        const destCoords = route.coords[route.coords.length - 1];
        const dist = Utils.haversineDist(position.lat, position.lng, destCoords[1], destCoords[0]);
        const eta = Utils.estimateETA(dist, position.speed);

        const etaEl = document.getElementById(`admin-eta-${route.id}`);
        if (etaEl) etaEl.textContent = eta;

        // Battery (mock)
        const batteryLevel = 50 + Math.floor(Math.random() * 45);
        const batteryIcon = batteryLevel > 75 ? 'fa-battery-full' :
          batteryLevel > 50 ? 'fa-battery-three-quarters' :
            batteryLevel > 25 ? 'fa-battery-half' : 'fa-battery-quarter';
        const batteryEl = document.getElementById(`admin-battery-${route.id}`);
        if (batteryEl) batteryEl.innerHTML = `<i class="fas ${batteryIcon}"></i> ${batteryLevel}%`;

        // Internet (mock)
        const internetEl = document.getElementById(`admin-internet-${route.id}`);
        if (internetEl) {
          const connected = Math.random() > 0.1;
          internetEl.innerHTML = connected
            ? '<span style="color:var(--success)">Connected</span>'
            : '<span style="color:var(--danger)">Disconnected</span>';
        }

        const driverEl = document.getElementById(`admin-driver-${route.id}`);
        if (driverEl) driverEl.textContent = route.driverName;
      });
    },

    destroy() {
      if (this.interval) clearInterval(this.interval);
      this.initialized = false;
    },
  };

  // =============================================
  // 12. DARK MODE & THEME
  // =============================================
  const ThemeManager = {
    init() {
      const savedTheme = Storage.getTheme();
      this.setTheme(savedTheme);

      document.getElementById('theme-toggle')?.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        this.setTheme(next);
        Storage.saveTheme(next);
      });
    },

    setTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      const icon = document.querySelector('#theme-toggle i');
      if (icon) {
        icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      }

      // Update map styles if maps are loaded
      // (MapLibre handles this via the style URL in the map creation)
    },
  };

  // =============================================
  // 13. LIVE CLOCK & WEATHER
  // =============================================
  const LiveClock = {
    init() {
      this.update();
      setInterval(() => this.update(), 1000);
    },

    update() {
      const display = document.getElementById('clock-display');
      if (display) display.textContent = Utils.getCurrentTime();
    },
  };

  // =============================================
  // 14. ONLINE/OFFLINE INDICATOR
  // =============================================
  const Connectivity = {
    init() {
      this.updateStatus();
      window.addEventListener('online', () => this.updateStatus());
      window.addEventListener('offline', () => this.updateStatus());
    },

    updateStatus() {
      const indicator = document.getElementById('online-indicator');
      if (!indicator) return;

      const isOnline = navigator.onLine;
      indicator.innerHTML = `
        <span class="dot ${isOnline ? 'online' : 'offline'}"></span>
        ${isOnline ? 'Online' : 'Offline'}
      `;

      if (!isOnline) {
        Toast.warning('You are offline. Some features may be limited.');
      }
    },
  };

  // =============================================
  // 15. NOTIFICATION HANDLER
  // =============================================
  const NotificationHandler = {
    init() {
      this.panel = document.getElementById('notif-panel');
      this.body = document.getElementById('notif-panel-body');
      this.btn = document.getElementById('notification-btn');
      this.markReadBtn = document.getElementById('notif-mark-read');
      this.clearAllBtn = document.getElementById('notif-clear-all');

      this.btn?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePanel();
      });

      document.addEventListener('click', (e) => {
        if (this.panel?.classList.contains('open') && !e.target.closest('.notification-wrapper')) {
          this.closePanel();
        }
      });

      this.markReadBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        Storage.markNotifRead();
        this.render();
        Toast.success('All marked as read');
      });

      this.clearAllBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        Storage.clearAllNotifs();
        this.render();
        Toast.info('Notifications cleared');
      });

      Storage.updateNotifBadge();
    },

    togglePanel() {
      if (this.panel?.classList.contains('open')) {
        this.closePanel();
      } else {
        this.openPanel();
      }
    },

    openPanel() {
      this.panel?.classList.add('open');
      Storage.markNotifRead();
      this.render();
    },

    closePanel() {
      this.panel?.classList.remove('open');
    },

    render() {
      if (!this.body) return;
      const data = Storage.getAll();
      const notifs = data.notifications;

      if (notifs.length === 0) {
        this.body.innerHTML = `
          <div class="notif-empty">
            <i class="fas fa-bell-slash"></i>
            <p>No notifications yet</p>
          </div>
        `;
        return;
      }

      const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };

      this.body.innerHTML = notifs.map(n => `
        <div class="notif-item${n.read ? '' : ' unread'}">
          <div class="notif-icon ${n.type || 'info'}">
            <i class="fas ${icons[n.type] || icons.info}"></i>
          </div>
          <div class="notif-content">
            <div class="notif-msg">${n.message}</div>
            <div class="notif-time"><i class="far fa-clock"></i> ${this.timeAgo(n.timestamp)}</div>
          </div>
          ${n.read ? '' : '<div class="notif-unread-dot"></div>'}
        </div>
      `).join('');
    },

    timeAgo(timestamp) {
      if (!timestamp) return '';
      const now = Date.now();
      const diff = now - new Date(timestamp).getTime();
      const seconds = Math.floor(diff / 1000);
      if (seconds < 60) return 'just now';
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `${days}d ago`;
    },
  };

  // =============================================
  // 16. ANIMATED COUNTERS
  // =============================================
  const Counters = {
    init() {
      const counters = document.querySelectorAll('.stat-number[data-target]');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const target = parseInt(entry.target.dataset.target);
            Utils.animateCounter(entry.target, target, 1500);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      counters.forEach(c => observer.observe(c));
    },
  };

  // =============================================
  // 17. LOADING SCREEN
  // =============================================
  const LoadingScreen = {
    init() {
      window.addEventListener('load', () => {
        setTimeout(() => {
          document.getElementById('loading-screen')?.classList.add('hidden');
        }, 1500);
      });

      // Fallback: hide after 3 seconds if load event already fired
      if (document.readyState === 'complete') {
        setTimeout(() => {
          document.getElementById('loading-screen')?.classList.add('hidden');
        }, 1500);
      }
    },
  };

  // =============================================
  // 18. INITIALIZATION
  // =============================================
  document.addEventListener('DOMContentLoaded', () => {
    // Initialize core services
    LoadingScreen.init();
    ThemeManager.init();
    LiveClock.init();
    Connectivity.init();
    NotificationHandler.init();

    // Initialize navigation
    Navigation.init();

    // Initialize login
    DriverLogin.init();

    // Initialize counters
    Counters.init();

    // Initialize student page (default)
    StudentPage.init();

    // Handle back/forward cache
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        // Page was restored from bfcache, reinitialize
        if (Navigation.currentPage === 'student') StudentPage.init();
        if (Navigation.currentPage === 'driver-dashboard') DriverDashboard.init();
        if (Navigation.currentPage === 'admin') AdminPage.init();
      }
    });

    // Log initialization
    console.log('%c GTU-ITR Bus Tracking System v1.0 ',
      'background:#2563EB;color:#fff;padding:4px 8px;border-radius:4px;font-weight:bold');
    console.log('%c Map Engine: MapLibre GL JS (powered by MapCN) ',
      'background:#1E293B;color:#fff;padding:2px 6px;border-radius:3px;font-size:0.8rem');
    console.log(`%c Routes Loaded: ${ROUTES.length} `,
      'background:#22C55E;color:#fff;padding:2px 6px;border-radius:3px;font-size:0.8rem');
  });

})();

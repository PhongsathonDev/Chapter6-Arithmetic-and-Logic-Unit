/**
 * Chapter 6: ALU - Activity & Real-time Presence Engine
 * จัดการสถานะการออนไลน์ (Live Presence) และบันทึกสถิติเพื่อนำส่งสู่ศูนย์กลาง Portal-Hub
 * ทำงานเงียบสนิท ไม่รบกวนหน้าเว็บ และทนทานต่อการบล็อกของ Ad Blocker และ Privacy Shields
 */
(function () {
  'use strict';

  // ค้นหาพารามิเตอร์ของ script tag ตัวเอง
  const currentScript = document.currentScript || (function () {
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      const src = scripts[i].src || '';
      if (src.includes('activity.js') || src.includes('tracker.js') || src.includes('hub-pulse.js')) {
        return scripts[i];
      }
    }
    return scripts[scripts.length - 1];
  })();

  const customSiteId = currentScript ? currentScript.getAttribute('data-site') : null;
  const customSiteTitle = currentScript ? currentScript.getAttribute('data-title') : null;

  // Firebase Realtime Database Config
  const DEFAULT_FIREBASE_CONFIG = {
    apiKey: "AIzaSyDXlcEZtNZ10qCImyGA9VseWevwXpulIaE",
    authDomain: "tct36-752e1.firebaseapp.com",
    databaseURL: "https://tct36-752e1-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "tct36-752e1",
    storageBucket: "tct36-752e1.firebasestorage.app",
    messagingSenderId: "477608031840",
    appId: "1:477608031840:web:043cb5608deb1520d9b505",
    measurementId: "G-YX6TCVM5KG"
  };

  // Helper โหลด Script แบบ Promise ปลอดภัยจาก Deadlock
  function loadScript(src) {
    return new Promise((resolve) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        return resolve();
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => resolve();
      document.head.appendChild(s);
    });
  }

  // Safe Storage Access (ทนทานต่อ file://, Private Mode, และการบล็อก Storage)
  let _memorySessionId = null;
  let _memoryVisitorId = null;
  const _memoryStore = {};

  function safeGetItem(type, key) {
    try {
      const storage = type === 'session' ? window.sessionStorage : window.localStorage;
      return storage ? storage.getItem(key) : _memoryStore[key] || null;
    } catch (e) {
      return _memoryStore[key] || null;
    }
  }

  function safeSetItem(type, key, value) {
    try {
      const storage = type === 'session' ? window.sessionStorage : window.localStorage;
      if (storage) {
        storage.setItem(key, value);
        return;
      }
    } catch (e) {}
    _memoryStore[key] = String(value);
  }

  function getSessionId() {
    let sid = safeGetItem('session', 'hub_sess_id') || safeGetItem('session', 'va_session_id') || _memorySessionId;
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
      safeSetItem('session', 'hub_sess_id', sid);
      _memorySessionId = sid;
    }
    return sid;
  }

  function getVisitorId() {
    let vid = safeGetItem('local', 'hub_vis_id') || safeGetItem('local', 'va_visitor_id') || _memoryVisitorId;
    if (!vid) {
      vid = 'vis_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
      safeSetItem('local', 'hub_vis_id', vid);
      _memoryVisitorId = vid;
    }
    return vid;
  }

  function getDateKey(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // ==========================================
  // ตรวจจับระบบปฏิบัติการ, เบราว์เซอร์, และช่องทาง
  // ==========================================
  function detectClientTech() {
    const ua = navigator.userAgent || '';

    // Device
    const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
    const device = isMobile ? 'mobile' : 'desktop';

    // OS
    let os = 'Unknown OS';
    if (/Windows/i.test(ua)) os = 'Windows';
    else if (/Android/i.test(ua)) os = 'Android';
    else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
    else if (/Mac OS X/i.test(ua)) os = 'macOS';
    else if (/Linux/i.test(ua)) os = 'Linux';
    else if (/CrOS/i.test(ua)) os = 'ChromeOS';

    // Browser
    let browser = 'Unknown Browser';
    if (/Line/i.test(ua)) browser = 'Line App';
    else if (/FBAN|FBAV/i.test(ua)) browser = 'Facebook App';
    else if (/Edg/i.test(ua)) browser = 'Edge';
    else if (/Chrome/i.test(ua)) browser = 'Chrome';
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
    else if (/Firefox/i.test(ua)) browser = 'Firefox';
    else if (/Opera|OPR/i.test(ua)) browser = 'Opera';

    // Screen
    const screenRes = `${window.screen.width}x${window.screen.height}`;

    // Referrer Category
    let refCategory = 'Direct / บุ๊กมาร์กหรือพิมพ์เอง';
    const ref = document.referrer;
    if (ref) {
      try {
        const host = new URL(ref).hostname.toLowerCase();
        if (host.includes('google')) refCategory = 'Google Search';
        else if (host.includes('facebook') || host.includes('fb.me')) refCategory = 'Facebook';
        else if (host.includes('line.me') || host.includes('line-apps')) refCategory = 'Line';
        else if (host.includes('twitter') || host.includes('t.co') || host.includes('x.com')) refCategory = 'Twitter / X';
        else if (host.includes('github.io')) refCategory = 'Portal Hub / GitHub Pages';
        else refCategory = host;
      } catch (e) {
        refCategory = ref;
      }
    }

    return { device, os, browser, screenRes, refCategory };
  }

  // ==========================================
  // ติดตามการเลื่อนอ่าน (Scroll Depth) และเวลา (Time on Page)
  // ==========================================
  let maxScrollDepth = 0;
  const startTime = Date.now();

  function trackScroll() {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (docH <= 0) {
      maxScrollDepth = 100;
      return;
    }
    const currentScroll = Math.min(100, Math.round((window.scrollY / docH) * 100));
    if (currentScroll > maxScrollDepth) {
      maxScrollDepth = currentScroll;
    }
  }

  window.addEventListener('scroll', trackScroll, { passive: true });

  // ==========================================
  // เริ่มต้น Firebase App และการบันทึกสถานะ
  // ==========================================
  function ensureFirebaseApp() {
    const cfg = (window.PORTAL_CONFIG && window.PORTAL_CONFIG.firebase) ||
                (window.ANALYTICS_CONFIG && window.ANALYTICS_CONFIG.firebase) ||
                DEFAULT_FIREBASE_CONFIG;
    if (!window.firebase || !cfg) return null;

    let fbApp;
    const appName = 'Chapter6ActivityApp';
    const existingApps = window.firebase.apps || [];
    fbApp = existingApps.find((a) => a.name === appName) || existingApps.find((a) => a.name === '[DEFAULT]');

    if (!fbApp) {
      fbApp = window.firebase.initializeApp(cfg, appName);
    }

    const db = fbApp.database();
    return db;
  }

  async function initActivityEngine() {
    try {
      const siteId = customSiteId || 'chapter6-alu';
      const siteTitle = customSiteTitle || document.title || 'CS 3106 บทที่ 6: หน่วยคำนวณและตรรกะ (ALU)';

      // โหลด Firebase SDKs (ถ้ายังไม่มีในหน้าเว็บ)
      if (!window.firebase) {
        await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
      }
      if (!window.firebase || !window.firebase.database) {
        await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js');
      }

      // รอจนกว่า firebase.database พร้อม (ไม่เกิน 2 วินาที)
      let waitTimes = 0;
      while ((!window.firebase || !window.firebase.database) && waitTimes < 20) {
        await new Promise((r) => setTimeout(r, 100));
        waitTimes++;
      }

      const db = ensureFirebaseApp();
      if (!db) return;

      const tech = detectClientTech();

      // บันทึกข้อมูล Site
      db.ref(`analytics/sites/${siteId}`).update({
        id: siteId,
        title: siteTitle,
        lastSeen: Date.now(),
        origin: location.origin || 'unknown',
        path: location.pathname || '/'
      }).catch(() => {});

      // ตรวจจับ Real-time Presence ทันที
      setupPresence(db, siteId, siteTitle, tech);

      // บันทึกสถิติการเปิดหน้าเว็บ
      recordPageView(db, siteId, siteTitle, tech);

    } catch (err) {
      // ทำงานแบบเงียบสนิท
    }
  }

  function setupPresence(db, siteId, siteTitle, tech) {
    const sessionId = getSessionId();
    const visitorId = getVisitorId();
    const presenceRef = db.ref(`analytics/presence/${siteId}/${sessionId}`);
    const connectedRef = db.ref('.info/connected');

    const presenceData = {
      sessionId: sessionId,
      visitorId: visitorId,
      joinedAt: Date.now(),
      lastSeen: Date.now(),
      page: location.pathname || '/',
      title: siteTitle,
      device: tech.device,
      os: tech.os,
      browser: tech.browser,
      screen: tech.screenRes,
      currentScroll: maxScrollDepth
    };

    // ส่งสถานะ Presence ทันทีไม่ต้องรอ connected handshake
    presenceRef.set(presenceData).catch(() => {});
    presenceRef.onDisconnect().remove();

    connectedRef.on('value', (snap) => {
      if (snap.val() === true) {
        presenceRef.onDisconnect().remove();
        presenceRef.set(presenceData).catch(() => {});
      }
    });

    // Heartbeat ทุก 30 วินาที พร้อมอัปเดต Scroll Depth
    const heartbeatTimer = setInterval(() => {
      trackScroll();
      presenceRef.update({
        lastSeen: Date.now(),
        currentScroll: maxScrollDepth
      }).catch(() => {});
    }, 30000);

    window.addEventListener('beforeunload', () => {
      clearInterval(heartbeatTimer);
      presenceRef.remove().catch(() => {});
    });
  }

  function recordPageView(db, siteId, siteTitle, tech) {
    const today = getDateKey();
    const hour = String(new Date().getHours()).padStart(2, '0');

    const dailyVisitorKey = `hub_seen_${siteId}_${today}`;
    const isNewToday = !safeGetItem('local', dailyVisitorKey) && !safeGetItem('local', `va_seen_${siteId}_${today}`);
    if (isNewToday) {
      safeSetItem('local', dailyVisitorKey, '1');
    }

    const dayStatsRef = db.ref(`analytics/stats/${siteId}/${today}`);
    // ยอดวิวรวมและรายชั่วโมง
    dayStatsRef.child('views').transaction((c) => (c || 0) + 1).catch(() => {});
    dayStatsRef.child(`hourly/${hour}`).transaction((c) => (c || 0) + 1).catch(() => {});
    
    // ข้อมูลเชิงลึก: อุปกรณ์, OS, เบราว์เซอร์, แหล่งที่มา, ขนาดจอ
    dayStatsRef.child(`devices/${tech.device}`).transaction((c) => (c || 0) + 1).catch(() => {});
    dayStatsRef.child(`os/${tech.os}`).transaction((c) => (c || 0) + 1).catch(() => {});
    dayStatsRef.child(`browsers/${tech.browser}`).transaction((c) => (c || 0) + 1).catch(() => {});
    dayStatsRef.child(`screens/${tech.screenRes}`).transaction((c) => (c || 0) + 1).catch(() => {});
    
    const safeRefKey = tech.refCategory.replace(/[\.\#\$\[\]\/]/g, '_');
    dayStatsRef.child(`referrers/${safeRefKey}`).transaction((c) => (c || 0) + 1).catch(() => {});

    // นับ Unique คนไม่ซ้ำของวันนี้
    if (isNewToday) {
      dayStatsRef.child('uniques').transaction((c) => (c || 0) + 1).catch(() => {});
    }

    // สถิติสะสมตลอดกาล
    const totalRef = db.ref(`analytics/totals/${siteId}`);
    totalRef.child('views').transaction((c) => (c || 0) + 1).catch(() => {});
    if (isNewToday) {
      totalRef.child('uniques').transaction((c) => (c || 0) + 1).catch(() => {});
    }

    // บันทึกกิจกรรมการเข้าชมล่าสุด
    const logRef = db.ref(`analytics/recent_logs/${siteId}`).push();
    logRef.set({
      timestamp: Date.now(),
      page: location.pathname,
      title: siteTitle,
      referrer: tech.refCategory,
      device: tech.device,
      os: tech.os,
      browser: tech.browser,
      screen: tech.screenRes,
      duration: 1,
      scrollDepth: maxScrollDepth,
      sessionId: getSessionId()
    }).catch(() => {});

    // เมื่อผู้ใช้ออกจากหน้าเว็บ ให้อัปเดต Duration และ Scroll Depth สุดท้าย
    window.addEventListener('beforeunload', () => {
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      trackScroll();
      logRef.update({
        duration: durationSeconds,
        scrollDepth: maxScrollDepth
      }).catch(() => {});
    });
  }

  // เริ่มต้นทำงาน
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initActivityEngine);
  } else {
    initActivityEngine();
  }
})();

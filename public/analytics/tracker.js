/**
 * Web Analytics Reporter (Client Tracker)
 * สคริปต์สำหรับส่งข้อมูลสถิติการเข้าชมและคนออนไลน์สด (Presence) ไปยัง Firebase
 * ข้อมูลจะถูกรวบรวมไปแสดงผลที่หน้า Dashboard กลางของ Portal-Hub
 */
(function () {
  'use strict';

  // คอนฟิก Firebase Realtime Database กลาง
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDXlcEZtNZ10qCImyGA9VseWevwXpulIaE",
    authDomain: "tct36-752e1.firebaseapp.com",
    databaseURL: "https://tct36-752e1-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "tct36-752e1",
    storageBucket: "tct36-752e1.firebasestorage.app",
    messagingSenderId: "477608031840",
    appId: "1:477608031840:web:043cb5608deb1520d9b505"
  };

  const DEFAULT_SITE_ID = "chapter6-alu";
  const DEFAULT_SITE_TITLE = "บทที่ 6: หน่วยคำนวณและตรรกะ (ALU)";

  // ตรวจจับ attributes จาก tag ของตัวเอง
  const currentScript = document.currentScript || (function () {
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      if (scripts[i].src && scripts[i].src.includes('tracker.js')) {
        return scripts[i];
      }
    }
    return scripts[scripts.length - 1];
  })();

  const siteId = (currentScript && currentScript.getAttribute('data-site')) || DEFAULT_SITE_ID;
  const siteTitle = (currentScript && currentScript.getAttribute('data-title')) || DEFAULT_SITE_TITLE;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        if (existing.getAttribute('data-loaded') === 'true') return resolve();
        existing.addEventListener('load', () => resolve());
        existing.addEventListener('error', (err) => reject(err));
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = () => {
        s.setAttribute('data-loaded', 'true');
        resolve();
      };
      s.onerror = (err) => reject(err);
      document.head.appendChild(s);
    });
  }

  function getSessionId() {
    let sid = sessionStorage.getItem('va_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now();
      sessionStorage.setItem('va_session_id', sid);
    }
    return sid;
  }

  function getVisitorId() {
    let vid = localStorage.getItem('va_visitor_id');
    if (!vid) {
      vid = 'vis_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
      localStorage.setItem('va_visitor_id', vid);
    }
    return vid;
  }

  function getDateKey(d = new Date()) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  async function startTracking() {
    try {
      // โหลด Firebase Compat SDK
      if (!window.firebase) {
        await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
      }
      if (!window.firebase?.database) {
        await loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js');
      }

      let fbApp;
      const appName = 'WebAnalyticsTrackerApp';
      const existingApps = window.firebase.apps || [];
      fbApp = existingApps.find((a) => a.name === appName) || existingApps.find((a) => a.name === '[DEFAULT]');

      if (!fbApp) {
        fbApp = window.firebase.initializeApp(FIREBASE_CONFIG, appName);
      }

      const db = fbApp.database();

      // ลงทะเบียนเว็บเข้าสู่สารบัญกลาง
      db.ref(`analytics/sites/${siteId}`).update({
        id: siteId,
        title: siteTitle,
        lastSeen: Date.now(),
        origin: location.origin,
        path: location.pathname
      }).catch(() => {});

      // 1. ระบบ Real-time Presence (คนกำลังดูอยู่กี่คน)
      setupPresence(db, siteId, siteTitle);

      // 2. ระบบบันทึกสถิติการเปิดหน้า (Views, Uniques, Hourly, Devices)
      recordPageView(db, siteId);

    } catch (err) {
      // ทำงานแบบ silent ไม่ให้รบกวนหน้าเว็บหลัก
      console.warn('[Analytics Tracker] Notice:', err.message);
    }
  }

  function setupPresence(db, sId, sTitle) {
    const sessionId = getSessionId();
    const visitorId = getVisitorId();
    const presenceRef = db.ref(`analytics/presence/${sId}/${sessionId}`);
    const connectedRef = db.ref('.info/connected');

    connectedRef.on('value', (snap) => {
      if (snap.val() === true) {
        // เมื่อปิดแท็บหรือหลุดเน็ต Firebase จะลบ node นี้ทิ้งทันที
        presenceRef.onDisconnect().remove();

        presenceRef.set({
          sessionId: sessionId,
          visitorId: visitorId,
          joinedAt: Date.now(),
          lastSeen: Date.now(),
          page: location.pathname,
          title: sTitle,
          device: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
        }).catch(() => {});
      }
    });

    // ส่ง Heartbeat อัปเดตสถานะทุก 60 วินาที
    const heartbeatTimer = setInterval(() => {
      presenceRef.update({ lastSeen: Date.now() }).catch(() => {});
    }, 60000);

    window.addEventListener('beforeunload', () => {
      clearInterval(heartbeatTimer);
      presenceRef.remove().catch(() => {});
    });
  }

  function recordPageView(db, sId) {
    const today = getDateKey();
    const hour = String(new Date().getHours()).padStart(2, '0');
    const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);
    const device = isMobile ? 'mobile' : 'desktop';

    const dailyVisitorKey = `va_seen_${sId}_${today}`;
    const isNewToday = !localStorage.getItem(dailyVisitorKey);
    if (isNewToday) {
      localStorage.setItem(dailyVisitorKey, '1');
    }

    const dayStatsRef = db.ref(`analytics/stats/${sId}/${today}`);
    dayStatsRef.child('views').transaction((c) => (c || 0) + 1).catch(() => {});
    dayStatsRef.child(`hourly/${hour}`).transaction((c) => (c || 0) + 1).catch(() => {});
    dayStatsRef.child(`devices/${device}`).transaction((c) => (c || 0) + 1).catch(() => {});

    if (isNewToday) {
      dayStatsRef.child('uniques').transaction((c) => (c || 0) + 1).catch(() => {});
    }

    const totalRef = db.ref(`analytics/totals/${sId}`);
    totalRef.child('views').transaction((c) => (c || 0) + 1).catch(() => {});
    if (isNewToday) {
      totalRef.child('uniques').transaction((c) => (c || 0) + 1).catch(() => {});
    }

    const logRef = db.ref(`analytics/recent_logs/${sId}`).push();
    logRef.set({
      timestamp: Date.now(),
      page: location.pathname,
      referrer: document.referrer ? new URL(document.referrer).hostname : 'Direct',
      device: device,
      screen: `${window.innerWidth}x${window.innerHeight}`
    }).catch(() => {});
  }

  // เริ่มทำงานทันที
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startTracking);
  } else {
    startTracking();
  }
})();

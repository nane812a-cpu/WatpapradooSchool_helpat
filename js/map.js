/* ============================================================
   map.js — Interactive map: zoom, drag, search, building panel
   ============================================================ */

(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────
  let scale = 1;
  let originX = 0;
  let originY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;
  const MIN_SCALE = 0.3;
  const MAX_SCALE = 4;

  let activeBuilding = null;
  let activeFloor = null;
  let searchTimeout = null;

  // ── DOM refs ───────────────────────────────────────────────
  const mapArea      = document.getElementById('mapArea');
  const viewport     = document.getElementById('mapViewport');
  const infoPanel    = document.getElementById('infoPanel');
  const panelClose   = document.getElementById('panelClose');
  const sidebar      = document.getElementById('mapSidebar');
  const sidebarToggle= document.getElementById('sidebarToggle');
  const searchInput  = document.getElementById('searchInput');
  const searchResults= document.getElementById('searchResults');
  const sidebarBody  = document.getElementById('sidebarBody');
  const zoomLevelEl  = document.getElementById('zoomLevel');

  // ── Apply transform ────────────────────────────────────────
  function applyTransform() {
    viewport.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
    if (zoomLevelEl) zoomLevelEl.textContent = Math.round(scale * 100) + '%';
  }

  function clampOrigin() {
    // Allow some padding beyond map bounds
    const rect = mapArea.getBoundingClientRect();
    const vw = viewport.offsetWidth * scale;
    const vh = viewport.offsetHeight * scale;
    const pad = 120;
    originX = Math.min(pad, Math.max(-(vw - rect.width + pad), originX));
    originY = Math.min(pad, Math.max(-(vh - rect.height + pad), originY));
  }

  // ── Zoom ───────────────────────────────────────────────────
  function zoomAt(cx, cy, delta) {
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * delta));
    const ratio = newScale / scale;
    originX = cx - ratio * (cx - originX);
    originY = cy - ratio * (cy - originY);
    scale = newScale;
    clampOrigin();
    applyTransform();
  }

  function zoomIn()  { const r = mapArea.getBoundingClientRect(); zoomAt(r.width / 2, r.height / 2, 1.2); }
  function zoomOut() { const r = mapArea.getBoundingClientRect(); zoomAt(r.width / 2, r.height / 2, 1 / 1.2); }
  function resetView() {
    scale = 1; originX = 40; originY = 40;
    applyTransform();
  }

  // Wheel zoom
  mapArea.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = mapArea.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const delta = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    zoomAt(cx, cy, delta);
  }, { passive: false });

  // Pinch-to-zoom (touch)
  let lastPinchDist = null;
  mapArea.addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (lastPinchDist !== null) {
        const rect = mapArea.getBoundingClientRect();
        const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
        zoomAt(cx, cy, dist / lastPinchDist);
      }
      lastPinchDist = dist;
    }
  }, { passive: false });

  mapArea.addEventListener('touchend', () => { lastPinchDist = null; });

  // ── Drag ───────────────────────────────────────────────────
  mapArea.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    isDragging = true;
    startX = e.clientX - originX;
    startY = e.clientY - originY;
    lastX = e.clientX;
    lastY = e.clientY;
    mapArea.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    originX = e.clientX - startX;
    originY = e.clientY - startY;
    clampOrigin();
    applyTransform();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    mapArea.style.cursor = 'grab';
  });

  // Touch drag
  let touchStartX = 0;
  let touchStartY = 0;
  mapArea.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX - originX;
      touchStartY = e.touches[0].clientY - originY;
    }
  });

  mapArea.addEventListener('touchmove', e => {
    if (e.touches.length === 1) {
      originX = e.touches[0].clientX - touchStartX;
      originY = e.touches[0].clientY - touchStartY;
      clampOrigin();
      applyTransform();
    }
  }, { passive: false });

  // ── Zoom buttons ───────────────────────────────────────────
  document.getElementById('btnZoomIn') .addEventListener('click', zoomIn);
  document.getElementById('btnZoomOut').addEventListener('click', zoomOut);
  document.getElementById('btnReset')  .addEventListener('click', resetView);

  // ── Sidebar toggle ─────────────────────────────────────────
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    sidebarToggle.textContent = sidebar.classList.contains('collapsed') ? '▶' : '◀';
  });

  // ── Build sidebar ──────────────────────────────────────────
  function buildSidebar() {
    sidebarBody.innerHTML = '';
    BUILDINGS.forEach(b => {
      const totalRooms = b.floors.reduce((s, f) => s + f.rooms.length, 0);
      const wrap = document.createElement('div');
      wrap.className = 'sidebar-building';
      wrap.dataset.bid = b.id;

      const header = document.createElement('div');
      header.className = 'sidebar-building-header';
      header.innerHTML = `
        <span class="b-dot" style="background:${b.color}"></span>
        <span>${b.name}</span>
        <span class="b-arrow">▶</span>
      `;
      header.addEventListener('click', () => {
        const floors = wrap.querySelector('.sidebar-floors');
        const isOpen = floors.classList.contains('open');
        // Close all others
        document.querySelectorAll('.sidebar-floors.open').forEach(f => f.classList.remove('open'));
        document.querySelectorAll('.sidebar-building-header.expanded').forEach(h => h.classList.remove('expanded'));
        if (!isOpen) {
          floors.classList.add('open');
          header.classList.add('expanded');
        }
        if (!isOpen) openBuildingPanel(b.id);
      });

      const floorsEl = document.createElement('div');
      floorsEl.className = 'sidebar-floors';

      b.floors.forEach(f => {
        const fi = document.createElement('div');
        fi.className = 'sidebar-floor';
        fi.innerHTML = `<span>🏢</span><span>${f.label}</span><span class="floor-room-count">${f.rooms.length}</span>`;
        fi.addEventListener('click', e => {
          e.stopPropagation();
          openBuildingPanel(b.id, f.floor);
        });
        floorsEl.appendChild(fi);
      });

      wrap.appendChild(header);
      wrap.appendChild(floorsEl);
      sidebarBody.appendChild(wrap);
    });
  }

  // ── Open info panel ────────────────────────────────────────
  function openBuildingPanel(buildingId, floorNum) {
    const b = BUILDINGS.find(x => x.id === buildingId);
    if (!b) return;
    activeBuilding = b;

    // Header color
    const header = infoPanel.querySelector('.panel-header');
    header.style.background = b.color;
    header.querySelector('h3').textContent = b.name;
    header.querySelector('p').textContent  = b.nameEn;

    // Floor tabs
    const tabsEl    = infoPanel.querySelector('.floor-tabs');
    const bodyEl    = infoPanel.querySelector('.panel-body-inner');
    tabsEl.innerHTML = '';
    bodyEl.innerHTML = '';

    b.floors.forEach((f, i) => {
      const tab = document.createElement('button');
      tab.className = 'floor-tab';
      tab.textContent = f.label;
      tab.dataset.floor = f.floor;
      tab.addEventListener('click', () => switchFloorTab(f.floor));
      tabsEl.appendChild(tab);

      const content = document.createElement('div');
      content.className = 'floor-content';
      content.dataset.floor = f.floor;

      const list = document.createElement('div');
      list.className = 'room-list';

      f.rooms.forEach(r => {
        const typeInfo = ROOM_TYPES[r.type] || ROOM_TYPES.other;
        const item = document.createElement('div');
        item.className = 'room-item';
        item.id = 'room-' + r.id;
        item.innerHTML = `
          <span class="room-type-dot" style="background:${typeInfo.color}"></span>
          ${r.number ? `<span class="room-number">${r.number}</span>` : ''}
          <span class="room-name">${r.name || '—'}</span>
          <span class="room-type-label">${typeInfo.icon}</span>
        `;
        list.appendChild(item);
      });

      content.appendChild(list);
      bodyEl.appendChild(content);
    });

    infoPanel.classList.add('open');

    // Activate floor tab
    const targetFloor = floorNum || b.floors[0].floor;
    switchFloorTab(targetFloor);

    // Highlight building hotspot
    document.querySelectorAll('.building-hotspot').forEach(h => {
      h.style.outline = h.dataset.bid === buildingId ? '3px solid #fff' : 'none';
      h.style.zIndex  = h.dataset.bid === buildingId ? '60' : '';
    });

    // Highlight sidebar
    document.querySelectorAll('.sidebar-building-header').forEach(h => {
      h.classList.toggle('active', h.closest('.sidebar-building').dataset.bid === buildingId);
    });
  }

  function switchFloorTab(floorNum) {
    activeFloor = floorNum;
    infoPanel.querySelectorAll('.floor-tab').forEach(t => {
      t.classList.toggle('active', parseInt(t.dataset.floor) === floorNum);
    });
    infoPanel.querySelectorAll('.floor-content').forEach(c => {
      c.classList.toggle('active', parseInt(c.dataset.floor) === floorNum);
    });
    // Scroll to top of active content
    const active = infoPanel.querySelector('.floor-content.active');
    if (active) active.scrollTop = 0;
  }

  panelClose.addEventListener('click', () => {
    infoPanel.classList.remove('open');
    document.querySelectorAll('.building-hotspot').forEach(h => {
      h.style.outline = '';
      h.style.zIndex  = '';
    });
    document.querySelectorAll('.sidebar-building-header').forEach(h => h.classList.remove('active'));
    activeBuilding = null;
  });

  // ── Search ─────────────────────────────────────────────────
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(runSearch, 200);
  });

  function runSearch() {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      searchResults.classList.remove('show');
      searchResults.innerHTML = '';
      sidebarBody.style.display = '';
      return;
    }

    sidebarBody.style.display = 'none';
    searchResults.classList.add('show');
    searchResults.innerHTML = '';

    const hits = [];
    BUILDINGS.forEach(b => {
      b.floors.forEach(f => {
        f.rooms.forEach(r => {
          const nameMatch   = (r.name   || '').toLowerCase().includes(q);
          const numMatch    = (r.number || '').toLowerCase().includes(q);
          const buildMatch  = b.name.toLowerCase().includes(q) || b.nameEn.toLowerCase().includes(q);
          if (nameMatch || numMatch || buildMatch) {
            hits.push({ b, f, r });
          }
        });
      });
    });

    if (hits.length === 0) {
      searchResults.innerHTML = '<div class="no-results">🔍 ไม่พบผลการค้นหา</div>';
      return;
    }

    hits.slice(0, 40).forEach(({ b, f, r }) => {
      const typeInfo = ROOM_TYPES[r.type] || ROOM_TYPES.other;
      const el = document.createElement('div');
      el.className = 'search-result-item';
      el.innerHTML = `
        <div class="sri-room">${typeInfo.icon} ${r.number ? r.number + ' — ' : ''}${r.name || '(ไม่มีชื่อ)'}</div>
        <div class="sri-floor">${f.label}</div>
        <div class="sri-building" style="color:${b.color}">${b.name}</div>
      `;
      el.addEventListener('click', () => {
        openBuildingPanel(b.id, f.floor);
        // Scroll to and highlight the specific room
        setTimeout(() => {
          const roomEl = document.getElementById('room-' + r.id);
          if (roomEl) {
            roomEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            roomEl.classList.add('highlight');
            setTimeout(() => roomEl.classList.remove('highlight'), 2000);
          }
        }, 350);
      });
      searchResults.appendChild(el);
    });

    if (hits.length > 40) {
      const more = document.createElement('div');
      more.className = 'no-results';
      more.textContent = `... และอีก ${hits.length - 40} รายการ`;
      searchResults.appendChild(more);
    }
  }

  // Clear search when clicking outside
  document.addEventListener('click', e => {
    if (!e.target.closest('.sidebar-header')) {
      if (searchInput.value === '') {
        searchResults.classList.remove('show');
        sidebarBody.style.display = '';
      }
    }
  });

  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      searchResults.classList.remove('show');
      searchResults.innerHTML = '';
      sidebarBody.style.display = '';
    }
  });

  // ── Build hotspots on map ──────────────────────────────────
  // Positions are relative percentages of the school-map.png container
  // Adjust these values after loading your actual school-map.png
  const HOTSPOT_POSITIONS = {
    b1:     { left: '16%', top: '20%', width: '110px', height: '450px' },
    b2:     { left: '18%', top: '87%', width: '850px', height: '99px' },
    b3:     { left: '6%', top: '20%', width: '110px', height: '450px' },
    b4:     { left: '2%', top: '0.1%', width: '260px', height: '96px' },
    b6:     { left: '0.5%', top: '87%', width: '110px', height: '90px'  },
    bmulti: { left: '29%', top: '0.1%', width: '510px', height: '98px' },
    bpe:    { left: '70%', top: '0.1%', width: '230px', height: '98px' },
  };

  function buildHotspots() {
    const container = document.getElementById('mapImageContainer');
    if (!container) return;

    BUILDINGS.forEach(b => {
      const pos = HOTSPOT_POSITIONS[b.id];
      if (!pos) return;

      const totalRooms = b.floors.reduce((s, f) => s + f.rooms.length, 0);
      const hs = document.createElement('div');
      hs.className = 'building-hotspot';
      hs.dataset.bid = b.id;
      hs.style.cssText = `
        left: ${pos.left}; top: ${pos.top};
        width: ${pos.width}; height: ${pos.height};
        background: ${b.color}cc;
        border-color: ${b.color};
      `;
      hs.innerHTML = `
        <div class="hs-name">${b.name}</div>
        <div class="hs-en">${b.nameEn}</div>
        <div class="hs-floors">${b.floors.length} ชั้น · ${totalRooms} ห้อง</div>
      `;
      hs.addEventListener('click', e => {
        e.stopPropagation();
        openBuildingPanel(b.id);
        // Open sidebar building accordion
        const sidebarBuilding = sidebarBody.querySelector(`[data-bid="${b.id}"] .sidebar-building-header`);
        if (sidebarBuilding) sidebarBuilding.click();
      });

      container.appendChild(hs);
    });
  }

  // ── Init ───────────────────────────────────────────────────
  function init() {
    buildSidebar();
    buildHotspots();
    resetView();

    // Start slightly centred
    const mapImg = document.getElementById('mapImg');
    if (mapImg) {
      mapImg.addEventListener('load', () => {
        const areaRect = mapArea.getBoundingClientRect();
        const imgW = mapImg.naturalWidth  || mapImg.offsetWidth;
        const imgH = mapImg.naturalHeight || mapImg.offsetHeight;
        // Fit to area
        const fitScale = Math.min(
          (areaRect.width  - 80) / imgW,
          (areaRect.height - 80) / imgH,
          1
        );
        scale   = fitScale;
        originX = (areaRect.width  - imgW * fitScale) / 2;
        originY = (areaRect.height - imgH * fitScale) / 2;
        applyTransform();
      });

      // If already loaded
      if (mapImg.complete) mapImg.dispatchEvent(new Event('load'));
    }
  }

  init();

})();

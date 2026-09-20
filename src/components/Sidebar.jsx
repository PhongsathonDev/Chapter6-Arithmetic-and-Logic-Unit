import React from 'react';
import { BookMarked, ChevronRight, ListFilter } from 'lucide-react';

export default function Sidebar({ modules, activeModuleId, setActiveModuleId, searchQuery }) {
  const filteredModules = modules.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className="sidebar-nav">
      {/* Desktop Title Header */}
      <div className="sidebar-title desktop-only">
        <span>สารบัญเนื้อหา ({modules.length} โมดูลสรุป)</span>
        <BookMarked size={16} />
      </div>

      {/* Mobile-Only Navigation Container */}
      <div className="mobile-topic-nav-container">
        <div className="mobile-topic-header">
          <ListFilter size={18} color="#4f46e5" />
          <span className="mobile-topic-header-title">เลือกสารบัญเนื้อหา ({modules.length} โมดูล):</span>
        </div>

        {/* Full Title Dropdown */}
        <select
          className="mobile-topic-select"
          value={activeModuleId}
          onChange={(e) => setActiveModuleId(e.target.value)}
        >
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.moduleNumber} - {m.title}
            </option>
          ))}
        </select>

        {/* Quick Number Badges Grid */}
        <div className="mobile-badges-grid">
          {modules.map((m) => (
            <button
              key={m.id}
              className={`mobile-badge-btn ${activeModuleId === m.id ? 'active' : ''}`}
              onClick={() => setActiveModuleId(m.id)}
              title={m.title}
            >
              {m.moduleNumber}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Topic List */}
      <ul className="topic-list desktop-topic-list">
        {filteredModules.map((m) => (
          <li key={m.id}>
            <button
              className={`topic-item-btn ${activeModuleId === m.id ? 'active' : ''}`}
              onClick={() => setActiveModuleId(m.id)}
            >
              <span className="topic-num">{m.moduleNumber}</span>
              <span className="topic-text">
                {m.title}
              </span>
              <ChevronRight size={14} opacity={0.6} />
            </button>
          </li>
        ))}

        {filteredModules.length === 0 && (
          <li style={{ padding: '16px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>
            ไม่พบหัวข้อที่ค้นหา "{searchQuery}"
          </li>
        )}
      </ul>
    </aside>
  );
}

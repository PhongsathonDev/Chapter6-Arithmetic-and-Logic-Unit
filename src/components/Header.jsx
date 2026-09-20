import React from 'react';
import { BookOpen, Cpu, Calculator, HelpCircle, Layers, Search, Sliders, Divide } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, searchQuery, setSearchQuery, totalQuestions }) {
  return (
    <header className="main-header">
      <div className="header-top">
        <div className="brand-logo">
          <div className="logo-badge">CS 3106</div>
          <div className="title-group">
            <h1>บทที่ 6: หน่วยคำนวณทางคณิตศาสตร์และตรรกะ (ALU)</h1>
            <p className="desktop-only">Computer System Organization | เอกสารทบทวนและแบบทดสอบตามวัตถุประสงค์เชิงพฤติกรรม</p>
          </div>
        </div>

        <div className="header-search">
          <div className="search-input-wrapper">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="ค้นหาเนื้อหา (เช่น Booth, Restoring, IEEE 754, Adder)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ fontSize: '12px', color: '#94a3b8', background: '#cbd5e1', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="nav-tabs-wrapper">
        <nav className="nav-tabs">
          <button
            className={`tab-btn ${activeTab === 'summary' ? 'active' : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            <BookOpen size={18} />
            <span>สรุปเนื้อหา <small className="tab-sub">7 โมดูล</small></span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
            onClick={() => setActiveTab('quiz')}
          >
            <HelpCircle size={18} />
            <span>คลังข้อสอบ</span>
            <span className="tab-badge" style={{ background: '#dcfce7', color: '#15803d' }}>{totalQuestions} ข้อ</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'booth-sim' ? 'active' : ''}`}
            onClick={() => setActiveTab('booth-sim')}
          >
            <Cpu size={18} />
            <span>จำลองการคูณ Booth's</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'division-sim' ? 'active' : ''}`}
            onClick={() => setActiveTab('division-sim')}
          >
            <Divide size={18} />
            <span>จำลองการหาร Restoring</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'ieee-converter' ? 'active' : ''}`}
            onClick={() => setActiveTab('ieee-converter')}
          >
            <Sliders size={18} />
            <span>แปลง IEEE 754</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'flashcards' ? 'active' : ''}`}
            onClick={() => setActiveTab('flashcards')}
          >
            <Layers size={18} />
            <span>Flashcards</span>
          </button>
        </nav>
      </div>
    </header>
  );
}

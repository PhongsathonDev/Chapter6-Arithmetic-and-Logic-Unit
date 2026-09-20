import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SummaryViewer from './components/SummaryViewer';
import BoothsSimulator from './components/BoothsSimulator';
import RestoringDivisionSimulator from './components/RestoringDivisionSimulator';
import Ieee754Converter from './components/Ieee754Converter';
import QuizView from './components/QuizView';
import FlashcardsView from './components/FlashcardsView';

import { courseModules } from './data/courseData';
import { allQuizQuestions, quizQuestionsSet1, quizQuestionsSet2, quizSets } from './data/quizData';

export default function App() {
  const [activeTab, setActiveTab] = useState('summary');
  const [activeModuleId, setActiveModuleId] = useState(courseModules[0].id);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="app-container">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalQuestions={allQuizQuestions.length}
      />

      <div className="layout-body">
        {activeTab === 'summary' && (
          <div className="summary-layout">
            <Sidebar
              modules={courseModules}
              activeModuleId={activeModuleId}
              setActiveModuleId={setActiveModuleId}
              searchQuery={searchQuery}
            />
            <SummaryViewer
              modules={courseModules}
              activeModuleId={activeModuleId}
              searchQuery={searchQuery}
            />
          </div>
        )}

        {activeTab === 'booth-sim' && <BoothsSimulator />}

        {activeTab === 'division-sim' && <RestoringDivisionSimulator />}

        {activeTab === 'ieee-converter' && <Ieee754Converter />}

        {activeTab === 'flashcards' && <FlashcardsView />}

        {activeTab === 'quiz' && (
          <QuizView
            allQuestions={allQuizQuestions}
            set1Questions={quizQuestionsSet1}
            set2Questions={quizQuestionsSet2}
            quizSets={quizSets}
          />
        )}
      </div>

      <footer className="main-footer">
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <p style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px' }}>
            วิชา 020413106 โครงสร้างระบบคอมพิวเตอร์ (Computer System Organization)
          </p>
          <p style={{ marginTop: '6px', color: '#475569', fontSize: '14px' }}>
            บทที่ 6: หน่วยคำนวณทางคณิตศาสตร์และตรรกะ (Arithmetic and Logic Unit - ALU)
          </p>
          <p style={{ fontSize: '12.5px', marginTop: '10px', color: '#94a3b8' }}>
            เอกสารทบทวนสอบและคลังข้อสอบ 68 ข้อ อิงตามวัตถุประสงค์เชิงพฤติกรรม 34 ข้อ | ครบถ้วนตามเอกสารประกอบการสอน 77 หน้า
          </p>
        </div>
      </footer>
    </div>
  );
}

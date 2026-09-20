import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  HelpCircle, CheckCircle2, XCircle, RotateCcw, Award, Filter,
  ArrowRight, BookOpen, Layers, Shuffle, Star, Trash2, RefreshCw, BarChart2
} from 'lucide-react';

export default function QuizView({ allQuestions = [], set1Questions = [], set2Questions = [], quizSets = [], questions }) {
  // Fallback pool
  const pool = useMemo(() => {
    return allQuestions.length > 0 ? allQuestions : (questions || []);
  }, [allQuestions, questions]);

  // Persistent States from LocalStorage
  const [userAnswers, setUserAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem('cpu_quiz_answers_v1');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const saved = localStorage.getItem('cpu_quiz_bookmarks_v1');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const [selectedSet, setSelectedSet] = useState(() => {
    return localStorage.getItem('cpu_quiz_set_v1') || 'all';
  });

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [mode, setMode] = useState('practice'); // 'practice' or 'exam'
  const [isShuffle, setIsShuffle] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0); // Trigger re-shuffle
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('cpu_quiz_answers_v1', JSON.stringify(userAnswers));
    } catch (e) {}
  }, [userAnswers]);

  useEffect(() => {
    try {
      localStorage.setItem('cpu_quiz_bookmarks_v1', JSON.stringify(bookmarks));
    } catch (e) {}
  }, [bookmarks]);

  useEffect(() => {
    try {
      localStorage.setItem('cpu_quiz_set_v1', selectedSet);
    } catch (e) {}
  }, [selectedSet]);

  // Filter pool by question set
  const setFilteredQuestions = useMemo(() => {
    if (selectedSet === 'all') return pool;
    if (selectedSet === '1') {
      return set1Questions.length > 0 ? set1Questions : pool.filter(q => q.setId === 1);
    }
    if (selectedSet === '2') {
      return set2Questions.length > 0 ? set2Questions : pool.filter(q => q.setId === 2);
    }
    return pool;
  }, [selectedSet, pool, set1Questions, set2Questions]);

  // Categories list for active set
  const categories = useMemo(() => {
    const rawCats = [...new Set(setFilteredQuestions.map(q => q.category))];
    return ['All', '⭐ ข้อที่บันทึกไว้ (Starred)', '❌ ข้อที่ตอบผิด (Wrong)', ...rawCats];
  }, [setFilteredQuestions]);

  // Filter by category / stars / wrong
  const baseFilteredQuestions = useMemo(() => {
    if (selectedCategory === 'All') return setFilteredQuestions;
    if (selectedCategory === '⭐ ข้อที่บันทึกไว้ (Starred)') {
      return setFilteredQuestions.filter(q => bookmarks[q.id]);
    }
    if (selectedCategory === '❌ ข้อที่ตอบผิด (Wrong)') {
      return setFilteredQuestions.filter(q => userAnswers[q.id] !== undefined && userAnswers[q.id] !== q.correctIndex);
    }
    return setFilteredQuestions.filter(q => q.category === selectedCategory);
  }, [selectedCategory, setFilteredQuestions, bookmarks, userAnswers]);

  // Shuffle questions if isShuffle is enabled
  const filteredQuestions = useMemo(() => {
    if (!isShuffle) return baseFilteredQuestions;
    const arr = [...baseFilteredQuestions];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseFilteredQuestions, isShuffle, shuffleSeed]);

  const currentQ = filteredQuestions[currentIdx] || filteredQuestions[0];

  const handleSelectOption = (qId, optionIdx) => {
    if (isSubmitted && mode === 'exam') return;
    setUserAnswers(prev => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const toggleBookmark = (qId) => {
    setBookmarks(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  };

  const handleCalculateScore = () => {
    let score = 0;
    filteredQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const handleSubmitExam = () => {
    setIsSubmitted(true);
    const score = handleCalculateScore();
    const percent = Math.round((score / (filteredQuestions.length || 1)) * 100);
    if (percent >= 70) {
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  const handleResetCurrentQuiz = () => {
    setIsSubmitted(false);
    setCurrentIdx(0);
  };

  // Full reset with confirmation
  const handleClearAllProgress = () => {
    if (window.confirm("คุณต้องการล้างประวัติการตอบข้อสอบทั้งหมด และเริ่มทำใหม่ใช่หรือไม่?")) {
      setUserAnswers({});
      setIsSubmitted(false);
      setCurrentIdx(0);
      try {
        localStorage.removeItem('cpu_quiz_answers_v1');
      } catch (e) {}
    }
  };

  const handleToggleShuffle = () => {
    setIsShuffle(prev => !prev);
    setShuffleSeed(prev => prev + 1);
    setCurrentIdx(0);
  };

  const handleReShuffle = () => {
    setShuffleSeed(prev => prev + 1);
    setCurrentIdx(0);
  };

  const handleSetChange = (newSetId) => {
    setSelectedSet(newSetId);
    setSelectedCategory('All');
    handleResetCurrentQuiz();
  };

  const handleCategoryChange = (newCat) => {
    setSelectedCategory(newCat);
    handleResetCurrentQuiz();
  };

  // Statistics calculation
  const setTotalCount = setFilteredQuestions.length;
  const setAnsweredCount = setFilteredQuestions.filter(q => userAnswers[q.id] !== undefined).length;
  const setCorrectCount = setFilteredQuestions.filter(q => userAnswers[q.id] === q.correctIndex).length;
  const setWrongCount = setFilteredQuestions.filter(q => userAnswers[q.id] !== undefined && userAnswers[q.id] !== q.correctIndex).length;

  const currentScore = handleCalculateScore();
  const currentPercentage = Math.round((currentScore / (filteredQuestions.length || 1)) * 100);

  return (
    <div className="quiz-container">
      {/* Question Set Selection Tabs */}
      <div className="quiz-set-card">
        <div className="quiz-set-title">
          <Layers size={18} color="var(--indigo-primary)" />
          <span>เลือกชุดข้อสอบ:</span>
        </div>

        <div className="quiz-set-pills">
          {quizSets && quizSets.length > 0 ? (
            quizSets.map((s) => (
              <button
                key={s.id}
                className={`btn-secondary ${selectedSet === s.id ? 'btn-primary' : ''}`}
                onClick={() => handleSetChange(s.id)}
              >
                {s.id === 'all' ? '📚' : s.id === '1' ? '📝' : '✨'} {s.name}
              </button>
            ))
          ) : (
            <>
              <button
                className={`btn-secondary ${selectedSet === 'all' ? 'btn-primary' : ''}`}
                onClick={() => handleSetChange('all')}
              >
                📚 ทุกชุดข้อสอบ ({pool.length} ข้อ)
              </button>
              <button
                className={`btn-secondary ${selectedSet === '1' ? 'btn-primary' : ''}`}
                onClick={() => handleSetChange('1')}
              >
                📝 ชุดที่ 1: พื้นฐานและหลักการสำคัญ (34 ข้อ)
              </button>
              <button
                className={`btn-secondary ${selectedSet === '2' ? 'btn-primary' : ''}`}
                onClick={() => handleSetChange('2')}
              >
                ✨ ชุดที่ 2: เชิงวิเคราะห์และการคำนวณ (34 ข้อ)
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress & Persistence Overview Bar */}
      <div className="quiz-stats-card">
        <div className="quiz-stats-header">
          <div className="quiz-stats-info">
            <div className="quiz-stats-label">
              <BarChart2 size={16} color="var(--indigo-primary)" />
              <span>ความคืบหน้าภาพรวม (บันทึกอัตโนมัติ):</span>
            </div>
            <div className="quiz-stats-metrics">
              <span className="stat-item">ทำแล้ว: <strong>{setAnsweredCount}/{setTotalCount}</strong></span>
              <span className="stat-item correct">ถูก: <strong>{setCorrectCount}</strong></span>
              <span className="stat-item wrong">ผิด: <strong>{setWrongCount}</strong></span>
              <span className="stat-item remaining">คงเหลือ: <strong>{setTotalCount - setAnsweredCount}</strong></span>
            </div>
          </div>

          <button
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px', color: 'var(--rose-danger)', borderColor: 'var(--rose-danger)' }}
            onClick={handleClearAllProgress}
            title="ล้างประวัติคำตอบทั้งหมดที่บันทึกไว้ในระบบ"
          >
            <Trash2 size={14} /> ล้างประวัติ (Reset)
          </button>
        </div>

        {/* Progress Fill Bar */}
        <div className="quiz-progress-bar-bg">
          <div className="quiz-progress-fill-correct" style={{ width: `${(setCorrectCount / (setTotalCount || 1)) * 100}%` }} title="ตอบถูก" />
          <div className="quiz-progress-fill-wrong" style={{ width: `${(setWrongCount / (setTotalCount || 1)) * 100}%` }} title="ตอบผิด" />
        </div>
      </div>

      {/* Mode, Random & Category Toolbar */}
      <div className="content-card quiz-toolbar" style={{ marginBottom: '20px' }}>
        <div className="quiz-toolbar-inner">
          
          {/* Mode & Random buttons */}
          <div className="quiz-mode-buttons">
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-muted)' }}>โหมด:</span>
            <button
              className={`btn-secondary ${mode === 'practice' ? 'btn-primary' : ''}`}
              onClick={() => { setMode('practice'); setIsSubmitted(false); }}
            >
              Practice (เฉลยทันที)
            </button>
            <button
              className={`btn-secondary ${mode === 'exam' ? 'btn-primary' : ''}`}
              onClick={() => { setMode('exam'); setIsSubmitted(false); }}
            >
              Exam (ลองสอบเก็บคะแนน)
            </button>

            {/* Random Shuffle Toggle */}
            <button
              className={`btn-secondary ${isShuffle ? 'btn-primary' : ''}`}
              onClick={handleToggleShuffle}
              title="เปิด/ปิด การสุ่มลำดับข้อสอบ"
            >
              <Shuffle size={14} /> {isShuffle ? 'โหมดสุ่ม: เปิด' : 'สุ่มลำดับข้อสอบ'}
            </button>

            {isShuffle && (
              <button
                className="btn-secondary"
                onClick={handleReShuffle}
                title="สุ่มลำดับคำถามใหม่อีกครั้ง"
              >
                <RefreshCw size={14} /> สุ่มใหม่
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-strong)',
                fontSize: '13px',
                fontFamily: 'inherit',
                width: '100%',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)'
              }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? `ทุกหมวดวิชา (${setFilteredQuestions.length} ข้อ)` : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Exam Result Banner if submitted */}
      {isSubmitted && (
        <div
          className="content-card"
          style={{
            background: currentPercentage >= 70 ? 'var(--emerald-light)' : 'var(--rose-light)',
            border: `2px solid ${currentPercentage >= 70 ? 'var(--emerald-success)' : 'var(--rose-danger)'}`,
            textAlign: 'center',
            padding: '32px',
            marginBottom: '20px'
          }}
        >
          <Award size={48} color={currentPercentage >= 70 ? 'var(--emerald-success)' : 'var(--rose-danger)'} style={{ margin: '0 auto 12px auto' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: currentPercentage >= 70 ? '#065f46' : '#9f1239' }}>
            {currentPercentage >= 70 ? '🎉 ยินดีด้วย! คุณผ่านการทดสอบ' : '💪 พยายามอีกนิด! ลองทบทวนเพิ่มเติม'}
          </h2>
          <p style={{ fontSize: '18px', margin: '8px 0 16px 0', color: 'var(--text-primary)' }}>
            คุณทำได้ <strong>{currentScore}</strong> จากทั้งหมด <strong>{filteredQuestions.length}</strong> ข้อ ({currentPercentage}%)
          </p>
          <button className="btn-primary" onClick={handleResetCurrentQuiz}>
            <RotateCcw size={16} /> ทำข้อสอบใหม่อีกครั้ง
          </button>
        </div>
      )}

      {/* Main Question Card */}
      {currentQ ? (
        <div className="quiz-card">
          <div className="quiz-meta">
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="quiz-num">ข้อที่ {currentIdx + 1} / {filteredQuestions.length}</span>
              <span className={`badge-set ${currentQ.setId === 2 ? 'badge-set-2' : 'badge-set-1'}`}>
                {currentQ.setId === 2 ? 'ชุดที่ 2' : 'ชุดที่ 1'}
              </span>
              <span className="page-ref-badge">{currentQ.category}</span>
            </div>

            {/* Bookmark Star Button */}
            <button
              className={`bookmark-btn ${bookmarks[currentQ.id] ? 'active' : ''}`}
              onClick={() => toggleBookmark(currentQ.id)}
              title="ติดดาวข้อนี้ไว้ทบทวนภายหลัง"
            >
              <Star size={15} fill={bookmarks[currentQ.id] ? 'var(--amber-warning)' : 'none'} color={bookmarks[currentQ.id] ? 'var(--amber-warning)' : 'var(--text-muted)'} />
              {bookmarks[currentQ.id] ? 'บันทึกแล้ว' : 'ติดดาวข้อนี้'}
            </button>
          </div>

          <h3 className="quiz-question">
            {currentQ.question}
          </h3>

          <div className="quiz-options">
            {currentQ.options.map((opt, optIdx) => {
              const isSelected = userAnswers[currentQ.id] === optIdx;
              const isCorrect = optIdx === currentQ.correctIndex;
              
              let btnClass = "option-btn";
              if (mode === 'practice' && userAnswers[currentQ.id] !== undefined) {
                if (isCorrect) btnClass += " correct";
                else if (isSelected && !isCorrect) btnClass += " wrong";
              } else if (mode === 'exam') {
                if (isSelected) btnClass += " selected";
                if (isSubmitted) {
                  if (isCorrect) btnClass += " correct";
                  else if (isSelected && !isCorrect) btnClass += " wrong";
                }
              }

              return (
                <button
                  key={optIdx}
                  className={btnClass}
                  onClick={() => handleSelectOption(currentQ.id, optIdx)}
                >
                  <span className="option-key">
                    {['ก', 'ข', 'ค', 'ง'][optIdx]}
                  </span>
                  <span>{opt.replace(/^[ก-ง]\.\s*/, '')}</span>
                </button>
              );
            })}
          </div>

          {/* Practice mode instant explanation */}
          {mode === 'practice' && userAnswers[currentQ.id] !== undefined && (
            <div className="explanation-box">
              <div className="explanation-title">
                <BookOpen size={16} />
                เฉลยและคำอธิบายละเอียด:
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Navigation between questions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', paddingTop: '16px', borderTop: '1px solid var(--border-light)' }}>
            <button
              className="btn-secondary"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              style={{ opacity: currentIdx === 0 ? 0.5 : 1 }}
            >
              ข้อก่อนหน้า
            </button>

            {currentIdx < filteredQuestions.length - 1 ? (
              <button
                className="btn-primary"
                onClick={() => setCurrentIdx(prev => Math.min(filteredQuestions.length - 1, prev + 1))}
              >
                ข้อถัดไป <ArrowRight size={16} />
              </button>
            ) : (
              mode === 'exam' && !isSubmitted && (
                <button className="btn-primary" style={{ background: 'var(--emerald-success)' }} onClick={handleSubmitExam}>
                  ส่งกระดาษคำตอบตรวจคะแนน
                </button>
              )
            )}
          </div>
        </div>
      ) : (
        <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)' }}>ไม่พบข้อสอบในหมวดวิชาที่เลือก</p>
        </div>
      )}

      {/* Questions Palette Jump - Harmonized with theme */}
      <div className="palette-container">
        <div className="palette-header">
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-secondary)', margin: 0 }}>
            แถบเลือกข้อสอบอย่างรวดเร็ว (Quick Jump Palette):
          </h4>
          <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
            <span style={{ color: 'var(--emerald-success)', fontWeight: '600' }}>🟢 ถูก</span>
            <span style={{ color: 'var(--rose-danger)', fontWeight: '600' }}>🔴 ผิด</span>
            <span style={{ color: 'var(--text-muted)' }}>⚪ ยังไม่ได้ทำ</span>
          </div>
        </div>

        <div className="palette-grid">
          {filteredQuestions.map((q, idx) => {
            const answered = userAnswers[q.id] !== undefined;
            const isCorrect = userAnswers[q.id] === q.correctIndex;
            const isCurrent = idx === currentIdx;
            const isStarred = bookmarks[q.id];

            let classNames = "palette-btn";
            if (mode === 'practice' || isSubmitted) {
              if (answered) {
                if (isCorrect) classNames += " correct";
                else classNames += " wrong";
              }
            } else if (mode === 'exam' && answered) {
              classNames += " answered-exam";
            }

            if (isCurrent) classNames += " active";

            return (
              <button
                key={q.id}
                className={classNames}
                onClick={() => setCurrentIdx(idx)}
                title={`ข้อที่ ${idx + 1} ${answered ? (isCorrect ? '(ตอบถูก)' : '(ตอบผิด)') : '(ยังไม่ได้ตอบ)'}`}
              >
                {idx + 1}
                {isStarred && (
                  <span style={{ position: 'absolute', top: '-3px', right: '-3px', fontSize: '10px' }}>⭐</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

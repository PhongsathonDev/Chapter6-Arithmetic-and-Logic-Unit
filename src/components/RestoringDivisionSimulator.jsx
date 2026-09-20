import React, { useState, useMemo } from 'react';
import { RotateCcw, ArrowRight, ArrowLeft, Info, Sparkles, ShieldAlert } from 'lucide-react';

export default function RestoringDivisionSimulator() {
  const [dividendVal, setDividendVal] = useState(13);
  const [divisorVal, setDivisorVal] = useState(2);
  const [bitLength, setBitLength] = useState(4);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const toBin = (val, bits) => {
    return (val & ((1 << bits) - 1)).toString(2).padStart(bits, '0');
  };

  // Generate complete Restoring Division simulation steps
  const simulationSteps = useMemo(() => {
    const bits = bitLength;
    const M_val = divisorVal;
    const Q_val = dividendVal;

    // A register has bits + 1 size for sign bit handling (e.g. 5 bits for 4-bit numbers)
    const aBits = bits + 1;
    let A = 0;
    let Q = Q_val & ((1 << bits) - 1);
    let N = bits;

    const steps = [];

    // Step 0: Init
    steps.push({
      stepNum: 0,
      round: 0,
      phase: 'INITIALIZATION',
      action: 'กำหนดค่าเริ่มต้น',
      A_bin: toBin(A, aBits),
      Q_bin: toBin(Q, bits),
      N: N,
      msbA: 0,
      desc: `กำหนดค่าเริ่มต้น: A = ${toBin(A, aBits)} (0), Q = ${toBin(Q, bits)} (${Q_val}), ตัวหาร M = ${toBin(M_val, aBits)} (${M_val}), ตัวนับ N = ${N}`,
      isRestored: false
    });

    for (let r = 1; r <= bits; r++) {
      // 1. Shift Left AQ
      const q_msb = (Q >> (bits - 1)) & 1;
      A = ((A << 1) | q_msb) & ((1 << aBits) - 1);
      Q = (Q << 1) & ((1 << bits) - 1); // Q0 is temporarily 0

      steps.push({
        stepNum: steps.length,
        round: r,
        phase: 'SHIFT_LEFT',
        action: 'Shift Left AQ',
        A_bin: toBin(A, aBits),
        Q_bin: toBin(Q, bits),
        N: N,
        msbA: (A >> (aBits - 1)) & 1,
        desc: `รอบที่ ${r}: เลื่อนบิต AQ ไปทางซ้าย 1 บิต บิตซ้ายสุดของ Q (${q_msb}) ถูกเลื่อนเข้าสู่ A ได้ A = ${toBin(A, aBits)}`,
        isRestored: false
      });

      // 2. Subtract A = A - M
      const a_before_sub = A;
      let a_sub = A - M_val;
      if (a_sub < 0) {
        a_sub = (1 << aBits) + a_sub;
      }
      A = a_sub & ((1 << aBits) - 1);
      const msb = (A >> (aBits - 1)) & 1;

      steps.push({
        stepNum: steps.length,
        round: r,
        phase: 'SUBTRACT',
        action: 'A = A - M',
        A_bin: toBin(A, aBits),
        Q_bin: toBin(Q, bits),
        N: N,
        msbA: msb,
        desc: `รอบที่ ${r}: ทำการลบ A = A - M $\\rightarrow$ ได้ A = ${toBin(A, aBits)} (MSB ของ A คือ ${msb})`,
        isRestored: false
      });

      // 3. Check MSB of A
      if (msb === 1) {
        // Negative -> Restore A and Set Q0 = 0
        A = a_before_sub; // restored
        Q = Q & ~1; // Q0 = 0
        N = N - 1;

        steps.push({
          stepNum: steps.length,
          round: r,
          phase: 'RESTORE',
          action: 'Restore A & Q₀ = 0',
          A_bin: toBin(A, aBits),
          Q_bin: toBin(Q, bits),
          N: N,
          msbA: (A >> (aBits - 1)) & 1,
          desc: `รอบที่ ${r}: เนื่องจาก MSB ของ A เป็น 1 (ผลลัพธ์ติดลบ) $\\rightarrow$ กู้คืนค่า A เดิม (${toBin(A, aBits)}) และกำหนด Q₀ = 0, ลดรอบเหลือ N = ${N}`,
          isRestored: true
        });
      } else {
        // Positive -> Keep A and Set Q0 = 1
        Q = Q | 1; // Q0 = 1
        N = N - 1;

        steps.push({
          stepNum: steps.length,
          round: r,
          phase: 'NO_RESTORE',
          action: 'Keep A & Q₀ = 1',
          A_bin: toBin(A, aBits),
          Q_bin: toBin(Q, bits),
          N: N,
          msbA: (A >> (aBits - 1)) & 1,
          desc: `รอบที่ ${r}: เนื่องจาก MSB ของ A เป็น 0 (ผลลัพธ์เป็นบวก) $\\rightarrow$ ไม่ต้อง Restore คงค่า A ไว้ และกำหนด Q₀ = 1, ลดรอบเหลือ N = ${N}`,
          isRestored: false
        });
      }
    }

    // Final state
    const quotientDec = Q;
    const remainderDec = A;

    steps.push({
      stepNum: steps.length,
      round: bits,
      phase: 'FINAL',
      action: 'สิ้นสุดการหาร (N = 0)',
      A_bin: toBin(A, aBits),
      Q_bin: toBin(Q, bits),
      N: 0,
      msbA: (A >> (aBits - 1)) & 1,
      desc: `คำนวณครบ ${bits} รอบ! สิ้นสุดการทำงาน ได้ ผลหาร (Quotient) ใน Q = ${toBin(Q, bits)} (${quotientDec}) และ เศษเหลือ (Remainder) ใน A = ${toBin(A, aBits)} (${remainderDec})`,
      isRestored: false,
      quotientDec: quotientDec,
      remainderDec: remainderDec
    });

    return steps;
  }, [dividendVal, divisorVal, bitLength]);

  const currentStep = simulationSteps[currentStepIdx] || simulationSteps[0];

  const handleNext = () => {
    if (currentStepIdx < simulationSteps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStepIdx(0);
  };

  const applyPreset = (dividend, divisor, bits) => {
    setBitLength(bits);
    setDividendVal(dividend);
    setDivisorVal(divisor);
    setCurrentStepIdx(0);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Title & Presets */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', color: '#059669', padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
          <Sparkles size={16} /> อัลกอริทึมการหาร ALU
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
          ตัวจำลองการหาร Restoring Division (Interactive Simulator)
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
          จำลองขั้นตอนการหารเลขจำนวนเต็มฐานสอง Shift Left, ทดลองลบ, ตรวจสอบเครื่องหมาย และกู้คืนค่า A
        </p>

        {/* Presets */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', alignSelf: 'center' }}>โจทย์ตัวอย่าง:</span>
          <button className="btn-secondary" style={{ fontSize: '13px', padding: '6px 12px' }} onClick={() => applyPreset(13, 2, 4)}>
            📌 13 ÷ 2 = 6 เศษ 1 (หน้า 67-69)
          </button>
          <button className="btn-secondary" style={{ fontSize: '13px', padding: '6px 12px' }} onClick={() => applyPreset(10, 3, 4)}>
            📌 10 ÷ 3 = 3 เศษ 1 (หน้า 51)
          </button>
          <button className="btn-secondary" style={{ fontSize: '13px', padding: '6px 12px' }} onClick={() => applyPreset(13, 5, 4)}>
            📌 13 ÷ 5 = 2 เศษ 3 (หน้า 47)
          </button>
          <button className="btn-secondary" style={{ fontSize: '13px', padding: '6px 12px' }} onClick={() => applyPreset(11, 3, 4)}>
            📌 11 ÷ 3 = 3 เศษ 2
          </button>
        </div>
      </div>

      {/* Input Parameters Box */}
      <div className="content-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              ตัวตั้ง (Dividend: Q เริ่มต้น)
            </label>
            <input 
              type="number" 
              min={1}
              max={15}
              value={dividendVal} 
              onChange={(e) => { setDividendVal(Math.max(1, parseInt(e.target.value, 10) || 1)); setCurrentStepIdx(0); }}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            />
            <small style={{ color: '#64748b' }}>Binary: {toBin(dividendVal, bitLength)}₂</small>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              ตัวหาร (Divisor: M)
            </label>
            <input 
              type="number" 
              min={1}
              max={15}
              value={divisorVal} 
              onChange={(e) => { setDivisorVal(Math.max(1, parseInt(e.target.value, 10) || 1)); setCurrentStepIdx(0); }}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            />
            <small style={{ color: '#64748b' }}>Binary: {toBin(divisorVal, bitLength)}₂</small>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              ขนาดบิตของตัวตั้ง (n)
            </label>
            <select 
              value={bitLength} 
              onChange={(e) => { setBitLength(parseInt(e.target.value, 10)); setCurrentStepIdx(0); }}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: 'white' }}
            >
              <option value={4}>4 บิต (วน 4 รอบ)</option>
              <option value={5}>5 บิต (วน 5 รอบ)</option>
            </select>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>ผลลัพธ์ทางคณิตศาสตร์</span>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#059669' }}>
              {dividendVal} ÷ {divisorVal} = {Math.floor(dividendVal / divisorVal)} เศษ {dividendVal % divisorVal}
            </div>
          </div>
        </div>
      </div>

      {/* Live Registers Display */}
      <div className="content-card" style={{ padding: '24px', marginBottom: '24px', background: '#ffffff', border: '2px solid #a7f3d0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span className="badge-pill badge-green" style={{ fontSize: '13px' }}>
              สเต็ปที่ {currentStepIdx} / {simulationSteps.length - 1}
            </span>
            <span style={{ marginLeft: '8px', fontWeight: '700', color: '#1e293b' }}>
              {currentStep.action}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" onClick={handlePrev} disabled={currentStepIdx === 0}>
              <ArrowLeft size={16} /> ย้อนกลับ
            </button>
            <button className="btn-primary" style={{ background: '#059669' }} onClick={handleNext} disabled={currentStepIdx === simulationSteps.length - 1}>
              สเต็ปถัดไป <ArrowRight size={16} />
            </button>
            <button className="btn-secondary" onClick={handleReset} title="เริ่มใหม่">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Live Registers Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '14px', margin: '20px 0' }}>
          {/* Register A */}
          <div style={{ background: '#f8fafc', border: `2px solid ${currentStep.isRestored ? '#e11d48' : '#10b981'}`, borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#059669', textTransform: 'uppercase' }}>
              Accumulator (A: เศษ)
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: '#0f172a', margin: '6px 0' }}>
              {currentStep.A_bin}
            </div>
            <span className="badge-pill" style={{ background: currentStep.msbA === 1 ? '#ffe4e6' : '#dcfce7', color: currentStep.msbA === 1 ? '#9f1239' : '#15803d', fontSize: '11px' }}>
              MSB (Sign) = {currentStep.msbA} ({currentStep.msbA === 1 ? 'ติดลบ' : 'บวก/ศูนย์'})
            </span>
          </div>

          {/* Register Q */}
          <div style={{ background: '#f8fafc', border: '2px solid #3b82f6', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#1d4ed8', textTransform: 'uppercase' }}>
              Quotient (Q: ผลหาร)
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: '#0f172a', margin: '6px 0' }}>
              {currentStep.Q_bin}
            </div>
            <span style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: '700' }}>
              บิตผลหาร Q₀ = {currentStep.Q_bin.slice(-1)}
            </span>
          </div>

          {/* Register M */}
          <div style={{ background: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
              Divisor (M: ตัวหาร)
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: '#334155', margin: '6px 0' }}>
              {toBin(divisorVal, bitLength + 1)}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>ค่าตัวหารคงที่ = {divisorVal}</span>
          </div>

          {/* Counter N */}
          <div style={{ background: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>
              รอบคงเหลือ (N)
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: '#334155', margin: '6px 0' }}>
              {currentStep.N}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>{currentStep.N === 0 ? 'เสร็จสิ้นกระบวนการ' : `เหลืออีก ${currentStep.N} รอบ`}</span>
          </div>
        </div>

        {/* Callout explanation */}
        <div className={`callout ${currentStep.isRestored ? 'callout-warning' : 'callout-info'}`} style={{ marginTop: '16px' }}>
          <div className="callout-header">
            {currentStep.isRestored ? <ShieldAlert size={18} /> : <Info size={18} />}
            <span className="callout-title">
              {currentStep.isRestored ? 'แจ้งเตือน: เกิดการกู้คืนค่า (RESTORE A)' : 'คำอธิบายการประมวลผลสเต็ปนี้:'}
            </span>
          </div>
          <div className="callout-body" style={{ fontSize: '15px' }}>
            {currentStep.desc}
          </div>
        </div>
      </div>

      {/* Trace History Table */}
      <div className="content-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
          📋 ตารางบันทึกการทำงาน Restoring Division (Trace Table)
        </h3>
        <div className="modern-table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th className="center">รอบ</th>
                <th>ขั้นตอนการกระทำ (Action)</th>
                <th className="center mono">A (Accumulator)</th>
                <th className="center mono">Q (Quotient)</th>
                <th className="center">MSB (Sign)</th>
                <th className="center">สถานะ Restore</th>
                <th className="center">N</th>
              </tr>
            </thead>
            <tbody>
              {simulationSteps.slice(0, currentStepIdx + 1).map((s, idx) => (
                <tr key={idx} style={{ background: idx === currentStepIdx ? '#f0fdf4' : 'transparent', fontWeight: idx === currentStepIdx ? '700' : 'normal' }}>
                  <td className="center">{s.round}</td>
                  <td>{s.action}</td>
                  <td className="center mono" style={{ color: '#059669' }}>{s.A_bin}</td>
                  <td className="center mono" style={{ color: '#2563eb' }}>{s.Q_bin}</td>
                  <td className="center">
                    <span className={`badge-pill ${s.msbA === 1 ? 'badge-rose' : 'badge-green'}`}>
                      {s.msbA}
                    </span>
                  </td>
                  <td className="center">
                    {s.isRestored ? <span className="badge-pill badge-rose">Restore!</span> : <span className="badge-pill badge-blue">ผ่าน</span>}
                  </td>
                  <td className="center">{s.N}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

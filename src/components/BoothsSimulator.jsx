import React, { useState, useMemo } from 'react';
import { RotateCcw, ArrowRight, ArrowLeft, Info, Sparkles } from 'lucide-react';

export default function BoothsSimulator() {
  const [multiplicandVal, setMultiplicandVal] = useState(7);
  const [multiplierVal, setMultiplierVal] = useState(3);
  const [bitLength, setBitLength] = useState(4);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Helper to convert signed integer to n-bit binary string (2's complement)
  const to2sComp = (val, bits) => {
    let num = val;
    if (num < 0) {
      num = (1 << bits) + num;
    }
    num = num & ((1 << bits) - 1);
    return num.toString(2).padStart(bits, '0');
  };

  // Generate complete Booth's algorithm trace steps
  const simulationSteps = useMemo(() => {
    const bits = bitLength;
    const M_val = multiplicandVal;
    const Q_val = multiplierVal;
    const negM_val = -M_val;

    const M_bin = to2sComp(M_val, bits);
    const negM_bin = to2sComp(negM_val, bits);

    let A = 0; // bits length
    let Q = Q_val < 0 ? (1 << bits) + Q_val : Q_val;
    Q = Q & ((1 << bits) - 1);
    let Q_neg1 = 0;
    let N = bits;

    const steps = [];

    // Step 0: Initial state
    steps.push({
      stepNum: 0,
      round: 0,
      phase: 'INITIALIZATION',
      action: 'กำหนดค่าเริ่มต้น',
      A_bin: to2sComp(A, bits),
      Q_bin: to2sComp(Q, bits),
      Q_neg1: Q_neg1,
      N: N,
      pair: `${to2sComp(Q, bits).slice(-1)}${Q_neg1}`,
      desc: `กำหนด A = ${to2sComp(A, bits)}, Q = ${to2sComp(Q, bits)} (${Q_val}), Q₋₁ = 0, M = ${M_bin} (${M_val}), -M = ${negM_bin} (${negM_val}), N = ${N}`,
      arithAction: 'Init'
    });

    for (let r = 1; r <= bits; r++) {
      const q0 = Q & 1;
      const pair = `${q0}${Q_neg1}`;

      // Decision
      let arithDesc = '';
      if (pair === '01') {
        A = (A + M_val);
        // mask to bits
        if (A < 0) A = (1 << bits) + (A % (1 << bits));
        A = A & ((1 << bits) - 1);
        arithDesc = `คู่บิต 01: บวก M เข้า A (A = A + M) ได้ A = ${to2sComp(A, bits)}`;
      } else if (pair === '10') {
        A = (A - M_val);
        if (A < 0) A = (1 << bits) + (A % (1 << bits));
        A = A & ((1 << bits) - 1);
        arithDesc = `คู่บิต 10: ลบ M ออกจาก A (A = A - M) ได้ A = ${to2sComp(A, bits)}`;
      } else {
        arithDesc = `คู่บิต ${pair}: ไม่ต้องบวกหรือลบ (No Op)`;
      }

      steps.push({
        stepNum: steps.length,
        round: r,
        phase: 'ARITHMETIC',
        action: pair === '01' ? 'A = A + M' : pair === '10' ? 'A = A - M' : 'No Add/Sub',
        A_bin: to2sComp(A, bits),
        Q_bin: to2sComp(Q, bits),
        Q_neg1: Q_neg1,
        N: N,
        pair: pair,
        desc: `รอบที่ ${r}: ตรวจสอบ Q₀ Q₋₁ = ${pair} → ${arithDesc}`,
        arithAction: pair
      });

      // Arithmetic Shift Right (A, Q, Q_neg1)
      const a_msb = (A >> (bits - 1)) & 1;
      const a_lsb = A & 1;
      const q_lsb = Q & 1;

      Q_neg1 = q_lsb;
      Q = (Q >> 1) | (a_lsb << (bits - 1));
      A = (A >> 1) | (a_msb << (bits - 1));
      N = N - 1;

      steps.push({
        stepNum: steps.length,
        round: r,
        phase: 'SHIFT',
        action: 'Arithmetic Shift Right (ASR)',
        A_bin: to2sComp(A, bits),
        Q_bin: to2sComp(Q, bits),
        Q_neg1: Q_neg1,
        N: N,
        pair: `${to2sComp(Q, bits).slice(-1)}${Q_neg1}`,
        desc: `ทำ ASR: เลื่อนขวาโดยคงบิต MSB ของ A (${a_msb}) ไว้, Q₋₁ รับบิต ${q_lsb} จาก Q₀, ลดตัวนับเหลือ N = ${N}`,
        arithAction: 'ASR'
      });
    }

    // Final result conversion
    const combinedBin = to2sComp(A, bits) + to2sComp(Q, bits);
    const totalBits = bits * 2;
    let finalDec = parseInt(combinedBin, 2);
    if (combinedBin[0] === '1') {
      finalDec = finalDec - (1 << totalBits);
    }

    steps.push({
      stepNum: steps.length,
      round: bits,
      phase: 'FINAL',
      action: 'สิ้นสุดการคำนวณ (N = 0)',
      A_bin: to2sComp(A, bits),
      Q_bin: to2sComp(Q, bits),
      Q_neg1: Q_neg1,
      N: 0,
      pair: '--',
      desc: `คำนวณครบ ${bits} รอบ! ผลลัพธ์สุดท้ายอยู่ในรีจิสเตอร์ AQ = ${combinedBin}₂ หรือเท่ากับ ${finalDec}₁₀ (${M_val} × ${Q_val} = ${M_val * Q_val})`,
      arithAction: 'Done',
      finalDec: finalDec
    });

    return steps;
  }, [multiplicandVal, multiplierVal, bitLength]);

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

  const applyPreset = (m, q, bits) => {
    setBitLength(bits);
    setMultiplicandVal(m);
    setMultiplierVal(q);
    setCurrentStepIdx(0);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Title & Presets */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#eeefff', color: '#4f46e5', padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
          <Sparkles size={16} /> เครื่องมือจำลองฮาร์ดแวร์ ALU
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
          ตัวจำลองการคูณ Booth's Algorithm (Interactive Simulator)
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
          จำลองขั้นตอนการคูณเลขฐานสองแบบคิดเครื่องหมาย (2's Complement) พร้อมการเลื่อนบิต Arithmetic Shift Right
        </p>

        {/* Presets */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', alignSelf: 'center' }}>โจทย์ตัวอย่าง:</span>
          <button className="btn-secondary" style={{ fontSize: '13px', padding: '6px 12px' }} onClick={() => applyPreset(7, 3, 4)}>
            📌 7 × 3 = 21 (หน้า 32)
          </button>
          <button className="btn-secondary" style={{ fontSize: '13px', padding: '6px 12px' }} onClick={() => applyPreset(-9, 13, 5)}>
            📌 (-9) × 13 = -117 (หน้า 39)
          </button>
          <button className="btn-secondary" style={{ fontSize: '13px', padding: '6px 12px' }} onClick={() => applyPreset(3, -2, 4)}>
            📌 3 × (-2) = -6
          </button>
          <button className="btn-secondary" style={{ fontSize: '13px', padding: '6px 12px' }} onClick={() => applyPreset(-5, -4, 4)}>
            📌 (-5) × (-4) = 20
          </button>
        </div>
      </div>

      {/* Input Parameters Box */}
      <div className="content-card" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              ตัวตั้ง (Multiplicand: M)
            </label>
            <input 
              type="number" 
              value={multiplicandVal} 
              onChange={(e) => { setMultiplicandVal(parseInt(e.target.value, 10) || 0); setCurrentStepIdx(0); }}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            />
            <small style={{ color: '#64748b' }}>2's Comp: {to2sComp(multiplicandVal, bitLength)}₂</small>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              ตัวคูณ (Multiplier: Q)
            </label>
            <input 
              type="number" 
              value={multiplierVal} 
              onChange={(e) => { setMultiplierVal(parseInt(e.target.value, 10) || 0); setCurrentStepIdx(0); }}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            />
            <small style={{ color: '#64748b' }}>2's Comp: {to2sComp(multiplierVal, bitLength)}₂</small>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
              ขนาดบิต (Bit Length: n)
            </label>
            <select 
              value={bitLength} 
              onChange={(e) => { setBitLength(parseInt(e.target.value, 10)); setCurrentStepIdx(0); }}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', background: 'white' }}
            >
              <option value={4}>4 บิต (ช่วง -8 ถึง +7)</option>
              <option value={5}>5 บิต (ช่วง -16 ถึง +15)</option>
              <option value={6}>6 บิต (ช่วง -32 ถึง +31)</option>
            </select>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>ผลคูณเป้าหมาย</span>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#4f46e5' }}>
              {multiplicandVal} × {multiplierVal} = {multiplicandVal * multiplierVal}
            </div>
          </div>
        </div>
      </div>

      {/* Register Live Display Card */}
      <div className="content-card" style={{ padding: '24px', marginBottom: '24px', background: '#ffffff', border: '2px solid #e0e7ff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <span className="badge-pill badge-blue" style={{ fontSize: '13px' }}>
              สเต็ปที่ {currentStepIdx} / {simulationSteps.length - 1}
            </span>
            <span style={{ marginLeft: '8px', fontWeight: '700', color: '#1e293b' }}>
              {currentStep.phase === 'INITIALIZATION' ? '🎬 กำหนดค่าเริ่มต้น' : currentStep.phase === 'ARITHMETIC' ? '⚡ ดำเนินการคณิตศาสตร์' : currentStep.phase === 'SHIFT' ? '➡️ เลื่อนบิตแบบรักษาสัญญาณ (ASR)' : '🏁 สิ้นสุดการคำนวณ'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-secondary" onClick={handlePrev} disabled={currentStepIdx === 0}>
              <ArrowLeft size={16} /> ย้อนกลับ
            </button>
            <button className="btn-primary" onClick={handleNext} disabled={currentStepIdx === simulationSteps.length - 1}>
              สเต็ปถัดไป <ArrowRight size={16} />
            </button>
            <button className="btn-secondary" onClick={handleReset} title="เริ่มใหม่">
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {/* Live Registers Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', margin: '20px 0' }}>
          {/* Register A */}
          <div style={{ background: '#f8fafc', border: '2px solid #6366f1', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase' }}>Accumulator (A)</div>
            <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: '#0f172a', margin: '6px 0' }}>
              {currentStep.A_bin}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>MSB = {currentStep.A_bin[0]}</span>
          </div>

          {/* Register Q */}
          <div style={{ background: '#f8fafc', border: '2px solid #0ea5e9', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#0284c7', textTransform: 'uppercase' }}>Multiplier (Q)</div>
            <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: '#0f172a', margin: '6px 0' }}>
              {currentStep.Q_bin}
            </div>
            <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '600' }}>Q₀ = {currentStep.Q_bin.slice(-1)}</span>
          </div>

          {/* Register Q-1 */}
          <div style={{ background: '#f8fafc', border: '2px solid #f59e0b', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#d97706', textTransform: 'uppercase' }}>Flip-Flop (Q₋₁)</div>
            <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: '#d97706', margin: '6px 0' }}>
              {currentStep.Q_neg1}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>บิตสมมติทางขวา</span>
          </div>

          {/* Inspected Pair Q0, Q-1 */}
          <div style={{ background: '#fef3c7', border: '2px dashed #d97706', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#92400e', textTransform: 'uppercase' }}>คู่บิต (Q₀ Q₋₁)</div>
            <div style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'JetBrains Mono', color: '#b45309', margin: '6px 0' }}>
              {currentStep.pair}
            </div>
            <span className="badge-pill badge-amber" style={{ fontSize: '11px' }}>
              {currentStep.pair === '01' ? 'บวก M (+M)' : currentStep.pair === '10' ? 'ลบ M (-M)' : currentStep.pair === '00' || currentStep.pair === '11' ? 'ไม่บวก/ลบ' : '--'}
            </span>
          </div>

          {/* Counter N */}
          <div style={{ background: '#f8fafc', border: '2px solid #cbd5e1', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>ตัวนับรอบ (N)</div>
            <div style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'JetBrains Mono', color: '#334155', margin: '6px 0' }}>
              {currentStep.N}
            </div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>เหลืออีก {currentStep.N} รอบ</span>
          </div>
        </div>

        {/* Step Explanation Callout */}
        <div className="callout callout-info" style={{ marginTop: '16px' }}>
          <div className="callout-header">
            <Info size={18} />
            <span className="callout-title">คำอธิบายการประมวลผลในสเต็ปนี้:</span>
          </div>
          <div className="callout-body" style={{ fontSize: '15px' }}>
            {currentStep.desc}
          </div>
        </div>
      </div>

      {/* Trace History Table */}
      <div className="content-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
          📋 ตารางบันทึกการทำงานทีละขั้นตอน (Execution Trace Table)
        </h3>
        <div className="modern-table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th className="center">รอบ</th>
                <th>ขั้นตอนการกระทำ (Action)</th>
                <th className="center mono">A (Accumulator)</th>
                <th className="center mono">Q (Multiplier)</th>
                <th className="center mono">Q₋₁</th>
                <th className="center">คู่บิต</th>
                <th className="center">N</th>
              </tr>
            </thead>
            <tbody>
              {simulationSteps.slice(0, currentStepIdx + 1).map((s, idx) => (
                <tr key={idx} style={{ background: idx === currentStepIdx ? '#f0f4ff' : 'transparent', fontWeight: idx === currentStepIdx ? '700' : 'normal' }}>
                  <td className="center">{s.round}</td>
                  <td>{s.action}</td>
                  <td className="center mono" style={{ color: '#4f46e5' }}>{s.A_bin}</td>
                  <td className="center mono" style={{ color: '#0284c7' }}>{s.Q_bin}</td>
                  <td className="center mono" style={{ color: '#d97706' }}>{s.Q_neg1}</td>
                  <td className="center"><span className="badge-pill badge-amber">{s.pair}</span></td>
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

import React, { useState, useMemo } from 'react';
import { Sparkles } from 'lucide-react';

export default function Ieee754Converter() {
  const [inputValue, setInputValue] = useState(5.75);

  const conversion = useMemo(() => {
    const num = parseFloat(inputValue);
    if (isNaN(num)) {
      return null;
    }

    if (num === 0) {
      return {
        num: 0,
        signBit: 0,
        actualExp: 0,
        biasedExp: 0,
        expBin: '00000000',
        mantissaBin: '0'.repeat(23),
        hexStr: '00000000',
        binaryRaw: '0.0',
        normalizedStr: '0.0 × 2⁰',
        steps: ['ค่าตัวเลขเป็น 0 ในระบบ IEEE 754 จะแทนด้วย 0 ทั้งหมด 32 บิต']
      };
    }

    const isNegative = num < 0;
    const signBit = isNegative ? 1 : 0;
    const absVal = Math.abs(num);

    // Integer part
    const intPart = Math.floor(absVal);
    const intBin = intPart.toString(2);

    // Fraction part (up to 30 bits)
    let fracPart = absVal - intPart;
    let fracBin = '';
    let tempFrac = fracPart;
    for (let i = 0; i < 28 && tempFrac > 0; i++) {
      tempFrac *= 2;
      if (tempFrac >= 1) {
        fracBin += '1';
        tempFrac -= 1;
      } else {
        fracBin += '0';
      }
    }
    if (!fracBin) fracBin = '0';

    // Full raw binary
    const fullRawBin = `${intBin}.${fracBin}`;

    // Normalization
    let actualExp = 0;
    let mantissaStr = '';

    if (intPart > 0) {
      actualExp = intBin.length - 1;
      mantissaStr = intBin.slice(1) + fracBin;
    } else {
      // Find first 1 in fraction
      const firstOneIdx = fracBin.indexOf('1');
      if (firstOneIdx !== -1) {
        actualExp = -(firstOneIdx + 1);
        mantissaStr = fracBin.slice(firstOneIdx + 1);
      }
    }

    // Pad or truncate mantissa to 23 bits
    const mantissa23 = mantissaStr.padEnd(23, '0').slice(0, 23);

    // Biased Exponent (Single Precision Bias = 127)
    const biasedExp = actualExp + 127;
    const expBin = (biasedExp & 0xFF).toString(2).padStart(8, '0');

    // 32-bit combined
    const bitString32 = `${signBit}${expBin}${mantissa23}`;

    // Convert to Hex
    let hexStr = '';
    for (let i = 0; i < 32; i += 4) {
      const nibble = bitString32.substring(i, i + 4);
      hexStr += parseInt(nibble, 2).toString(16).toUpperCase();
    }

    // Double Precision
    const doubleBiasedExp = actualExp + 1023;
    const doubleExpBin = (doubleBiasedExp & 0x7FF).toString(2).padStart(11, '0');
    const doubleMantissa52 = mantissaStr.padEnd(52, '0').slice(0, 52);

    return {
      num,
      isNegative,
      signBit,
      intBin,
      fracBin,
      fullRawBin,
      actualExp,
      biasedExp,
      expBin,
      mantissa23,
      bitString32,
      hexStr,
      doubleBiasedExp,
      doubleExpBin,
      doubleMantissa52
    };
  }, [inputValue]);

  const presets = [
    { label: '5.75 (หน้า 63)', val: 5.75 },
    { label: '-13.625', val: -13.625 },
    { label: '0.125 (1/8)', val: 0.125 },
    { label: '-42.5', val: -42.5 },
    { label: '10.5', val: 10.5 }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f0f9ff', color: '#0284c7', padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
          <Sparkles size={16} /> มาตรฐาน IEEE 754
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
          เครื่องมือแปลงเลขทศนิยม IEEE 754 (Floating Point Converter)
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
          แยกส่วนประกอบ Sign Bit (1 บิต), Biased Exponent (8 บิต) และ Mantissa Normal Form (23 บิต)
        </p>

        {/* Presets */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', alignSelf: 'center' }}>โจทย์ตัวอย่าง:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              className="btn-secondary"
              style={{ fontSize: '13px', padding: '6px 12px' }}
              onClick={() => setInputValue(p.val)}
            >
              📌 {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="content-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#334155', marginBottom: '8px' }}>
            กรอกตัวเลขจำนวนจริง / ทศนิยมฐานสิบ:
          </label>
          <input
            type="number"
            step="any"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '2px solid #6366f1',
              fontSize: '20px',
              fontWeight: '700',
              textAlign: 'center',
              outline: 'none',
              color: '#0f172a'
            }}
          />
        </div>
      </div>

      {conversion && (
        <>
          {/* Visualizer 32-bit Single Precision */}
          <div className="content-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                🎨 แผนผังการจัดสรรบิตแบบ Single-Precision (32 บิต)
              </h3>
              <span className="badge-pill badge-purple" style={{ fontSize: '13px' }}>
                Hexadecimal: <strong>{conversion.hexStr}h</strong>
              </span>
            </div>

            <div className="bit-layout-visualizer" style={{ margin: '16px 0' }}>
              <div className="bit-segment bit-segment-sign">
                <div className="bit-segment-label">Sign (S)</div>
                <div style={{ fontSize: '20px', fontFamily: 'JetBrains Mono', margin: '4px 0' }}>{conversion.signBit}</div>
                <div className="bit-segment-sub">บิต 31 (1 บิต)</div>
              </div>

              <div className="bit-segment bit-segment-exp">
                <div className="bit-segment-label">Exponent (E + 127)</div>
                <div style={{ fontSize: '18px', fontFamily: 'JetBrains Mono', margin: '4px 0' }}>{conversion.expBin}</div>
                <div className="bit-segment-sub">บิต 30-23 (8 บิต) = {conversion.biasedExp}₁₀</div>
              </div>

              <div className="bit-segment bit-segment-mantissa">
                <div className="bit-segment-label">Mantissa (ส่วนหลังจุดทศนิยม M)</div>
                <div style={{ fontSize: '16px', fontFamily: 'JetBrains Mono', margin: '4px 0', letterSpacing: '0.04em', overflowWrap: 'break-word' }}>
                  {conversion.mantissa23}
                </div>
                <div className="bit-segment-sub">บิต 22-0 (23 บิต) | ซ่อนเลข 1 หน้าจุด (Implicit 1)</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-around', background: '#f8fafc', padding: '12px', borderRadius: '8px', marginTop: '12px', fontSize: '13px', color: '#475569', flexWrap: 'wrap', gap: '8px' }}>
              <span>🟦 <strong>Sign (S):</strong> {conversion.signBit} ({conversion.isNegative ? 'ค่าลบ' : 'ค่าบวก'})</span>
              <span>🟩 <strong>Actual Exp (e):</strong> {conversion.actualExp} | <strong>Biased Exp (E):</strong> {conversion.biasedExp}</span>
              <span>🟨 <strong>Normalized Form:</strong> 1.{conversion.mantissa23.slice(0, 6)}... × 2<sup>{conversion.actualExp}</sup></span>
            </div>
          </div>

          {/* Step-by-Step Breakdown Cards */}
          <div className="content-card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>
              🔍 ขั้นตอนการคำนวณและแปลงค่าทีละขั้นตอน (Walkthrough)
            </h3>

            <div className="step-cards-container">
              {/* Step 1 */}
              <div className="step-card">
                <div className="step-number">1</div>
                <div className="step-body">
                  <div className="step-title">กำหนดบิตเครื่องหมาย (Sign Bit: S)</div>
                  <div className="step-desc">
                    ตัวเลข {conversion.num} เป็น <strong>{conversion.isNegative ? 'ค่าลบ (-)' : 'ค่าบวก (+)'}</strong><br/>
                    ดังนั้นบิตเครื่องหมายกำหนดให้ <strong>S = {conversion.signBit}</strong> (1 บิตซ้ายสุด)
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="step-card">
                <div className="step-number">2</div>
                <div className="step-body">
                  <div className="step-title">แปลงตัวเลขเป็นเลขฐานสอง (Binary Conversion)</div>
                  <div className="step-desc">
                    • ส่วนจำนวนเต็ม: {Math.floor(Math.abs(conversion.num))}₁₀ = <code>{conversion.intBin}₂</code><br/>
                    • ส่วนทศนิยม: {(Math.abs(conversion.num) % 1).toFixed(4)}₁₀ = <code>0.{conversion.fracBin}₂</code><br/>
                    • รวมกันได้เป็นเลขฐานสอง: <strong>{conversion.fullRawBin}₂</strong>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="step-card">
                <div className="step-number">3</div>
                <div className="step-body">
                  <div className="step-title">จัดรูปเป็น Normal Form (1.M × 2ᵉ)</div>
                  <div className="step-desc">
                    เลื่อนจุดทศนิยมเพื่อให้เหลือเลข 1 หน้าจุดตัวเดียว (Normalize):<br/>
                    {conversion.fullRawBin}₂ → <strong>1.{conversion.mantissa23.slice(0, 10)}...₂ × 2<sup>{conversion.actualExp}</sup></strong><br/>
                    • ได้เลขชี้กำลังแท้จริง <strong>e = {conversion.actualExp}</strong>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="step-card">
                <div className="step-number">4</div>
                <div className="step-body">
                  <div className="step-title">คำนวณ Biased Exponent (E) และ Mantissa (M)</div>
                  <div className="step-desc">
                    • <strong>Biased Exponent:</strong> E = e + 127 = {conversion.actualExp} + 127 = <strong>{conversion.biasedExp}₁₀</strong> → <code>{conversion.expBin}₂</code> (8 บิต)<br/>
                    • <strong>Mantissa:</strong> ตัดเลข 1 ข้างหน้าออก (Implicit Leading Bit) นำเศษหลังจุดมาเติม 0 ให้ครบ 23 บิต → <code>{conversion.mantissa23}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Double Precision Comparison Card */}
          <div className="content-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', marginBottom: '14px' }}>
              🔬 เทียบกับ Double-Precision (64 บิต)
            </h3>
            <div className="modern-table-container">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>คุณสมบัติ</th>
                    <th>Single-Precision (32-bit)</th>
                    <th>Double-Precision (64-bit)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Sign Bit</strong></td>
                    <td className="mono">{conversion.signBit} (1 บิต)</td>
                    <td className="mono">{conversion.signBit} (1 บิต)</td>
                  </tr>
                  <tr>
                    <td><strong>Exponent (E)</strong></td>
                    <td className="mono">{conversion.expBin} (8 บิต, Bias 127 = {conversion.biasedExp})</td>
                    <td className="mono">{conversion.doubleExpBin} (11 บิต, Bias 1023 = {conversion.doubleBiasedExp})</td>
                  </tr>
                  <tr>
                    <td><strong>Mantissa (M)</strong></td>
                    <td className="mono">{conversion.mantissa23} (23 บิต)</td>
                    <td className="mono" style={{ fontSize: '12px' }}>{conversion.doubleMantissa52.slice(0, 32)}... (52 บิต)</td>
                  </tr>
                  <tr>
                    <td><strong>ระดับความละเอียด</strong></td>
                    <td>ประมาณ 7 ตำแหน่งทศนิยมฐานสิบ</td>
                    <td>ประมาณ 15-17 ตำแหน่งทศนิยมฐานสิบ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

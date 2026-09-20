import React, { useState } from 'react';
import { Layers, RotateCcw, ArrowRight, ArrowLeft, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

export default function FlashcardsView() {
  const [cardIdx, setCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const cards = [
    {
      front: "ALU (Arithmetic and Logic Unit) มีบทบาทหน้าที่หลักอย่างไร?",
      back: "เป็นเสมือนสมองและโรงงานคำนวณหลัก ทำหน้าที่คำนวณทางคณิตศาสตร์ (+, -, *, /) และตัดสินใจเชิงตรรกะระดับบิต (AND, OR, NOT, COMPLEMENT, เปรียบเทียบ)"
    },
    {
      front: "Control Unit (CU) สั่งการ ALU อย่างไร?",
      back: "ทำหน้าที่เป็นวาทยกรหรือหัวหน้าเชฟ ส่งสัญญาณควบคุม (Control Signals) เพื่อบอก ALU ว่าต้องคำนวณประเภทใด ณ สัญญาณนาฬิกาใด"
    },
    {
      front: "Accumulator (A / AC) ในวงจร ALU ทำหน้าที่อะไร?",
      back: "เป็นรีจิสเตอร์ความเร็วสูง ทำหน้าที่เป็นโต๊ะทำงานชั่วคราวสำหรับเก็บตัวตั้ง ผลรวมบางส่วน และผลลัพธ์สุดท้ายของการคำนวณ"
    },
    {
      front: "Zero Flag (Z) และ Carry Flag (C) บ่งบอกสถานะใด?",
      back: "Zero Flag (Z = 1) บอกว่าผลลัพธ์ล่าสุดเป็นศูนย์ทุกบิต ส่วน Carry Flag (C = 1) บอกว่าเกิดตัวทดล้นออกจากการบวกหรือเกิดการยืมในการลบ"
    },
    {
      front: "Unsigned Representation ต่างจาก Sign-Magnitude อย่างไร?",
      back: "Unsigned ใช้ทุกบิตแทนขนาดตัวเลข (0 ถึง 2ⁿ - 1) ไม่มีค่าลบ ส่วน Sign-Magnitude ใช้บิตซ้ายสุดเป็นบิตเครื่องหมาย (0=บวก, 1=ลบ) และมีปัญหาศูนย์สองตัว"
    },
    {
      front: "วิธีการคำนวณ 1's Complement ของเลขฐานสองทำอย่างไร?",
      back: "ทำการกลับบิตทั้งหมด (Bit Inversion) สลับ 0 เป็น 1 และสลับ 1 เป็น 0 เช่น 10110₂ กลายเป็น 01001₂"
    },
    {
      front: "สูตรและขั้นตอนการหา 2's Complement คืออะไร?",
      back: "2's Complement = 1's Complement + 1 (กลับบิตทั้งหมดแล้วบวก 1 ที่บิตขวาสุด) เป็นวิธีมาตรฐานที่ใช้แทนค่าลบในคอมพิวเตอร์"
    },
    {
      front: "เหตุใดคอมพิวเตอร์จึงเลือกใช้ระบบ 2's Complement แทนค่าลบ?",
      back: "มีค่าศูนย์เพียงค่าเดียว (0000 = 0) และทำให้ฮาร์ดแวร์ใช้วงจรบวก (Adder) ในการคำนวณการลบได้ทันทีโดยแปลงเป็น A + (-B)"
    },
    {
      front: "ในการลบด้วย 2's Complement หากเกิด Carry-out ต้องจัดการอย่างไร?",
      back: "ตัดตัวทดทิ้ง (Discard Carry) คำตอบที่เหลือจะเป็นค่าบวกที่ถูกต้องสมบูรณ์"
    },
    {
      front: "Half Adder (HA) ต่างจาก Full Adder (FA) อย่างไร?",
      back: "Half Adder บวกได้เพียง 2 บิต (ไม่มีตัวทดเข้า) ส่วน Full Adder บวกได้ 3 บิตพร้อมกัน (A, B, Cin) รองรับตัวทดจากหลักก่อนหน้า"
    },
    {
      front: "วงจร Ripple Carry Adder ทำงานอย่างไร?",
      back: "นำ Full Adder มาต่อเรียงอนุกรมกัน ตัวทดจากหลักขวา (Cout) จะถูกส่งต่อเป็น Cin ของหลักถัดไปเรื่อยๆ เหมือนโดมิโน่"
    },
    {
      front: "การคูณเลขฮาร์ดแวร์ใช้องค์ประกอบรีจิสเตอร์ใดบ้าง?",
      back: "รีจิสเตอร์ M (ตัวตั้ง Multiplicand), รีจิสเตอร์ Q (ตัวคูณ Multiplier), รีจิสเตอร์ A (Accumulator), และ Carry Flip-Flop (C)"
    },
    {
      front: "ในการคูณฮาร์ดแวร์พื้นฐาน บิตใดของตัวคูณที่ถูกตรวจสอบทุกรอบ?",
      back: "บิตขวาสุดของตัวคูณคือ Q₀ (หาก Q₀ = 1 ให้บวก A = A + M แล้ว Shift Right; หาก Q₀ = 0 ให้ Shift Right ทันที)"
    },
    {
      front: "การขยายบิตเครื่องหมาย (Sign Extension) คืออะไร ทำไมต้องทำ?",
      back: "การขยายขนาดบิตให้ยาวขึ้นโดยคัดลอกบิตเครื่องหมายเดิม (MSB) ไปเติมทางซ้าย เพื่อรักษาค่าทางคณิตศาสตร์และเครื่องหมายให้คงเดิม"
    },
    {
      front: "Booth's Algorithm ถูกออกแบบมาเพื่อแก้ปัญหาใด?",
      back: "เพื่อใช้คูณเลขฐานสองแบบมีเครื่องหมายในระบบ 2's Complement ได้โดยตรง ทั้งค่าบวกและค่าลบโดยไม่ต้องแปลงเป็นค่าบวกก่อน"
    },
    {
      front: "ตรรกะการตัดสินใจคู่บิต (Q₀, Q₋₁) ใน Booth's Algorithm คืออะไร?",
      back: "00 หรือ 11 = ไม่บวก/ลบ ทำ ASR | 01 = บวกตัวตั้ง (A = A + M) แล้วทำ ASR | 10 = ลบตัวตั้ง (A = A - M) แล้วทำ ASR"
    },
    {
      front: "Arithmetic Shift Right (ASR) ต่างจาก Logical Shift Right อย่างไร?",
      back: "ASR จะทำการเลื่อนบิตขวาโดยคัดลอกบิตเครื่องหมาย (MSB) ของ A ไว้คงเดิมเสมอ (Sign Preserved) ไม่แทนที่ด้วย 0"
    },
    {
      front: "ผลลัพธ์สมบูรณ์ของการหารเลขจำนวนเต็ม (Integer Division) คืออะไร?",
      back: "ประกอบด้วย 2 ส่วนเสมอ คือ ผลหาร (Quotient ในรีจิสเตอร์ Q) และ เศษเหลือ (Remainder ในรีจิสเตอร์ A)"
    },
    {
      front: "ทำไมอัลกอริทึมการหารจึงมีชื่อว่า 'Restoring' Division?",
      back: "เพราะเมื่อนำ A - M แล้วได้ผลลัพธ์ติดลบ (MSB เป็น 1) วงจรจะต้อง 'กู้คืนค่า A เดิม' (Restore) ด้วยการบวก M กลับคืน (A = A + M)"
    },
    {
      front: "ใน Restoring Division หากลบแล้ว MSB ของ A เป็น 0 ต้องทำอย่างไร?",
      back: "แสดงว่าการลบสำเร็จ ไม่ต้อง Restore ค่า A และกำหนดให้บิตผลหาร Q₀ = 1"
    },
    {
      front: "มาตรฐาน IEEE 754 จัดเก็บเลขจำนวนจริงในรูปทั่วไปอย่างไร?",
      back: "V = (-1)ˢ × 1.M × 2^(E - Bias) ประกอบด้วย Sign bit (S), Mantissa (M) และ Biased Exponent (E)"
    },
    {
      front: "ค่า Bias ของ Exponent ใน Single-precision (32 บิต) คือเท่าใด?",
      back: "ค่า Bias = 127 ดังนั้นเลขชี้กำลังที่จัดเก็บในคอมพิวเตอร์คือ E = e + 127 (ส่วน Double-precision มี Bias = 1023)"
    },
    {
      front: "Implicit Leading Bit ใน Mantissa ของ IEEE 754 คืออะไร?",
      back: "การละเว้นไม่บันทึกเลข 1 ที่อยู่หน้าจุดทศนิยม (1.M) ลงในหน่วยความจำ เพราะทุกเลขที่ Normalize มีเลข 1 เสมอ ช่วยประหยัดเนื้อที่ 1 บิตฟรี"
    },
    {
      front: "Single-precision (32-bit) แบ่งการจัดสรรบิตอย่างไร?",
      back: "Sign bit (S) 1 บิต, Exponent (E) 8 บิต (Bias 127), และ Mantissa (M) 23 บิต รวมเป็น 32 บิต (ความแม่นยำ ~7 หลักทศนิยม)"
    }
  ];

  const current = cards[cardIdx];

  const handleNext = () => {
    setIsFlipped(false);
    setCardIdx(prev => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCardIdx(prev => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div style={{ padding: '24px 0', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#f3e8ff', color: '#7c3aed', padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
          <Sparkles size={16} /> ทบทวนนิยามก่อนสอบ
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>
          🎴 Flashcards ทบทวนความจำ บทที่ 6 (ALU)
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
          คลิกที่การ์ดเพื่อพลิกดูคำตอบและเฉลย ({cardIdx + 1} / {cards.length})
        </p>
      </div>

      <div className="flashcard-wrapper">
        <div 
          className="flashcard" 
          onClick={() => setIsFlipped(!isFlipped)}
          style={{ minHeight: '260px', cursor: 'pointer', transition: 'all 0.2s ease', border: isFlipped ? '2px solid #4f46e5' : '1px solid #cbd5e1' }}
        >
          <span className="card-side-tag" style={{ background: isFlipped ? '#eeefff' : '#f1f5f9', color: isFlipped ? '#4f46e5' : '#475569' }}>
            {isFlipped ? '💡 เฉลยและคำอธิบาย' : '❓ คำถาม / นิยามศัพท์'}
          </span>

          <h3 style={{ fontSize: isFlipped ? '16.5px' : '20px', color: isFlipped ? '#1e293b' : '#4f46e5', fontWeight: '700', lineHeight: '1.6', margin: '20px 0' }}>
            {isFlipped ? current.back : current.front}
          </h3>

          <div style={{ marginTop: 'auto', fontSize: '12px', color: '#94a3b8' }}>
            (คลิกเพื่อ{isFlipped ? 'ดูคำถาม' : 'พลิกดูเฉลย'})
          </div>
        </div>

        <div className="flashcard-controls" style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '20px' }}>
          <button className="btn-secondary" onClick={handlePrev}>
            <ArrowLeft size={16} /> ข้อก่อนหน้า
          </button>
          <button className="btn-secondary" onClick={() => setIsFlipped(!isFlipped)}>
            <RefreshCw size={16} /> พลิกการ์ด
          </button>
          <button className="btn-primary" onClick={handleNext}>
            ข้อถัดไป <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

# ⚙️ CS 3106 | บทที่ 6: หน่วยคำนวณทางคณิตศาสตร์และตรรกะ (Arithmetic and Logic Unit - ALU)

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-2563eb?style=for-the-badge&logo=github&logoColor=white)](https://phongsathondev.github.io/Chapter6-Arithmetic-and-Logic-Unit/)
[![React](https://img.shields.io/badge/React%2019-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

> 🌐 **เข้าใช้งานสรุปบทเรียนและสื่อการสอนแบบ Interactive ได้ที่:**  
> 👉 **[CS 3106 | บทที่ 6: หน่วยคำนวณทางคณิตศาสตร์และตรรกะ (ALU)](https://phongsathondev.github.io/Chapter6-Arithmetic-and-Logic-Unit/)**

---

## 📖 เกี่ยวกับโปรเจกต์ (Overview)

เว็บแอปพลิเคชันสรุปบทเรียน สื่อการสอนแบบมีปฏิสัมพันธ์ (Interactive Learning Platform) และคลังข้อสอบวิชา **020413106 โครงสร้างระบบคอมพิวเตอร์ (Computer System Organization) - บทที่ 6 หน่วยคำนวณทางคณิตศาสตร์และตรรกะ (Arithmetic and Logic Unit - ALU)** 

เนื้อหาครอบคลุมอย่างละเอียดและครบถ้วนตามเอกสารประกอบการสอน 77 หน้า และตรงตาม **วัตถุประสงค์เชิงพฤติกรรมทั้ง 34 ข้อ** ของรายวิชา พร้อมเครื่องมือจำลองเสมือนจริงสำหรับอัลกอริทึมการคูณและการหารระดับฮาร์ดแวร์

---

## ✨ ฟีเจอร์หลัก (Key Features)

### 1. 📚 สรุปเนื้อหาเจาะลึก 7 โมดูลการเรียนรู้ (7 Comprehensive Modules)
- **Module 01: บทบาทและโครงสร้างการทำงานของ ALU, Control Unit, Registers & Flags** (วัตถุประสงค์ 1–5, หน้า 4–5) — หน้าที่ของ ALU, การประมวลผลคณิตศาสตร์/ตรรกะ, การสั่งการของ Control Unit, Registers (Accumulator) และ Flags (Z, C, S, V)
- **Module 02: การแทนค่าตัวเลขจำนวนเต็มและระบบ Complement** (วัตถุประสงค์ 6–8, หน้า 6–8) — Unsigned vs Sign-Magnitude, 1's Complement, 2's Complement และข้อดีของการแทนค่าลบในคอมพิวเตอร์
- **Module 03: หลักการบวกและการลบเลขฐานสอง และวงจร Logic คำนวณ** (วัตถุประสงค์ 9–11, หน้า 9–11, 23–25) — กฎการบวก, การลบด้วย 2's Complement และการตรวจ Carry-out, วงจร Half Adder, Full Adder และ Ripple Carry Adder 4-บิต
- **Module 04: การคูณเลขฐานสองและสถาปัตยกรรมฮาร์ดแวร์สำหรับการคูณ** (วัตถุประสงค์ 12–15, 18–19, หน้า 12–18, 26–28, 34–38) — การคูณยาวแบบไม่คิดเครื่องหมาย, องค์ประกอบฮาร์ดแวร์ (M, Q, A, C, N), Flowchart การคูณ และ Trace Step-by-Step
- **Module 05: การคูณเลขคิดเครื่องหมายและ Booth's Algorithm** (วัตถุประสงค์ 16–17, 20–22, หน้า 19–22, 29–34, 38–42) — การขยายบิต Sign Extension, สถาปัตยกรรม Booth's Multiplier, Decision Matrix คู่บิต $(Q_0, Q_{-1})$, การเลื่อนบิต Arithmetic Shift Right (ASR) และตัวอย่างคำนวณจริง ($7 \times 3$, $(-9) \times 13$)
- **Module 06: การหารเลขฐานสองและ Restoring Division Algorithm** (วัตถุประสงค์ 23–28, หน้า 43–61, 67–71) — องค์ประกอบผลหารและเศษเหลือ, ฮาร์ดแวร์วงจรหาร, อัลกอริทึม Shift Left, ทดลองลบ $A - M$, ตรวจสอบ MSB และ Restore A เมื่อผลลัพธ์ติดลบ พร้อม Trace การคำนวณ ($13 \div 2$)
- **Module 07: การจัดเก็บเลขจำนวนจริงตามมาตรฐาน IEEE 754** (วัตถุประสงค์ 29–34, หน้า 61–67) — ความเป็นมาของมาตรฐาน, โครงสร้าง $(-1)^S \times 1.M \times 2^{E - \text{Bias}}$, Sign bit (1 บิต), Biased Exponent (8 บิต / Bias 127), Mantissa Normal Form (23 บิต ซ่อน Implicit 1) และเปรียบเทียบ Single vs Double Precision

---

### 2. 🛠️ เครื่องมือจำลองและการคำนวณแบบ Interactive
- ⚡ **Booth's Multiplier Simulator:** จำลองการคูณเลขฐานสองแบบคิดเครื่องหมายทีละจังหวะ แสดงค่าใน Registers A, Q, $Q_{-1}$, Counter N พร้อมการเลื่อนบิต ASR
- ➗ **Restoring Division Simulator:** จำลองการหารจำนวนเต็มฐานสอง Shift Left, ทดลองลบ, ตรวจสอบบิตเครื่องหมาย และ Restore คืนค่า A อย่างเห็นภาพชัดเจน
- 📐 **IEEE 754 Floating Point Converter:** เครื่องมือแปลงเลขทศนิยมฐานสิบเป็นรหัส IEEE 754 32 บิต พร้อมแผนผังสีระบุตำแหน่งบิตและขั้นตอนการ Normalization ทีละสเต็ป
- 🎴 **Interactive Flashcards:** การ์ดคำศัพท์ คอนเซปต์ และนิยามสำคัญ 24 ใบสำหรับฝึกจำก่อนสอบ
- 📝 **Exam Quiz System (คลังข้อสอบ 68 ข้อ):** แบบทดสอบวัดผลอิงตามวัตถุประสงค์เชิงพฤติกรรมทั้ง 34 ข้อ (ข้อละ 2 ข้อ) ตัวเลือกความยาวสมดุล ไร้สิ่งชี้นำ พร้อมระบบ Practice Mode เฉลยทันที และ Exam Mode จับเวลาตรวจคะแนน

---

## 🚀 การติดตั้งและรันในเครื่อง (Local Development)

```bash
# 1. โคลนคลังโค้ด (Clone Repository)
git clone https://github.com/PhongsathonDev/Chapter6-Arithmetic-and-Logic-Unit.git
cd Chapter6-Arithmetic-and-Logic-Unit

# 2. ติดตั้ง Dependencies
npm install

# 3. รันเซิร์ฟเวอร์สำหรับการพัฒนา
npm run dev

# 4. ทดสอบบิลด์โปรดักชัน
npm run build
```

---

## 📦 การ Deploy ขึ้น GitHub Pages

โปรเจกต์นี้ตั้งค่า GitHub Actions Workflow ไว้ที่ `.github/workflows/deploy.yml` รองรับการ Deploy อัตโนมัติเมื่อ Push ไปยังกิ่ง `main`:

```bash
git add .
git commit -m "feat: complete chapter 6 ALU curriculum, interactive simulators & quiz assessment"
git branch -M main
git remote add origin https://github.com/PhongsathonDev/Chapter6-Arithmetic-and-Logic-Unit.git
git push -u origin main
```

จากนั้นไปที่การตั้งค่าบน GitHub:
1. ไปที่แท็บ **Settings** > **Pages**
2. ภายใต้หัวข้อ **Build and deployment** เลือก Source เป็น **GitHub Actions**
3. ระบบจะทำการ Deploy เว็บไซต์ให้โดยอัตโนมัติ

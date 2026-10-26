/**
 * ==============================================================================
 * โครงการ: นักผจญภัยตามล่าหลักฐานทางประวัติศาสตร์ (Grade 4 History Adventure)
 * ไฟล์: Code.gs (Google Apps Script สำหรับเชื่อมต่อ Google Sheets)
 * Google Sheets ID: 1Jhet_jW9Hwd9BJ6FXme_8qmDbY4cuTaz4CEK1Ck59WA
 * ==============================================================================
 * 
 * วิธีการติดตั้งและนำไปใช้งาน:
 * 1. เปิด Google Sheets ที่ต้องการเก็บคะแนน
 * 2. ไปที่เมนู "ส่วนขยาย" (Extensions) -> "Apps Script"
 * 3. วางโค้ดทั้งหมดนี้ลงในไฟล์ รหัส.gs แล้วกด "บันทึก" (Ctrl + S)
 * 4. คลิกปุ่มสีน้ำเงินมุมบนขวา "การทำให้ใช้งานได้" (Deploy) -> "การทำให้ใช้งานได้รายการใหม่" (New deployment)
 * 5. เลือกประเภท (รูปฟันเฟือง): "เว็บแอปพลิเคชัน" (Web app)
 * 6. ตั้งค่า:
 *    - คำอธิบาย: บันทึกคะแนนเกมประวัติศาสตร์ ป.4
 *    - ดำเนินการในฐานะ (Execute as): "ตัวฉัน" (Me)
 *    - ผู้ที่มีสิทธิ์เข้าถึง (Who has access): "ทุกคน" (Anyone)  <--- สำคัญมาก!
 * 7. คลิก "ทำให้ใช้งานได้" (Deploy) -> กด "ให้สิทธิ์เข้าถึง" (Authorize access)
 * 8. คัดลอก "URL ของเว็บแอป" (Web App URL) ที่ลงท้ายด้วย /exec ไปใส่ในเกม
 */

// รหัส Google Sheets (หากเปิด Apps Script จาก Google Sheets โดยตรง ระบบจะเชื่อมโยงให้อัตโนมัติ)
const SPREADSHEET_ID = '1Jhet_jW9Hwd9BJ6FXme_8qmDbY4cuTaz4CEK1Ck59WA';
const SHEET_NAME = 'ผลการเล่น';

/**
 * ฟังก์ชันสำหรับทดสอบการทำงานผ่านปุ่ม "เรียกใช้" (Run) ใน Apps Script
 * * สามารถเลือกฟังก์ชันนี้แล้วกด "เรียกใช้" เพื่อทดสอบและให้สิทธิ์ (Authorize) ได้ทันที
 */
function testSaveScore() {
  Logger.log('=== กำลังเริ่มการทดสอบบันทึกข้อมูลคะแนน ===');
  const testData = {
    timestamp: Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss'),
    nickname: 'นักเรียนทดสอบระบบ',
    score: 50,
    correctCount: 5,
    totalQuestions: 5,
    maxScore: 50,
    evaluation: '🌟 ยอดเยี่ยม (สุดยอดนักสืบประวัติศาสตร์)',
    playDuration: '01:20',
    userAgent: 'Apps Script Manual Test'
  };

  try {
    const result = saveScoreData(testData);
    Logger.log('✅ บันทึกสำเร็จ: ' + JSON.stringify(result));
    return result;
  } catch (err) {
    Logger.log('❌ เกิดข้อผิดพลาด: ' + err.toString());
    throw err;
  }
}

/**
 * ฟังก์ชันรับคำขอแบบ POST จากเกมเพื่อบันทึกคะแนน (ทำงานเมื่อเกมส่งข้อมูลมา ไม่ต้องกดเรียกใช้ในหน้า Apps Script)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  const lockSuccess = lock.tryLock(10000);
  
  if (!lockSuccess) {
    return createJsonResponse({
      status: 'error',
      message: 'เซิร์ฟเวอร์กำลังประมวลผลคำขออื่น กรุณาลองใหม่อีกครั้ง'
    });
  }

  try {
    let data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    const result = saveScoreData(data);
    return createJsonResponse(result);

  } catch (error) {
    Logger.log('doPost Error: ' + error.toString());
    return createJsonResponse({
      status: 'error',
      message: 'เกิดข้อผิดพลาดในการบันทึก: ' + error.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * ฟังก์ชันสำหรับตรวจสอบสถานะ Web App ผ่านเบราว์เซอร์
 */
function doGet(e) {
  return createJsonResponse({
    status: 'online',
    message: 'ระบบบันทึกคะแนนเกม "นักผจญภัยตามล่าหลักฐานทางประวัติศาสตร์" พร้อมทำงาน',
    sheetId: SPREADSHEET_ID,
    timestamp: new Date().toISOString()
  });
}

/**
 * ตรรกะหลักในการเปิด Google Sheet และบันทึกคะแนน
 */
function saveScoreData(data) {
  // 1. ดึง Spreadsheet (รองรับทั้งแบบ Container-bound และแบบระบุ ID)
  let ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (err) {}

  if (!ss && SPREADSHEET_ID) {
    try {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (err) {
      throw new Error('ไม่สามารถเปิด Google Sheet รหัส ' + SPREADSHEET_ID + ': ' + err.message);
    }
  }

  if (!ss) {
    throw new Error('ไม่พบ Google Sheet กรุณาเปิดสคริปต์จาก Google Sheet โดยตรง หรือระบุ SPREADSHEET_ID ให้ถูกต้อง');
  }

  // 2. ดึงหรือสร้าง Sheet ชื่อ 'ผลการเล่น'
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // 3. ตรวจสอบและสร้างหัวตารางอัตโนมัติหากยังไม่มีข้อมูล
  ensureHeaderExists(sheet);

  // 4. จัดเตรียมข้อมูลแถวใหม่
  const now = new Date();
  const timestamp = data.timestamp || Utilities.formatDate(now, 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss');
  const nickname = (data.nickname || 'นักผจญภัยนิรนาม').toString().trim();
  const score = Number(data.score !== undefined ? data.score : 0);
  const correctCount = Number(data.correctCount !== undefined ? data.correctCount : 0);
  const totalQuestions = Number(data.totalQuestions || 5);
  const maxScore = Number(data.maxScore || 50);
  const percentage = Math.round((score / maxScore) * 100);
  const evaluation = data.evaluation || getEvaluationText(score);
  const playDuration = data.playDuration || '-';
  const userAgent = data.userAgent || '';

  // 5. บันทึกแถวใหม่ลง Sheet
  sheet.appendRow([
    timestamp,
    nickname,
    score,
    maxScore,
    `${correctCount} จาก ${totalQuestions} ข้อ`,
    `${percentage}%`,
    evaluation,
    playDuration,
    userAgent
  ]);

  // จัดตำแหน่งข้อความของแถวล่าสุดให้สวยงาม
  const lastRow = sheet.getLastRow();
  const dataRange = sheet.getRange(lastRow, 1, 1, 9);
  dataRange.setVerticalAlignment('middle');
  sheet.getRange(lastRow, 3, 1, 4).setHorizontalAlignment('center');

  return {
    status: 'success',
    message: 'บันทึกคะแนนลง Google Sheets เรียบร้อยแล้ว!',
    rowNumber: lastRow,
    data: {
      nickname: nickname,
      score: score,
      maxScore: maxScore,
      evaluation: evaluation,
      timestamp: timestamp
    }
  };
}

/**
 * ฟังก์ชันตรวจสอบและสร้างหัวตารางอัตโนมัติหากยังไม่มี
 */
function ensureHeaderExists(sheet) {
  if (sheet.getLastRow() === 0) {
    const headers = [
      'วันเวลาที่เล่น (Timestamp)',
      'ชื่อเล่น (Nickname)',
      'คะแนนที่ได้ (Score)',
      'คะแนนเต็ม (Max Score)',
      'จำนวนข้อที่ตอบถูก',
      'ร้อยละ (%)',
      'ระดับการประเมิน',
      'เวลาที่ใช้เล่น',
      'ข้อมูลอุปกรณ์ (Device)'
    ];

    sheet.appendRow(headers);

    // ตกแต่งหัวตารางด้วยสีสันสดใส เข้ากับเกม
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#4F46E5'); // สีม่วง Indigo
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(11);
    headerRange.setHorizontalAlignment('center');
    headerRange.setVerticalAlignment('middle');

    sheet.setRowHeight(1, 38);
    sheet.setFrozenRows(1); // ตรึงแถวหัวตาราง

    // ปรับความกว้างคอลัมน์อัตโนมัติ
    for (let col = 1; col <= headers.length; col++) {
      sheet.autoResizeColumn(col);
    }
  }
}

/**
 * ฟังก์ชันคำนวณข้อความประเมินตามเกณฑ์คะแนน ป.4
 */
function getEvaluationText(score) {
  if (score >= 50) return '🌟 ยอดเยี่ยม (สุดยอดนักสืบประวัติศาสตร์)';
  if (score >= 40) return '👏 ดีมาก (นักสำรวจผู้เชี่ยวชาญ)';
  if (score >= 30) return '👍 ดี (นักสืบประวัติศาสตร์ฝึกหัด)';
  if (score >= 20) return '🌱 พอใช้ (กำลังพัฒนาความรู้)';
  return '💡 ควรทบทวน (เริ่มต้นเรียนรู้)';
}

/**
 * ตัวช่วยสร้างการตอบกลับรูปแบบ JSON รองรับ CORS
 */
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

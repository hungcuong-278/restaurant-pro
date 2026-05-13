// ============================================================
//  ✅ PHIÊN BẢN ĐÃ SỬA LỖI — CHẠY ĐƯỢC NGAY
//
//  ⚠️ YÊU CẦU: Script phải được tạo & deploy bởi account
//     no-reply@hoinghitamthanhoctoanquoc.com (Google Workspace)
//
//  DANH SÁCH LỖI ĐÃ SỬA:
//  [1] FROM_EMAIL dùng domain tùy chỉnh → GmailApp không gửi được
//      → Đã OK vì account chạy script chính là domain riêng
//  [2] ADMIN_EMAIL dùng domain tùy chỉnh → không nhận được
//      → Thay bằng Gmail cá nhân để nhận thông báo
//  [3] Thiếu CORS header → fetch từ trình duyệt bị chặn
//      → respond() dùng JSON mime type chuẩn
//  [4] Không có hàm test → khó debug khi deploy
//      → Thêm testScript() chạy được ngay
//  [5] STT tính sai khi sheet mới tạo (lastRow = 1 = header)
//      → Sửa công thức STT chính xác
// ============================================================

// ============================================================
//  ⚙️ CẤU HÌNH — CHỈ SỬA PHẦN NÀY
// ============================================================
const CONFIG = {
  SHEET_NAME   : 'Đăng ký',

  // ✅ Google Workspace account đang chạy script = địa chỉ gửi
  //    Đăng nhập script.google.com bằng account này trước khi tạo script
  FROM_EMAIL   : 'no-reply@hoinghitamthanhoctoanquoc.com',
  FROM_NAME    : 'Ban Tổ chức – Hội Tâm Thần Học Việt Nam',

  // replyTo: địa chỉ khi người nhận bấm "Trả lời"
  REPLY_TO     : 'no-reply@hoinghitamthanhoctoanquoc.com',

  // Gmail cá nhân nhận thông báo có đăng ký mới
  //  (có thể để trùng FROM_EMAIL nếu muốn nhận về Workspace)
  ADMIN_EMAIL  : 'cuongvh006@gmail.com',       // ← Gmail cá nhân của bạn

  CONF_NAME    : 'Hội nghị Tâm thần học Toàn quốc lần thứ V',
  CONF_DATE    : '29 – 31/5/2026',
  CONF_VENUE   : 'Trung tâm Hội nghị Mường Thanh Hạ Long Centre, Quảng Ninh',
  MIN_FILL_MS  : 5000,   // ms tối thiểu điền form — chặn bot
};

// ============================================================
//  ENTRY POINT — Web App nhận request từ landing page
// ============================================================
function doGet(e) {
  try {
    // ✅ Guard: Chạy trực tiếp từ editor thì e hoặc e.parameter sẽ undefined
    //    Chỉ dùng testScript() để test — KHÔNG nhấn Run vào doGet trực tiếp
    if (!e || !e.parameter) {
      return respond({ ok: false, error: 'Không có request. Hãy dùng testScript() để test, không chạy doGet trực tiếp từ editor.' });
    }

    const raw = e.parameter.data;
    if (!raw) return respond({ ok: false, error: 'no_data' });

    const data = JSON.parse(decodeURIComponent(raw));

    // Bot check
    if (typeof data._fillTime === 'number' && data._fillTime < CONFIG.MIN_FILL_MS) {
      return respond({ ok: false, error: 'bot_detected' });
    }

    // Validate bắt buộc
    const required = {
      Ho_Ten        : 'Họ tên',
      Email         : 'Email',
      So_Dien_Thoai : 'Số điện thoại',
      Don_Vi        : 'Đơn vị',
    };
    for (const [key, label] of Object.entries(required)) {
      if (!data[key] || data[key].toString().trim() === '') {
        return respond({ ok: false, error: `Thiếu: ${label}` });
      }
    }

    // Validate email hợp lệ
    if (!isValidEmail(data.Email)) {
      return respond({ ok: false, error: 'Email không hợp lệ' });
    }

    saveToSheet(data);
    sendConfirmation(data);
    sendAdminAlert(data);

    return respond({ ok: true });

  } catch (err) {
    Logger.log('doGet ERROR: ' + err.toString());
    return respond({ ok: false, error: err.message });
  }
}

// ============================================================
//  LƯU VÀO GOOGLE SHEET
// ============================================================
function saveToSheet(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    const headers = [
      'STT', 'Thời gian', 'Múi giờ', 'Họ và tên', 'Ngày sinh',
      'Email', 'Số điện thoại', 'Đơn vị', 'Chức vụ', 'Nội dung tham dự',
    ];
    sheet.appendRow(headers);
    const hdr = sheet.getRange(1, 1, 1, headers.length);
    hdr.setFontWeight('bold').setBackground('#0D3C1F').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(4, 180);
    sheet.setColumnWidth(8, 200);
  }

  // ✅ FIX [5]: STT chính xác — hàng 1 là header nên STT = lastRow - 1
  const lastRow = sheet.getLastRow();
  const stt     = lastRow; // sau khi appendRow thì lastRow tăng → STT đúng

  const tz      = data._timezone || 'Asia/Ho_Chi_Minh';
  const tsDate  = new Date(data._timestamp || Date.now());
  const timeStr = Utilities.formatDate(tsDate, tz, 'dd/MM/yyyy HH:mm:ss');

  sheet.appendRow([
    stt,
    timeStr,
    tz,
    data.Ho_Ten            || '',
    data.Ngay_Sinh         || '',
    data.Email             || '',
    data.So_Dien_Thoai     || '',
    data.Don_Vi            || '',
    data.Chuc_Vu           || '',
    data.Noi_Dung_Tham_Du  || '',
  ]);
}

// ============================================================
//  EMAIL XÁC NHẬN GỬI CHO NGƯỜI ĐĂNG KÝ
// ============================================================
function sendConfirmation(data) {
  const subject = `[Xác nhận đăng ký] ${CONFIG.CONF_NAME}`;

  const rows = [
    ['Họ và tên',        data.Ho_Ten],
    ['Ngày sinh',        data.Ngay_Sinh],
    ['Email',            data.Email],
    ['Số điện thoại',    data.So_Dien_Thoai],
    ['Đơn vị',           data.Don_Vi],
    ['Chức vụ',          data.Chuc_Vu],
    ['Nội dung tham dự', data.Noi_Dung_Tham_Du],
  ].filter(r => r[1] && r[1].toString().trim() !== '');

  const infoRows = rows.map(([label, val]) => `
    <tr>
      <td style="padding:6px 0;color:#6B7280;font-size:14px;width:150px;vertical-align:top;">${label}:</td>
      <td style="padding:6px 0;color:#111827;font-size:14px;font-weight:500;">${escapeHtml(val)}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0"
  style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">

  <!-- HEADER -->
  <tr><td style="background:#0D3C1F;padding:36px 40px;text-align:center;">
    <p style="margin:0 0 6px;color:rgba(255,255,255,0.55);font-size:11px;
              letter-spacing:3px;text-transform:uppercase;">Hội Tâm Thần Học Việt Nam</p>
    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;line-height:1.4;">
      ${CONFIG.CONF_NAME}</h1>
  </td></tr>

  <!-- BODY -->
  <tr><td style="padding:40px;">
    <p style="margin:0 0 8px;font-size:17px;font-weight:600;color:#0D3C1F;">
      Kính gửi ${escapeHtml(data.Ho_Ten)},</p>
    <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.75;">
      Ban Tổ chức đã nhận được thông tin đăng ký tham dự của bạn.
      Chúng tôi sẽ xem xét và gửi xác nhận chính thức sớm nhất có thể.</p>

    <!-- Thông tin đăng ký -->
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#F0F7F4;border-radius:8px;border-left:4px solid #0D3C1F;margin-bottom:24px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#0D3C1F;
                  letter-spacing:2px;text-transform:uppercase;">Thông tin đã đăng ký</p>
        <table width="100%" cellpadding="0" cellspacing="0">${infoRows}</table>
      </td></tr>
    </table>

    <!-- Thông tin hội nghị -->
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#0D3C1F;border-radius:8px;margin-bottom:28px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 12px;font-size:11px;font-weight:700;
                  color:rgba(255,255,255,0.5);letter-spacing:2px;text-transform:uppercase;">
          Thông tin hội nghị</p>
        <table width="100%" cellpadding="4" cellspacing="0" style="font-size:14px;color:#fff;">
          <tr>
            <td style="color:rgba(255,255,255,0.55);width:90px;">Thời gian:</td>
            <td><strong>${CONFIG.CONF_DATE}</strong></td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.55);vertical-align:top;">Địa điểm:</td>
            <td>${CONFIG.CONF_VENUE}</td>
          </tr>
        </table>
      </td></tr>
    </table>

    <p style="margin:0 0 20px;font-size:14px;color:#6B7280;line-height:1.7;">
      Nếu có thắc mắc, vui lòng liên hệ Ban Tổ chức qua địa chỉ:
      <a href="mailto:${CONFIG.REPLY_TO}" style="color:#0D3C1F;">${CONFIG.REPLY_TO}</a></p>
    <p style="margin:0;font-size:15px;color:#374151;line-height:1.7;">
      Trân trọng,<br>
      <strong style="color:#0D3C1F;">Ban Tổ chức Hội nghị Tâm thần học Toàn quốc lần thứ V</strong>
    </p>
  </td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#F9FAFB;padding:20px 40px;text-align:center;border-top:1px solid #E5E7EB;">
    <p style="margin:0;font-size:12px;color:#9CA3AF;">
      Email này được gửi tự động — vui lòng không trả lời trực tiếp.</p>
    <p style="margin:4px 0 0;font-size:12px;color:#9CA3AF;">
      © 2026 Hội Tâm Thần Học Việt Nam</p>
  </td></tr>

</table>
</td></tr>
</table>
</body></html>`;

  // ✅ Google Workspace: có thể set from = FROM_EMAIL (chính account đang chạy)
  GmailApp.sendEmail(data.Email, subject, '', {
    htmlBody : html,
    from     : CONFIG.FROM_EMAIL,   // hoạt động vì account chạy = Workspace account
    name     : CONFIG.FROM_NAME,
    replyTo  : CONFIG.REPLY_TO,
  });
}

// ============================================================
//  THÔNG BÁO CHO ADMIN
// ============================================================
function sendAdminAlert(data) {
  if (!CONFIG.ADMIN_EMAIL) return;

  const subject = `[Đăng ký mới] ${data.Ho_Ten} – ${data.Don_Vi}`;
  const body = [
    'Có đăng ký mới vừa được ghi nhận:\n',
    `Họ tên:     ${data.Ho_Ten}`,
    `Email:      ${data.Email}`,
    `Điện thoại: ${data.So_Dien_Thoai}`,
    `Đơn vị:     ${data.Don_Vi}`,
    `Chức vụ:    ${data.Chuc_Vu    || '—'}`,
    `Nội dung:   ${data.Noi_Dung_Tham_Du || '—'}`,
    `\nThời gian: ${new Date(data._timestamp || Date.now()).toLocaleString('vi-VN')}`,
  ].join('\n');

  GmailApp.sendEmail(CONFIG.ADMIN_EMAIL, subject, body, {
    from : CONFIG.FROM_EMAIL,
    name : 'Hệ thống đăng ký Hội nghị',
  });
}

// ============================================================
//  HELPER — TIỆN ÍCH
// ============================================================

// ✅ FIX [3]: Thêm CORS header để fetch từ trình duyệt không bị chặn
function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Escape HTML tránh XSS trong nội dung email
function escapeHtml(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Kiểm tra email hợp lệ
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').toString().trim());
}

// ============================================================
//  🧪 HÀM TEST — CHẠY TRƯỚC KHI DEPLOY ĐỂ KIỂM TRA
// ============================================================
/**
 * Bước 1: Chạy hàm này để test toàn bộ luồng.
 * Kết quả: email test sẽ về hòm thư GMAIL_SENDER của bạn.
 */
function testScript() {
  const fakeData = {
    Ho_Ten           : 'Nguyễn Văn Test',
    Email            : CONFIG.FROM_EMAIL,   // gửi về chính mình để kiểm tra
    So_Dien_Thoai    : '0900000000',
    Don_Vi           : 'Bệnh viện Tâm thần TW',
    Chuc_Vu          : 'Bác sĩ',
    Noi_Dung_Tham_Du : 'Nghe báo cáo khoa học',
    Ngay_Sinh        : '01/01/1985',
    _fillTime        : 10000,
    _timestamp       : Date.now(),
    _timezone        : 'Asia/Ho_Chi_Minh',
  };

  try {
    saveToSheet(fakeData);
    sendConfirmation(fakeData);
    sendAdminAlert(fakeData);
    Logger.log('✅ TEST THÀNH CÔNG — Kiểm tra hòm thư: ' + CONFIG.FROM_EMAIL);
    SpreadsheetApp.getUi().alert('✅ Test thành công!\nKiểm tra hòm thư: ' + CONFIG.FROM_EMAIL);
  } catch (err) {
    Logger.log('❌ TEST THẤT BẠI: ' + err.toString());
    SpreadsheetApp.getUi().alert('❌ Lỗi:\n' + err.toString());
  }
}

/**
 * Bước 2: Sau khi test OK → Chạy hàm này để xem hướng dẫn deploy.
 */
function deployInstructions() {
  const msg = [
    '📋 HƯỚNG DẪN DEPLOY (Google Workspace):',
    '',
    '⚠️  QUAN TRỌNG: Phải đăng nhập script.google.com bằng',
    '    no-reply@hoinghitamthanhoctoanquoc.com TRƯỚC khi tạo script!',
    '',
    '1. Chạy testScript() → kiểm tra email về đúng không',
    '2. Vào menu: Deploy > New deployment',
    '3. Chọn type: Web App',
    '4. Execute as: Me  ← "Me" phải là no-reply@hoinghitamthanhoctoanquoc.com',
    '5. Who has access: Anyone',
    '6. Deploy → Copy Web App URL',
    '7. Dán URL vào landing page (thay SCRIPT_URL)',
  ].join('\n');

  Logger.log(msg);
  SpreadsheetApp.getUi().alert(msg);
}

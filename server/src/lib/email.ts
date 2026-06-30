import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.CPANEL_SMTP_HOST || 'server222.web-hosting.com',
  port: parseInt(process.env.CPANEL_SMTP_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.CPANEL_SMTP_USER || 'info@qirox.online',
    pass: process.env.SMTP_PASS,
  },
  tls: { rejectUnauthorized: false },
});

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

const FROM = `"مجتمع مبادرة تسويقية" <${process.env.CPANEL_SMTP_USER || 'info@qirox.online'}>`;

export async function sendEmail(opts: EmailOptions): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: FROM,
      to: Array.isArray(opts.to) ? opts.to.join(', ') : opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    return true;
  } catch (err) {
    console.error('Email send error:', err);
    return false;
  }
}

function baseTemplate(content: string): string {
  return `
  <!DOCTYPE html>
  <html lang="ar" dir="rtl">
  <head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>مجتمع مبادرة تسويقية</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f6f9;font-family:'Tajawal',Arial,sans-serif;direction:rtl;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:30px 0;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(30,58,95,0.08);max-width:600px;width:100%;">
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a5f 0%,#2a4a7f 100%);padding:32px 40px;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;letter-spacing:-0.5px;">مجتمع مبادرة تسويقية</h1>
              <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:13px;">المجتمع المهني الأول للتسويق في العالم العربي</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e8edf2;text-align:center;">
              <p style="color:#94a3b8;font-size:12px;margin:0;">هذا البريد أُرسل تلقائيًا — يُرجى عدم الرد عليه</p>
              <p style="color:#94a3b8;font-size:12px;margin:6px 0 0;">© 2026 مجتمع مبادرة تسويقية</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;
}

export async function sendNewApplicationEmail(adminEmail: string, applicantName: string, applicantEmail: string) {
  return sendEmail({
    to: adminEmail,
    subject: `📋 طلب عضوية جديد — ${applicantName}`,
    html: baseTemplate(`
      <h2 style="color:#1e3a5f;margin:0 0 16px;font-size:20px;">طلب عضوية جديد</h2>
      <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">وردنا طلب عضوية جديد يحتاج إلى مراجعتك وموافقتك.</p>
      <table style="background:#f8fafc;border-radius:10px;padding:20px;width:100%;border-collapse:collapse;">
        <tr><td style="color:#64748b;font-size:14px;padding:6px 0;">الاسم</td><td style="color:#1e3a5f;font-weight:700;font-size:14px;text-align:left;">${applicantName}</td></tr>
        <tr><td style="color:#64748b;font-size:14px;padding:6px 0;">البريد</td><td style="color:#1e3a5f;font-weight:700;font-size:14px;text-align:left;">${applicantEmail}</td></tr>
      </table>
      <div style="margin-top:28px;text-align:center;">
        <a href="https://mmt-community.site/admin/applications" style="background:#1e3a5f;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">مراجعة الطلب</a>
      </div>
    `),
  });
}

export async function sendApplicationApprovedEmail(memberEmail: string, memberName: string) {
  return sendEmail({
    to: memberEmail,
    subject: '🎉 تهانينا! تمت الموافقة على طلب عضويتك',
    html: baseTemplate(`
      <h2 style="color:#1e3a5f;margin:0 0 16px;font-size:20px;">مرحبًا بك في المجتمع، ${memberName}!</h2>
      <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">يسعدنا إبلاغك بأن طلب عضويتك في مجتمع مبادرة تسويقية قد تمت الموافقة عليه. أنت الآن عضو رسمي في أكبر مجتمع مهني للتسويق في العالم العربي.</p>
      <div style="margin-top:28px;text-align:center;">
        <a href="https://mmt-community.site/login" style="background:#1e3a5f;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">ابدأ رحلتك الآن</a>
      </div>
    `),
  });
}

export async function sendApplicationRejectedEmail(memberEmail: string, memberName: string) {
  return sendEmail({
    to: memberEmail,
    subject: 'بشأن طلب عضويتك في مجتمع مبادرة تسويقية',
    html: baseTemplate(`
      <h2 style="color:#1e3a5f;margin:0 0 16px;font-size:20px;">عزيزي ${memberName}</h2>
      <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">شكرًا لتقديمك طلب الانضمام إلى مجتمع مبادرة تسويقية. بعد مراجعة طلبك، لم نتمكن من قبوله في الوقت الحالي. نشجعك على إعادة التقديم لاحقًا.</p>
      <div style="margin-top:28px;text-align:center;">
        <a href="https://mmt-community.site/join" style="background:#1e3a5f;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">إعادة التقديم</a>
      </div>
    `),
  });
}

export async function sendEventReminderEmail(memberEmail: string, memberName: string, eventTitle: string, eventDate: string) {
  return sendEmail({
    to: memberEmail,
    subject: `⏰ تذكير: ${eventTitle}`,
    html: baseTemplate(`
      <h2 style="color:#1e3a5f;margin:0 0 16px;font-size:20px;">تذكير بالفعالية</h2>
      <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 20px;">عزيزي ${memberName}، نذكّرك بفعاليتك القادمة.</p>
      <table style="background:#f8fafc;border-radius:10px;padding:20px;width:100%;border-collapse:collapse;">
        <tr><td style="color:#64748b;font-size:14px;padding:6px 0;">الفعالية</td><td style="color:#1e3a5f;font-weight:700;font-size:14px;text-align:left;">${eventTitle}</td></tr>
        <tr><td style="color:#64748b;font-size:14px;padding:6px 0;">الموعد</td><td style="color:#1e3a5f;font-weight:700;font-size:14px;text-align:left;">${eventDate}</td></tr>
      </table>
      <div style="margin-top:28px;text-align:center;">
        <a href="https://mmt-community.site/events" style="background:#1e3a5f;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">تفاصيل الفعالية</a>
      </div>
    `),
  });
}

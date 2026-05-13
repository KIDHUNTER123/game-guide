import nodemailer from "nodemailer"

async function getTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }

  // Dev mode: Ethereal fake SMTP
  const testAccount = await nodemailer.createTestAccount()
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  })
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const transporter = await getTransporter()

  const info = await transporter.sendMail({
    from: '"游戏攻略" <noreply@gameguides.app>',
    to: email,
    subject: "重置密码 - 游戏攻略",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
        <h2>重置密码</h2>
        <p>请点击下方链接重置您的密码，链接有效期为 1 小时：</p>
        <a href="${resetUrl}" style="display:inline-block;padding:10px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">重置密码</a>
        <p style="margin-top:24px;color:#666;font-size:14px;">如果无法点击按钮，请复制以下链接到浏览器：</p>
        <p style="font-size:12px;word-break:break-all;color:#888;">${resetUrl}</p>
      </div>
    `,
  })

  let previewUrl: string | null = null
  if (!process.env.SMTP_HOST) {
    const url = nodemailer.getTestMessageUrl(info)
    if (url) previewUrl = url as string
  }

  return previewUrl
}

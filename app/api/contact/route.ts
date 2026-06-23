import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('RESEND_API_KEY tanımlı değil')
      return NextResponse.json(
        { error: 'Mail servisi yapılandırılmamış' },
        { status: 500 }
      )
    }
    const resend = new Resend(apiKey)

    const body = await request.json()
    const { name, email, phone, message } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Lütfen tüm zorunlu alanları doldurun' },
        { status: 400 }
      )
    }

    const emailSubject = `Yeni İletişim Mesajı - ${name}`
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #EA580C;">Yeni İletişim Formu Mesajı</h2>
        <p>Aşağıdaki bilgilerle yeni bir mesaj aldınız:</p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f9fafb; font-weight: bold;">Ad Soyad</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f9fafb; font-weight: bold;">Email</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${email}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd; background: #f9fafb; font-weight: bold;">Telefon</td>
            <td style="padding: 10px; border: 1px solid #ddd;">${phone || 'Belirtilmemiş'}</td>
          </tr>
        </table>

        <h3 style="color: #374151;">Mesaj:</h3>
        <p style="background: #f3f4f6; padding: 15px; border-radius: 5px; line-height: 1.6;">${message}</p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          Bu mesaj gulerinsaat.org web sitesinden gönderilmiştir.
        </p>
      </div>
    `

    const { error: emailError } = await resend.emails.send({
      from: 'Güler Yapı Proje <noreply@gulerinsaat.org>',
      to: 'guleryapiproje@gmail.com',
      replyTo: email,
      subject: emailSubject,
      html: emailHtml,
    })

    if (emailError) {
      console.error('Resend error:', emailError)
      return NextResponse.json(
        { error: 'Mesaj gönderilirken bir hata oluştu' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Mesaj gönderilirken bir hata oluştu' },
      { status: 500 }
    )
  }
}

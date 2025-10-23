import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const createTransporter = () => {
  console.log('=== EMAIL CONFIGURATION DEBUG ===');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST || 'smtp.gmail.com');
  console.log('EMAIL_PORT:', process.env.EMAIL_PORT || 587);
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
  console.log('EMAIL_PASS length:', process.env.EMAIL_PASS?.length);
  console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
  console.log('=================================');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('ERROR: Email credentials are missing!');
    console.error('EMAIL_USER:', process.env.EMAIL_USER || 'NOT SET');
    console.error('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
  }
  
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    },
    debug: true,
    logger: true
  });
};

export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const sendVerificationEmail = async (userEmail, userName, verificationToken) => {
  try {
    console.log('Attempting to send verification email to:', userEmail);
    const transporter = createTransporter();
    
    try {
      await transporter.verify();
      console.log('Email server connection verified successfully');
    } catch (verifyError) {
      console.error('Email server verification failed:', verifyError);
      return { success: false, error: 'Email server connection failed: ' + verifyError.message };
    }
    
    //update: Use FRONTEND_URL from environment variable instead of hardcoded production URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email?token=${verificationToken}&email=${encodeURIComponent(userEmail)}`;
    
    console.log('Verification URL generated:', verificationUrl);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Montserrat', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f8f9fa;
              border-radius: 10px;
              padding: 30px;
              margin-top: 20px;
            }
            .header {
              text-align: center;
              color: #9747ff;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .content {
              background-color: white;
              padding: 25px;
              border-radius: 8px;
              margin-top: 20px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              margin: 20px 0;
              background-color: #9747ff;
              color: white !important;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .button:hover {
              background-color: #7431ca;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 12px;
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffc107;
              color: #856404;
              padding: 10px;
              border-radius: 5px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              Uribarri.Online
            </div>
            <div class="content">
              <h2>¡Hola ${userName}!</h2>
              <p>Gracias por registrarte en Uribarri.Online. Para completar tu registro y verificar tu dirección de correo electrónico, por favor haz clic en el siguiente botón:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verificar mi Email</a>
              </div>
              
              <p>O copia y pega este enlace en tu navegador:</p>
              <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 5px;">
                ${verificationUrl}
              </p>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong> Este enlace expirará en 24 horas. Si no solicitaste esta cuenta, puedes ignorar este correo.
              </div>
            </div>
            <div class="footer">
              <p>© 2024 Uribarri.Online - Gestión de pedidos y reservas online</p>
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const textContent = `
      Hola ${userName}!
      
      Gracias por registrarte en Uribarri.Online.
      
      Para verificar tu correo electrónico, visita el siguiente enlace:
      ${verificationUrl}
      
      Este enlace expirará en 24 horas.
      
      Si no solicitaste esta cuenta, puedes ignorar este correo.
      
      Saludos,
      El equipo de Uribarri.Online
    `;
    
    const mailOptions = {
      from: `"Uribarri.Online" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '✅ Verifica tu correo electrónico - Uribarri.Online',
      text: textContent,
      html: htmlContent,
    };
    
    console.log('Sending email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Verification email sent successfully:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Error sending verification email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response
    });
    return { success: false, error: error.message };
  }
};

export const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    console.log('Sending welcome email to:', userEmail);
    const transporter = createTransporter();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Montserrat', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f8f9fa;
              border-radius: 10px;
              padding: 30px;
            }
            .header {
              text-align: center;
              color: #9747ff;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .content {
              background-color: white;
              padding: 25px;
              border-radius: 8px;
              margin-top: 20px;
            }
            .success-icon {
              text-align: center;
              font-size: 48px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              Uribarri.Online
            </div>
            <div class="content">
              <div class="success-icon">🎉</div>
              <h2>¡Bienvenid@ ${userName}!</h2>
              <p>Tu cuenta ha sido verificada exitosamente. Ya puedes disfrutar de todos los servicios de Uribarri.Online.</p>
              
              <h3>¿Qué puedes hacer ahora?</h3>
              <ul>
                <li>Explorar tiendas locales en tu área</li>
                <li>Realizar pedidos online</li>
                <li>Hacer reservas en tus establecimientos favoritos</li>
                <li>Acceder a ofertas exclusivas</li>
              </ul>
              
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
              
              <p>¡Esperamos que disfrutes tu experiencia!</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const mailOptions = {
      from: `"Uribarri.Online" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🎉 ¡Bienvenid@ a Uribarri.Online!',
      html: htmlContent,
    };
    
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully to:', userEmail);
    
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

export const sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
  try {
    console.log('Attempting to send password reset email to:', userEmail);
    const transporter = createTransporter();
    
    try {
      await transporter.verify();
      console.log('Email server connection verified successfully');
    } catch (verifyError) {
      console.error('Email server verification failed:', verifyError);
      return { success: false, error: 'Email server connection failed: ' + verifyError.message };
    }
    
    //update: Use FRONTEND_URL from environment variable instead of hardcoded production URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(userEmail)}`;
    
    console.log('Password reset URL generated:', resetUrl);
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Montserrat', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f8f9fa;
              border-radius: 10px;
              padding: 30px;
              margin-top: 20px;
            }
            .header {
              text-align: center;
              color: #9747ff;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .content {
              background-color: white;
              padding: 25px;
              border-radius: 8px;
              margin-top: 20px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              margin: 20px 0;
              background-color: #9747ff;
              color: white !important;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .button:hover {
              background-color: #7431ca;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 12px;
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffc107;
              color: #856404;
              padding: 10px;
              border-radius: 5px;
              margin-top: 20px;
            }
            .security-notice {
              background-color: #d1ecf1;
              border: 1px solid #bee5eb;
              color: #0c5460;
              padding: 10px;
              border-radius: 5px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              Uribarri.Online
            </div>
            <div class="content">
              <h2>¡Hola ${userName}!</h2>
              <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Uribarri.Online.</p>
              
              <p>Para restablecer tu contraseña, por favor haz clic en el siguiente botón:</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
              </div>
              
              <p>O copia y pega este enlace en tu navegador:</p>
              <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 5px;">
                ${resetUrl}
              </p>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong> Este enlace expirará en 1 hora por motivos de seguridad.
              </div>
              
              <div class="security-notice">
                <strong>🔒 Nota de Seguridad:</strong> Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura. Tu contraseña actual no se verá afectada.
              </div>
            </div>
            <div class="footer">
              <p>© 2024 Uribarri.Online - Gestión de pedidos y reservas online</p>
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    const textContent = `
      Hola ${userName}!
      
      Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Uribarri.Online.
      
      Para restablecer tu contraseña, visita el siguiente enlace:
      ${resetUrl}
      
      Este enlace expirará en 1 hora por motivos de seguridad.
      
      Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura.
      
      Saludos,
      El equipo de Uribarri.Online
    `;
    
    const mailOptions = {
      from: `"Uribarri.Online" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🔑 Restablece tu contraseña - Uribarri.Online',
      text: textContent,
      html: htmlContent,
    };
    
    console.log('Sending password reset email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Password reset email sent successfully:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
    return { success: true, messageId: info.messageId };
    
  } catch (error) {
    console.error('Error sending password reset email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response
    });
    return { success: false, error: error.message };
  }
};

export const sendContactShopOwnerEmail = async (senderName, senderEmail, recipientEmail, shopName, message, subject = '') => {
  try {
    console.log('Attempting to send contact email to shop owner:', recipientEmail);
    const transporter = createTransporter();

    try {
      await transporter.verify();
      console.log('Email server connection verified successfully');
    } catch (verifyError) {
      console.error('Email server verification failed:', verifyError);
      return { success: false, error: 'Email server connection failed: ' + verifyError.message };
    }

    const emailSubject = subject || `Mensaje de ${senderName} sobre ${shopName}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: 'Montserrat', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f8f9fa;
              border-radius: 10px;
              padding: 30px;
              margin-top: 20px;
            }
            .header {
              text-align: center;
              color: #9747ff;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .content {
              background-color: white;
              padding: 25px;
              border-radius: 8px;
              margin-top: 20px;
            }
            .shop-name {
              color: #9747ff;
              font-weight: bold;
              font-size: 18px;
              margin-bottom: 15px;
            }
            .sender-info {
              background-color: #f0f0f0;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .message-box {
              background-color: #f8f9fa;
              padding: 20px;
              border-left: 4px solid #9747ff;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
            .note {
              background-color: #fff3cd;
              padding: 15px;
              border-radius: 5px;
              border-left: 4px solid #ffc107;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              💬 Nuevo Mensaje
            </div>
            <div class="content">
              <div class="shop-name">
                📍 Sobre tu comercio: ${shopName}
              </div>

              <p>Has recibido un nuevo mensaje a través de Uribarri.Online:</p>

              <div class="sender-info">
                <strong>👤 De:</strong> ${senderName}<br>
                <strong>📧 Email:</strong> ${senderEmail}
              </div>

              <div class="message-box">
                <strong>Mensaje:</strong><br><br>
                ${message.replace(/\n/g, '<br>')}
              </div>

              <div class="note">
                <strong>💡 Nota:</strong> Puedes responder directamente a este correo para contactar con ${senderName}.
              </div>
            </div>
            <div class="footer">
              <p>© 2024 Uribarri.Online - Conectando comercios locales con la comunidad</p>
              <p>Este mensaje fue enviado a través de la plataforma Uribarri.Online</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const textContent = `
      Nuevo mensaje sobre tu comercio: ${shopName}

      De: ${senderName}
      Email: ${senderEmail}

      Mensaje:
      ${message}

      ---
      Puedes responder directamente a este correo para contactar con ${senderName}.

      Saludos,
      El equipo de Uribarri.Online
    `;

    const mailOptions = {
      from: `"Uribarri.Online" <${process.env.EMAIL_USER}>`,
      to: recipientEmail,
      replyTo: senderEmail,
      subject: emailSubject,
      text: textContent,
      html: htmlContent,
    };

    console.log('Sending contact email with options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      replyTo: mailOptions.replyTo,
      subject: mailOptions.subject
    });

    const info = await transporter.sendMail(mailOptions);

    console.log('Contact email sent successfully:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));

    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('Error sending contact email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response
    });
    return { success: false, error: error.message };
  }
};

export default {
  generateVerificationToken,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendContactShopOwnerEmail
};
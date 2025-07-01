const nodemailer = require("nodemailer");

const isProduction = process.env.NODE_ENV == "production" ? 
    process.env.REMOTE_CLIENT_APP : 
    process.env.LOCAL_CLIENT_APP; 

exports.sendCompanyOnBoardEmail = async (name, email) => {

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.EMAIL_TEST_USER,
          pass: process.env.EMAIL_TEST_PASS,
      },
  });

  const mailOptions = {
      from: "Lingo Ekperi", 
      to: email,
      subject: 'Congratulations on onboarding!',
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Congratulations on onboarding!</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f5f5f5;
                  color: black; /* Default text color for light mode */
              }
              @media (prefers-color-scheme: dark) {
                  /* Dark mode styles */
                  body {
                      background-color: #fff; /* Dark background color */
                      color: #000; /* Text color for dark mode */
                  }
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #ffffff;
                  border: 1px solid #e0e0e0;
                  border-radius: 5px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              h2 {
                  font-size: 24px;
                  color: inherit;
              }
              p {
                  font-size: 16px;
                  line-height: 1.5;
                  color: inherit;
              }
          </style>
      </head>
      <body>
          <div class="container">
            <h1>Dear ${name},</h1>
            <p>Congratulations on joining our platform! We're thrilled to have you on board.</p>
            <p>Thanks for choosing <b>Lingo Ekperi</b></p>
            <p>Thank you for using our service.</p>
            <p>Best regards,<br><b>Lingo Ekperi</b></p>
          </div>
      </body>
      </html>`
  };

try{
  await transporter.sendMail(mailOptions);
} catch (error) {
  console.error({ error: 'Email could not be sent.' });
}
}


exports.sendVerificationEmail = async (firstname, email, verificationToken) => {

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_TEST_USER,
            pass: process.env.EMAIL_TEST_PASS,
        },
    });



    const mailOptions = {
        from: "Lingo Ekperi", 
        to: email,
        subject: 'Email Verification',
        html: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f5f5f5;
                    color: black; /* Default text color for light mode */
                }
                @media (prefers-color-scheme: dark) {
                    /* Dark mode styles */
                    body {
                        background-color: #fff; /* Dark background color */
                        color: #000; /* Text color for dark mode */
                    }
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border: 1px solid #e0e0e0;
                    border-radius: 5px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                h2 {
                    font-size: 24px;
                    color: inherit;
                }
                p {
                    font-size: 16px;
                    line-height: 1.5;
                    color: inherit;
                }

                .verify-btn {
                  background: #B2193F !important;
                  color: white !important;
                  font-size: 18px !important;
                  font-weight: 600 !important;
                  padding: 6px 14px !important;
                  border-radius: 10px !important;
                  text-decoration: none !important;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Email Verification</h2>
                <p>Hello ${firstname},</p>
                <p>Welcome to <b>Lingo Ekperi</b> To start enjoying all the benefits of our platform, please click the link below to verify your email address:</p>
                <p><a href="${isProduction}/auth/verify-email/${verificationToken.token}" class="verify-btn">Verify Email</a></p>
                <p>This link will expire soon, so don't wait. Verify your email now for uninterrupted access.</p>

                <p>If you need assistance or have questions, our support team is here to help at info@skillupacademy.com.</p>

                <p>Thanks for choosing <b>Lingo Ekperi</b></p>

                <p>Thank you for using our service.</p>
                <p>Best regards,<br><b>Lingo Ekperi</b></p>
            </div>
        </body>
        </html>`
    };

  try{
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error({ error: 'Email could not be sent.' });
  }
}


exports.sendUserVerificationEmail = async (firstname, email, verificationToken, password, company, role) => {

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.EMAIL_TEST_USER,
          pass: process.env.EMAIL_TEST_PASS,
      },
  });

  const mailOptions = {
      from: "Lingo Ekperi", 
      to: email,
      subject: 'Email Verification',
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  background-color: #f5f5f5;
                  color: black; /* Default text color for light mode */
              }
              @media (prefers-color-scheme: dark) {
                  /* Dark mode styles */
                  body {
                      background-color: #fff; /* Dark background color */
                      color: #000; /* Text color for dark mode */
                  }
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #ffffff;
                  border: 1px solid #e0e0e0;
                  border-radius: 5px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              h2 {
                  font-size: 24px;
                  color: inherit;
              }
              p {
                  font-size: 16px;
                  line-height: 1.5;
                  color: inherit;
              }

              .verify-btn {
                background: #B2193F !important;
                color: white !important;
                font-size: 18px !important;
                font-weight: 600 !important;
                padding: 6px 14px !important;
                border-radius: 10px !important;
                text-decoration: none !important;
              }
          </style>
      </head>
      <body>
        <div class="container">
            <h2>Email and Password Details</h2>
            <p>Hello ${firstname},</p>
            <p>Welcome to <b>Lingo Ekperi</b>! You've been successfully added as a <b>${role}</b> by <b>${company}</b> on our platform.</p>
            <p>Below are your default login credentials:</p>
            <ul>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Password:</strong> ${password}</li>
            </ul>
            <p>To start accessing our platform, please click the link below to verify your email address:</p>
            <p><a href="${isProduction}/auth/verify-email/${verificationToken}" class="verify-btn">Verify Email</a></p>
            <p>Remember, this link will expire soon, so it's best to verify your email now for uninterrupted access.</p>
            <p>If you need any assistance or have questions, feel free to contact our support team at info@skillupacademy.com.</p>
            <p>Thank you for choosing <b>Lingo Ekperi</b>!</p>
            <p>Best regards,<br><b>Lingo Ekperi</b></p>
        </div>
     </body>
      </html>`
  };

    try{
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error:", 'Email could not be sent.');
    }
}



exports.sendUserVerificationEmail = async (firstname, email, verificationToken, password, company, role) => {

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.EMAIL_TEST_USER,
          pass: process.env.EMAIL_TEST_PASS,
      },
    });

    const mailOptions = {
        from: "Lingo Ekperi",
        to: email,
        subject: 'Welcome to Lingo Ekperi - Account Details and Verification',
        html: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Lingo Ekperi</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f5f5f5;
                    color: black;
                }
                @media (prefers-color-scheme: dark) {
                    body {
                        background-color: #fff;
                        color: #000;
                    }
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border: 1px solid #e0e0e0;
                    border-radius: 5px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                h2 {
                    font-size: 24px;
                    color: inherit;
                }
                p {
                    font-size: 16px;
                    line-height: 1.5;
                    color: inherit;
                }
                .verify-btn {
                    background: #B2193F !important;
                    color: white !important;
                    font-size: 18px !important;
                    font-weight: 600 !important;
                    padding: 6px 14px !important;
                    border-radius: 10px !important;
                    text-decoration: none !important;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Welcome to Lingo Ekperi</h2>
                <p>Hello ${firstname},</p>
                <p>Your account has been created. Below are your login credentials:</p>
                <ul>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Generated Password:</strong> ${password}</li>
                </ul>
                <p>To start using your account, please verify your email address by clicking the link below:</p>
                <p><a href="${isProduction}/auth/verify-email/${verificationToken}" class="verify-btn">Verify Email</a></p>
                <p>This verification link will expire soon, so please verify your email promptly to ensure uninterrupted access.</p>
                <p>If you have any questions or need assistance, contact our support team at info@skillupacademy.com.</p>
                <p>Thank you for joining <b>Lingo Ekperi</b>!</p>
                <p>Best regards,<br><b>Lingo Ekperi</b></p>
            </div>
        </body>
        </html>`
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Error:", 'Email could not be sent.');
    }
}

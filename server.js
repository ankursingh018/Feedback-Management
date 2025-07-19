require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your app password
  },
});

// Test email configuration
app.get('/test-email', async (req, res) => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    res.json({
      message: 'Test email configuration successful',
      testAccount
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Failed to test email configuration' });
  }
});

// Send survey email endpoint
app.post('/api/send-survey-email', async (req, res) => {
  try {
    const { from, to, subject, message, surveyId, surveyTitle } = req.body;

    if (!from || !to || !Array.isArray(to) || to.length === 0 || !subject || !message || !surveyId) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['from', 'to', 'subject', 'message', 'surveyId']
      });
    }

    // Generate survey URL
    const surveyUrl = `${process.env.FRONTEND_URL || 'http://localhost'}/take-survey.html?id=${surveyId}`;
    
    // Replace [Survey Link] in the message with the actual URL
    const emailHtml = message.replace(
      /\[Survey Link\]/g, 
      `<a href="${surveyUrl}" target="_blank">${surveyTitle || 'Take the survey'}</a>`
    );

    // Send email to each recipient
    const sendPromises = to.map(recipient => {
      return transporter.sendMail({
        from: from,
        to: recipient,
        subject: subject,
        html: emailHtml,
        text: emailHtml.replace(/<[^>]*>?/gm, ''), // Fallback text version
      });
    });

    await Promise.all(sendPromises);
    
    res.json({ 
      success: true, 
      message: `Survey links sent to ${to.length} recipient(s)`,
      surveyUrl
    });

  } catch (error) {
    console.error('Error sending survey emails:', error);
    res.status(500).json({ 
      error: 'Failed to send survey emails',
      details: error.message 
    });
  }
});

// Serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

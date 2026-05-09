const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const app = express();
app.use(cors());
app.use(bodyParser.json());

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});

let fcmTokens = {};

app.post('/register-token', (req, res) => {
  const { token, phone } = req.body;
  fcmTokens[phone] = token;
  console.log(`Token registered for ${phone}`);
  res.json({ success: true });
});

app.post('/send-notification', async (req, res) => {
  const { phone, title, body } = req.body;
  try {
    const token = fcmTokens[phone];
    if (!token) {
      return res.json({ success: false, message: 'No token for this phone' });
    }
    
    await admin.messaging().send({
      token: token,
      notification: {
        title: title,
        body: body
      },
      android: {
        notification: {
          channelId: 'superburger',
          title: title,
          body: body,
          icon: 'ic_notification',
          color: '#F5C518'
        }
      }
    });
    
    console.log(`Notification sent to ${phone}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error:', error.message);
    res.json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountCredentials.json');

const app = express();
app.use(cors());
app.use(bodyParser.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let fcmTokens = {};

app.post('/register-token', (req, res) => {
  const { token, phone } = req.body;
  fcmTokens[phone] = token;
  res.json({ success: true });
});

app.post('/send-notification', async (req, res) => {
  const { phone, title, body } = req.body;
  try {
    const token = fcmTokens[phone];
    if (!token) return res.json({ success: false, message: 'No token' });
    
    await admin.messaging().send({
      token: token,
      notification: { title, body },
      android: { notification: { channelId: 'superburger', title, body, icon: 'ic_notification', color: '#F5C518' } }
    });
    
    res.json({ success: true });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

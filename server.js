const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountCredentials.json', 'utf8'));

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
    if (!token) return res.json({ success: false });
    await admin.messaging().send({
      token: token,
      notification: { title, body },
      android: { notification: { channelId: 'superburger', title, body } }
    });
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false });
  }
});

app.listen(3000, () => console.log('Server running!'));

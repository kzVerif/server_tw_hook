const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(bodyParser.json());

let webhookData = [];

app.post('/webhook', (req, res) => {
    if (req.method === 'POST') {
        const token = req.body; // Extract the token from the body

        // Decode the JWT
        const decode = jwt.decode(token.message);

        // ตรวจสอบถ้าจำนวนมีแค่ 1 หรือ 2 หลัก
        if (decode.amount.toString().length === 2 || decode.amount.toString().length === 1) {
            decode.amount = "0." + decode.amount.toString();  // เปลี่ยนให้เป็นทศนิยม
            decode.amount = +decode.amount;  // แปลงให้เป็นตัวเลข
        } else {
            const amountStr = decode.amount.toString();
            // ใช้ slice เพื่อตัดเลข 2 ตัวสุดท้ายและแทรกจุดทศนิยม
            decode.amount = amountStr.slice(0, -2) + '.' + amountStr.slice(-2);
            decode.amount = +decode.amount;  // แปลงให้เป็นตัวเลข
        }
        
        console.log(decode.amount);  // แสดงผลจำนวนเงินหลังจากปรับ

        webhookData.push(decode);

        if (decode) {
            res.status(200).json({ message: 'success', decoded: decode });
        } else {
            console.error('Failed to decode the JWT. Ensure the token is valid.');
            res.status(400).send('Invalid JWT');
        }
    } else {
        res.status(400).send('Invalid request method');
    }
});


app.get('/data', (req, res) => {
    res.status(200).json(webhookData);
});

app.delete('/clear', (req, res) => {
    webhookData = [];
    res.status(200).json({ message: 'success', status: 'deleted' }); // Respond with confirmation
});

const PORT = 3002; // Specify the port number
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

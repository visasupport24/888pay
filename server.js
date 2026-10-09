const express = require('express');
const path = require('path');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// একই ফোল্ডারে থাকা ফ্রন্ট-এন্ড ফাইলগুলোর জন্য এক্সেস তৈরি
app.use(express.static(__dirname));

// Aiven.io ডেটাবেস কানেকশন পুল
const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
});
const db = pool.promise();

// ১. রেজিস্ট্রেশন এপিআই (POST: /api/auth/register)
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "সবগুলো ঘর পূরণ করুন!" });
    }

    try {
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, balance) VALUES (?, ?, ?, 0.00)', 
            [name, email, password]
        );
        res.status(201).json({ success: true, message: "নিবন্ধন সফল হয়েছে!", userId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "এই ইমেইলটি অলরেডি ব্যবহার করা হয়েছে।" });
        }
        res.status(500).json({ error: "সার্ভারে সমস্যা হয়েছে: " + error.message });
    }
});

// ২. লগইন এপিআই (POST: /api/auth/login)
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
        
        if (rows.length === 0) {
            return res.status(401).json({ error: "ইমেইল বা পাসওয়ার্ড ভুল!" });
        }

        const user = rows[0];
        res.status(200).json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                balance: user.balance
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// মূল পেজ লোড করার জন্য রাউট
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running successfully on port ${PORT}`);
});

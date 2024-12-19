const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const port = 3000;

// 啟用 CORS 支援
app.use(cors());

// 啟用 JSON Body Parsing
app.use(express.json());

// 資料庫連接
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'MySQl1127.',
    database: 'SAD'
});

// 檢查資料庫連接
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1); // 無法連接時結束程序
    }
    console.log('Connected to the database');
});

// API 路由
app.get('/api/user', (req, res) => {
    db.query('SELECT * FROM user', (err, results) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).send('Database error');
        } else {
            res.json(results);
        }
    });
});

app.put('/api/user', (req, res) => {
    const userId = req.params.id;
    const { name, image, introduction } = req.body;

    if (!name && !image && !introduction) {
        return res.status(400).send('沒有更新任何資料');
    }

    const fields = [];
    const values = [];
    if (name) {
        fields.push('name = ?');
        values.push(name);
    }
    if (image) {
        fields.push('image = ?');
        values.push(image);
    }
    if (introduction) {
        fields.push('introduction = ?');
        values.push(introduction);
    }
    values.push(userId);

    const query = `UPDATE user SET ${fields.join(', ')} WHERE id = ?`;

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).send('Error updating user');
        }
        if (results.affectedRows === 0) {
            return res.status(404).send('User not found');
        }
        res.send('User updated successfully');
    });
});

//註冊 已完成
app.post('/api/register', async (req, res) => {
    const { name, email, password, gender, birthday, image, introduction } = req.body;

    if (!name || !gender || !password) {
        return res.status(400).send('Name, gender, and password are required.');
    }

    if (!['male', 'female', 'other'].includes(gender)) {
        return res.status(400).send('Invalid gender value.');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO user (name, email, password, gender, birthday, image, introduction) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            name,
            email,
            hashedPassword,
            gender,
            birthday,
            image || null,
            introduction || null
        ];

        db.query(query, values, (err, results) => {
            if (err) {
                console.error('Error inserting user:', err);
                return res.status(500).send('Error registering user.');
            }
            res.status(201).send('User registered successfully.');
        });
    } catch (error) {
        console.error('Error hashing password:', error);
        res.status(500).send('Server error.');
    }
  });

  //登入
  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM user WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).send('Server error.');
        }

        if (results.length === 0) {
            return res.status(404).send('User not found.');
        }

        const user = results[0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).send('Invalid email or password.');
        }

        res.status(200).send({ message: 'Login successful', userId: user.id });
        });
    });


// 啟動伺服器
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

// 資料庫連接
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'MySQl1127.',
    database: 'SAD'
});

// API 路由
app.get('/api/users', (req, res) => {
    db.query('SELECT * FROM user', (err, results) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).send('Database error');
        } else {
            res.json(results);
        }
    });
});

app.put('/api/users', (req, res) => {
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

//註冊
app.post('/api/register', async (req, res) => {
    const { name, gender, email, birthday, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (name, gender, email, birthday, password) VALUES (?, ?, ?, ?, ?)', [name, gender, email, birthday, password], (err) => {
      if (err) return res.status(500).send(err);
      res.status(201).send('User registered');
    });
  });


// 啟動伺服器
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

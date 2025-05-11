const multer = require('multer');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = 5050;
const pool = new Pool({
  user: 'authuser',
  host: 'localhost',
  database: 'authdb',
  password: 'secret123',
  port: 5432,
});

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());


// Avatar upload setup
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({ storage });

app.use('/uploads', express.static(uploadDir));


const SECRET = 'your_jwt_secret'; 

function authenticateToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.sendStatus(401);
  try {
    const payload = jwt.verify(auth.split(' ')[1], SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.sendStatus(403);
  }
}

// Register
app.post('/api/register', async (req, res) => {
  const { email, username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    await pool.query(
      'INSERT INTO users (email, username, password) VALUES ($1, $2, $3)',
      [email, username, hashed]
    );
    res.status(201).send('User registered');
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '1h' });
  res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
});

// Auth check
app.get('/api/me', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, email, avatar FROM users WHERE id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});


// Avatar upload endpoint
app.post('/api/upload-avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  const avatarUrl = `/uploads/${req.file.filename}`;
  try {
    await pool.query('UPDATE users SET avatar = $1 WHERE id = $2', [avatarUrl, req.user.id]);
    res.json({ avatar: avatarUrl });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Profile update endpoint
app.put('/api/update-profile', authenticateToken, async (req, res) => {
  const { email, username, currentPassword, newPassword } = req.body;

  try {
    const updates = [];
    const values = [];
    let idx = 1;

    if (email) {
      updates.push(`email = $${idx++}`);
      values.push(email);
    }

    if (username) {
      updates.push(`username = $${idx++}`);
      values.push(username);
    }

    if (newPassword) {
      const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
      const user = userResult.rows[0];
      const isValid = await bcrypt.compare(currentPassword || '', user.password);
      if (!isValid) {
        return res.status(403).json({ error: 'Current password is incorrect' });
      }
      const hashed = await bcrypt.hash(newPassword, 10);
      updates.push(`password = $${idx++}`);
      values.push(hashed);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields provided to update' });
    }

    values.push(req.user.id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}`;
    await pool.query(query, values);

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.listen(port, () => console.log(`API running on http://localhost:${port}`));
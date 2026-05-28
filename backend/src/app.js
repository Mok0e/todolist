'use strict';

const { PORT, CORS_ORIGIN } = require('./config/env');

const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const auth = require('./middleware/auth');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const todoRoutes = require('./routes/todoRoutes');

const app = express();

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/categories', auth, categoryRoutes);
app.use('/todos', auth, todoRoutes);

app.use((req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: '요청한 리소스를 찾을 수 없습니다.' } });
});

app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

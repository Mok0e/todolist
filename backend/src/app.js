'use strict';

const { PORT, CORS_ORIGIN } = require('./config/env');

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});


if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

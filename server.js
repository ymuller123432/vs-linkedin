const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve all static files from the project root (index.html, bimi/logo.svg, etc.)
app.use(express.static(__dirname));

// Optional: explicit route for root to guarantee index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`VS LinkedIn site running on port ${port}`);
});

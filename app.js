const express  = require('express');
const sqlite3  = require('sqlite3').verbose();
const { nanoid } = require('nanoid');
const client   = require('prom-client');
const QRCode   = require('qrcode');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===============================
   PART 1 — PROMETHEUS METRICS
================================ */
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const urlsCreated = new client.Counter({
  name: 'smartlink_urls_created_total',
  help: 'Total short URLs created',
  registers: [register]
});

const urlsRedirected = new client.Counter({
  name: 'smartlink_redirects_total',
  help: 'Total URL redirections',
  registers: [register]
});

const urlsExpired = new client.Counter({
  name: 'smartlink_urls_expired_total',
  help: 'Total expired URLs deleted',
  registers: [register]
});

/* ===============================
   PART 2 — SQLITE DATABASE
================================ */
const db = new sqlite3.Database('./smartlink.db');

db.run(`
  CREATE TABLE IF NOT EXISTS urls (
    id         TEXT PRIMARY KEY,
    original   TEXT NOT NULL,
    clicks     INTEGER DEFAULT 0,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

/* ===============================
   PART 3 — AUTO CLEANUP CRON
================================ */
// Delete expired links every 60 seconds
setInterval(() => {
  db.run(
    'DELETE FROM urls WHERE expires_at IS NOT NULL AND expires_at < datetime("now")',
    function(err) {
      if (!err && this.changes > 0) {
        urlsExpired.inc(this.changes);
        console.log(`Cleaned up ${this.changes} expired link(s)`);
      }
    }
  );
}, 60000);

/* ===============================
   PART 4 — HOME PAGE
================================ */
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>SmartLink - Intelligent URL Platform</title>
      <style>
        body { font-family: Arial; max-width: 600px; margin: 60px auto; padding: 20px; }
        h1   { color: #1A237E; }
        input, select { width: 100%; padding: 10px; margin: 8px 0; box-sizing: border-box; }
        button { background: #1565C0; color: white; padding: 12px 30px; border: none; cursor: pointer; border-radius: 4px; }
        button:hover { background: #0D47A1; }
      </style>
    </head>
    <body>
      <h1>SmartLink Platform</h1>
      <p>Shorten URLs with QR codes and expiry control</p>
      <form method='POST' action='/shorten'>
        <label>Long URL:</label>
        <input name='url' placeholder='https://example.com/very/long/url' required />
        <label>Expiry:</label>
        <select name='expiry'>
          <option value='none'>No Expiry</option>
          <option value='24h'>24 Hours</option>
          <option value='7d'>7 Days</option>
        </select>
        <br/><br/>
        <button type='submit'>Generate SmartLink + QR Code</button>
      </form>
    </body>
    </html>
  `);
});

/* ===============================
   PART 5 — SHORTEN ROUTE + QR
================================ */
app.post('/shorten', async (req, res) => {
  const { url, expiry } = req.body;
  if (!url) return res.status(400).send('URL is required');

  const id = nanoid(6);
  let expiresAt = null;

  // Expiry logic
  if (expiry === '24h') {
    const d = new Date();
    d.setHours(d.getHours() + 24);
    expiresAt = d.toISOString();
  } else if (expiry === '7d') {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    expiresAt = d.toISOString();
  }

  db.run(
    'INSERT INTO urls (id, original, expires_at) VALUES (?, ?, ?)',
    [id, url, expiresAt],
    async (err) => {
      if (err) return res.status(500).send('Database error');

      urlsCreated.inc();
      const shortUrl = `http://${req.headers.host}/${id}`;

      // Generate QR code
      const qrDataUrl = await QRCode.toDataURL(shortUrl, { width: 200 });

      const expiryText = expiresAt
        ? `Expires: ${new Date(expiresAt).toLocaleString()}`
        : 'No expiry (permanent link)';

      res.send(`
        <!DOCTYPE html><html><head><title>SmartLink Created</title>
        <style>body{font-family:Arial;max-width:600px;margin:60px auto;padding:20px;}
        .box{background:#E3F2FD;padding:20px;border-radius:8px;margin:20px 0;}
        a{color:#1565C0;font-size:18px;font-weight:bold;}
        img{border:2px solid #1565C0;border-radius:8px;}</style></head>
        <body>
        <h2 style='color:#1A237E'>SmartLink Created!</h2>
        <div class='box'>
          <p>Short URL: <a href='${shortUrl}'>${shortUrl}</a></p>
          <p style='color:#555'>${expiryText}</p>
          <p><strong>QR Code:</strong></p>
          <img src='${qrDataUrl}' alt='QR Code' width='200' />
          <p style='font-size:13px;color:#888'>Scan to open the link on mobile</p>
        </div>
        <a href='/'>Shorten another URL</a>
        </body></html>
      `);
    }
  );
});

/* ===============================
   PART 6 — METRICS ENDPOINT
================================ */
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

/* ===============================
   PART 7 — REDIRECT ROUTE
================================ */
app.get('/:id', (req, res) => {
  db.get('SELECT * FROM urls WHERE id = ?', [req.params.id], (err, row) => {
    if (!row) {
      return res.status(404).send('<h2>Link not found or expired</h2><a href="/">Go Home</a>');
    }

    // Expiry check
    if (row.expires_at && new Date(row.expires_at) < new Date()) {
      db.run('DELETE FROM urls WHERE id = ?', [req.params.id]);
      urlsExpired.inc();
      return res.status(410).send('<h2>This link has expired</h2><a href="/">Go Home</a>');
    }

    // Track clicks
    db.run('UPDATE urls SET clicks = clicks + 1 WHERE id = ?', [req.params.id]);
    urlsRedirected.inc();

    res.redirect(row.original);
  });
});

/* ===============================
   START SERVER
================================ */
app.listen(3000, () => console.log('SmartLink running on port 3000'));
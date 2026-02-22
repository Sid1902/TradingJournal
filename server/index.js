require("dotenv").config();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = "supersecretkey";
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const multer = require("multer");
const path = require("path");

const app = express();

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (origin === process.env.FRONTEND_URL) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

// PostgreSQL connection
const pool1 = new Pool({
  user: "postgres",
  host: "localhost",
  database: "finance_db",
  password: "Password@123",
  port: 5432,
});
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

const upload = multer({ storage });

// Get all trades

app.get("/api/trades", authMiddleware, async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM trades WHERE user_id = $1 AND is_active = true ORDER BY id DESC",
    [req.user.id]
  );
  res.json(result.rows);
});

// Add trade with image

app.post("/api/trades", authMiddleware, upload.single("image"), async (req, res) => {
  const { symbol, entry_price, exit_price, quantity, notes } = req.body;

  const pnl = (exit_price - entry_price) * quantity;

  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  const result = await pool.query(
    `INSERT INTO trades 
    (symbol, entry_price, exit_price, quantity, notes, pnl, image_path, user_id) 
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *`,
    [
      symbol,
      entry_price,
      exit_price,
      quantity,
      notes,
      pnl,
      imagePath,
      req.user.id
    ]
  );

  res.json(result.rows[0]);
});

app.delete("/api/trades/:id", authMiddleware, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await pool.query(
      "UPDATE trades SET is_active = false WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );

    res.json({ message: "Soft deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed" });
  }
});
// Update trade
app.put("/api/trades/:id", async (req, res) => {
    const { symbol, entry_price, exit_price, quantity, notes } = req.body;
  
    const pnl = (exit_price - entry_price) * quantity;
  
    const result = await pool.query(
      `UPDATE trades 
       SET symbol=$1, entry_price=$2, exit_price=$3, quantity=$4, notes=$5, pnl=$6
       WHERE id=$7
       RETURNING *`,
      [symbol, entry_price, exit_price, quantity, notes, pnl, req.params.id]
    );
  
    res.json(result.rows[0]);
  });
  

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {});

const axios = require("axios");

// Search stock symbols
app.get("/api/stocks", async (req, res) => {
  try {
    const query = req.query.q || "";

    const response = await axios.get(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${query}&quotesCount=20&newsCount=0`
    );

    const stocks = response.data.quotes
      .filter((s) => s.exchange === "NSI")
      .map((s) => ({
        symbol: s.symbol.replace(".NS", ""),
        name: s.shortname,
      }));

    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: "Stock search failed" });
  }
});
// Get stock details
app.get("/api/stock/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol + ".NS";
  
      const response = await axios.get(
        `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=price,assetProfile`
      );
  
      const data = response.data.quoteSummary.result[0];
  
      res.json({
        name: data.price.shortName,
        sector: data.assetProfile?.sector || "N/A",
        price: data.price.regularMarketPrice.raw,
      });
    } catch (err) {
      res.status(500).json({ error: "Stock details failed" });
    }
  });

  app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING *",
      [name, email, hashedPassword]
    );

    res.json({ message: "User created" });
  } catch (err) {
    res.status(400).json({ error: "User already exists" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  if (result.rows.length === 0)
    return res.status(400).json({ error: "User not found" });

  const user = result.rows[0];

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch)
    return res.status(400).json({ error: "Invalid password" });

  const accessToken = jwt.sign(
  { id: user.id },
  JWT_SECRET,
  { expiresIn: "30m" }
);

const refreshToken = jwt.sign(
  { id: user.id },
  JWT_SECRET,
  { expiresIn: "7d" }
);

  res.json({ accessToken,
  refreshToken });
});

app.put(
  "/api/trades/:id/image",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    const imagePath = `/uploads/${req.file.filename}`;

    const result = await pool.query(
      "UPDATE trades SET image_path = $1 WHERE id = $2 RETURNING *",
      [imagePath, req.params.id]
    );

    res.json(result.rows[0]);
  }
);

app.post("/api/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(401).json({ error: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);

    const newAccessToken = jwt.sign(
      { id: decoded.id },
      JWT_SECRET,
      { expiresIn: "30m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
  }
});

const fs = require("fs");

app.delete("/api/trades/:id/image", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT image_path FROM trades WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );

    if (!result.rows.length)
      return res.status(404).json({ error: "Trade not found" });

    const imagePath = result.rows[0].image_path;

    // Remove file from uploads folder
    if (imagePath) {
      const fullPath = path.join(__dirname, imagePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    // Remove image_path from DB
    await pool.query(
      "UPDATE trades SET image_path = NULL WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );

    res.json({ message: "Image deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Image delete failed" });
  }
});
  
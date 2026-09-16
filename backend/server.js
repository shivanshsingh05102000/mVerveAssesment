const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
require("dotenv").config();

const customerRoutes = require("./routes/customerRoutes");

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, "customers.db");

app.use(cors());
app.use(express.json());

app.use((error, req, res, next) => {
  // Note to self: keep bad JSON responses as JSON, otherwise Express returns an HTML error page.
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "Invalid JSON body." });
  }

  next(error);
});

const db = new sqlite3.Database(DB_FILE);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      company TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Active', 'Inactive')),
      created_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) reject(error);
      else resolve(this);
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) reject(error);
      else resolve(row);
    });
  });
}

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) reject(error);
      else resolve(rows);
    });
  });
}

function validateCustomer(data) {
  const errors = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long.");
  }

  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
    errors.push("Valid email is required.");
  }

  if (!data.phone || data.phone.trim().length < 7) {
    errors.push("Phone number must be at least 7 characters long.");
  }

  if (!data.company || data.company.trim().length < 2) {
    errors.push("Company must be at least 2 characters long.");
  }

  if (!["Active", "Inactive"].includes(data.status)) {
    errors.push("Status must be Active or Inactive.");
  }

  return errors;
}

app.get("/", (req, res) => {
  res.send("Customer Management API is running.");
});

app.use(
  "/api/customers",
  customerRoutes({ runQuery, getQuery, allQuery, validateCustomer })
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

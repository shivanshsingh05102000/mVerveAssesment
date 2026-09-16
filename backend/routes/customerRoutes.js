const express = require("express");

function customerRoutes({ runQuery, getQuery, allQuery, validateCustomer }) {
  const router = express.Router();

  function hasValidId(req, res) {
    if (/^\d+$/.test(req.params.id)) {
      return true;
    }

    res.status(400).json({ message: "Customer id must be a number." });
    return false;
  }

  router.get("/", async (req, res) => {
    try {
      const search = req.query.search || "";
      const page = Math.max(parseInt(req.query.page) || 1, 1);
      const limit = Math.max(parseInt(req.query.limit) || 5, 1);
      const offset = (page - 1) * limit;

      // Note to self: column names cannot be parameterized, so only allow known sort fields.
      const allowedSortFields = [
        "name",
        "email",
        "company",
        "status",
        "created_date",
      ];

      const sortBy = allowedSortFields.includes(req.query.sortBy)
        ? req.query.sortBy
        : "created_date";

      const order = req.query.order === "asc" ? "ASC" : "DESC";
      const searchValue = `%${search}%`;

      const customers = await allQuery(
        `
        SELECT * FROM customers
        WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ? OR status LIKE ?
        ORDER BY ${sortBy} ${order}
        LIMIT ? OFFSET ?
        `,
        [
          searchValue,
          searchValue,
          searchValue,
          searchValue,
          searchValue,
          limit,
          offset,
        ]
      );

      const totalRow = await getQuery(
        `
        SELECT COUNT(*) AS total FROM customers
        WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? OR company LIKE ? OR status LIKE ?
        `,
        [searchValue, searchValue, searchValue, searchValue, searchValue]
      );

      res.json({
        customers,
        page,
        limit,
        total: totalRow.total,
        totalPages: Math.ceil(totalRow.total / limit),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customers." });
    }
  });

  router.get("/:id", async (req, res) => {
    try {
      if (!hasValidId(req, res)) return;

      const customer = await getQuery("SELECT * FROM customers WHERE id = ?", [
        req.params.id,
      ]);

      if (!customer) {
        return res.status(404).json({ message: "Customer not found." });
      }

      res.json(customer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch customer." });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const errors = validateCustomer(req.body);

      if (errors.length > 0) {
        return res.status(400).json({ message: "Invalid input.", errors });
      }

      const { name, email, phone, company, status } = req.body;

      const result = await runQuery(
        `
        INSERT INTO customers (name, email, phone, company, status)
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          name.trim(),
          email.trim().toLowerCase(),
          phone.trim(),
          company.trim(),
          status,
        ]
      );

      const newCustomer = await getQuery("SELECT * FROM customers WHERE id = ?", [
        result.lastID,
      ]);

      res.status(201).json(newCustomer);
    } catch (error) {
      if (error.message.includes("UNIQUE")) {
        return res.status(409).json({ message: "Email already exists." });
      }

      res.status(500).json({ message: "Failed to create customer." });
    }
  });

  router.put("/:id", async (req, res) => {
    try {
      if (!hasValidId(req, res)) return;

      const errors = validateCustomer(req.body);

      if (errors.length > 0) {
        return res.status(400).json({ message: "Invalid input.", errors });
      }

      const existingCustomer = await getQuery(
        "SELECT * FROM customers WHERE id = ?",
        [req.params.id]
      );

      if (!existingCustomer) {
        return res.status(404).json({ message: "Customer not found." });
      }

      const { name, email, phone, company, status } = req.body;

      await runQuery(
        `
        UPDATE customers
        SET name = ?, email = ?, phone = ?, company = ?, status = ?
        WHERE id = ?
        `,
        [
          name.trim(),
          email.trim().toLowerCase(),
          phone.trim(),
          company.trim(),
          status,
          req.params.id,
        ]
      );

      const updatedCustomer = await getQuery(
        "SELECT * FROM customers WHERE id = ?",
        [req.params.id]
      );

      res.json(updatedCustomer);
    } catch (error) {
      if (error.message.includes("UNIQUE")) {
        return res.status(409).json({ message: "Email already exists." });
      }

      res.status(500).json({ message: "Failed to update customer." });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      if (!hasValidId(req, res)) return;

      const result = await runQuery("DELETE FROM customers WHERE id = ?", [
        req.params.id,
      ]);

      if (result.changes === 0) {
        return res.status(404).json({ message: "Customer not found." });
      }

      res.json({ message: "Customer deleted successfully." });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete customer." });
    }
  });

  return router;
}

module.exports = customerRoutes;

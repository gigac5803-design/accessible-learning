const express = require("express");
const cors = require("cors");
const { items, validateAndCreateItem } = require("./data");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/api/status", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/items", (req, res) => {
  res.json(items);
});

app.post("/api/items", (req, res) => {
  const { error, item } = validateAndCreateItem(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  items.push(item);
  res.status(201).json(item);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
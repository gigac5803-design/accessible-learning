require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {
  items,
  validateAndCreateItem,
  validateAndUpdateItem
} = require("./data");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Проверка работы сервера
app.get("/api/status", (req, res) => {
  res.json({ status: "ok" });
});

// PART 1: REST API (GET, POST, PATCH, DELETE)
app.get("/api/items", (req, res) => {
  res.json(items);
});

app.get("/api/items/:id", (req, res) => {
  const id = Number(req.params.id);
  const item = items.find((currentItem) => currentItem.id === id);

  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }

  res.json(item);
});

app.post("/api/items", (req, res) => {
  const { error, item } = validateAndCreateItem(req.body);

  if (error) {
    return res.status(400).json({ error });
  }

  items.push(item);
  res.status(201).json(item);
});

app.patch("/api/items/:id", (req, res) => {
  const id = Number(req.params.id);
  const item = items.find((currentItem) => currentItem.id === id);

  if (!item) {
    return res.status(404).json({ error: "Item not found" });
  }

  const { error, updates } = validateAndUpdateItem(req.body);
  if (error) {
    return res.status(400).json({ error });
  }

  Object.assign(item, updates);
  res.status(200).json(item);
});

app.delete("/api/items/:id", (req, res) => {
  const id = Number(req.params.id);
  const filteredItems = items.filter((item) => item.id !== id);

  if (filteredItems.length === items.length) {
    return res.status(404).json({ error: "Item not found" });
  }

  items.splice(0, items.length, ...filteredItems);
  res.status(204).send();
});

// PART 2: External Public API (Free Dictionary API)
app.get("/api/dictionary/:word", async (req, res) => {
  const word = req.params.word.trim().toLowerCase();

  if (!word || !/^[a-z-]+$/.test(word)) {
    return res.status(400).json({ error: "Please enter a valid English word." });
  }

  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    );

    if (response.status === 404) {
      return res.status(404).json({ error: `Word "${word}" not found in dictionary.` });
    }

    if (!response.ok) {
      return res.status(502).json({ error: "Dictionary service is temporarily unavailable." });
    }

    const data = await response.json();
    const entry = data[0];
    const firstMeaning = entry.meanings?.[0];
    const firstDef = firstMeaning?.definitions?.[0];
    const audioEntry = entry.phonetics?.find((p) => p.audio && p.audio.trim() !== "");

    res.status(200).json({
      word: entry.word,
      phonetic: entry.phonetic || audioEntry?.text || "",
      audioUrl: audioEntry?.audio || "",
      partOfSpeech: firstMeaning?.partOfSpeech || "",
      definition: firstDef?.definition || "No definition available.",
      example: firstDef?.example || ""
    });
  } catch (err) {
    console.error("Dictionary API error:", err);
    res.status(500).json({ error: "Failed to fetch word definition." });
  }
});

// PART 3: AI Feature (Transformers.js local backend model)
let simplifierPipeline = null;

async function getSimplifier() {
  if (!simplifierPipeline) {
    const { pipeline } = await import("@huggingface/transformers");
    simplifierPipeline = await pipeline(
      "text2text-generation",
      "Xenova/flan-t5-small"
    );
  }
  return simplifierPipeline;
}

app.post("/api/ai/simplify", async (req, res) => {
  const { title, description } = req.body || {};

  if (!description || typeof description !== "string" || description.trim() === "") {
    return res.status(400).json({ error: "Description text is required for AI simplification." });
  }

  try {
    const simplifier = await getSimplifier();
    const prompt = `Rewrite this study note in very simple, short words so it is easy to read: ${title ? title + ". " : ""}${description.trim()}`;

    const output = await simplifier(prompt, {
      max_new_tokens: 60,
      do_sample: false
    });

    const simplifiedText = output?.[0]?.generated_text?.trim();

    if (!simplifiedText) {
      return res.status(502).json({ error: "AI returned an empty response." });
    }

    res.status(200).json({
      simplifiedText,
      model: "Xenova/flan-t5-small (Transformers.js)"
    });
  } catch (err) {
    console.error("Transformers.js AI error:", err);
    res.status(500).json({ error: "Failed to run AI simplification." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
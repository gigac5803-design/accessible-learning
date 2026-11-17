const items = [
  {
    id: 1,
    title: "Dyslexia-Friendly Reading Guide",
    category: "Reading Tools",
    description: "Tips on spacing, font size, and contrast for comfortable reading."
  },
  {
    id: 2,
    title: "Text-to-Speech Audio Helper",
    category: "Audio Support",
    description: "Convert study notes into clear, paced audio lessons."
  },
  {
    id: 3,
    title: "Simplified Study Notes",
    category: "Learning Materials",
    description: "Structured summaries broken into short, easy-to-scan blocks."
  }
];

function validateAndCreateItem(body) {
  if (!body || typeof body.title !== "string" || body.title.trim() === "") {
    return { error: "Title is required" };
  }

  const newItem = {
    id: Date.now(),
    title: body.title.trim(),
    category:
      typeof body.category === "string" && body.category.trim()
        ? body.category.trim()
        : "General",
    description:
      typeof body.description === "string" && body.description.trim()
        ? body.description.trim()
        : "No description provided."
  };

  return { item: newItem };
}

function validateAndUpdateItem(body) {
  if (!body || typeof body !== "object") {
    return { error: "Invalid request body" };
  }

  const updates = {};

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim() === "") {
      return { error: "Title must be a non-empty string" };
    }
    updates.title = body.title.trim();
  }

  if (body.category !== undefined) {
    if (typeof body.category !== "string" || body.category.trim() === "") {
      return { error: "Category must be a non-empty string" };
    }
    updates.category = body.category.trim();
  }

  if (body.description !== undefined) {
    if (typeof body.description !== "string" || body.description.trim() === "") {
      return { error: "Description must be a non-empty string" };
    }
    updates.description = body.description.trim();
  }

  if (Object.keys(updates).length === 0) {
    return { error: "Provide at least one field to update (title, category, or description)" };
  }

  return { updates };
}

module.exports = { items, validateAndCreateItem, validateAndUpdateItem };
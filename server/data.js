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
  if (!body || !body.title || body.title.trim() === "") {
    return { error: "Title is required" };
  }

  const newItem = {
    id: Date.now(),
    title: body.title.trim(),
    category: body.category ? body.category.trim() : "General",
    description: body.description ? body.description.trim() : "No description provided."
  };

  return { item: newItem };
}

module.exports = { items, validateAndCreateItem };
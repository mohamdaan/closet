const OpenAI = require("openai");
const pool = require("../db/db");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getSuggestions = async (req, res) => {
  const userId = req.userId;

  try {
    const itemsResult = await pool.query(
      `SELECT id, name, brand, category, description
       FROM items
       WHERE user_id = $1 AND item_type = 'WARDROBE'`,
      [userId]
    );

    const items = itemsResult.rows;

    if (items.length === 0) {
      return res.status(400).json({ error: "Add some items to your wardrobe first" });
    }

    const pastResult = await pool.query(
      `SELECT item_ids FROM outfit_suggestions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 10`,
      [userId]
    );

    const itemsById = Object.fromEntries(items.map((item) => [item.id, item]));

    const pastCombinations = pastResult.rows.map((row) =>
      row.item_ids.map((id) => itemsById[id]?.name || `item #${id}`).join(" + ")
    );

    const itemsList = items
      .map((item) => `[id:${item.id}] ${item.name} (${item.brand || "no brand"}, ${item.category || "uncategorized"})`)
      .join("\n");

    const avoidanceText = pastCombinations.length > 0
      ? `\n\nAvoid repeating these exact combinations I've already been shown:\n${pastCombinations.map((c) => `- ${c}`).join("\n")}`
      : "";

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1200,
      temperature: 0.9,
      messages: [
        {
          role: "user",
          content: `Here is my wardrobe, each item labeled with its id:\n${itemsList}${avoidanceText}\n\nSuggest 3 new outfit combinations using only these items. For each outfit, respond in this exact format:\n\nOUTFIT [number]\nITEMS: [comma-separated item ids used, e.g. 3,7,12]\nDESCRIPTION: [1-2 sentence explanation of the outfit and why it works]\n\nDo not include anything else in your response.`,
        },
      ],
    });

    const responseText = completion.choices[0].message.content;

    const outfitBlocks = responseText.split(/OUTFIT \d+/).filter((block) => block.trim());

    const outfits = outfitBlocks.map((block) => {
      const itemsMatch = block.match(/ITEMS:\s*([\d,\s]+)/);
      const descMatch = block.match(/DESCRIPTION:\s*(.+)/s);

      const ids = itemsMatch
        ? itemsMatch[1].split(",").map((id) => parseInt(id.trim())).filter(Boolean)
        : [];

      return {
        itemIds: ids,
        items: ids.map((id) => itemsById[id]).filter(Boolean),
        description: descMatch ? descMatch[1].trim() : "",
      };
    });

    for (const outfit of outfits) {
      if (outfit.itemIds.length > 0) {
        await pool.query(
          `INSERT INTO outfit_suggestions (user_id, item_ids, suggestion_text) VALUES ($1, $2, $3)`,
          [userId, outfit.itemIds, outfit.description]
        );
      }
    }

    res.json({ outfits });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate suggestions" });
  }
};

module.exports = { getSuggestions };
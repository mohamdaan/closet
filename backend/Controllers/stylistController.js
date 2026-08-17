const OpenAI = require("openai");
const pool = require("../db/db");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const getSuggestions = async (req, res) => {
  const userId = req.userId;

  try {
    const itemsResult = await pool.query(
      `SELECT id, name, brand, category, description, image_url
       FROM items
       WHERE user_id = $1 AND item_type = 'WARDROBE'`,
      [userId]
    );

    const items = itemsResult.rows;

    if (items.length === 0) {
      return res
        .status(400)
        .json({ error: "Add some items to your wardrobe first" });
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
      .map(
        (item) =>
          `[id:${item.id}] ${item.name} (${item.brand || "no brand"}, ${
            item.category || "uncategorized"
          })`
      )
      .join("\n");

    const avoidanceText =
      pastCombinations.length > 0
        ? `\n\nAvoid repeating these exact combinations I've already been shown:\n${pastCombinations
            .map((c) => `- ${c}`)
            .join("\n")}`
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

    const outfitBlocks = responseText
      .split(/OUTFIT \d+/)
      .filter((block) => block.trim());

    const outfits = outfitBlocks.map((block) => {
      const itemsMatch = block.match(/ITEMS:\s*([\d,\s]+)/);
      const descMatch = block.match(/DESCRIPTION:\s*(.+)/s);

      const ids = itemsMatch
        ? itemsMatch[1]
            .split(",")
            .map((id) => parseInt(id.trim()))
            .filter(Boolean)
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

const chat = async (req, res) => {
  const userId = req.userId;
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ error: "Message content is required" });
  }

  try {
    await pool.query(
      `INSERT INTO chat_messages (user_id, role, content) VALUES ($1, 'user', $2)`,
      [userId, content]
    );

    const historyResult = await pool.query(
      `SELECT role, content FROM chat_messages WHERE user_id = $1 ORDER BY created_at ASC`,
      [userId]
    );

    const messages = historyResult.rows;

    const itemsResult = await pool.query(
      `SELECT id, name, brand, category, description, image_url
       FROM items
       WHERE user_id = $1 AND item_type = 'WARDROBE'`,
      [userId]
    );

    const items = itemsResult.rows;
    const itemsById = Object.fromEntries(items.map((item) => [item.id, item]));

    const itemsList = items
      .map(
        (item) =>
          `[id:${item.id}] ${item.name} (${item.brand || "no brand"}, ${
            item.category || "uncategorized"
          })`
      )
      .join("\n");

    const systemPrompt = `You are a friendly personal stylist chatbot. The user's wardrobe (each item labeled with its id) is:\n${itemsList}\n\nIMPORTANT: Any time you recommend a specific outfit or combination of items, you MUST end your response with exactly one line in this format, with nothing after it:\nOUTFIT_ITEMS: 3,7\n\nUse the actual ids from the wardrobe list above, comma-separated. This line is required every time you mention specific items together as an outfit, even in casual conversation. If you are not recommending specific items, omit this line entirely.`;

    const reinforcedMessages = messages.map((msg, index) => {
      if (index === messages.length - 1 && msg.role === "user") {
        return {
          role: msg.role,
          content: `${msg.content}\n\n(Reminder: if recommending an outfit, end with "OUTFIT_ITEMS: id,id,id" using real ids from the wardrobe.)`,
        };
      }
      return msg;
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 800,
      temperature: 0.8,
      messages: [
        { role: "system", content: systemPrompt },
        ...reinforcedMessages,
      ],
    });

    const replyText = completion.choices[0].message.content;

    const outfitMatch = replyText.match(/OUTFIT_ITEMS:\s*([\d,\s]+)/);
    let outfitItems = [];

    if (outfitMatch) {
      const ids = outfitMatch[1]
        .split(",")
        .map((id) => parseInt(id.trim()))
        .filter(Boolean);
      outfitItems = ids.map((id) => itemsById[id]).filter(Boolean);
    } else {
      outfitItems = items.filter((item) =>
        replyText.toLowerCase().includes(item.name.toLowerCase())
      );
    }

    const displayText = replyText.replace(/OUTFIT_ITEMS:.*$/s, "").trim();

    const outfitItemIds = outfitItems.map((item) => item.id);

    await pool.query(
      `INSERT INTO chat_messages (user_id, role, content, outfit_item_ids) VALUES ($1, 'assistant', $2, $3)`,
      [userId, displayText, outfitItemIds.length > 0 ? outfitItemIds : null]
    );

    res.json({ reply: displayText, outfitItems });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get response" });
  }
};

const getChatHistory = async (req, res) => {
  const userId = req.userId;

  try {
    const messagesResult = await pool.query(
      `SELECT id, role, content, outfit_item_ids, created_at FROM chat_messages WHERE user_id = $1 ORDER BY created_at ASC`,
      [userId]
    );

    const itemsResult = await pool.query(
      `SELECT id, name, brand, category, image_url FROM items WHERE user_id = $1`,
      [userId]
    );

    const itemsById = Object.fromEntries(
      itemsResult.rows.map((item) => [item.id, item])
    );

    const messages = messagesResult.rows.map((msg) => ({
      ...msg,
      outfitItems: msg.outfit_item_ids
        ? msg.outfit_item_ids.map((id) => itemsById[id]).filter(Boolean)
        : [],
    }));

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = { getSuggestions, chat, getChatHistory };

const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export const getRuleBasedMove = (b) => {
  const empty = b
    .map((cell, i) => (cell === null ? i : -1))
    .filter((i) => i !== -1);
  if (!empty.length) return null;

  const findWinning = (mark) => {
    for (const line of WIN_LINES) {
      const cells = line.map((i) => b[i]);
      if (cells.filter((c) => c === mark).length === 2 && cells.includes(null)) {
        return line.find((i) => b[i] === null);
      }
    }
    return null;
  };

  const win = findWinning("0");
  if (win !== null) return win;
  const block = findWinning("X");
  if (block !== null) return block;
  if (b[4] === null) return 4;
  return [0, 2, 6, 8].find((i) => b[i] === null)
    ?? [1, 3, 5, 7].find((i) => b[i] === null);
};

export const getAIMoveFromOpenRouter = async (board) => {
  const SystemPrompt = `
You are a Tic Tac Toe engine playing as "0". You are PERFECT at this game.
Follow this exact decision procedure, in order:
1. WIN: If any empty cell completes a row of three for you ("0"), pick it.
2. BLOCK: Else if any empty cell completes a row of three for the opponent ("X"), pick it.
3. FORK: Else pick a cell that creates two winning lines at once.
4. BLOCK FORK: Else if the opponent can fork next turn, block it.
5. CENTER: Else pick 4 if it is empty.
6. CORNER: Else pick an empty corner (0, 2, 6, 8).
7. SIDE: Else pick an empty side (1, 3, 5, 7).

Reply with EXACTLY ONE INTEGER from 0 to 8 and NOTHING ELSE.
No punctuation. No spaces. No explanation. No reasoning.
Your entire response must be a single digit.
  `;

  const userPrompt = `
Current board (indexes):
[0] [1] [2]
[3] [4] [5]
[6] [7] [8]

Board state: ${JSON.stringify(board)}
("0" = you, "X" = opponent, null = empty)

Your move (single digit 0-8):
  `;

  const getMoveFromLLM = async () => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY?.trim();
    if (!apiKey) {
      console.error("OpenRouter API Key is missing! Check your .env file.");
      return null;
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173", 
        "X-Title": "Tic Tac Tai",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b:free",
        temperature: 0.2,
        max_tokens: 100,
        messages: [
          { role: "system", content: SystemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter API Error:", response.status);
      console.error("Error Details:", JSON.stringify(data, null, 2));
      console.log("--- API Key Debug ---");
      console.log("Key present:", !!apiKey);
      console.log("Key length:", apiKey?.length);
      console.log("Key starts with 'sk-or-v1-':", apiKey?.startsWith("sk-or-v1-"));
      if (apiKey) {
        console.log("Key first 10 characters:", apiKey.substring(0, 10));
        console.log("Key last 5 characters:", apiKey.slice(-5));
      }
      console.log("----------------------");
      return null;
    }
    
    const message = data?.choices?.[0]?.message;
    const rawContent = message?.content;
    const content = Array.isArray(rawContent)
      ? rawContent.map((part) => part?.text ?? "").join("")
      : rawContent;
    const text = (content || message?.reasoning || "").trim();
    if (!text) {
      console.error("OpenRouter returned no content:", data);
      return null;
    }

    console.log("AI Response:", text);
    const candidates = text.match(/[0-8]/g) || [];
    const emptyCells = board
      .map((cell, i) => (cell === null ? i : -1))
      .filter((i) => i !== -1);
    const valid = candidates
      .map(Number)
      .filter((cell) => emptyCells.includes(cell));
    return valid.length ? valid[valid.length - 1] : null;
  };

  try {
    return await getMoveFromLLM();
  } catch (err) {
    console.log("AI error:", err);
    return getRuleBasedMove(board);
  }
};

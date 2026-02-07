export const getAIMoveFromOpenRouter = async (board) => {
  const SystemPrompt = `
    You are a smart Tic Tac Toe AI playing as "0".

    Your goal:
    1. Win if possible
    2. Block the opponent if they are about to win
    3. Otherwise: choose center > corner > side

    Only return ONE number (0–8). Do NOT explain.
  `;

  const userPrompt = `
    Current board: ${JSON.stringify(board)}

    Each cell is indexed:
    [0] [1] [2]
    [3] [4] [5]
    [6] [7] [8]

    "0" = you (AI)
    "X" = human
    null = empty

    What is your move?
  `;

  const getMoveFromClaude = async () => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173", // Optional, for OpenRouter rankings
        "X-Title": "Tic Tac Tai", // Optional, for OpenRouter rankings
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1",
        temperature: 0.2,
        messages: [
          { role: "system", content: SystemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    const data = await response.json();
    
    const text = data?.choices?.[0]?.message?.content?.trim();
    console.log(text);
    const match = text.match(/\d+/);
    return match ? parseInt(match[0], 10) : null;
  };

  try {
    let move = await getMoveFromClaude();
    return move;
  } catch (err) {
    console.log("AI error:", err);
  }
};

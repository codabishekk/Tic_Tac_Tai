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
        model: "deepseek/deepseek-r1",
        temperature: 0.2,
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
    
    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      console.error("OpenRouter returned no content:", data);
      return null;
    }

    const text = content.trim();
    console.log("AI Response:", text);
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

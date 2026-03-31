export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { message, sessionId } = req.body;
  if (!message || !sessionId) {
    return res.status(400).json({ error: "message e sessionId são obrigatórios" });
  }

  try {
    const response = await fetch(
      `https://api.gptmaker.ai/v2/agent/${process.env.GPTMAKER_BOT_ID}/conversation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GPTMAKER_API_KEY}`,
        },
        body: JSON.stringify({
          prompt: message,
          contextId: sessionId,
          chatName: "Visitante Site GPT Zendra",
        }),
      }
    );
    if (!response.ok) {
      console.error("GPTMaker error:", response.status, await response.text());
      return res.status(502).json({
        reply: "Desculpe, estou com dificuldades no momento. Tente novamente em alguns instantes.",
      });
    }
    const data = await response.json();
    const reply = data.message || "Desculpe, não consegui processar sua mensagem.";
    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({
      reply: "Desculpe, ocorreu um erro. Tente novamente em alguns instantes.",
    });
  }
}

const API_KEY = process.env.GPTMAKER_API_KEY;
const BOT_ID  = process.env.GPTMAKER_BOT_ID;
const WS_ID   = process.env.GPTMAKER_WS_ID;
const BASE    = 'https://api.gptmaker.ai/v2';
const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query;

  // ── CHAT ──────────────────────────────────────────
  if (!action || action === 'chat') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { message, sessionId } = req.body;
    if (!message || !sessionId) return res.status(400).json({ error: 'message e sessionId obrigatórios' });
    try {
      const r = await fetch(`${BASE}/agent/${BOT_ID}/conversation`, {
        method: 'POST', headers,
        body: JSON.stringify({ prompt: message, contextId: sessionId, chatName: 'Visitante Site GPT Zendra' })
      });
      const data = await r.json();
      return res.status(200).json({ reply: data.message || 'Erro ao processar mensagem.' });
    } catch (e) {
      return res.status(500).json({ reply: 'Erro interno.' });
    }
  }

  // ── WORKSPACES (per trovare ID corretto) ──────────
  if (action === 'workspaces') {
    try {
      const r = await fetch(`${BASE}/workspace`, { headers });
      const data = await r.json();
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao buscar workspaces.' });
    }
  }

  // ── CREDITI ───────────────────────────────────────
  if (action === 'credits') {
    try {
      const r = await fetch(`${BASE}/workspace/${WS_ID}/credits`, { headers });
      const data = await r.json();
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao buscar créditos.' });
    }
  }

  // ── CONVERSAZIONI ─────────────────────────────────
  if (action === 'interactions') {
    try {
      const r = await fetch(`${BASE}/workspace/${WS_ID}/interactions`, { headers });
      const data = await r.json();
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao buscar interações.' });
    }
  }

  // ── MESSAGGI ──────────────────────────────────────
  if (action === 'messages') {
    const { interactionId } = req.query;
    if (!interactionId) return res.status(400).json({ error: 'interactionId obrigatório' });
    try {
      const r = await fetch(`${BASE}/interaction/${interactionId}/messages`, { headers });
      const data = await r.json();
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao buscar mensagens.' });
    }
  }

  // ── AGENTE (consumo crediti) ───────────────────────
  if (action === 'consumption') {
    try {
      const r = await fetch(`${BASE}/agent/${BOT_ID}/credits`, { headers });
      const data = await r.json();
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao buscar consumo.' });
    }
  }

  return res.status(400).json({ error: 'Ação não reconhecida.' });
}

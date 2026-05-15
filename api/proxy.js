export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const path = req.query.path;
  if (!path) return res.status(400).json({ error: 'Missing path' });

  try {
    const response = await fetch(`https://api.samu.ai${path}`, {
      method: req.method,
      headers: {
        'apiKey': 'cb5a944dadb61a3b7eb51c321a3c4140',
        'Content-Type': 'application/json',
      },
    });
    const text = await response.text();
    res.status(response.status).send(text);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

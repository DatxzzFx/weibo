const axios = require('axios');

async function onedl(url) {
  try {
    const { data } = await axios.post(
      'https://onedownloader.net/search',
      new URLSearchParams({ query: encodeURIComponent(url) }).toString(),
      {
        headers: {
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'origin': 'https://onedownloader.net',
          'referer': 'https://onedownloader.net/',
          'user-agent': 'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36',
          'x-requested-with': 'XMLHttpRequest'
        }
      }
    );

    const result = data.data;
    if (!result) throw new Error('Video tidak ditemukan.');
    return Array.isArray(result) ? result : [result];
  } catch (error) {
    const msg = error.response ? error.response.data.message : error.message;
    throw new Error(msg || 'Gagal mengambil video.');
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { url } = req.body;
  if (!url) return res.status(400).json({ message: 'URL diperlukan.' });

  try {
    const data = await onedl(url);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

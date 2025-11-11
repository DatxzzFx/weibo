const axios = require('axios');

async function onedl(url) {
  try {
    if (!url || !url.includes('weibo.com') && !url.includes('weibo.cn')) {
      throw new Error('Invalid Weibo URL.');
    }
    const { data } = await axios.post('https://onedownloader.net/search', new URLSearchParams({
      query: encodeURIComponent(url)
    }).toString(), {
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'origin': 'https://onedownloader.net',
        'referer': 'https://onedownloader.net/',
        'user-agent': 'Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36',
        'x-requested-with': 'XMLHttpRequest'
      }
    });
    return data.data;
  } catch (error) {
    // Mengembalikan pesan error yang lebih informatif
    throw new Error(error.response ? error.response.data.message : 'Failed to fetch video. Please check the URL and try again.');
  }
}

module.exports = async (req, res) => {
  // Mengizinkan CORS untuk semua origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: 'URL is required.' });
  }

  try {
    const data = await onedl(url);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
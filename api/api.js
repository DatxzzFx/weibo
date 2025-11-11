const axios = require('axios');

async function onedl(url) {
  try {
    // FIX: Validasi URL dasar, tanpa filter domain spesifik.
    if (!url || !url.startsWith('http')) {
      throw new Error('URL tidak valid. Harap masukkan URL yang benar.');
    }

    const { data } = await axios.post('https://onedownloader.net/search', new URLSearchParams({
      query: encodeURIComponent(url)
    }).toString(), {
      headers: {
        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'origin': 'https://onedownloader.net',
        'referer': 'https://onedownloader.net/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'x-requested-with': 'XMLHttpRequest'
      }
    });

    const results = data.data;

    // Jika tidak ada data media yang ditemukan sama sekali
    if (!results) {
      throw new Error('Media tidak ditemukan. Periksa kembali URL Anda atau coba URL lain.');
    }
    
    // Memastikan data selalu dalam format array
    const resultsArray = Array.isArray(results) ? results : [results];

    // **CRITICAL FIX:** Standarisasi output untuk memastikan frontend selalu menerima properti `url`.
    // Scraper terkadang mengembalikan 'link' bukan 'url'.
    const standardizedResults = resultsArray.map(item => ({
      quality: item.quality || 'Standar',
      url: item.url || item.link // <-- Ini adalah perbaikan utamanya
    })).filter(item => item.url); // Hapus item yang tidak memiliki URL setelah standarisasi

    if (standardizedResults.length === 0) {
        throw new Error('Gagal mengekstrak link unduhan dari respons API.');
    }

    return standardizedResults;

  } catch (error) {
    const errorMessage = error.response ? error.response.data.message : error.message;
    throw new Error(errorMessage || 'Gagal mengambil video. Terjadi kesalahan yang tidak diketahui.');
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: 'URL diperlukan.' });
  }

  try {
    const data = await onedl(url);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
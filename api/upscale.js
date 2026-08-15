export default async function handler(req, res) {
  const API_KEY = "r8_Ua1ywudbHx5lUdRPu0mBBtMZu86iOrn4eojJd";

  try {
    // GET: Durum Sorgulama
    if (req.method === 'GET') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID eksik' });

      const checkRes = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
        headers: { 'Authorization': `Token ${API_KEY}` }
      });
      const prediction = await checkRes.json();
      return res.status(200).json(prediction);
    }

    // POST: İşlemi Başlatma
    if (req.method === 'POST') {
      const { image } = req.body;
      if (!image) return res.status(400).json({ error: 'Görsel eksik' });

      const startRes = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: "42a346882b0f20d6f228471f4967362f6d0f62d100063f25c7e3f848074f386c",
          input: {
            image: image,
            scale: 2,
            face_enhance: true
          }
        })
      });

      const startData = await startRes.json();
      if (startData.error) return res.status(500).json({ error: startData.error });

      return res.status(200).json({ id: startData.id, status: startData.status });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

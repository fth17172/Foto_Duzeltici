export default async function handler(req, res) {
  const API_KEY = "r8_Ua1ywudbHx5lUdRPu0mBBtMZu86iOrn4eojJd";

  try {
    if (req.method === 'GET') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'ID eksik' });

      const checkRes = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
        headers: { 'Authorization': `Token ${API_KEY}` }
      });
      const prediction = await checkRes.json();
      return res.status(200).json(prediction);
    }

    if (req.method === 'POST') {
      const { image } = req.body;
      if (!image) return res.status(400).json({ error: 'Görsel eksik' });

      // Hızlı çalışan Real-ESRGAN Modeli
      const startRes = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: "f121d640bd286e1fdc6732651516230bea32b3842d4502dd1d963f2591177202",
          input: {
            image: image,
            upscale: 2,
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

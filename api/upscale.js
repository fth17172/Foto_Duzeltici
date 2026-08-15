export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { image } = req.body;
  const API_KEY = "r8_Ua1ywudbHx5lUdRPu0mBBtMZu86iOrn4eojJd";

  try {
    // 1. Replicate'e işlemi başlatma isteği
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
    if (startData.error) throw new Error(startData.error);

    // 2. İşlem tamamlanana kadar arka planda bekleme (Polling)
    let prediction = startData;
    while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
      await new Promise(r => setTimeout(r, 1500));
      const checkRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { 'Authorization': `Token ${API_KEY}` }
      });
      prediction = await checkRes.json();
    }

    if (prediction.status === 'succeeded') {
      return res.status(200).json({ output: prediction.output });
    } else {
      return res.status(500).json({ error: prediction.error || 'İşlem başarısız' });
    }

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

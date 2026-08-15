export default async function handler(req, res) {
  const HF_TOKEN = "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";

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body;
    if (!image) return res.status(400).json({ error: 'Görsel eksik' });

    // Base64 verisini binary buffer'a çevir
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Hugging Face router endpoint
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/xinntao/realesrgan-x4plus",
      {
        headers: {
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/octet-stream",
          "x-wait-for-model": "true"
        },
        method: "POST",
        body: imageBuffer,
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return res.status(response.status).json({ error: `HF API Hata (${response.status}): ${errText}` });
    }

    const arrayBuffer = await response.arrayBuffer();
    const resultBase64 = Buffer.from(arrayBuffer).toString('base64');
    const resultDataUrl = `data:image/png;base64,${resultBase64}`;

    return res.status(200).json({ output: resultDataUrl });

  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: `Sunucu Hatası: ${error.message}` });
  }
}

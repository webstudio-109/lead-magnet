export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'URL required' });

  try {
    const psiRes = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(
        url
      )}&key=${process.env.PAGESPEED_API_KEY}&strategy=mobile`
    );
    const psiData = await psiRes.json();

    const performanceScore = Math.round(
      (psiData.lighthouseResult?.categories?.performance?.score || 0) * 100
    );
    const mobileFriendly = performanceScore > 50;

    const screenshot = `https://image.thum.io/get/width/1200/${url}`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a web design consultant finding pain points for cold outreach.',
          },
          {
            role: 'user',
            content: `Website: ${url}
Performance score: ${performanceScore}/100
Mobile friendly: ${mobileFriendly}

1. List 3-4 specific pain points (design, speed, UX) in bullet points.
2. Write short personalized cold email (friendly tone) offering website redesign service, mentioning these pain points. Under 120 words.

Format:
PAIN POINTS:
- point1

EMAIL:
(content)`,
          },
        ],
      }),
    });

    const groqData = await groqRes.json();
    const aiText = groqData.choices?.[0]?.message?.content || 'AI failed';
    const [painPointsPart, emailPart] = aiText.split('EMAIL:');

    res.status(200).json({
      url,
      screenshot,
      performanceScore,
      mobileFriendly,
      painPoints: painPointsPart?.replace('PAIN POINTS:', '').trim(),
      emailDraft: emailPart?.trim(),
    });
  } catch (err) {
    res.status(500).json({ error: err.message, url });
  }
}

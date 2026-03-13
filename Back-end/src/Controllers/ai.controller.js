const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateDescription = async (req, res) => {
  try {
    const { productName, category } = req.body;

    if (!productName) {
      return res.status(400).json({ success: false, error: 'Product name is required' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `Write a compelling, professional product description for "${productName}"${category ? ` in the ${category} category` : ''}.

The description should:
- Highlight key features and benefits
- Be SEO-friendly with relevant keywords
- Be engaging and persuasive for customers
- Include technical specifications if relevant
- Be between 100-150 words
- Use professional e-commerce language

Make it sound authentic and avoid generic phrases.`;

    const result = await model.generateContent(prompt);
    const description = result.response.text().trim();

    res.json({ success: true, description });

  } catch (error) {
    console.error('Gemini AI Error:', error);
    res.status(500).json({ success: false, error: 'Failed to generate description. Please try again.' });
  }
};

const analyzeProductImage = async (req, res) => {
  const fs = require('fs');
  const file = req.files && req.files[0];
  try {
    if (!file) {
      return res.status(400).json({ success: false, error: 'No image provided' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const imageData = fs.readFileSync(file.path);
    const base64Image = imageData.toString('base64');
    const mimeType = file.mimetype;

    const prompt = `Analyze this solar/energy product image and return a JSON object with these fields (use null if not visible/applicable):
{
  "productName": "specific product name",
  "category": "one of: Solar Panel, Inverter, Battery, Lithium Battery, Gel Battery, Charge Controller, Solar Lighting, Flood Lights & Street Lights, Garden Lights, Mounting Systems, Water Heaters, Family Solar Packages",
  "description": "2-3 sentence product description for e-commerce",
  "wattage": "number and unit only, e.g. 450W, or null",
  "voltage": "number and unit only, e.g. 12V, or null",
  "batteryType": "e.g. Lithium Ion, Lead Acid, or null"
}
Return ONLY valid JSON, no markdown, no explanation.`;

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType, data: base64Image } }
    ]);

    try { fs.unlinkSync(file.path); } catch (e) {}

    const responseText = result.response.text().trim();
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJson);

    return res.json({ success: true, data });

  } catch (error) {
    console.error('Image Analysis Error:', error);
    if (file && file.path) { try { require('fs').unlinkSync(file.path); } catch (e) {} }
    return res.status(500).json({ success: false, error: 'Failed to analyze image. Please try again.' });
  }
};

module.exports = {
  generateDescription,
  analyzeProductImage
};

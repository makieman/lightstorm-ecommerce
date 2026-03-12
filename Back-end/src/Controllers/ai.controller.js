const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateDescription = async (req, res) => {
  try {
    const { productName, category } = req.body;
    
    if (!productName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Product name is required' 
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
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
    
    res.json({ 
      success: true, 
      description 
    });
    
  } catch (error) {
    console.error('Gemini AI Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to generate description. Please try again.' 
    });
  }
};

module.exports = {
  generateDescription
};

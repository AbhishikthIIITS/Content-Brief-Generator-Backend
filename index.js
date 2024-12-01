const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.post("/generate-brief", async (req, res) => {
  const { topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: "Topic is required" });
  }

  const prompt = `
  Generate a detailed SEO-optimized content brief for the topic: "${topic}".

  Include the following structure:
  1. Topic headline.
  2. Related headings relevant to the topic.
  3. Under each heading, generate:
     a. Subheadings that logically organize the content.
     b. Under each Subheading generate the required Key points and takeaways for each subheading to enhance reader engagement.
     c. External links to authoritative sources to add credibility and depth. These links should be clickable ones so that it redirects to the source site.
  4. Ensure the tone is natural, engaging, and hooks the reader from the beginning, while maintaining an SEO focus.
`;


  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    let content = result.response.text();

    // List of sections to remove
    const unwantedSections = [
      "Target Audience:",
      "Keywords:",
      "Tone:",
      "SEO Optimization:",
      "Meta Description:"
    ];

    // Remove unwanted sections using regex
    unwantedSections.forEach(section => {
      const regex = new RegExp(`(?<=^|\n)${section}.*?(\n|$)`, 'g');
      content = content.replace(regex, '');
    });

    // Clean up any additional white space or newline issues
    content = content.replace(/\n{2,}/g, '\n').trim();

    res.json({ brief: content });
  } catch (error) {
    console.error("Error generating content:", error.message);
    res.status(500).json({ error: "Failed to generate content brief" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

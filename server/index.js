import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { db } from "./src/db/index.js";
import { explanations } from "./src/db/schema.js";
import { desc, eq } from "drizzle-orm";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "200kb" }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

//testing purposes
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "SyntaxSense backend is running" });
});

//posts to gemini api
app.post("/api/explain", async (req, res) => {
  try {
    const { code, language, lineNumber, source } = req.body;

    if (!code || !language) {
      return res.status(400).json({
        error: "Missing code or language.",
      });
    }

    const prompt = `
You are SyntaxSense, a beginner-friendly coding tutor inside VS Code.

Explain the syntax of this code.

Rules:
- Focus on syntax, not just what the code does.
- Explain important keywords, symbols, punctuation, and structure.
- Keep the explanation beginner-friendly.
- Use short sections.
- Do not be too long.
- If there is a mistake, gently explain what might be wrong.
- Explain it like the user is learning this language.

Language: ${language}
Source: ${source}
Line Number: ${lineNumber}

Code:
\`\`\`${language}
${code}
\`\`\`
`;

const response = await ai.models.generateContent({
  model: "gemini-3.5-flash",
  contents: prompt,
});

const explanationText = response.text || "Gemini did not return an explanation.";

const [savedExplanation] = await db
  .insert(explanations)
  .values({
    userId: "demo-user",
    language,
    source,
    lineNumber,
    code,
    explanation: explanationText,
  })
  .returning();

res.json({
  explanation: explanationText,
  explanationId: savedExplanation.id,
});
  } catch (error) {
    console.error("Gemini API error:", error);

    res.status(500).json({
      error: "Something went wrong while generating the explanation.",
    });
  }
});

//grabs history

app.get("/api/history", async (req, res) => {
  try {
    const userId = req.query.userId || "demo-user";

    const history = await db
      .select()
      .from(explanations)
      .where(eq(explanations.userId, String(userId)))
      .orderBy(desc(explanations.createdAt))
      .limit(20);

    res.json({ history });
  } catch (error) {
    console.error("History error:", error);

    res.status(500).json({
      error: "Could not load explanation history.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`SyntaxSense backend running on http://localhost:${PORT}`);
});
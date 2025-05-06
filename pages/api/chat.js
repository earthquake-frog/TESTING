import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { messages } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
      temperature: 0.7
    });

    const reply = completion.choices[0].message;
    res.status(200).json({ reply });
  } catch (error) {
    res.status(500).json({ error: "OpenAI API 오류", detail: error.message });
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {

  try {

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const result = await model.generateContent(
      "List the latest global military conflicts or tensions in the last 24 hours with country names and short descriptions."
    );

    const response = result.response.text();

    res.status(200).json({
      intelligence: response
    });

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

}


import { GoogleGenAI, Type } from "@google/genai";
import { TransactionType } from "../types";

// Always use process.env.API_KEY directly for initialization as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const parseTransactionText = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Parse this financial transaction text in Bengali or English: "${text}". 
      Return the details including amount, type (INCOME, EXPENSE, LOAN_GIVEN, LOAN_RECEIVED), category, and note. 
      The currency is BDT.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            type: { 
              type: Type.STRING, 
              enum: ['INCOME', 'EXPENSE', 'LOAN_GIVEN', 'LOAN_RECEIVED'] 
            },
            category: { type: Type.STRING },
            note: { type: Type.STRING },
            // Changed property name to personName to match types.ts interface
            personName: { type: Type.STRING, description: "If it's a loan, who is the person?" }
          },
          required: ["amount", "type", "category"]
        }
      }
    });

    // Access .text property directly (not as a function) and handle potential undefined
    const jsonStr = response.text?.trim();
    if (!jsonStr) return null;
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    return null;
  }
};

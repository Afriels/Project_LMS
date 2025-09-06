// FIX: Add a triple-slash directive to include Vite's client types. This resolves the error "Property 'env' does not exist on type 'ImportMeta'".
/// <reference types="vite/client" />

import { GoogleGenAI, Type } from "@google/genai";
import { QuestionType, Difficulty, BankSoal } from '../types';

// The GoogleGenAI class is initialized using the API key from environment variables.
// Vite exposes environment variables via `import.meta.env`.
const apiKey = import.meta.env.VITE_API_KEY;
if (!apiKey) {
    throw new Error("VITE_API_KEY is not defined in the environment.");
}
const ai = new GoogleGenAI({ apiKey });


const getQuestionTypeDescription = (type: QuestionType) => {
    switch (type) {
        case QuestionType.MCQ:
            return "Multiple Choice Question with 4 options (a, b, c, d). One is correct.";
        case QuestionType.TRUE_FALSE:
            return "A statement that is either true or false.";
        case QuestionType.ISIAN:
            return "Fill-in-the-blank question where a short answer is expected.";
        case QuestionType.ESAI:
            return "Essay question that requires a detailed explanation.";
    }
}

export const generateQuestionsWithAI = async (
    topic: string,
    type: QuestionType,
    difficulty: Difficulty,
    count: number
): Promise<Partial<BankSoal>[]> => {
    try {
        const prompt = `Generate ${count} ${getQuestionTypeDescription(type)} questions about "${topic}" with a difficulty level of "${difficulty}". For multiple choice, provide four distinct options labeled a, b, c, d and indicate the correct answer key. For true/false, provide the correct answer. For fill-in-the-blank, provide the correct short answer. For essays, the answer key should be a brief summary of expected points.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            pertanyaan: {
                                type: Type.STRING,
                                description: "The question text.",
                            },
                            opsi: {
                                type: Type.ARRAY,
                                description: "Array of options for MCQ. E.g., ['Option A', 'Option B']. Should be null for other types.",
                                items: { type: Type.STRING },
                            },
                            kunci_jawaban: {
                                type: Type.STRING,
                                description: "The correct answer. For MCQ, this should be the letter (e.g., 'a'). For True/False, 'true' or 'false'. For Isian, the blank word. For Esai, a summary of the expected answer.",
                            },
                        },
                        required: ["pertanyaan", "kunci_jawaban"]
                    },
                },
            },
        });

        const jsonStr = response.text.trim();
        const generated = JSON.parse(jsonStr) as { pertanyaan: string; opsi?: string[]; kunci_jawaban: string }[];
        
        return generated.map(q => ({
            pertanyaan: q.pertanyaan,
            opsi_json: q.opsi ? q.opsi.map((opt, index) => ({
                value: String.fromCharCode(97 + index), // 'a', 'b', 'c', 'd'
                text: opt
            })) : undefined,
            kunci_jawaban: q.kunci_jawaban,
            mapel: topic, // Use the topic as the subject
            tipe: type,
            tingkat_kesulitan: difficulty,
        }));
    } catch (error) {
        console.error("Error generating questions with AI:", error);
        if (error instanceof Error && (error.message.includes('API key') || error.message.includes('permission'))) {
             throw error; // Re-throw the specific error message
        }
        throw new Error("Failed to parse AI response. The model may have returned an invalid format or the request was blocked.");
    }
};
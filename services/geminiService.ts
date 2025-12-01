import { GoogleGenAI, Type } from "@google/genai";

// Ensure the API key is available in the environment variables
if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        expression: {
            type: Type.STRING,
            description: "The recognized mathematical expression as a string, e.g., '2 + 2 * 4'."
        },
        result: {
            type: Type.STRING,
            description: "The final calculated result as a string. If the expression is unsolvable or invalid, this should be the string 'Error'."
        },
        explanation: {
            type: Type.STRING,
            description: "A detailed, step-by-step explanation of how the result was calculated. Use newline characters for line breaks."
        }
    },
    required: ['expression', 'result', 'explanation']
};


export const solveMathProblem = async (imageDataUrl: string) => {
    const base64Data = imageDataUrl.split(',')[1];

    if (!base64Data) {
        throw new Error("Invalid image data provided.");
    }

    const imagePart = {
        inlineData: {
            mimeType: 'image/png',
            data: base64Data,
        },
    };

    const textPart = {
        text: `You are an advanced mathematical assistant. Your task is to analyze the handwritten expression in the provided image and return a JSON object. The JSON object must have three keys: 'expression' which contains the recognized mathematical expression as a string, 'result' which contains the calculated numerical answer as a string, and 'explanation' which contains a step-by-step breakdown of the solution. If the expression is invalid or cannot be solved, the 'result' should be the string 'Error' and the 'explanation' should describe the issue. Do not include any markdown formatting (\`\`\`json ... \`\`\`) or any text outside of the JSON object. Just return the raw JSON.`,
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart, imagePart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.1,
            }
        });

        const text = response.text?.trim();

        if (!text) {
          throw new Error("Received an empty response from the AI.");
        }
        
        // The response should be a clean JSON string because of responseSchema
        const parsedResult = JSON.parse(text);

        if (typeof parsedResult.expression !== 'string' || typeof parsedResult.result === 'undefined' || typeof parsedResult.explanation !== 'string') {
            throw new Error("AI response is not in the expected format.");
        }

        return {
            expression: parsedResult.expression,
            result: String(parsedResult.result), // Ensure result is a string
            explanation: parsedResult.explanation
        };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("The AI model could not process the request. Please try again.");
    }
};

export const solveMathProblemFromText = async (problem: string) => {
    const textPart = {
        text: `You are an advanced mathematical assistant. Your task is to solve the following mathematical expression and return a JSON object. The expression is: "${problem}". The JSON object must have three keys: 'expression' which should be the input expression you were given, 'result' which contains the calculated numerical answer as a string, and 'explanation' which contains a step-by-step breakdown of the solution. If the expression is invalid or cannot be solved, the 'result' should be the string 'Error' and the 'explanation' should describe the issue. Do not include any markdown formatting (\`\`\`json ... \`\`\`) or any text outside of the JSON object. Just return the raw JSON.`,
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.1,
            }
        });

        const text = response.text?.trim();

        if (!text) {
          throw new Error("Received an empty response from the AI.");
        }
        
        const parsedResult = JSON.parse(text);

        if (typeof parsedResult.expression !== 'string' || typeof parsedResult.result === 'undefined' || typeof parsedResult.explanation !== 'string') {
            throw new Error("AI response is not in the expected format.");
        }

        return {
            expression: parsedResult.expression,
            result: String(parsedResult.result), // Ensure result is a string
            explanation: parsedResult.explanation
        };

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("The AI model could not process the request. Please try again.");
    }
};
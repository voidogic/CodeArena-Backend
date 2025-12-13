const { GoogleGenAI } = require("@google/genai");

// solve doubt ke body me title nhi aa rha hai baki sb aaa rha hai , 
console.log("GEMINI KEY EXISTS:", !!process.env.GEMINI_KEY);




// const solveDoubt = async (req, res) => {
//     try {
//         // console.log("ye ekho",req.body.title); 
//         // console.log("ye ekho",req.body.description); 
//         const { messages, title, description, testCases, startCode } = req.body;
//         // console.log("ye dekho"); 
//         const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

//         if (!Array.isArray(messages)) {
//             console.error("❌ messages is not an array:", messages);
//             return res.status(400).json({ message: "Invalid messages format" });
//         }

//         const formattedMessages = messages
//             .filter(m => m?.role === "user" && m?.parts?.[0]?.text)
//             .map(m => ({
//                 role: "user",
//                 parts: [{ text: m.parts[0].text }]
//             }));


//         async function main() {
//             const response = await ai.models.generateContent({
//                 model: "gemini-1.5-flash",
//                 contents: formattedMessages,
//                 config: {
//                     systemInstruction: `
// You are an expert Data Structures and Algorithms (DSA) tutor specializing in helping users solve coding problems. Your role is strictly limited to DSA-related assistance only.

// ## CURRENT PROBLEM CONTEXT:
// [PROBLEM_TITLE]: ${title}
// [PROBLEM_DESCRIPTION]: ${description}
// [EXAMPLES]: ${JSON.stringify(testCases, null, 2)}
// [startCode]: ${startCode || "N/A"}


// ## YOUR CAPABILITIES:
// 1. **Hint Provider**: Give step-by-step hints without revealing the complete solution
// 2. **Code Reviewer**: Debug and fix code submissions with explanations
// 3. **Solution Guide**: Provide optimal solutions with detailed explanations
// 4. **Complexity Analyzer**: Explain time and space complexity trade-offs
// 5. **Approach Suggester**: Recommend different algorithmic approaches (brute force, optimized, etc.)
// 6. **Test Case Helper**: Help create additional test cases for edge case validation

// ## INTERACTION GUIDELINES:

// ### When user asks for HINTS:
// - Break down the problem into smaller sub-problems
// - Ask guiding questions to help them think through the solution
// - Provide algorithmic intuition without giving away the complete approach
// - Suggest relevant data structures or techniques to consider

// ### When user submits CODE for review:
// - Identify bugs and logic errors with clear explanations
// - Suggest improvements for readability and efficiency
// - Explain why certain approaches work or don't work
// - Provide corrected code with line-by-line explanations when needed

// ### When user asks for OPTIMAL SOLUTION:
// - Start with a brief approach explanation
// - Provide clean, well-commented code
// - Explain the algorithm step-by-step
// - Include time and space complexity analysis
// - Mention alternative approaches if applicable

// ### When user asks for DIFFERENT APPROACHES:
// - List multiple solution strategies (if applicable)
// - Compare trade-offs between approaches
// - Explain when to use each approach
// - Provide complexity analysis for each

// ## RESPONSE FORMAT:
// - Use clear, concise explanations
// - Format code with proper syntax highlighting
// - Use examples to illustrate concepts
// - Break complex explanations into digestible parts
// - Always relate back to the current problem context
// - Always response in the Language in which user is comfortable or given the context

// ## STRICT LIMITATIONS:
// - ONLY discuss topics related to the current DSA problem
// - DO NOT help with non-DSA topics (web development, databases, etc.)
// - DO NOT provide solutions to different problems
// - If asked about unrelated topics, politely redirect: "I can only help with the current DSA problem. What specific aspect of this problem would you like assistance with?"

// ## TEACHING PHILOSOPHY:
// - Encourage understanding over memorization
// - Guide users to discover solutions rather than just providing answers
// - Explain the "why" behind algorithmic choices
// - Help build problem-solving intuition
// - Promote best coding practices

// Remember: Your goal is to help users learn and understand DSA concepts through the lens of the current problem, not just to provide quick answers.
// `},

//             });

//             const aiReply =
//                 response?.candidates?.[0]?.content?.parts?.[0]?.text
//                 || "No response from AI";

//             res.status(200).json({
//                 message: aiReply
//             });
//         }

//         await main();

//     }
//     catch (err) {
//         res.status(500).json({
//             message: "Internal server error controllers/solveDoubt.js "
//         });
//     }
// }



const solveDoubt = async (req, res) => {
    try {
        const { messages, title, description, testCases, startCode } = req.body;

        

        // 1️⃣ Validate messages
        if (!Array.isArray(messages)) {
            return res.status(400).json({ message: "Invalid messages format" });
        }

        // 2️⃣ Take ONLY the last user message
        const lastUserMessage = messages
            .filter(m => m?.role === "user" && m?.parts?.[0]?.text)
            .at(-1);

        if (!lastUserMessage) {
            return res.status(400).json({ message: "No user message found" });
        }

        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_KEY
        });

        // const models = await ai.models.list();
        //console.log("AVAILABLE MODELS:", models);

        // 3️⃣ Send ONE user message + systemInstruction
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: lastUserMessage.parts[0].text }
                    ]
                }
            ],
            config: {
                systemInstruction: `
You are an expert Data Structures and Algorithms (DSA) tutor specializing in helping users solve coding problems. Your role is strictly limited to DSA-related assistance only.

## CURRENT PROBLEM CONTEXT:
[PROBLEM_TITLE]: ${title || "N/A"}
[PROBLEM_DESCRIPTION]: ${description || "N/A"}
[EXAMPLES]: ${JSON.stringify(testCases || [], null, 2)}
[startCode]: ${startCode || "N/A"}

## YOUR CAPABILITIES:
1. Hint Provider – step-by-step hints
2. Code Reviewer – debug and improve code
3. Solution Guide – optimal solutions with explanation
4. Complexity Analyzer – time & space complexity
5. Approach Suggester – brute force vs optimized
6. Test Case Helper – edge cases

## RULES:
- Stay strictly within this problem
- Do NOT answer non-DSA topics
- Explain clearly and concisely
- Use examples and clean code
- Teach concepts, don’t just give answers
`
            }
        });

        const aiReply =
            response?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "No response from AI";

        return res.status(200).json({ message: aiReply });

    } catch (err) {
        console.error("🔥 GEMINI ERROR:", err);
        return res.status(500).json({
            message: "Internal server error controllers/solveDoubt.js"
        });
    }
};

module.exports = solveDoubt;
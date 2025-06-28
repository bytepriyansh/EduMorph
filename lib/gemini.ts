
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
});


const APPLICATION_VISION_PROMPT = `
You are an expert at identifying real-world applications of concepts across multiple domains. 
When given a concept, generate:

1. Real-World Use Cases (1-2 applications):
   - Show practical uses in tech, science, business, creative fields
   - Be specific with examples
   - Format as array of strings
   - 4-5 sentences

2. Mini Project Idea:
   - A small, achievable project using the concept
   - Should be doable in a few hours to a day
   - Include specific technologies if relevant
   - 4-5 sentences

3. Tools & Skills:
   - List 3-5 actual software, APIs, frameworks used with this concept
   - Include both technical and non-technical tools
   - 4-5 sentences

4. Industry/Career Touchpoints:
   - 3-5 industries/job roles where this concept is important
   - Include both obvious and non-obvious applications


Persona Context (if provided):
- Engineer: focus on technical implementations
- Designer: focus on creative/visual applications
- Researcher: focus on academic/scientific uses
- Entrepreneur: focus on business/startup applications

Response Format (JSON):
{
  "useCases": string[],
  "miniProject": string,
  "tools": string[],
  "industries": string[]
}

Example Input: "Refraction"
Example Output:
{
  "useCases": [
    "Eyeglasses lens design to correct vision",
    "Camera lens optics for photography",
    "Underwater photography light correction"
  ],
  "miniProject": "Build a light refraction simulation using HTML Canvas API showing how light bends when passing through different media",
  "tools": ["Optics lab software", "Unity 3D for visual simulations", "Python with Matplotlib for modeling"],
  "industries": [
    "Optical engineering",
    "AR/VR development",
    "Photography equipment manufacturing",
    "Physics research"
  ]
}
`;

export async function generateApplicationVision(
  concept: string,
  persona: string = 'default'
): Promise<{
  useCases: string[];
  miniProject: string;
  tools: string[];
  industries: string[];
}> {
  const model = 'gemini-1.5-flash';

  const prompt = `${APPLICATION_VISION_PROMPT}
  
  Concept: ${concept}
  ${persona !== 'default' ? `Persona: ${persona}` : ''}
  
  Generate comprehensive application vision:
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{
        role: 'user',
        parts: [{ text: prompt }],
      }],
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error('Received empty response from AI model');
    }

    // Extract JSON from response
    const jsonStart = textResponse.indexOf('{');
    const jsonEnd = textResponse.lastIndexOf('}') + 1;
    const jsonString = textResponse.slice(jsonStart, jsonEnd);

    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error generating application vision:', error);
    throw new Error('Failed to generate application vision');
  }
}


const ROADMAP_CREATOR_PROMPT = `
You are an expert learning path designer AI that creates comprehensive, personalized roadmaps for any learning goal.

When generating a roadmap:

1. FIRST analyze the learning goal to determine:
   - Relevant subject area (programming, design, science, etc.)
   - Difficulty level (beginner, intermediate, advanced)
   - Practical applications of the skill
   - Industry standards and best practices

2. THEN create a structured roadmap with:
   - 6-10 key milestones that build progressively
   - Clear, actionable milestone titles
   - Concise descriptions of what will be learned
   - Estimated timeframes for each milestone
   - 3-5 key topics per milestone
   - Appropriate difficulty classification
   - Relevant icons/symbols for each milestone

3. FORMAT the response as JSON with this structure:
{
  "title": "Customized Learning Path for [Goal]",
  "description": "Comprehensive roadmap to master [Goal] from fundamentals to advanced concepts",
  "totalDays": [sum of all milestone days],
  "totalMilestones": [count],
  "category": "[Subject]",
  "milestones": [
    {
      "title": "Fundamentals & Setup",
      "description": "What will be learned in this phase",
      "estimatedDays": 14,
      "topics": ["Topic 1", "Topic 2", "Topic 3"],
      "difficulty": "Beginner",
      "icon": "BookOpen"
    }
  ]
}

4. ICON OPTIONS (use exactly these names):
   - BookOpen (fundamentals)
   - Target (core concepts)
   - Code (practical application)
   - Sparkles (advanced techniques)
   - Database (data/APIs)
   - CheckCircle (testing/quality)
   - Trophy (mastery/deployment)
   - Puzzle (problem solving)
   - Cpu (technical topics)
   - Globe (web-related)
   - Smartphone (mobile)
   - Palette (design)

Important rules:
- Make estimates realistic (beginners need more time)
- Ensure logical progression between milestones
- Include practical projects where applicable
- Balance theory and practice
- Use the exact JSON format specified
- Only return the JSON with no additional text
`;

export async function generateLearningRoadmap(
  learningGoal: string,
  currentLevel: "beginner" | "intermediate" | "advanced" = "beginner",
  timeCommitment: "part-time" | "full-time" = "part-time"
): Promise<any> {
  const model = "gemini-1.5-flash";

  const prompt = `${ROADMAP_CREATOR_PROMPT}
  
  Learning Goal: ${learningGoal}
  Current Level: ${currentLevel}
  Time Commitment: ${timeCommitment}
  
  Please generate a comprehensive, well-structured learning roadmap:
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }],
    });

    const textResponse = response.text;
    if (!textResponse) {
      throw new Error("Received empty response from AI model");
    }
    const jsonStart = textResponse.indexOf('{');
    const jsonEnd = textResponse.lastIndexOf('}') + 1;
    const jsonString = textResponse.slice(jsonStart, jsonEnd);

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error generating learning roadmap:", error);
    throw new Error("Failed to generate learning roadmap");
  }
}

const DOUBT_SOLVER_PROMPT = `
You are an expert AI tutor specialized in resolving student doubts across all academic subjects. 
Your role is to:

1. FIRST analyze the student's question carefully to understand:
   - The core concept being asked about
   - The student's potential knowledge level
   - Any misconceptions the question might reveal

2. THEN provide a structured response with:
   - Clear explanation of the concept
   - Step-by-step reasoning if applicable
   - Relevant examples/analogies
   - Common pitfalls to avoid
   - Follow-up questions to check understanding

3. FORMAT your response with:
   - Concise paragraphs
   - Markdown formatting for clarity
   - Emoji where appropriate for engagement
   - Bullet points for key takeaways

4. ADAPT your response based on:
   - Question complexity (simplify for beginners)
   - Subject matter (use appropriate terminology)
   - Context clues from the conversation

Important rules:
- Never say "this is a great question" or similar filler
- Be precise and get straight to the answer
- If unsure, ask clarifying questions
- Maintain supportive but professional tone
`;

export async function resolveDoubt(
  question: string,
  context: string = "",
  subject: string = "General"
): Promise<string> {
  const model = "gemini-1.5-flash";

  const prompt = `${DOUBT_SOLVER_PROMPT}
  
  Current Subject: ${subject}
  ${context ? `Conversation Context:\n${context}` : ''}
  
  Student Question: ${question}
  
  Please provide your best explanation:
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }],
    });

    return response.text || "I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Error in resolveDoubt:", error);
    return "Sorry, I encountered an error while processing your question. Please try again.";
  }
}


export async function streamConceptExplanation(
  input: string,
  type: "tldr" | "eli5" | "deepdive",
  mode: "default" | "gamer" | "chef" | "rapper" | "pirate" | "scientist",
  onChunk: (text: string) => void
): Promise<void> {
  const model = "gemini-1.5-flash";
  const prompt = generatePrompt(input, type, mode);

  const response = await ai.models.generateContentStream({
    model,
    contents: [{
      role: "user",
      parts: [{ text: prompt }]
    }],
  });

  for await (const chunk of response) {
    if (chunk?.text) onChunk(chunk.text);
  }
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
}

export async function generateQuizQuestions(
  topic: string,
  difficulty: "easy" | "medium" | "hard" = "medium",
  questionCount: number = 5
): Promise<QuizQuestion[]> {
  const model = "gemini-1.5-flash";

  const prompt = `
  Generate ${questionCount} quiz questions about ${topic} with ${difficulty} difficulty.
  For each question, provide:
  - A clear, concise question
  - 4 possible answers (only one correct)
  - The index of the correct answer (0-3)
  - A brief explanation of why the answer is correct
  - The difficulty level (easy, medium, hard)
  
  Format the response as a JSON array with the following structure:
  [
    {
      "question": "Question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correctAnswer": 0,
      "explanation": "Explanation text",
      "difficulty": "easy"
    }
  ]
  
  Difficulty guidelines:
  - Easy: Basic concepts, straightforward questions
  - Medium: Some complexity, may require deeper understanding
  - Hard: Challenging questions that test advanced knowledge
  
  Return ONLY the JSON array with no additional text or markdown formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }],
    });

    const textResponse:any = response.text;
    // Clean the response to ensure it's valid JSON
    const jsonStart = textResponse.indexOf('[');
    const jsonEnd = textResponse.lastIndexOf(']') + 1;
    const jsonString = textResponse.slice(jsonStart, jsonEnd);

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    throw new Error("Failed to generate quiz questions");
  }
}

export async function explainConcept(
  concept: string,
  question: string,
  mode: "default" | "gamer" | "chef" | "rapper" | "pirate" | "scientist" = "default"
): Promise<string> {
  let explanation = "";

  await streamConceptExplanation(
    `Concept: ${concept}\nQuestion Context: ${question}`,
    "deepdive",
    mode,
    (chunk) => {
      explanation += chunk;
    }
  );

  return explanation;
}

function generatePrompt(topic: string, type: string, mode: string): string {
  const modeInstructions = {
    default: "Provide a clear explanation.",
    gamer: "Use gaming analogies and terminology. Compare concepts to game mechanics, levels, power-ups, etc.",
    chef: "Explain like you're teaching someone to cook. Use cooking metaphors, ingredients as concepts, recipes as processes.",
    rapper: "Respond in rap form with rhythm and rhyme. Keep it educational but with rap style and swagger.",
    pirate: "Explain like a pirate would. Use pirate slang and nautical metaphors. Start with 'Arrr!'",
    scientist: "Use technical terminology and precise language. Include relevant formulas or scientific principles where applicable."
  }

  const typeInstructions = {
    tldr: `Provide a concise summary of ${topic} in 2-3 sentences. Highlight only the most essential aspects.`,
    eli5: `Explain ${topic} in simple terms that a 5-year-old could understand. Use analogies from everyday life.`,
    deepdive: `Provide a comprehensive explanation of ${topic}. Cover key concepts, applications, and important details. Use markdown formatting with headings, lists, and bold text for important terms.`
  }

  return `${typeInstructions[type as keyof typeof typeInstructions]} ${modeInstructions[mode as keyof typeof modeInstructions]}. Format the response in markdown with clear paragraphs and no introduction.`
}
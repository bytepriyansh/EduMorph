# 🚀 EduMorph – The Shape-Shifting AI Learning Companion

EduMorph is a futuristic AI-powered education platform that redefines self-learning with creativity, clarity, and cutting-edge experiences. Designed to help students **understand deeply**, **revise smartly**, and **apply concepts in the real world**, EduMorph adapts to each learner in real-time — no past data required.

---

## 🌐 Live Demo

🔗 **[edu-morph.vercel.app](https://edu-morph.vercel.app)**  

---

## ✨ Key Features

### 1. 🔮 **Concept Morph**
Enter any topic → Get 3 AI-powered explanation levels:
- 🧠 TL;DR
- 🎈 Explain Like I'm 5 (ELI5)
- 🔍 Deep Dive  
Optional: Explain as gamer/rapper/chef for fun!

### 2. 🎯 **Quiz Zone**
Auto-generated MCQs based on any topic:
- Difficulty adapts in real time
- Timer, score, and retry logic
- Result analytics + emoji reactions

### 3. 💬 **Doubt Resolver**
Ask anything — AI answers with full context:
- Smart ChatGPT-like UI
- Typing animation, feedback system
- Sidebar archive of past questions

### 4. 🛤️ **Roadmap Creator**
Set a goal → Get an AI-generated study path:
- Milestones, timelines, checkboxes
- Horizontal & vertical scroll
- Linked resources and progress tracking

### 5. ⏰ **Spaced Revision**
Your personal memory trainer:
- AI schedules revision using spaced repetition
- Flashcard-style interface
- Revision calendar + notifications

### 6. 💡 **Application Vision**
ENTER A CONCEPT → Instantly see:
- 3 Real-world use cases
- Mini-project ideas
- Industry tools & jobs that use this concept
- Optional: View as a Designer, Developer, Researcher, etc.

---

## ⚙️ Tech Stack

| Layer         | Tech                                                     |
|---------------|----------------------------------------------------------|
| Frontend      | **Next.js (App Router)**, TypeScript, TailwindCSS        |
| UI Generator  | **[v0.dev](https://v0.dev)** – React UI code generation  |
| Styling       | TailwindCSS + Custom Gradients + Glassmorphism           |
| AI Models     | **Gemini 1.5 Pro (via API)** / OpenAI GPT-4o (fallback)  |
| Backend DB    | **Firebase Firestore** – for data storage & auth         |
| Auth          | Firebase Auth + Google Sign-In                           |
| Hosting       | **Vercel**                                               |
| State/UX      | Zustand (optional), Dark Mode Toggle, Mobile-First       |

---

## 🧭 Project Structure (Simplified)

```bash
/edumorph
├── app/                 # Next.js pages (App Router)
│   ├── quiz/
│   ├── roadmap/
│   ├── concept-morph/
│   └── spaced-revision/
├── components/          # Reusable UI components
├── lib/                 # API helpers (Gemini, Firebase)
├── styles/              # Tailwind configs + global styles
├── utils/               # Utility functions (formatting, prompts, etc.)
├── public/              # Static assets
└── firebase/            # Firebase config & auth hooks

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Zap, Clock, CheckCircle, XCircle, Trophy, Target, RotateCcw, ArrowRight, Star, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { generateQuizQuestions, explainConcept } from "@/lib/gemini"
import { auth, db } from "@/lib/firebase"
import { useAuthState } from "react-firebase-hooks/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { toast } from "sonner"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'


interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: "easy" | "medium" | "hard"
}

interface QuizResult {
  score: number
  totalQuestions: number
  percentage: number
  correctAnswers: number[]
  timeTaken: number
  date: Date
  topic: string
  difficulty: string
}

export default function QuizZonePage() {
  const [user] = useAuthState(auth)
  const [selectedTopic, setSelectedTopic] = useState("")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<number[]>([])
  const [showResult, setShowResult] = useState(false)
  const [quizStarted, setQuizStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300)
  const [showExplanation, setShowExplanation] = useState(false)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [explanationText, setExplanationText] = useState("")
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([])

  const topics = [
    { value: "javascript", label: "JavaScript", icon: "💻" },
    { value: "react", label: "React", icon: "⚛️" },
    { value: "python", label: "Python", icon: "🐍" },
    { value: "algorithms", label: "Algorithms", icon: "🧮" },
    { value: "databases", label: "Databases", icon: "🗄️" },
    { value: "networking", label: "Networking", icon: "🌐" },
    { value: "web-development", label: "Web Dev", icon: "🕸️" },
    { value: "machine-learning", label: "ML/AI", icon: "🧠" },
  ]

  useEffect(() => {
    if (user) loadQuizHistory()
  }, [user])

  const loadQuizHistory = async () => {
    if (!user) return
    try {
      const docRef = doc(db, "users", user.uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setQuizHistory(docSnap.data().quizHistory || [])
      }
    } catch (error) {
      console.error("Error loading quiz history:", error)
      toast.error("Failed to load quiz history")
    }
  }

  const saveQuizResult = async (result: QuizResult) => {
    if (!user) return
    try {
      const userRef = doc(db, "users", user.uid)
      const newHistory = [...quizHistory, result]
      await setDoc(userRef, { quizHistory: newHistory }, { merge: true })
      setQuizHistory(newHistory)
    } catch (error) {
      console.error("Error saving quiz result:", error)
      toast.error("Failed to save quiz result")
    }
  }

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (quizStarted && timeLeft > 0 && !showResult) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    } else if (timeLeft === 0) {
      handleQuizEnd()
    }
    return () => clearTimeout(timer)
  }, [quizStarted, timeLeft, showResult])

  const startQuiz = async () => {
    if (!selectedTopic) {
      toast.warning("Please select a topic")
      return
    }

    setLoading(true)
    try {
      const generatedQuestions = await generateQuizQuestions(selectedTopic, difficulty)
      setQuestions(generatedQuestions.map((q, index) => ({ id: index, ...q })))
      setQuizStarted(true)
      setCurrentQuestion(0)
      setAnswers([])
      setShowResult(false)
      setTimeLeft(300)
      toast.success("Quiz generated successfully!")
    } catch (error) {
      console.error("Error generating quiz:", error)
      toast.error("Failed to generate quiz. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
  }

  const handleNextQuestion = async () => {
    if (selectedAnswer === null) {
      toast.warning("Please select an answer")
      return
    }

    const newAnswers = [...answers, selectedAnswer]
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      handleQuizEnd()
    }
  }

  const handleQuizEnd = () => {
    const result = {
      score: calculateScore(),
      totalQuestions: questions.length,
      percentage: getScorePercentage(),
      correctAnswers: answers.map((answer, index) =>
        answer === questions[index].correctAnswer ? 1 : 0
      ),
      timeTaken: 300 - timeLeft,
      date: new Date(),
      topic: selectedTopic,
      difficulty: difficulty
    }

    saveQuizResult(result)
    setShowResult(true)
    setQuizStarted(false)
  }

  const calculateScore = () => {
    return answers.reduce((score, answer, index) => {
      return score + (answer === questions[index]?.correctAnswer ? 1 : 0)
    }, 0)
  }

  const getScorePercentage = () => {
    return Math.round((calculateScore() / questions.length) * 100)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getPerformanceMessage = () => {
    const percentage = getScorePercentage()
    if (percentage >= 90) return { message: "Outstanding! 🎉", color: "text-green-600" }
    if (percentage >= 80) return { message: "Great job! 👏", color: "text-blue-600" }
    if (percentage >= 70) return { message: "Good work! 👍", color: "text-yellow-600" }
    if (percentage >= 60) return { message: "Keep practicing! 💪", color: "text-orange-600" }
    return { message: "Need more practice 📚", color: "text-red-600" }
  }

  const handleExplainConcept = async () => {
    if (!questions[currentQuestion]) return

    setLoading(true)
    try {
      const explanation = await explainConcept(
        questions[currentQuestion].question,
        questions[currentQuestion].explanation
      )
      setExplanationText(explanation)
      setShowExplanation(true)
    } catch (error) {
      console.error("Error generating explanation:", error)
      toast.error("Failed to generate explanation")
    } finally {
      setLoading(false)
    }
  }

  if (!quizStarted && !showResult) {
    return (
      <div className="min-h-screen mt-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 pt-20 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Zap className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4">
              AI Quiz Zone
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Test your knowledge with AI-generated quizzes tailored to your skill level
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border-white/20 dark:border-slate-700/20 shadow-lg rounded-2xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                  Quiz Settings
                </CardTitle>
                <p className="text-slate-600 dark:text-slate-400">Customize your quiz experience</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">Select Topic</h3>
                  <div className="grid md:grid-cols-4 gap-3">
                    {topics.map((topic) => (
                      <motion.div
                        key={topic.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant={selectedTopic === topic.value ? "default" : "outline"}
                          className={`w-full h-auto py-3 flex flex-col items-center gap-2 transition-all ${selectedTopic === topic.value
                              ? "bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-md"
                              : "hover:bg-slate-100 dark:hover:bg-slate-700/50"
                            }`}
                          onClick={() => setSelectedTopic(topic.value)}
                        >
                          <span className="text-2xl">{topic.icon}</span>
                          <span>{topic.label}</span>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">Difficulty Level</h3>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant={difficulty === "easy" ? "default" : "outline"}
                      className={`px-6 ${difficulty === "easy" ? "bg-green-600 hover:bg-green-700" : ""}`}
                      onClick={() => setDifficulty("easy")}
                    >
                      Easy
                    </Button>
                    <Button
                      variant={difficulty === "medium" ? "default" : "outline"}
                      className={`px-6 ${difficulty === "medium" ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                      onClick={() => setDifficulty("medium")}
                    >
                      Medium
                    </Button>
                    <Button
                      variant={difficulty === "hard" ? "default" : "outline"}
                      className={`px-6 ${difficulty === "hard" ? "bg-red-600 hover:bg-red-700" : ""}`}
                      onClick={() => setDifficulty("hard")}
                    >
                      Hard
                    </Button>
                  </div>
                </div>

                <div className="text-center pt-6">
                  <Button
                    onClick={startQuiz}
                    disabled={!selectedTopic || loading}
                    className="h-14 px-8 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group text-lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Generating Quiz...
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                        Start AI Quiz
                        <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  if (showResult) {
    const score = calculateScore()
    const percentage = getScorePercentage()
    const performance = getPerformanceMessage()

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 pt-20 p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto mt-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border-white/20 dark:border-slate-700/20 shadow-2xl rounded-3xl">
              <CardContent className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-24 h-24 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Trophy className="h-12 w-12 text-white" />
                </motion.div>

                <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-200 mb-4">Quiz Complete!</h1>

                <div className={`text-2xl font-bold mb-6 ${performance.color}`}>{performance.message}</div>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-md">
                    <Target className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-3xl font-bold">
                      {score}/{questions.length}
                    </div>
                    <div className="text-green-100">Correct Answers</div>
                  </div>
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-md">
                    <Star className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-3xl font-bold">{percentage}%</div>
                    <div className="text-blue-100">Score</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-md">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <div className="text-3xl font-bold">{formatTime(300 - timeLeft)}</div>
                    <div className="text-purple-100">Time Taken</div>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Performance Breakdown</h3>
                  {questions.map((question, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/70 transition-colors"
                    >
                      <span className="text-sm text-slate-600 dark:text-slate-400">Question {index + 1}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${answers[index] === question.correctAnswer ? "text-green-600" : "text-red-600"
                          }`}>
                          {question.difficulty.toUpperCase()}
                        </span>
                        {answers[index] === question.correctAnswer ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => {
                      setShowResult(false)
                      setQuizStarted(false)
                      setSelectedTopic("")
                    }}
                    className="h-12 px-6 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Try Another Quiz
                  </Button>
                  <Button
                    onClick={() => {
                      setShowResult(false)
                      setCurrentQuestion(0)
                      setAnswers([])
                      setSelectedAnswer(null)
                      setTimeLeft(300)
                      setQuizStarted(true)
                    }}
                    variant="outline"
                    className="h-12 px-6 rounded-2xl border-2 border-yellow-200 dark:border-yellow-800 hover:bg-yellow-50 dark:hover:bg-yellow-950"
                  >
                    Retry This Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 pt-20 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mt-12 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="px-4 py-2 text-lg font-semibold">
              Question {currentQuestion + 1} of {questions.length}
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5">
              {question?.difficulty.toUpperCase()}
            </Badge>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Clock className="h-5 w-5" />
              <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Progress value={progress} className="h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
        </motion.div>

        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border-white/20 dark:border-slate-700/20 shadow-lg rounded-2xl mb-6">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                {question?.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {question?.options.map((option, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className={`w-full p-6 text-left justify-start h-auto rounded-2xl border-2 transition-all duration-300 ${selectedAnswer === index
                        ? "bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-transparent shadow-lg"
                        : "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      }`}
                    onClick={() => handleAnswerSelect(index)}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold ${selectedAnswer === index
                            ? "bg-white text-orange-600 border-white"
                            : "border-slate-300 dark:border-slate-600"
                          }`}
                      >
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span className="text-lg">{option}</span>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <Card className="bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-semibold">AI Explanation</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                          <div className="rounded-lg overflow-hidden my-2">
                          
                          </div>
                        ) : (
                          <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm">
                            {children}
                          </code>
                        )
                      }
                    }}
                  >
                    {explanationText}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-between"
        >
          <Button
            onClick={handleExplainConcept}
            disabled={loading}
            variant="outline"
            className="h-14 px-6 rounded-2xl border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100/50 dark:hover:bg-blue-800/30"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5 mr-2" />
            )}
            Explain Concept
          </Button>

          <Button
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null || loading}
            className="h-14 px-8 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group text-lg"
          >
            {currentQuestion === questions.length - 1 ? "Finish Quiz" : "Next Question"}
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

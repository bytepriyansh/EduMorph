"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageCircle,
  Send,
  ThumbsUp,
  ThumbsDown,
  Brain,
  Clock,
  Archive,
  Search,
  Filter,
  Sparkles,
  Loader2,
  ArrowDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUser } from "@/hooks/useUser"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { resolveDoubt } from "@/lib/gemini"
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date | { toDate: () => Date }
  rating?: "up" | "down" | null
}

interface PastDoubt {
  id: string
  question: string
  subject: string
  timestamp: Date | { toDate: () => Date }
  resolved: boolean
}

export default function DoubtResolverPage() {
  const { user } = useUser()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [activeSubject, setActiveSubject] = useState<string>("General")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [pastDoubts, setPastDoubts] = useState<PastDoubt[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Load user's chat history
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!user?.uid) return

      setIsLoading(true)
      try {
        const userDocRef = doc(db, "users", user.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          setMessages(userData?.doubtHistory || [])
          setPastDoubts(userData?.pastDoubts || [])
        } else {
          const welcomeMessage: Message = {
            id: Date.now().toString(),
            content: "Hello! I'm your AI tutor. What would you like to learn about today?",
            isUser: false,
            timestamp: new Date(),
          }
          await setDoc(userDocRef, {
            doubtHistory: [welcomeMessage],
            pastDoubts: [],
            createdAt: new Date(),
          })
          setMessages([welcomeMessage])
        }
      } catch (error) {
        console.error("Error loading chat history:", error)
        setMessages([{
          id: Date.now().toString(),
          content: "Hello! I'm your AI tutor. What would you like to learn about today?",
          isUser: false,
          timestamp: new Date(),
        }])
      } finally {
        setIsLoading(false)
      }
    }

    loadChatHistory()
  }, [user?.uid])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user?.uid) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInputMessage("")
    setIsTyping(true)

    try {
      const context = messages.slice(-3).map(m =>
        `${m.isUser ? 'Student' : 'Tutor'}: ${m.content}`
      ).join('\n')

      const aiResponse = await resolveDoubt(inputMessage, context, activeSubject)

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
      }

      const updatedMessages = [...newMessages, aiMessage]
      setMessages(updatedMessages)

      const newDoubt: PastDoubt = {
        id: userMessage.id,
        question: inputMessage,
        subject: activeSubject,
        timestamp: new Date(),
        resolved: true,
      }

      await updateDoc(doc(db, "users", user.uid), {
        doubtHistory: updatedMessages,
        pastDoubts: [...pastDoubts, newDoubt],
      })

      setPastDoubts(prev => [...prev, newDoubt])
    } catch (error) {
      console.error("Error generating response:", error)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error. Please try again.",
        isUser: false,
        timestamp: new Date(),
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleRating = async (messageId: string, rating: "up" | "down") => {
    if (!user?.uid) return

    const updatedMessages = messages.map(msg =>
      msg.id === messageId ? { ...msg, rating } : msg
    )
    setMessages(updatedMessages)

    try {
      await updateDoc(doc(db, "users", user.uid), {
        doubtHistory: updatedMessages,
      })
    } catch (error) {
      console.error("Error updating rating:", error)
    }
  }

  const formatTime = (date: Date | { toDate: () => Date }) => {
    const jsDate = typeof date === 'object' && 'toDate' in date ? date.toDate() : new Date(date)
    return jsDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (date: Date | { toDate: () => Date }) => {
    const jsDate = typeof date === 'object' && 'toDate' in date ? date.toDate() : new Date(date)

    const now = new Date()
    const diffTime = Math.abs(now.getTime() - jsDate.getTime())
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 7) return `${diffDays} days ago`
    return jsDate.toLocaleDateString()
  }

  const subjects = [
    "General", "Math", "Science", "Programming",
    "History", "Language", "Physics", "Chemistry"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 pt-14 pb-10">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 h-full">
        <div className="flex flex-col h-full">
          <div className="flex-1 flex flex-col h-full">
            <Card className="flex-1 flex flex-col h-full">
              <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                      <MessageCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-200">
                        Meta Mentor
                      </CardTitle>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        AI-powered instant help for all your questions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Online</span>
                  </div>
                </div>
              </CardHeader>

              <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap gap-2">
                  {subjects.map((subject) => (
                    <Button
                      key={subject}
                      variant={activeSubject === subject ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                      onClick={() => setActiveSubject(subject)}
                    >
                      {subject}
                    </Button>
                  ))}
                </div>
              </div>

              <CardContent className="flex-1 p-0 overflow-hidden">
                <ScrollArea
                  ref={scrollAreaRef}
                  className="h-[calc(100vh-20rem)] w-full"
                >
                  <div className="p-6 space-y-6">
                    {isLoading ? (
                      <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                      </div>
                    ) : (
                      <AnimatePresence>
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.4 }}
                            className={`flex gap-4 ${message.isUser ? "justify-end" : "justify-start"}`}
                          >
                            {!message.isUser && (
                              <Avatar className="h-10 w-10 bg-gradient-to-r from-purple-600 to-pink-600">
                                <AvatarFallback className="bg-transparent text-white font-bold">
                                  <Brain className="h-5 w-5" />
                                </AvatarFallback>
                              </Avatar>
                            )}

                            <div className={`max-w-[80%] ${message.isUser ? "order-first" : ""}`}>
                              <div
                                className={`p-4 rounded-2xl ${message.isUser
                                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white ml-auto"
                                  : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                                  }`}
                              >
                                <p className="whitespace-pre-wrap leading-relaxed break-words">
                                  {message.content}
                                </p>
                              </div>

                              <div
                                className={`flex items-center gap-2 mt-2 ${message.isUser ? "justify-end" : "justify-start"
                                  }`}
                              >
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(message.timestamp)}
                                </span>

                                {!message.isUser && (
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={`h-6 w-6 ${message.rating === "up" ? "text-green-600" : "text-slate-400"
                                        }`}
                                      onClick={() => handleRating(message.id, "up")}
                                    >
                                      <ThumbsUp className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className={`h-6 w-6 ${message.rating === "down" ? "text-red-600" : "text-slate-400"
                                        }`}
                                      onClick={() => handleRating(message.id, "down")}
                                    >
                                      <ThumbsDown className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {message.isUser && (
                              <Avatar className="h-10 w-10 bg-gradient-to-r from-indigo-600 to-purple-600">
                                <AvatarFallback className="bg-transparent text-white font-bold">
                                  {user?.email?.[0].toUpperCase() || "U"}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}

                    {/* Typing Indicator */}
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-4"
                      >
                        <Avatar className="h-10 w-10 bg-gradient-to-r from-purple-600 to-pink-600">
                          <AvatarFallback className="bg-transparent text-white font-bold">
                            <Brain className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-2xl">
                          <div className="flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                              <div
                                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              />
                              <div
                                className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              />
                            </div>
                            <span className="text-sm text-slate-600 dark:text-slate-400">AI is thinking...</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Input Area */}
              <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder={`Ask your ${activeSubject} question...`}
                      className="h-12 pr-12 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:border-purple-500 dark:focus:border-purple-400 transition-all duration-300"
                    />
                    <Sparkles className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="h-12 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    {isTyping ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
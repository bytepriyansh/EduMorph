"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Brain, Send, Sparkles, Lightbulb, Microscope, Copy, ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { streamConceptExplanation } from "@/lib/gemini"
import { doc, getDoc, setDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuthState } from "react-firebase-hooks/auth"
import { auth } from "@/lib/firebase"

export default function ConceptMorphPage() {
  const [topic, setTopic] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [responses, setResponses] = useState<{ [key: string]: string }>({})
  const [funMode, setFunMode] = useState("default")
  const { toast } = useToast()
  const [user] = useAuthState(auth)

  const funModes = [
    { value: "default", label: "Default", icon: "🎯", description: "Standard explanation" },
    { value: "gamer", label: "Gamer", icon: "🎮", description: "Explain using gaming analogies" },
    { value: "chef", label: "Chef", icon: "👨‍🍳", description: "Explain like cooking a recipe" },
    { value: "rapper", label: "Rapper", icon: "🎤", description: "Explain in rap style" },
    { value: "pirate", label: "Pirate", icon: "🏴‍☠️", description: "Arrr! Pirate-style explanation" },
    { value: "scientist", label: "Scientist", icon: "🔬", description: "Technical deep dive" },
  ]

  const tabs = [
    { id: "tldr", label: "TL;DR", icon: Sparkles, description: "Quick summary" },
    { id: "eli5", label: "ELI5", icon: Lightbulb, description: "Explain like I'm 5" },
    { id: "deepdive", label: "Deep Dive", icon: Microscope, description: "Comprehensive analysis" },
  ]

  useEffect(() => {
    const loadUserConcepts = async () => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid, "concepts", "current")
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            setResponses(docSnap.data().responses || {})
            setTopic(docSnap.data().topic || "")
            setFunMode(docSnap.data().funMode || "default")
          }
        } catch (error) {
          console.error("Error loading concepts:", error)
        }
      }
    }

    loadUserConcepts()
  }, [user])

  useEffect(() => {
    const saveToFirebase = async () => {
      if (user && Object.keys(responses).length > 0) {
        try {
          const docRef = doc(db, "users", user.uid, "concepts", "current")
          await setDoc(docRef, {
            topic,
            responses,
            funMode,
            timestamp: new Date()
          })
        } catch (error) {
          console.error("Error saving to Firebase:", error)
        }
      }
    }

    saveToFirebase()
  }, [responses, topic, funMode, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic.trim()) return

    setIsLoading(true)
    setResponses({})

    try {
      await Promise.all(
        tabs.map(async (tab) => {
          let fullResponse = ""

          await streamConceptExplanation(
            topic,
            tab.id as "tldr" | "eli5" | "deepdive",
            funMode as any,
            (chunk) => {
              fullResponse += chunk
              setResponses(prev => ({
                ...prev,
                [tab.id]: fullResponse
              }))
            }
          )
        })
      )
    } catch (error) {
      console.error("Error generating content:", error)
      toast({
        title: "Error",
        description: "Failed to generate explanations. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "Explanation copied to clipboard",
      })
    } catch (err) {
      console.error("Failed to copy text: ", err)
      toast({
        title: "Error",
        description: "Failed to copy text",
        variant: "destructive",
      })
    }
  }
  return (
    <div className="min-h-screen mt-16 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 pt-20 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Concept Morph
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Transform any complex topic into clear, digestible explanations tailored to your learning style
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border-white/20 dark:border-slate-700/20 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Input
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Enter any topic you want to understand..."
                      className="h-14 text-lg rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 pl-12"
                    />
                    <Lightbulb className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <Select value={funMode} onValueChange={setFunMode}>
                    <SelectTrigger className="w-full sm:w-48 h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl backdrop-blur-lg bg-white/90 dark:bg-slate-800/90 border-white/20 dark:border-slate-700/20">
                      {funModes.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value} className="hover:bg-indigo-50 dark:hover:bg-indigo-900/30">
                          <span className="flex items-center gap-3">
                            <span className="text-lg">{mode.icon}</span>
                            <div>
                              <div className="font-medium">{mode.label}</div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">{mode.description}</div>
                            </div>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="submit"
                    disabled={!topic.trim() || isLoading}
                    className="h-14 px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group flex-shrink-0"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform" />
                        Morph It!
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence>
          {(Object.keys(responses).length > 0 || isLoading) && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="w-full"
            >
              <Tabs defaultValue="tldr" className="w-full space-y-6">
                <TabsList className="grid w-full grid-cols-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/20 rounded-2xl p-1 shadow-sm h-12">
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="flex items-center justify-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-sm transition-all duration-300 h-10"
                    >
                      <tab.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {tabs.map((tab) => (
                  <TabsContent key={tab.id} value={tab.id} className="w-full">
                    <Card className="w-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border border-white/20 dark:border-slate-700/20 shadow-lg rounded-2xl overflow-hidden">
                      <CardHeader className="pb-4 px-6 pt-6">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                              <tab.icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-200 leading-tight">
                                {tab.label}
                              </CardTitle>
                              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                {tab.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                              onClick={() => {
                                if (responses[tab.id]) {
                                  handleCopy(responses[tab.id]);
                                }
                              }}
                              disabled={isLoading || !responses[tab.id]}
                              aria-label="Copy to clipboard"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                              disabled={isLoading}
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                              disabled={isLoading}
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="px-6 pb-6">
                        {isLoading ? (
                          <div className="space-y-4 w-full">
                            <div className="flex items-center gap-4 w-full">
                              <Avatar className="h-12 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md flex-shrink-0">
                                <AvatarFallback className="bg-transparent text-white font-bold">AI</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                                  <div
                                    className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.1s" }}
                                  ></div>
                                  <div
                                    className="w-2 h-2 bg-sky-600 rounded-full animate-bounce"
                                    style={{ animationDelay: "0.2s" }}
                                  ></div>
                                  <span className="text-sm text-slate-600 dark:text-slate-400 ml-2">
                                    Morphing your concept...
                                  </span>
                                </div>
                                <div className="space-y-2">
                                  {[...Array(3)].map((_, i) => (
                                    <div
                                      key={i}
                                      className="h-3 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"
                                      style={{
                                        width: `${90 - i * 15}%`,
                                        animationDelay: `${i * 0.1}s`
                                      }}
                                    ></div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-4 w-full">
                            <Avatar className="h-12 w-12 bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md flex-shrink-0">
                              <AvatarFallback className="bg-transparent text-white font-bold">AI</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-5 shadow-inner w-full">
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.8 }}
                                  className="prose prose-slate dark:prose-invert max-w-none w-full break-words"
                                  dangerouslySetInnerHTML={{
                                    __html:
                                      responses[tab.id]
                                        ?.replace(/\n/g, "<br>")
                                        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                        .replace(/\*(.*?)\*/g, "<em>$1</em>")
                                        .replace(/### (.*?)\n/g, "<h3>$1</h3>")
                                        .replace(/## (.*?)\n/g, "<h2>$1</h2>")
                                        .replace(/- (.*?)\n/g, "<li>$1</li>") || "",
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>

        {Object.keys(responses).length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center"
          >
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-6">Try these popular topics:</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "Quantum Computing",
                "Machine Learning",
                "Blockchain",
                "Neural Networks",
                "Photosynthesis",
                "Black Holes",
                "DNA Replication",
                "Climate Change",
              ].map((exampleTopic) => (
                <Button
                  key={exampleTopic}
                  variant="outline"
                  onClick={() => setTopic(exampleTopic)}
                  className="rounded-2xl border-2 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 shadow-sm"
                >
                  {exampleTopic}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Map,
  Target,
  CheckCircle,
  Circle,
  Calendar,
  Clock,
  Trophy,
  Sparkles,
  ArrowRight,
  Plus,
  BookOpen,
  Code,
  Database,
  Palette,
  Smartphone,
  Puzzle,
  Cpu,
  Globe,
  ChevronDown,
  ChevronUp,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateLearningRoadmap } from "@/lib/gemini"
import { toast } from "sonner"
import { exportRoadmapToPDF } from "@/components/export-roadmap"

interface Milestone {
  id: string
  title: string
  description: string
  completed: boolean
  estimatedDays: number
  topics: string[]
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  icon: string
}

interface Roadmap {
  id: string
  title: string
  description: string
  totalDays: number
  completedMilestones: number
  totalMilestones: number
  milestones: Milestone[]
  category: string
}

const iconComponents: Record<string, any> = {
  BookOpen,
  Target,
  Code,
  Sparkles,
  Database,
  CheckCircle,
  Trophy,
  Puzzle,
  Cpu,
  Globe,
  Smartphone,
  Palette
}

export default function RoadmapCreatorPage() {
  const [learningGoal, setLearningGoal] = useState("")
  const [currentLevel, setCurrentLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner")
  const [timeCommitment, setTimeCommitment] = useState<"part-time" | "full-time">("part-time")
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [showRoadmap, setShowRoadmap] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentRoadmap, setCurrentRoadmap] = useState<Roadmap | null>(null)
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null)

  const sampleRoadmaps = [
    {
      title: "Full Stack Web Development",
      description: "Master both frontend and backend development",
      category: "Web Development",
      icon: Code,
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      title: "Data Science & Machine Learning",
      description: "Learn data analysis and AI fundamentals",
      category: "Data Science",
      icon: Database,
      gradient: "from-green-500 to-emerald-600",
    },
    {
      title: "Mobile App Development",
      description: "Build iOS and Android applications",
      category: "Mobile Development",
      icon: Smartphone,
      gradient: "from-purple-500 to-pink-600",
    },
    {
      title: "UI/UX Design",
      description: "Create beautiful and user-friendly interfaces",
      category: "Design",
      icon: Palette,
      gradient: "from-orange-500 to-red-600",
    },
  ]

  const generateRoadmap = async () => {
    if (!learningGoal.trim()) {
      toast.warning("Please enter a learning goal")
      return
    }

    setIsGenerating(true)
    setShowRoadmap(false)
    setCurrentRoadmap(null)

    try {
      const generatedRoadmap = await generateLearningRoadmap(learningGoal, currentLevel, timeCommitment)
      
      const transformedRoadmap: Roadmap = {
        id: Date.now().toString(),
        title: generatedRoadmap.title,
        description: generatedRoadmap.description,
        totalDays: generatedRoadmap.totalDays,
        completedMilestones: 0,
        totalMilestones: generatedRoadmap.milestones.length,
        category: generatedRoadmap.category,
        milestones: generatedRoadmap.milestones.map((milestone: any, index: number) => ({
          id: `milestone-${index}`,
          title: milestone.title,
          description: milestone.description,
          completed: false,
          estimatedDays: milestone.estimatedDays,
          topics: milestone.topics,
          difficulty: milestone.difficulty,
          icon: milestone.icon
        }))
      }

      setCurrentRoadmap(transformedRoadmap)
      setShowRoadmap(true)
      toast.success("Your personalized roadmap has been generated!")
    } catch (error) {
      console.error("Error generating roadmap:", error)
      toast.error("Failed to generate roadmap. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleMilestone = (milestoneId: string) => {
    if (!currentRoadmap) return

    setCurrentRoadmap((prev) => {
      if (!prev) return null
      
      const updatedMilestones = prev.milestones.map((milestone) =>
        milestone.id === milestoneId ? { ...milestone, completed: !milestone.completed } : milestone
      )
      
      const completedCount = updatedMilestones.filter(m => m.completed).length
      
      return {
        ...prev,
        milestones: updatedMilestones,
        completedMilestones: completedCount
      }
    })
  }

  const toggleMilestoneExpand = (milestoneId: string) => {
    setExpandedMilestone(expandedMilestone === milestoneId ? null : milestoneId)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "Advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  if (showRoadmap && currentRoadmap) {
    const progressPercentage = (currentRoadmap.completedMilestones / currentRoadmap.totalMilestones) * 100

    return (
      <div className="min-h-screen mt-14 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 pt-20 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 shadow-2xl rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{currentRoadmap.title}</h1>
                    <p className="text-emerald-100 text-lg mb-4">{currentRoadmap.description}</p>
                    <div className="flex flex-wrap gap-4">
                      <Badge variant="secondary" className="text-sm bg-white/20 hover:bg-white/30">
                        {currentRoadmap.category}
                      </Badge>
                      <div className="flex items-center gap-2 text-emerald-100">
                        <Calendar className="h-4 w-4" />
                        <span>{currentRoadmap.totalDays} days total</span>
                      </div>
                   
                    </div>
                  </div>
                 
                </div>
                
              </CardContent>
            </Card>
          </motion.div>

          <div className="space-y-6">
            {currentRoadmap.milestones.map((milestone, index) => {
              const IconComponent = iconComponents[milestone.icon] || Target
              const isExpanded = expandedMilestone === milestone.id
              
              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  {index < currentRoadmap.milestones.length - 1 && (
                    <div className="absolute left-8 top-20 w-0.5 h-16 bg-gradient-to-b from-slate-300 to-slate-200 dark:from-slate-600 dark:to-slate-700" />
                  )}

                  <Card
                    className={`ml-20 transition-all duration-300 hover:shadow-lg overflow-hidden ${
                      milestone.completed
                        ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                        : "bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border-white/20 dark:border-slate-700/20"
                    } shadow-lg rounded-2xl`}
                  >
                    <CardContent className="p-0">
                      <div className="flex items-start gap-6 p-6">
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleMilestone(milestone.id)}
                            className={`absolute -left-28 top-0 w-16 h-16 rounded-2xl transition-all duration-300 ${
                              milestone.completed
                                ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                                : "bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300"
                            }`}
                          >
                            {milestone.completed ? (
                              <CheckCircle className="h-8 w-8" />
                            ) : (
                              <IconComponent className="h-8 w-8" />
                            )}
                          </Button>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3
                                className={`text-2xl font-bold mb-2 ${
                                  milestone.completed
                                    ? "text-green-800 dark:text-green-200"
                                    : "text-slate-800 dark:text-slate-200"
                                }`}
                              >
                                {milestone.title}
                              </h3>
                              <p className="text-slate-600 dark:text-slate-400">{milestone.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getDifficultyColor(milestone.difficulty)}>
                                {milestone.difficulty}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {milestone.estimatedDays}days 
                              </Badge>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 px-0 text-emerald-600 dark:text-emerald-400 hover:bg-transparent"
                            onClick={() => toggleMilestoneExpand(milestone.id)}
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Show less
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                Show details
                              </>
                            )}
                          </Button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 pt-0 border-t border-slate-200 dark:border-slate-700">
                              <div className="mb-2 mt-4">
                                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                  Key Topics:
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {milestone.topics.map((topic, topicIndex) => (
                                    <Badge 
                                      key={topicIndex} 
                                      variant="secondary" 
                                      className="text-sm py-1 px-3 rounded-lg"
                                    >
                                      {topic}
                                    </Badge>
                                  ))}
                                </div>
                              </div>


                             
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 text-center"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => {
                  setShowRoadmap(false)
                  setCurrentRoadmap(null)
                  setLearningGoal("")
                }}
                className="h-12 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Roadmap
              </Button>
              <Button
                onClick={() => exportRoadmapToPDF(currentRoadmap)}
                variant="outline"
                className="h-12 px-6 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 bg-transparent group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-emerald-600 dark:text-emerald-400 group-hover:animate-bounce"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export Roadmap
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 pt-20 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto mt-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <Map className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
            AI Roadmap Creator
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Get a personalized learning path tailored to your goals and current level
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border-white/20 dark:border-slate-700/20 shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                  What do you want to learn?
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  Tell us your learning goal and we'll create a personalized roadmap for you
                </p>
              </div>

              <div className="space-y-6">
                <Textarea
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                  placeholder="e.g., I want to become a full-stack web developer, learn machine learning, master React and Node.js..."
                  className="min-h-[120px] text-lg rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-300 resize-none"
                />

                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-slate-600 dark:text-slate-400"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                  >
                    {showAdvancedOptions ? (
                      <>
                        <ChevronUp className="h-4 w-4" />
                        Hide advanced options
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4" />
                        Show advanced options
                      </>
                    )}
                  </Button>

                  <AnimatePresence>
                    {showAdvancedOptions && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden space-y-4"
                      >
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300">Current Skill Level</Label>
                            <RadioGroup 
                              value={currentLevel}
                              onValueChange={(value: "beginner" | "intermediate" | "advanced") => setCurrentLevel(value)}
                              className="grid grid-cols-3 gap-2"
                            >
                              <div>
                                <RadioGroupItem value="beginner" id="beginner" className="peer sr-only" />
                                <Label
                                  htmlFor="beginner"
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:cursor-pointer peer-data-[state=checked]:border-emerald-500 dark:peer-data-[state=checked]:border-emerald-400 peer-data-[state=checked]:bg-emerald-50 dark:peer-data-[state=checked]:bg-emerald-900/20"
                                >
                                  <span className="text-sm font-medium">Beginner</span>
                                </Label>
                              </div>
                              <div>
                                <RadioGroupItem value="intermediate" id="intermediate" className="peer sr-only" />
                                <Label
                                  htmlFor="intermediate"
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:cursor-pointer peer-data-[state=checked]:border-emerald-500 dark:peer-data-[state=checked]:border-emerald-400 peer-data-[state=checked]:bg-emerald-50 dark:peer-data-[state=checked]:bg-emerald-900/20"
                                >
                                  <span className="text-sm font-medium">Intermediate</span>
                                </Label>
                              </div>
                              <div>
                                <RadioGroupItem value="advanced" id="advanced" className="peer sr-only" />
                                <Label
                                  htmlFor="advanced"
                                  className="flex flex-col items-center justify-between rounded-md border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:cursor-pointer peer-data-[state=checked]:border-emerald-500 dark:peer-data-[state=checked]:border-emerald-400 peer-data-[state=checked]:bg-emerald-50 dark:peer-data-[state=checked]:bg-emerald-900/20"
                                >
                                  <span className="text-sm font-medium">Advanced</span>
                                </Label>
                              </div>
                            </RadioGroup>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-slate-700 dark:text-slate-300">Time Commitment</Label>
                            <Select
                              value={timeCommitment}
                              onValueChange={(value: "part-time" | "full-time") => setTimeCommitment(value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select time commitment" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="part-time">Part-time (5-10 hrs/week)</SelectItem>
                                <SelectItem value="full-time">Full-time (20+ hrs/week)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="text-center pt-4">
                  <Button
                    onClick={generateRoadmap}
                    disabled={!learningGoal.trim() || isGenerating}
                    className="h-14 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group text-lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Generating Your Roadmap...
                      </>
                    ) : (
                      <>
                        <Target className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                        Create My Roadmap
                        <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="mb-12"
            >
              <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border-white/20 dark:border-slate-700/20 shadow-lg rounded-2xl overflow-hidden">
                <CardContent className="p-8 text-center">
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { 
                        duration: 2, 
                        repeat: Infinity, 
                        ease: "linear" 
                      },
                      scale: {
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }
                    }}
                    className="w-16 h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6"
                  >
                    <Sparkles className="h-8 w-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">
                    Crafting Your Perfect Learning Path
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Our AI is analyzing your goals and creating a personalized roadmap...
                  </p>
                  <div className="space-y-3 max-w-md mx-auto">
                    {[
                      "Analyzing your learning goals...",
                      "Identifying key milestones...",
                      "Estimating realistic timeframes...",
                      "Organizing learning sequence...",
                      "Adding practical projects...",
                    ].map((step, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.5 }}
                        className="flex items-center justify-center gap-3"
                      >
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ 
                            duration: 1.5, 
                            repeat: Infinity,
                            delay: index * 0.2
                          }}
                          className="w-2 h-2 bg-emerald-600 rounded-full"
                        />
                        <span className="text-slate-600 dark:text-slate-400">{step}</span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {!isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 text-center mb-8">
              Or choose from popular learning paths:
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {sampleRoadmaps.map((roadmap, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group cursor-pointer"
                  onClick={() => {
                    setLearningGoal(roadmap.title)
                    toast.info(`Selected "${roadmap.title}" - customize your options or click "Create My Roadmap"`)
                  }}
                >
                  <Card className="h-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg border-white/20 dark:border-slate-700/20 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${roadmap.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                      >
                        {roadmap.icon && <roadmap.icon className="h-8 w-8 text-white" />}
                      </div>
                      <h4 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                        {roadmap.title}
                      </h4>
                      <p className="text-slate-600 dark:text-slate-400 mb-4">{roadmap.description}</p>
                      <Badge variant="secondary" className="mb-4">
                        {roadmap.category}
                      </Badge>
                      <div className="flex items-center text-emerald-600 dark:text-emerald-400 group-hover:translate-x-2 transition-transform duration-300">
                        <span className="font-medium">Select this path</span>
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
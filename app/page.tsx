"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Brain,
  Zap,
  Target,
  MessageCircle,
  Map,
  RefreshCw,
  BookOpen,
  Star,
  Users,
  Award,
  ChevronRight,
  Bookmark,
  GraduationCap,
  Clock,
  BarChart2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const features = [
    {
      icon: Brain,
      title: "Concept Morph",
      description: "Transform complex topics into digestible explanations with AI-powered simplification",
      gradient: "from-indigo-500 to-purple-600",
    },
    {
      icon: Zap,
      title: "Quiz Zone",
      description: "AI-generated quizzes that adapt to your learning pace and identify knowledge gaps",
      gradient: "from-sky-500 to-indigo-600",
    },
    {
      icon: MessageCircle,
      title: "Doubt Resolver",
      description: "Get instant, contextual answers to your questions with our intelligent AI tutor",
      gradient: "from-purple-500 to-pink-600",
    },
    {
      icon: Map,
      title: "Roadmap Creator",
      description: "Personalized learning paths tailored to your goals and current knowledge level",
      gradient: "from-emerald-500 to-teal-600",
    },
    {
      icon: Target,
      title: "Knowledge Graph",
      description: "Visualize your knowledge network and track mastery across different topics",
      gradient: "from-orange-500 to-red-600",
    },
  ]




  const learningMethods = [
    {
      title: "Adaptive Learning",
      description: "Our AI adjusts content difficulty based on your performance",
      icon: BarChart2,
    },
    {
      title: "Micro-Lessons",
      description: "Bite-sized lessons optimized for maximum retention",
      icon: Clock,
    },
    {
      title: "Multimodal Input",
      description: "Learn through text, audio, diagrams, and interactive exercises",
      icon: GraduationCap,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-indigo-200/30 dark:bg-indigo-900/20"
            style={{
              width: Math.random() * 10 + 5 + 'px',
              height: Math.random() * 10 + 5 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
            }}
            animate={{
              x: mousePosition.x * (Math.random() * 0.02 - 0.01),
              y: mousePosition.y * (Math.random() * 0.02 - 0.01),
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
        
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-indigo-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-10"
          animate={{
            x: mousePosition.x * 0.02,
            y: mousePosition.y * 0.02,
            rotate: mousePosition.x * 0.01,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-sky-400 to-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 dark:opacity-10"
          animate={{
            x: mousePosition.x * -0.02,
            y: mousePosition.y * -0.02,
            rotate: mousePosition.x * -0.01,
          }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
        />
      </div>

     

      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-sm font-medium mb-4">
                AI-Powered Learning Platform
              </span>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 bg-clip-text text-transparent mb-6 leading-tight">
                Learn Smarter,<br />Not Harder
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
                The future of education is here. EduMorph adapts to your learning style, pace, and goals to deliver truly personalized education.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              <Link href="/concept-morph">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  Start Learning Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="relative max-w-5xl mx-auto"
            >
              <div className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-xl rounded-3xl p-6 border border-white/30 dark:border-slate-700/30 shadow-2xl overflow-hidden">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {features.slice(0, 6).map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-5 border border-white/30 dark:border-slate-700/30 hover:shadow-md transition-all"
                    >
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-3`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-base mb-1">{feature.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">{feature.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-200 mb-6">
              Transform Your Learning Experience
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              Cutting-edge features powered by artificial intelligence to accelerate your learning
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="group"
              >
                <Card className="h-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-white/30 dark:border-slate-700/30 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className={`h-2 w-full bg-gradient-to-r ${feature.gradient}`} />
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.gradient} flex items-center justify-center mr-4`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{feature.title}</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                    <div className="mt-4">
                      <Button variant="ghost" size="sm" className="text-indigo-600 dark:text-indigo-400 group-hover:underline">
                        Learn more <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

  
     
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join thousands of learners experiencing the future of education today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Learning Free
                </Button>
              </Link>
            
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          
           
          </div>
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Brain className="h-6 w-6 text-indigo-600 dark:text-indigo-400 mr-2" />
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                EduMorph
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              © {new Date().getFullYear()} EduMorph. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
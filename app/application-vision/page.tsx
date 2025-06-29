'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FiSearch, FiLoader, FiPlus, FiGlobe, FiCode, FiLayers, FiBriefcase } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { generateApplicationVision } from '@/lib/gemini';
import { Sparkles } from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';

interface ApplicationVisionData {
  useCases: string[];
  miniProject: string;
  tools: string[];
  industries: string[];
}

const FloatingIcons = () => {
  const iconsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (iconsRef.current) {
      iconsRef.current.rotation.y += 0.002;
      iconsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
    }
  });

  return (
    <group ref={iconsRef}>
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <mesh position={[-1.5, 0, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} />
        </mesh>
      </Float>
      <Float speed={3} rotationIntensity={1.5} floatIntensity={1.5}>
        <mesh position={[1.5, 0, 0]}>
          <boxGeometry args={[0.4, 0.4, 0.4]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
        </mesh>
      </Float>
      <Float speed={1.5} rotationIntensity={2} floatIntensity={2.5}>
        <mesh position={[0, 1.5, 0]}>
          <torusGeometry args={[0.3, 0.1, 16, 32]} />
          <meshStandardMaterial color="#7c3aed" emissive="#7c3aed" emissiveIntensity={0.5} />
        </mesh>
      </Float>
    </group>
  );
};

const ThreeDScene = () => {
  return (
    <Canvas className="absolute inset-0 -z-10 opacity-30 dark:opacity-20">
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <FloatingIcons />
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </Canvas>
  );
};

const ApplicationVisionCard = ({
  title,
  description,
  icon: Icon,
  className = '',
}: {
  title: string;
  description: string | string[];
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`relative overflow-hidden rounded-xl border bg-gradient-to-br from-white/80 to-white/20 p-6 shadow-lg backdrop-blur-lg dark:from-purple-900/20 dark:to-purple-900/10 ${className}`}
    >
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-500/10 blur-3xl" />
      
      <div className="relative z-10">
        <div className="mb-4 flex items-center">
          <div className="mr-4 rounded-lg bg-purple-500/10 p-3">
            <Icon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">{title}</h3>
        </div>
        
        {Array.isArray(description) ? (
          <ul className="space-y-2">
            {description.map((item, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start text-gray-700 dark:text-gray-300"
              >
                <span className="mr-2 mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700 dark:text-gray-300">{description}</p>
        )}
      </div>
    </motion.div>
  );
};

const ApplicationVisionCardSkeleton = () => (
  <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-white/80 to-white/20 p-6 shadow-lg backdrop-blur-lg dark:from-purple-900/20 dark:to-purple-900/10">
    <div className="space-y-4">
      <div className="flex items-center">
        <div className="mr-4 h-12 w-12 rounded-lg bg-purple-500/10" />
        <div className="h-6 w-32 rounded bg-gray-200/50 dark:bg-gray-700/50" />
      </div>
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 rounded bg-gray-200/30 dark:bg-gray-700/30" />
        ))}
      </div>
    </div>
  </div>
);

const ApplicationVision = () => {
  const [concept, setConcept] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<ApplicationVisionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [persona, setPersona] = useState<string>('default');
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await generateApplicationVision(concept, persona);
      setData(response);
    } catch (err) {
      console.error('Error generating application vision:', err);
      setError('Failed to generate vision. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const personas = [
    { value: 'default', label: 'General' },
    { value: 'engineer', label: 'Engineer' },
    { value: 'designer', label: 'Designer' },
    { value: 'researcher', label: 'Researcher' },
    { value: 'entrepreneur', label: 'Entrepreneur' },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ThreeDScene />
      
      <div className="container relative mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-4xl"
        >
          <div className="mb-12 text-center">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4 text-5xl font-bold tracking-tight text-gray-900 dark:text-white"
            >
              <span className="bg-gradient-to-r from-purple-600 to-emerald-500 bg-clip-text text-transparent">
                Application Vision
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-600 dark:text-gray-400"
            >
              Transform abstract concepts into tangible opportunities
            </motion.p>
          </div>

          <motion.form
            ref={formRef}
            onSubmit={handleSubmit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-12"
          >
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder="Enter any concept (e.g., Matrices, Photosynthesis, HTTP, World War II)"
                  className="h-16 rounded-2xl border-2 border-purple-200/50 bg-white/80 pl-14 text-lg shadow-lg backdrop-blur-sm transition-all hover:border-purple-300/70 focus:border-purple-500/50 focus:ring-0 dark:border-purple-900/50 dark:bg-gray-900/80 dark:hover:border-purple-800/70 dark:focus:border-purple-500/50"
                  disabled={isLoading}
                />
                <FiSearch className="absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-purple-500 dark:text-purple-400" />
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                  <Select value={persona} onValueChange={setPersona}>
                    <SelectTrigger className="h-14 rounded-xl border-2 border-purple-200/50 bg-white/80 shadow-lg backdrop-blur-sm hover:border-purple-300/70 focus:ring-0 dark:border-purple-900/50 dark:bg-gray-900/80 dark:hover:border-purple-800/70">
                      <SelectValue placeholder="Select perspective" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-0 bg-white/80 backdrop-blur-lg dark:bg-gray-900/80">
                      {personas.map((p) => (
                        <SelectItem
                          key={p.value}
                          value={p.value}
                          className="rounded-lg hover:bg-purple-100/50 dark:hover:bg-purple-900/50"
                        >
                          View as: {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="h-14 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 px-8 text-lg font-medium text-white shadow-lg transition-all hover:from-purple-700 hover:to-emerald-600 hover:shadow-xl focus:ring-0 focus:ring-offset-0"
                  disabled={isLoading || !concept.trim()}
                >
                  {isLoading ? (
                    <>
                      <FiLoader className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Vision
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.form>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-red-600 backdrop-blur-sm dark:text-red-400"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 gap-6 md:grid-cols-2"
              >
                {[...Array(4)].map((_, i) => (
                  <ApplicationVisionCardSkeleton key={i} />
                ))}
              </motion.div>
            ) : data ? (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ staggerChildren: 0.1 }}
                className="grid grid-cols-1 gap-6 md:grid-cols-2"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ApplicationVisionCard
                    title="Real-World Use Cases"
                    description={data.useCases}
                    icon={FiGlobe}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <ApplicationVisionCard
                    title="Mini Project Idea"
                    description={data.miniProject}
                    icon={FiCode}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <ApplicationVisionCard
                    title="Tools & Skills"
                    description={data.tools}
                    icon={FiLayers}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <ApplicationVisionCard
                    title="Industry Applications"
                    description={data.industries}
                    icon={FiBriefcase}
                  />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                  className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/10 to-emerald-500/10"
                >
                  <Sparkles className="h-16 w-16 text-purple-600 dark:text-purple-400" />
                </motion.div>
                <h3 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">
                  Discover Practical Applications
                </h3>
                <p className="max-w-md text-lg text-gray-600 dark:text-gray-400">
                  Enter any concept to reveal real-world use cases, project ideas, essential tools, and
                  industry connections.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default ApplicationVision;
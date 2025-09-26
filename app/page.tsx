'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Users, MessageCircle, Brain, ArrowRight, Mail, Linkedin } from 'lucide-react';
import AuthModal from '@/components/auth/auth-modal';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HomePage() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');

  const features = [
    {
      icon: Users,
      title: 'Peer Learning',
      description: 'Connect with peers to teach and learn skills collaboratively',
    },
    {
      icon: MessageCircle,
      title: 'Community',
      description: 'Join discussions, ask questions, and share knowledge',
    },
    {
      icon: Brain,
      title: 'AI Assistant',
      description: 'Get personalized learning help from PeerUp AI',
    },
  ];

  return (
    <>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative px-4 py-20 md:py-32">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Learn Together,
                <br />
                Grow Together
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                PeerUp connects learners and teachers in a collaborative environment where knowledge flows both ways.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => setAuthModalOpen(true)}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-4 text-lg"
                >
                  Start Learning Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* What is PeerUp Section */}
        <section className="px-4 py-20">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                What is PeerUp?
              </h2>
              <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
                PeerUp is a revolutionary peer-to-peer learning platform that connects people who want to learn with those who want to teach. 
                Whether you're looking to master a new programming language, learn a musical instrument, or improve your language skills, 
                PeerUp makes it easy to find the perfect learning partner.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl h-full">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                      <p className="text-slate-300 leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
                <CardContent className="p-8 text-center">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Get in Touch
                  </h2>
                  
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
                    <a
                      href="mailto:contact.sharajmm@gmail.com"
                      className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group"
                    >
                      <Mail className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                      <span>contact.sharajmm@gmail.com</span>
                    </a>
                    
                    <a
                      href="https://www.linkedin.com/in/sharajmm"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-slate-300 hover:text-white transition-colors group"
                    >
                      <Linkedin className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                      <span>LinkedIn Profile</span>
                    </a>
                  </div>

                  <div className="border-t border-white/20 pt-6">
                    <blockquote className="text-lg text-slate-300 italic leading-relaxed max-w-2xl mx-auto">
                      "The beautiful thing about learning is that no one can take it away from you. 
                      Education is the most powerful weapon which you can use to change the world. 
                      Together, we can unlock the potential in everyone."
                    </blockquote>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </>
  );
}
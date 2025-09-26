"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "signup";
  onModeChange: (mode: "login" | "signup") => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  mode,
  onModeChange,
}: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          username: username || email.split("@")[0],
          // store a lowercased username for reliable case-insensitive searches
          username_lower: (username || email.split("@")[0]).toLowerCase(),
          createdAt: new Date(),
          connections: [],
          profile: {
            age: null,
            gender: null,
            instagram: null,
            linkedin: null,
          },
        });

        toast({
          title: "Account created successfully!",
          description:
            "Welcome to PeerUp. You can now start learning and teaching.",
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Welcome back!",
          description: "You have been logged in successfully.",
        });
      }

      onClose();
      setEmail("");
      setPassword("");
      setUsername("");
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description:
          error.message || "An error occurred during authentication.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/20 bg-gradient-to-br from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {mode === "login" ? "Welcome Back" : "Join PeerUp"}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, x: mode === "login" ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === "login" ? 20 : -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {mode === "signup" && (
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-slate-200 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="glass-input bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                  placeholder="Enter your username"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-slate-200 flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-input bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-slate-200 flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass-input bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:scale-105"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() =>
                  onModeChange(mode === "login" ? "signup" : "login")
                }
                className="text-blue-400 hover:text-blue-300 text-sm underline underline-offset-2"
              >
                {mode === "login"
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </motion.form>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

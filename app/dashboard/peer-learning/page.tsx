"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Users,
  Clock,
  Globe,
  Send,
  Loader2,
  Calendar,
  Video,
} from "lucide-react";
import {
  createLearnRequest,
  createTeachOffer,
  getMatchingTeachers,
  getMatchingLearners,
  createMatchRequest,
} from "@/lib/firestore";

export default function PeerLearningPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<"learn" | "teach">("learn");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);

  // Form states
  const [skill, setSkill] = useState("");
  const [language, setLanguage] = useState("");
  const [availability, setAvailability] = useState<string[]>([]);

  const availabilityOptions = [
    "Morning (6AM - 12PM)",
    "Afternoon (12PM - 6PM)",
    "Evening (6PM - 12AM)",
    "Weekdays",
    "Weekends",
  ];

  const languages = [
    "English",
    "Hindi",
    "Spanish",
    "French",
    "German",
    "Chinese",
    "Japanese",
  ];

  const handleAvailabilityChange = (option: string, checked: boolean) => {
    if (checked) {
      setAvailability((prev) => [...prev, option]);
    } else {
      setAvailability((prev) => prev.filter((item) => item !== option));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !skill.trim() || !language || availability.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      if (mode === "learn") {
        await createLearnRequest({
          userId: user.uid,
          userEmail: user.email,
          skill: skill.toLowerCase().trim(),
          language,
          availability,
          status: "active",
        });

        let teachers = await getMatchingTeachers(skill.toLowerCase().trim());
        // Debug: log all teacher IDs and current user UID
        console.log(
          "Teachers:",
          teachers.map((t) => t.id),
          "Current user UID:",
          user.uid
        );
        // Exclude current user from teachers
        teachers = teachers.filter((t) => t.id && t.id !== user.uid);
        setMatches(teachers);

        // Create notifications for each teacher found (excluding self)
        for (const teacher of teachers) {
          if (teacher.id !== user.uid) {
            await import("@/lib/firestore").then(({ createNotification }) =>
              createNotification({
                userId: teacher.id,
                type: "learn_request",
                title: "New Learn Request",
                message: `${
                  user.email?.split("@")[0] || "Someone"
                } sent you a request to learn ${skill} from you.`,
                fromUserId: user.uid,
                fromUserEmail: user.email,
              })
            );
          }
        }

        toast({
          title: "Learn Request Created!",
          description: `Found ${teachers.length} potential teachers for ${skill}`,
        });
      } else {
        await createTeachOffer({
          userId: user.uid,
          userEmail: user.email,
          skills: [skill.toLowerCase().trim()],
          language,
          availability,
          status: "active",
        });

        let learners = await getMatchingLearners(skill.toLowerCase().trim());
        // Debug: log all learner IDs and current user UID
        console.log(
          "Learners:",
          learners.map((l) => l.id),
          "Current user UID:",
          user.uid
        );
        // Exclude current user from learners
        learners = learners.filter((l) => l.id && l.id !== user.uid);
        setMatches(learners);

        // Create notifications for each learner found (excluding self)
        for (const learner of learners) {
          if (learner.id !== user.uid) {
            await import("@/lib/firestore").then(({ createNotification }) =>
              createNotification({
                userId: learner.id,
                type: "teach_offer",
                title: "New Teach Offer",
                message: `${
                  user.email?.split("@")[0] || "Someone"
                } sent you a request to teach ${skill} to you.`,
                fromUserId: user.uid,
                fromUserEmail: user.email,
              })
            );
          }
        }

        toast({
          title: "Teaching Offer Created!",
          description: `Found ${learners.length} potential learners for ${skill}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to create request. ${
          error?.message || error?.code || "Please try again."
        }`,
        variant: "destructive",
      });
      // Optionally log error to console for debugging
      console.error("Create request error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (
    targetUserId: string,
    targetEmail: string
  ) => {
    if (!user) return;

    try {
      const requestId = await createMatchRequest({
        requesterId: user.uid,
        requesterEmail: user.email,
        targetUserId,
        targetEmail,
        skill: skill.toLowerCase().trim(),
        type: mode,
        message: `Hi! I'd like to ${
          mode === "learn" ? "learn" : "teach"
        } ${skill} with you.`,
        meetingLink: `https://meet.jit.si/peerup-${Date.now()}`,
        scheduledFor: null,
      });
      await import("@/lib/firestore").then(({ createNotification }) =>
        createNotification({
          userId: targetUserId,
          type: "match_request",
          title: "New Match Request",
          message: `${
            user.email?.split("@")[0] || "Someone"
          } sent you a match request for ${skill}.`,
          fromUserId: user.uid,
          fromUserEmail: user.email,
          skill: skill,
          requestId,
        })
      );

      toast({
        title: "Request Sent!",
        description: `Your match request has been sent.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Peer Learning
          </h1>
          <p className="text-slate-300 text-lg">
            Connect with peers to learn and teach skills together
          </p>
        </motion.div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="glass-card bg-white/5 p-1 rounded-lg border border-white/20">
            <div className="flex">
              <Button
                onClick={() => setMode("learn")}
                variant={mode === "learn" ? "default" : "ghost"}
                className={`px-6 py-2 ${
                  mode === "learn"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <BookOpen className="w-4 h-4 mr-2" />I Want to Learn
              </Button>
              <Button
                onClick={() => setMode("teach")}
                variant={mode === "teach" ? "default" : "ghost"}
                className={`px-6 py-2 ${
                  mode === "teach"
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                    : "text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Users className="w-4 h-4 mr-2" />I Want to Teach
              </Button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                {mode === "learn" ? (
                  <>
                    <BookOpen className="w-5 h-5" />
                    What do you want to learn?
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    What can you teach?
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="skill" className="text-slate-200">
                    {mode === "learn" ? "Skill to Learn" : "Skill to Teach"}
                  </Label>
                  <Input
                    id="skill"
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    placeholder="e.g., JavaScript, Guitar, Spanish..."
                    className="glass-input bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="language"
                    className="text-slate-200 flex items-center gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    Preferred Language
                  </Label>
                  <Select value={language} onValueChange={setLanguage} required>
                    <SelectTrigger className="glass-input bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-white/20 bg-slate-900/95 backdrop-blur-xl">
                      {languages.map((lang) => (
                        <SelectItem
                          key={lang}
                          value={lang}
                          className="text-slate-200 hover:bg-white/10"
                        >
                          {lang}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Availability
                  </Label>
                  <div className="grid grid-cols-1 gap-2">
                    {availabilityOptions.map((option) => (
                      <div key={option} className="flex items-center space-x-2">
                        <Checkbox
                          id={option}
                          checked={availability.includes(option)}
                          onCheckedChange={(checked) =>
                            handleAvailabilityChange(option, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={option}
                          className="text-slate-300 text-sm"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {mode === "learn" ? "Find Teachers" : "Find Learners"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Matches Section */}
          <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                {mode === "learn"
                  ? "Available Teachers"
                  : "Interested Learners"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence>
                {matches.filter((m) => m.id && m.id !== user?.uid).length >
                0 ? (
                  <div className="space-y-4">
                    {matches
                      .filter((m) => m.id && m.id !== user?.uid)
                      .map((match, index) => (
                        <motion.div
                          key={`${match.id}-${index}`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="glass-card bg-white/5 p-4 rounded-lg border border-white/10">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                    {match.userEmail?.[0]?.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-white font-medium">
                                    {match.userEmail?.split("@")[0]}
                                  </p>
                                  <p className="text-slate-400 text-sm">
                                    {match.language}
                                  </p>
                                </div>
                              </div>
                              <Button
                                onClick={() =>
                                  handleSendRequest(
                                    match.userId,
                                    match.userEmail
                                  )
                                }
                                size="sm"
                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Request Session
                              </Button>
                            </div>

                            {match.skills && (
                              <div className="mb-3">
                                <div className="flex flex-wrap gap-2">
                                  {match.skills
                                    .slice(0, 3)
                                    .map((skill: string) => (
                                      <Badge
                                        key={skill}
                                        variant="secondary"
                                        className="bg-blue-500/20 text-blue-300"
                                      >
                                        {skill}
                                      </Badge>
                                    ))}
                                </div>
                              </div>
                            )}

                            {match.availability && (
                              <div className="text-slate-400 text-sm">
                                <Clock className="w-4 h-4 inline mr-1" />
                                Available:{" "}
                                {match.availability.slice(0, 2).join(", ")}
                                {match.availability.length > 2 &&
                                  ` +${match.availability.length - 2} more`}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">
                      {skill
                        ? `No ${
                            mode === "learn" ? "teachers" : "learners"
                          } found for "${skill}" yet.`
                        : `Submit a ${
                            mode === "learn" ? "learning" : "teaching"
                          } request to find matches.`}
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

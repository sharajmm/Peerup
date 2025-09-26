"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Network,
  Search,
  UserPlus,
  Users,
  MessageCircle,
  Loader2,
  Heart,
} from "lucide-react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createNotification, createConnectionRequest } from "@/lib/firestore";

export default function ConnectionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (user) {
      loadConnections();
    }
  }, [user]);

  // Debounced live search: run searchUsers 300ms after typing stops
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }

    const handle = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(handle);
  }, [searchQuery]);

  const loadConnections = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const connectionIds = userData.connections || [];

        if (connectionIds.length > 0) {
          const connectionsData = await Promise.all(
            connectionIds.map(async (connectionId: string) => {
              const connectionDoc = await getDoc(
                doc(db, "users", connectionId)
              );
              return connectionDoc.exists()
                ? { id: connectionDoc.id, ...connectionDoc.data() }
                : null;
            })
          );
          setConnections(connectionsData.filter(Boolean));
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load connections.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      // Prepare queries
      const q = searchQuery.trim();
      const qLower = q.toLowerCase();

      // Range queries for prefix matches using username_lower for case-insensitive search
      const usernameRangeQuery = query(
        collection(db, "users"),
        where("username_lower", ">=", qLower),
        where("username_lower", "<=", qLower + "\uf8ff")
      );

      // Also run a range query using the typed (original) case against 'username' as a fallback
      const usernameRangeQueryTyped = query(
        collection(db, "users"),
        where("username", ">=", q),
        where("username", "<=", q + "\uf8ff")
      );

      const emailRangeQuery = query(
        collection(db, "users"),
        where("email", ">=", qLower),
        where("email", "<=", qLower + "\uf8ff")
      );

      // Exact-match queries (helpful when user types full email or exact username)
      const emailExactQuery = query(
        collection(db, "users"),
        where("email", "==", qLower)
      );

      // Exact-match queries using username_lower and username as fallback
      const usernameExactQueryLower = query(
        collection(db, "users"),
        where("username_lower", "==", qLower)
      );

      const usernameExactQuery = query(
        collection(db, "users"),
        where("username", "==", q)
      );

      // Run queries in parallel
      const [
        usernameRangeResults,
        emailRangeResults,
        emailExactResults,
        usernameExactLowerResults,
        usernameExactResults,
        usernameRangeTypedResults,
      ] = await Promise.all([
        getDocs(usernameRangeQuery),
        getDocs(emailRangeQuery),
        getDocs(emailExactQuery),
        getDocs(usernameExactQueryLower),
        getDocs(usernameExactQuery),
        getDocs(usernameRangeQueryTyped),
      ]);

      const results = new Map<string, any>();

      const pushDocs = (docs: any[]) => {
        docs.forEach((d: any) => {
          if (d.exists && typeof d.exists === "function" ? d.exists() : true) {
            const id = d.id ?? d._document?.key?.path?.segments?.slice(-1)[0];
            if (id && id !== user?.uid) {
              const data = d.data
                ? d.data()
                : d._document?.data?.value?.mapValue?.fields;
              results.set(id, { id, ...(data || {}) });
            }
          } else if (d.id) {
            const id = d.id;
            if (id && id !== user?.uid) {
              const data = d.data();
              results.set(id, { id, ...data });
            }
          }
        });
      };

      pushDocs(usernameRangeResults.docs);
      pushDocs(emailRangeResults.docs);
      pushDocs(emailExactResults.docs);
      pushDocs(usernameExactLowerResults.docs);
      pushDocs(usernameExactResults.docs);
      // include typed-case range results too
      pushDocs(usernameRangeTypedResults.docs);

      setSearchResults(Array.from(results.values()));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search users.",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const sendConnectionRequest = async (
    targetUserId: string,
    targetEmail: string,
    targetUsername: string
  ) => {
    if (!user) return;

    try {
      // Create a pending connection request document
      const requestId = await createConnectionRequest({
        requesterId: user.uid,
        requesterEmail: user.email,
        targetId: targetUserId,
        targetEmail: targetEmail,
        status: "pending",
      });

      // Create notification for target user to accept/deny
      await createNotification({
        userId: targetUserId,
        type: "connection_request",
        title: "Connection Request",
        message: `${
          user.email?.split("@")[0] || "Someone"
        } wants to connect with you.`,
        fromUserId: user.uid,
        fromUserEmail: user.email,
        requestId,
      });

      toast({
        title: "Request Sent",
        description: `Connection request sent to ${
          targetUsername || targetEmail?.split("@")[0]
        }`,
      });

      // Remove from search results
      setSearchResults((prev) =>
        prev.filter((result) => result.id !== targetUserId)
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send connection request.",
        variant: "destructive",
      });
    }
  };

  const isAlreadyConnected = (userId: string) => {
    return connections.some((conn) => conn.id === userId);
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
            Connections
          </h1>
          <p className="text-slate-300 text-lg">
            Find and connect with other learners and teachers
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Search Section */}
          <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Search className="w-5 h-5" />
                Find New Connections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3 mb-6">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by username or email..."
                  className="glass-input bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                  onKeyPress={(e) => e.key === "Enter" && searchUsers()}
                />
                <Button
                  onClick={searchUsers}
                  disabled={searching || !searchQuery.trim()}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6"
                >
                  {searching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {searchResults.map((result) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <div className="glass-card bg-white/5 p-4 rounded-lg border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                              {result.username?.[0]?.toUpperCase() ||
                                result.email?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-medium">
                              {result.username || result.email?.split("@")[0]}
                            </p>
                            <p className="text-slate-400 text-sm">
                              {result.email}
                            </p>
                          </div>
                        </div>

                        {isAlreadyConnected(result.id) ? (
                          <Badge className="bg-green-500/20 text-green-300">
                            <Heart className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                        ) : (
                          <Button
                            onClick={() =>
                              sendConnectionRequest(
                                result.id,
                                result.email,
                                result.username
                              )
                            }
                            size="sm"
                            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                          >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Connect
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {searchQuery && searchResults.length === 0 && !searching && (
                  <div className="text-center py-6">
                    <Search className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-slate-400">
                      No users found matching "{searchQuery}"
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* My Connections Section */}
          <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Network className="w-5 h-5" />
                My Connections ({connections.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-400 mx-auto mb-2" />
                  <p className="text-slate-400">Loading connections...</p>
                </div>
              ) : connections.length > 0 ? (
                <div className="space-y-3">
                  <AnimatePresence>
                    {connections.map((connection, index) => (
                      <motion.div
                        key={connection.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="glass-card bg-white/5 p-4 rounded-lg border border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                                {connection.username?.[0]?.toUpperCase() ||
                                  connection.email?.[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white font-medium">
                                {connection.username ||
                                  connection.email?.split("@")[0]}
                              </p>
                              <p className="text-slate-400 text-sm">
                                {connection.email}
                              </p>
                              {connection.profile?.age &&
                                connection.profile?.gender && (
                                  <div className="flex gap-2 mt-1">
                                    <Badge
                                      variant="secondary"
                                      className="bg-purple-500/20 text-purple-300 text-xs"
                                    >
                                      {connection.profile.age} years
                                    </Badge>
                                    <Badge
                                      variant="secondary"
                                      className="bg-blue-500/20 text-blue-300 text-xs"
                                    >
                                      {connection.profile.gender}
                                    </Badge>
                                  </div>
                                )}
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-slate-300 hover:text-white hover:bg-white/10"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No Connections Yet
                  </h3>
                  <p className="text-slate-400 mb-4">
                    Start connecting with other learners and teachers!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

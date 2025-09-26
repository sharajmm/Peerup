"use client";
// ...existing imports...

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  Clock,
  Users,
  MessageCircle,
  BookOpen,
  Network,
  Loader2,
} from "lucide-react";
// Helper functions
function getNotificationIcon(type: string) {
  switch (type) {
    case "match_request":
      return MessageCircle;
    case "session_accepted":
      return BookOpen;
    case "connection_request":
      return Network;
    case "community_reply":
      return Users;
    default:
      return Bell;
  }
}
function getNotificationColor(type: string) {
  switch (type) {
    case "match_request":
      return "bg-blue-500/20 text-blue-400";
    case "session_accepted":
      return "bg-green-500/20 text-green-400";
    case "connection_request":
      return "bg-purple-500/20 text-purple-400";
    case "community_reply":
      return "bg-pink-500/20 text-pink-400";
    default:
      return "bg-slate-500/20 text-slate-400";
  }
}
function formatTimestamp(timestamp: any) {
  if (!timestamp) return "";
  try {
    if (timestamp.seconds) {
      return formatDistanceToNow(new Date(timestamp.seconds * 1000), {
        addSuffix: true,
      });
    }
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  } catch {
    return "";
  }
}
import { markNotificationAsRead } from "@/lib/firestore";
import {
  updateLearnRequest,
  updateTeachOffer,
  updateMatchRequest,
} from "@/lib/firestore";
import {
  acceptConnectionRequest,
  updateConnectionRequest,
  createNotification,
} from "@/lib/firestore";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";

export default function NotificationsPage() {
  // Accept/Deny handlers for learn/teach requests
  async function handleAllowLearnRequest(requestId: string) {
    try {
      await updateLearnRequest(requestId, { status: "allowed" });
      toast({
        title: "Request Allowed",
        description: "You have allowed the learn request.",
      });
      setModalOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: String(err),
        variant: "destructive",
      });
    }
  }

  async function handleDenyLearnRequest(requestId: string) {
    try {
      await updateLearnRequest(requestId, { status: "denied" });
      toast({
        title: "Request Denied",
        description: "You have denied the learn request.",
      });
      setModalOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: String(err),
        variant: "destructive",
      });
    }
  }

  async function handleAllowTeachOffer(requestId: string) {
    try {
      await updateTeachOffer(requestId, { status: "allowed" });
      toast({
        title: "Offer Allowed",
        description: "You have allowed the teach offer.",
      });
      setModalOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: String(err),
        variant: "destructive",
      });
    }
  }

  async function handleDenyTeachOffer(requestId: string) {
    try {
      await updateTeachOffer(requestId, { status: "denied" });
      toast({
        title: "Offer Denied",
        description: "You have denied the teach offer.",
      });
      setModalOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: String(err),
        variant: "destructive",
      });
    }
  }
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(
    null
  );
  const [requestDetails, setRequestDetails] = useState<any | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Accept/Deny handlers for match requests
  async function handleAcceptMatch(requestId: string) {
    try {
      await import("@/lib/firestore").then(({ updateMatchRequest }) =>
        updateMatchRequest(requestId, { status: "accepted" })
      );
      toast({
        title: "Request Accepted",
        description: "You have accepted the match request.",
      });
      setModalOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: String(err),
        variant: "destructive",
      });
    }
  }

  async function handleDenyMatch(requestId: string) {
    try {
      await import("@/lib/firestore").then(({ updateMatchRequest }) =>
        updateMatchRequest(requestId, { status: "denied" })
      );
      toast({
        title: "Request Denied",
        description: "You have denied the match request.",
      });
      setModalOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: String(err),
        variant: "destructive",
      });
    }
  }

  // Accept/Deny handlers for connection requests
  async function handleAcceptConnection(requestId: string, notification: any) {
    try {
      await acceptConnectionRequest(requestId);
      // update the connection_request status
      await updateConnectionRequest(requestId, { status: "accepted" });
      // notify requester
      if (notification?.fromUserId) {
        await createNotification({
          userId: notification.fromUserId,
          type: "session_accepted",
          title: "Connection Accepted",
          message: `${
            notification?.userId || "Someone"
          } accepted your connection request.`,
        });
      }
      toast({
        title: "Connection Accepted",
        description: "You are now connected.",
      });
      setModalOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: String(err),
        variant: "destructive",
      });
    }
  }

  async function handleDenyConnection(requestId: string, notification: any) {
    try {
      await updateConnectionRequest(requestId, { status: "denied" });
      // notify requester
      if (notification?.fromUserId) {
        await createNotification({
          userId: notification.fromUserId,
          type: "session_accepted",
          title: "Connection Denied",
          message: `${
            notification?.userId || "Someone"
          } denied your connection request.`,
        });
      }
      toast({
        title: "Request Denied",
        description: "Connection request denied.",
      });
      setModalOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: String(err),
        variant: "destructive",
      });
    }
  }

  // Helper: fetch request details for modal
  async function fetchRequestDetails(notification: any) {
    if (!notification?.requestId) {
      setRequestDetails(null);
      console.log("No requestId in notification", notification);
      return;
    }
    try {
      // Load from the appropriate collection depending on notification type
      let collectionName = "requests";
      switch (notification?.type) {
        case "connection_request":
          collectionName = "connection_requests";
          break;
        case "match_request":
          collectionName = "match_requests";
          break;
        case "learn_request":
          collectionName = "learn_requests";
          break;
        case "teach_offer":
          collectionName = "teach_offers";
          break;
        default:
          collectionName = "requests";
      }
      const docRef = doc(db, collectionName, notification.requestId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setRequestDetails(docSnap.data());
        console.log("Fetched request details:", docSnap.data());
      } else {
        setRequestDetails(null);
        console.log("No request found for id", notification.requestId);
      }
    } catch (err) {
      setRequestDetails(null);
      console.error("Error fetching request details:", err);
    }
  }

  // Helper: mark notification as read
  async function handleMarkAsRead(id: string) {
    await markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  useEffect(() => {
    async function fetchNotifications() {
      if (!user?.uid) return;
      setLoading(true);
      try {
        // Avoid composite-index errors by querying only by userId,
        // then sort by createdAt client-side.
        const q = query(
          collection(db, "notifications"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const notifs = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as any),
        }));
        // sort by createdAt desc (handle missing timestamps)
        notifs.sort((a: any, b: any) => {
          const ta = a.createdAt?.seconds
            ? a.createdAt.seconds
            : new Date(a.createdAt).getTime() / 1000 || 0;
          const tb = b.createdAt?.seconds
            ? b.createdAt.seconds
            : new Date(b.createdAt).getTime() / 1000 || 0;
          return tb - ta;
        });
        setNotifications(notifs.slice(0, 200));
      } catch (err) {
        setNotifications([]);
        toast({
          title: "Error loading notifications",
          description: String(err),
          variant: "destructive",
        });
      }
      setLoading(false);
    }
    fetchNotifications();
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2">
            Notifications
          </h1>
          <p className="text-slate-400 text-lg">
            Stay updated with the latest activity
          </p>
        </div>

        {/* Notifications List */}
        <Card className="glass-card border-white/20">
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
                <p className="text-slate-300">Loading notifications...</p>
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-4">
                <AnimatePresence>
                  {notifications.map((notification, index) => {
                    const IconComponent = getNotificationIcon(
                      notification.type
                    );
                    const colorClass = getNotificationColor(notification.type);
                    let displayTitle = notification.title;
                    let displayMessage = notification.message;
                    let displaySkill =
                      notification.skill ||
                      (requestDetails && requestDetails.skill);
                    let displayFrom =
                      notification.fromUserEmail ||
                      (requestDetails && requestDetails.requesterEmail);
                    // Custom display for match_request
                    if (notification.type === "match_request") {
                      displayTitle = `Session Request for ${
                        displaySkill || "a skill"
                      }`;
                      displayMessage = `${
                        displayFrom?.split("@")[0] || "Someone"
                      } wants to learn/teach ${
                        displaySkill || "a skill"
                      } with you.`;
                    }
                    return (
                      <Dialog
                        key={notification.id}
                        open={
                          modalOpen &&
                          selectedNotification?.id === notification.id
                        }
                        onOpenChange={(open) => {
                          setModalOpen(open);
                          if (!open) {
                            setSelectedNotification(null);
                            setRequestDetails(null);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            className={`glass-card p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                              notification.read
                                ? "bg-white/5 border-white/10"
                                : "bg-blue-500/10 border-blue-500/20 shadow-blue-500/10 shadow-lg"
                            }`}
                            onClick={async () => {
                              setSelectedNotification(notification);
                              setModalOpen(true);
                              await fetchRequestDetails(notification);
                            }}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}
                              >
                                <IconComponent className="w-5 h-5" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="text-white font-semibold">
                                    {displayTitle}
                                  </h3>
                                  <div className="flex items-center gap-2">
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                    )}
                                    <span className="text-slate-400 text-sm flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatTimestamp(notification.createdAt)}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-slate-300 mb-3 leading-relaxed">
                                  {displayMessage}
                                </p>
                                {displaySkill && (
                                  <div className="mb-2 text-slate-400 text-sm">
                                    Skill:{" "}
                                    <span className="font-semibold text-white">
                                      {displaySkill}
                                    </span>
                                  </div>
                                )}
                                {displayFrom && (
                                  <div className="flex items-center gap-2 mb-3">
                                    <Avatar className="w-6 h-6">
                                      <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white text-xs">
                                        {displayFrom[0]?.toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-slate-400 text-sm">
                                      From: {displayFrom.split("@")[0]}
                                    </span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  {!notification.read && (
                                    <Button
                                      onClick={() =>
                                        handleMarkAsRead(notification.id)
                                      }
                                      size="sm"
                                      variant="ghost"
                                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                    >
                                      <Check className="w-4 h-4 mr-2" />
                                      Mark as Read
                                    </Button>
                                  )}
                                  {notification.type ===
                                    "connection_request" && (
                                    <>
                                      <Button
                                        size="sm"
                                        className="bg-green-500 hover:bg-green-600 text-white"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          await handleAcceptConnection(
                                            notification.requestId,
                                            notification
                                          );
                                          // mark read after action
                                          await handleMarkAsRead(
                                            notification.id
                                          );
                                        }}
                                      >
                                        Accept
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="bg-red-500 hover:bg-red-600 text-white"
                                        onClick={async (e) => {
                                          e.stopPropagation();
                                          await handleDenyConnection(
                                            notification.requestId,
                                            notification
                                          );
                                          await handleMarkAsRead(
                                            notification.id
                                          );
                                        }}
                                      >
                                        Deny
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogClose className="absolute top-2 right-2" />
                          <DialogTitle className="text-xl font-bold mb-2">
                            Request Details
                          </DialogTitle>
                          {requestDetails ? (
                            <div className="space-y-2">
                              <div>
                                <strong>Type:</strong> {requestDetails.type}
                              </div>
                              <div>
                                <strong>Skill:</strong> {requestDetails.skill}
                              </div>
                              <div>
                                <strong>Message:</strong>{" "}
                                {requestDetails.message}
                              </div>
                              {requestDetails.requesterEmail && (
                                <div>
                                  <strong>From:</strong>{" "}
                                  {requestDetails.requesterEmail}
                                </div>
                              )}
                              {requestDetails.targetEmail && (
                                <div>
                                  <strong>To:</strong>{" "}
                                  {requestDetails.targetEmail}
                                </div>
                              )}
                              {requestDetails.meetingLink && (
                                <div>
                                  <strong>Meeting Link:</strong>{" "}
                                  <a
                                    href={requestDetails.meetingLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 underline"
                                  >
                                    Join
                                  </a>
                                </div>
                              )}
                              {selectedNotification?.type === "match_request" &&
                                requestDetails && (
                                  <div className="flex gap-3 mt-4">
                                    <Button
                                      onClick={() =>
                                        handleAcceptMatch(
                                          selectedNotification.requestId
                                        )
                                      }
                                      className="bg-green-500 hover:bg-green-600 text-white"
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleDenyMatch(
                                          selectedNotification.requestId
                                        )
                                      }
                                      className="bg-red-500 hover:bg-red-600 text-white"
                                    >
                                      Deny
                                    </Button>
                                  </div>
                                )}
                              {selectedNotification?.type === "learn_request" &&
                                requestDetails && (
                                  <div className="flex gap-3 mt-4">
                                    <Button
                                      onClick={() =>
                                        handleAllowLearnRequest(
                                          selectedNotification.requestId
                                        )
                                      }
                                      className="bg-green-500 hover:bg-green-600 text-white"
                                    >
                                      Allow
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleDenyLearnRequest(
                                          selectedNotification.requestId
                                        )
                                      }
                                      className="bg-red-500 hover:bg-red-600 text-white"
                                    >
                                      Deny
                                    </Button>
                                  </div>
                                )}
                              {selectedNotification?.type === "teach_offer" &&
                                requestDetails && (
                                  <div className="flex gap-3 mt-4">
                                    <Button
                                      onClick={() =>
                                        handleAllowTeachOffer(
                                          selectedNotification.requestId
                                        )
                                      }
                                      className="bg-green-500 hover:bg-green-600 text-white"
                                    >
                                      Allow
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleDenyTeachOffer(
                                          selectedNotification.requestId
                                        )
                                      }
                                      className="bg-red-500 hover:bg-red-600 text-white"
                                    >
                                      Deny
                                    </Button>
                                  </div>
                                )}
                              {selectedNotification?.type ===
                                "connection_request" &&
                                requestDetails && (
                                  <div className="flex gap-3 mt-4">
                                    <Button
                                      onClick={() =>
                                        handleAcceptConnection(
                                          selectedNotification.requestId,
                                          selectedNotification
                                        )
                                      }
                                      className="bg-green-500 hover:bg-green-600 text-white"
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        handleDenyConnection(
                                          selectedNotification.requestId,
                                          selectedNotification
                                        )
                                      }
                                      className="bg-red-500 hover:bg-red-600 text-white"
                                    >
                                      Deny
                                    </Button>
                                  </div>
                                )}
                            </div>
                          ) : (
                            <div className="text-slate-400">
                              No details found for this request.
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Notifications
                </h3>
                <p className="text-slate-400">
                  You're all caught up! Notifications will appear here when you
                  have new activity.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
          >
            <Card className="glass-card border-white/20 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-xl">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {
                    notifications.filter(
                      (n) =>
                        n.type === "match_request" ||
                        n.type === "session_accepted"
                    ).length
                  }
                </div>
                <div className="text-slate-300 text-sm">Learning Sessions</div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/20 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-xl">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">
                  {
                    notifications.filter((n) => n.type === "connection_request")
                      .length
                  }
                </div>
                <div className="text-slate-300 text-sm">New Connections</div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/20 bg-gradient-to-br from-green-500/10 to-blue-500/10 backdrop-blur-xl">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">
                  {
                    notifications.filter((n) => n.type === "community_reply")
                      .length
                  }
                </div>
                <div className="text-slate-300 text-sm">Community Activity</div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

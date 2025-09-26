import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  DocumentData,
  QuerySnapshot,
  DocumentSnapshot,
  arrayUnion,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// User operations
export const createUser = async (userId: string, userData: any) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getUser = async (userId: string): Promise<any | null> => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null;
};

export const updateUser = async (userId: string, userData: any) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    ...userData,
    updatedAt: serverTimestamp(),
  });
};

// Learn requests operations
export const updateLearnRequest = async (
  requestId: string,
  updateData: any
) => {
  const requestRef = doc(db, "learn_requests", requestId);
  await updateDoc(requestRef, {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
};
export const createLearnRequest = async (requestData: any) => {
  const docRef = await addDoc(collection(db, "learn_requests"), {
    ...requestData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getMatchingTeachers = async (skill: string) => {
  const q = query(
    collection(db, "teach_offers"),
    where("skills", "array-contains", skill.toLowerCase())
  );
  const querySnapshot = await getDocs(q);
  const results = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  // sort client-side by createdAt desc when available
  results.sort((a: any, b: any) => {
    const ta = a.createdAt?.seconds
      ? a.createdAt.seconds
      : new Date(a.createdAt).getTime() / 1000 || 0;
    const tb = b.createdAt?.seconds
      ? b.createdAt.seconds
      : new Date(b.createdAt).getTime() / 1000 || 0;
    return tb - ta;
  });
  return results;
};

// Teach offers operations
export const updateTeachOffer = async (offerId: string, updateData: any) => {
  const offerRef = doc(db, "teach_offers", offerId);
  await updateDoc(offerRef, {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
};
export const createTeachOffer = async (offerData: any) => {
  const docRef = await addDoc(collection(db, "teach_offers"), {
    ...offerData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getMatchingLearners = async (skill: string) => {
  const q = query(
    collection(db, "learn_requests"),
    where("skill", "==", skill.toLowerCase())
  );
  const querySnapshot = await getDocs(q);
  const results = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  results.sort((a: any, b: any) => {
    const ta = a.createdAt?.seconds
      ? a.createdAt.seconds
      : new Date(a.createdAt).getTime() / 1000 || 0;
    const tb = b.createdAt?.seconds
      ? b.createdAt.seconds
      : new Date(b.createdAt).getTime() / 1000 || 0;
    return tb - ta;
  });
  return results;
};

// Match requests operations
export const createMatchRequest = async (matchData: any) => {
  const docRef = await addDoc(collection(db, "match_requests"), {
    ...matchData,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateMatchRequest = async (matchId: string, updateData: any) => {
  const matchRef = doc(db, "match_requests", matchId);
  await updateDoc(matchRef, {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
};

// Connection requests operations
export const createConnectionRequest = async (requestData: any) => {
  const docRef = await addDoc(collection(db, "connection_requests"), {
    ...requestData,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateConnectionRequest = async (
  requestId: string,
  updateData: any
) => {
  const reqRef = doc(db, "connection_requests", requestId);
  await updateDoc(reqRef, {
    ...updateData,
    updatedAt: serverTimestamp(),
  });
};

export const acceptConnectionRequest = async (requestId: string) => {
  const reqRef = doc(db, "connection_requests", requestId);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) throw new Error("Request not found");
  const data = reqSnap.data() as any;
  if (!data.requesterId || !data.targetId)
    throw new Error("Invalid request data");

  // Add each user to the other's connections array
  const requesterRef = doc(db, "users", data.requesterId);
  const targetRef = doc(db, "users", data.targetId);

  await updateDoc(requesterRef, {
    connections: arrayUnion(data.targetId),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(targetRef, {
    connections: arrayUnion(data.requesterId),
    updatedAt: serverTimestamp(),
  });

  // Mark request accepted
  await updateDoc(reqRef, {
    status: "accepted",
    updatedAt: serverTimestamp(),
  });
};

// Community posts operations
export const createCommunityPost = async (postData: any) => {
  const docRef = await addDoc(collection(db, "community_posts"), {
    ...postData,
    likes: 0,
    replies: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getCommunityPosts = async () => {
  const q = query(
    collection(db, "community_posts"),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

// Notifications operations
export const createNotification = async (notificationData: any) => {
  const docRef = await addDoc(collection(db, "notifications"), {
    ...notificationData,
    read: false,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getUserNotifications = (
  userId: string,
  callback: (notifications: any[]) => void
) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId)
  );
  return onSnapshot(q, (querySnapshot) => {
    const notifications = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    // sort by createdAt desc, limit 50
    notifications.sort((a: any, b: any) => {
      const ta = a.createdAt?.seconds
        ? a.createdAt.seconds
        : new Date(a.createdAt).getTime() / 1000 || 0;
      const tb = b.createdAt?.seconds
        ? b.createdAt.seconds
        : new Date(b.createdAt).getTime() / 1000 || 0;
      return tb - ta;
    });
    callback(notifications.slice(0, 50));
  });
};

export const markNotificationAsRead = async (notificationId: string) => {
  const notificationRef = doc(db, "notifications", notificationId);
  await updateDoc(notificationRef, { read: true });
};

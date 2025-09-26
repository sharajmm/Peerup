'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Plus, Heart, Reply, Image, Users, Clock, Send, Loader2 } from 'lucide-react';
import { createCommunityPost, getCommunityPosts } from '@/lib/firestore';
import { formatDistanceToNow } from 'date-fns';
import { doc, updateDoc, serverTimestamp, collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CommunityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [body, setBody] = useState('');
  const [imageLink, setImageLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reply states
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const categories = [
    'Programming', 'Languages', 'Music', 'Art', 'Science', 'Mathematics',
    'Business', 'Design', 'Sports', 'Cooking', 'General', 'Other'
  ];

  const categoryColors: { [key: string]: string } = {
    Programming: 'bg-blue-500/20 text-blue-300',
    Languages: 'bg-green-500/20 text-green-300',
    Music: 'bg-purple-500/20 text-purple-300',
    Art: 'bg-pink-500/20 text-pink-300',
    Science: 'bg-cyan-500/20 text-cyan-300',
    Mathematics: 'bg-yellow-500/20 text-yellow-300',
    Business: 'bg-orange-500/20 text-orange-300',
    Design: 'bg-indigo-500/20 text-indigo-300',
    Sports: 'bg-red-500/20 text-red-300',
    Cooking: 'bg-amber-500/20 text-amber-300',
    General: 'bg-slate-500/20 text-slate-300',
    Other: 'bg-gray-500/20 text-gray-300'
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const postsData = await getCommunityPosts();
      // Fetch replies for each post
      const postsWithReplies = await Promise.all(postsData.map(async (post: any) => {
        const repliesSnapshot = await getDocs(query(collection(db, 'community_posts', post.id, 'replies'), orderBy('createdAt', 'asc')));
        const replies = repliesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return { ...post, repliesList: replies };
      }));
      setPosts(postsWithReplies);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load community posts.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !category || !body.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);
    try {
      await createCommunityPost({
        title: title.trim(),
        category,
        body: body.trim(),
        imageLink: imageLink.trim() || null,
        userId: user.uid,
        userEmail: user.email,
        userName: user.email?.split('@')[0] || 'Anonymous'
      });

      toast({
        title: 'Post Created!',
        description: 'Your post has been shared with the community.',
      });

      // Reset form
      setTitle('');
      setCategory('');
      setBody('');
      setImageLink('');
      setShowCreateForm(false);

      // Reload posts
      loadPosts();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  // Like handler
  const handleLike = async (postId: string, currentLikes: number) => {
    if (!user) {
      toast({ title: 'Login required', description: 'Please login to like posts.', variant: 'destructive' });
      return;
    }
    try {
      const postRef = doc(db, 'community_posts', postId);
      await updateDoc(postRef, { likes: currentLikes + 1 });
      loadPosts();
    } catch {
      toast({ title: 'Error', description: 'Failed to like post.', variant: 'destructive' });
    }
  };

  // Reply handler
  const handleReply = (postId: string) => {
    setReplyingTo(postId);
    setReplyText('');
  };

  const submitReply = async (postId: string) => {
    if (!user || !replyText.trim()) {
      toast({ title: 'Reply required', description: 'Please enter your reply.', variant: 'destructive' });
      return;
    }
    setReplyLoading(true);
    try {
      const repliesRef = collection(db, 'community_posts', postId, 'replies');
      await addDoc(repliesRef, {
        text: replyText.trim(),
        userId: user.uid,
        userName: user.email?.split('@')[0] || 'Anonymous',
        createdAt: serverTimestamp(),
      });
      // Update reply count
      const postRef = doc(db, 'community_posts', postId);
      await updateDoc(postRef, { replies: (posts.find(p => p.id === postId)?.replies || 0) + 1 });
      setReplyingTo(null);
      setReplyText('');
      loadPosts();
      toast({ title: 'Reply added!', description: 'Your reply was posted.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to post reply.', variant: 'destructive' });
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Community
          </h1>
          <p className="text-slate-300 text-lg">Share knowledge, ask questions, and connect with learners</p>
        </motion.div>

        {/* Create Post Button */}
        <div className="mb-8 text-center">
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showCreateForm ? 'Cancel' : 'Create New Post'}
          </Button>
        </div>

        {/* Create Post Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Create a New Post
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-slate-200">Title</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="What's your question or topic?"
                        className="glass-input bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-slate-200">Category</Label>
                      <Select value={category} onValueChange={setCategory} required>
                        <SelectTrigger className="glass-input bg-white/5 border-white/20 text-white">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent className="glass-card border-white/20 bg-slate-900/95 backdrop-blur-xl">
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat} className="text-slate-200 hover:bg-white/10">
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="body" className="text-slate-200">Content</Label>
                      <Textarea
                        id="body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Share your thoughts, questions, or knowledge..."
                        className="glass-input bg-white/5 border-white/20 text-white placeholder:text-slate-400 min-h-[120px]"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="imageLink" className="text-slate-200 flex items-center gap-2">
                        <Image className="w-4 h-4" />
                        Image Link (Optional)
                      </Label>
                      <Input
                        id="imageLink"
                        value={imageLink}
                        onChange={(e) => setImageLink(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="glass-input bg-white/5 border-white/20 text-white placeholder:text-slate-400"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
                    >
                      {submitting ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Share Post
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
              <p className="text-slate-300">Loading community posts...</p>
            </div>
          ) : posts.length > 0 ? (
            <AnimatePresence>
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {post.userName?.[0]?.toUpperCase() || post.userEmail?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white font-semibold">
                              {post.userName || post.userEmail?.split('@')[0] || 'Anonymous'}
                            </h3>
                            <Badge className={categoryColors[post.category] || categoryColors.Other}>
                              {post.category}
                            </Badge>
                            <div className="flex items-center text-slate-400 text-sm">
                              <Clock className="w-4 h-4 mr-1" />
                              {formatTimestamp(post.createdAt)}
                            </div>
                          </div>

                          <h2 className="text-xl font-semibold text-white mb-3">{post.title}</h2>
                          <p className="text-slate-300 mb-4 leading-relaxed">{post.body}</p>

                          {post.imageLink && (
                            <div className="mb-4">
                              <img
                                src={post.imageLink}
                                alt="Post attachment"
                                className="rounded-lg max-w-full h-auto border border-white/20"
                                style={{ maxHeight: '300px' }}
                              />
                            </div>
                          )}

                          <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                              onClick={() => handleLike(post.id, post.likes || 0)}
                              disabled={!user}
                            >
                              <Heart className="w-4 h-4 mr-2" />
                              {post.likes || 0}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-400 hover:text-blue-400 hover:bg-blue-500/10"
                              onClick={() => handleReply(post.id)}
                              disabled={!user}
                            >
                              <Reply className="w-4 h-4 mr-2" />
                              {post.replies || 0} Replies
                            </Button>
                          </div>
                          {/* Reply form */}
                          {replyingTo === post.id && (
                            <div className="mt-4">
                              <Textarea
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                                placeholder="Write your reply..."
                                className="glass-input bg-white/5 border-white/20 text-white placeholder:text-slate-400 min-h-[80px] mb-2"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-blue-500 text-white"
                                  onClick={() => submitReply(post.id)}
                                  disabled={replyLoading}
                                >
                                  {replyLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                  Reply
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setReplyingTo(null)}
                                >Cancel</Button>
                              </div>
                              {/* Show replies */}
                              <div className="mt-4 space-y-2">
                                {post.repliesList && post.repliesList.length > 0 ? (
                                  post.repliesList.map((reply: any) => (
                                    <div key={reply.id} className="bg-slate-800/60 rounded-lg p-2 text-slate-200">
                                      <span className="font-semibold mr-2">{reply.userName || 'Anonymous'}:</span>
                                      {reply.text}
                                      <span className="ml-2 text-xs text-slate-400">{formatTimestamp(reply.createdAt)}</span>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-slate-400">No replies yet.</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Posts Yet</h3>
              <p className="text-slate-400 mb-6">Be the first to share something with the community!</p>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create First Post
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
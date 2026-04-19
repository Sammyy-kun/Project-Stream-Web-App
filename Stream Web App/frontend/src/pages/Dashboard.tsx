import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth, logout } from '../firebase';
import { LogOut, Video, Loader2, Play, AlertCircle, Download } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

interface Recording {
  id: string;
  url: string;
  status: 'pending' | 'recording' | 'completed' | 'error';
  downloadUrl?: string;
  createdAt: any;
  error?: string;
}

export const Dashboard: React.FC = () => {
  const [url, setUrl] = useState('');
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'recordings'),
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const recs: Recording[] = [];
      snapshot.forEach((doc) => {
        recs.push({ id: doc.id, ...doc.data() } as Recording);
      });
      setRecordings(recs);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !auth.currentUser) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:8080/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          userId: auth.currentUser.uid
        })
      });

      if (!response.ok) throw new Error('Failed to start recording');
      setUrl('');
    } catch (error) {
      console.error(error);
      alert('Error starting recording');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: Recording['status']) => {
    switch (status) {
      case 'pending':
        return <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500 bg-yellow-100 dark:bg-yellow-500/10 px-2 py-1 rounded text-xs font-medium"><Loader2 className="w-3 h-3 animate-spin" /> Pending</span>;
      case 'recording':
        return <span className="flex items-center gap-1 text-red-600 dark:text-red-500 bg-red-100 dark:bg-red-500/10 px-2 py-1 rounded text-xs font-medium"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Recording</span>;
      case 'completed':
        return <span className="flex items-center gap-1 text-green-600 dark:text-green-500 bg-green-100 dark:bg-green-500/10 px-2 py-1 rounded text-xs font-medium"><Play className="w-3 h-3" /> Completed</span>;
      case 'error':
        return <span className="flex items-center gap-1 text-red-600 dark:text-red-500 bg-red-100 dark:bg-red-500/10 px-2 py-1 rounded text-xs font-medium"><AlertCircle className="w-3 h-3" /> Error</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white font-sans transition-colors">
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md sticky top-0 z-10 transition-colors">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 dark:bg-indigo-500 p-1.5 rounded-lg">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">StreamRecorder</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">{auth.currentUser?.email}</span>
            <ThemeToggle />
            <button
              onClick={logout}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm dark:shadow-2xl transition-colors">
          <h2 className="text-2xl font-bold mb-2">Record a Stream</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">Paste a YouTube, Twitch, or Kick URL to record it in 720p. It will be auto-deleted after 48 hours.</p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={isSubmitting || !url}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
              {isSubmitting ? 'Starting...' : 'Record Stream'}
            </button>
          </form>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            Your Recordings
            <span className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-0.5 rounded-full transition-colors">{recordings.length}</span>
          </h3>
          
          {recordings.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-800 rounded-2xl transition-colors">
              <Video className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">No recordings yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {recordings.map((rec) => (
                <div key={rec.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
                  <div className="flex-1 min-w-0">
                    <a href={rec.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-medium truncate block mb-1">
                      {rec.url}
                    </a>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{new Date(rec.createdAt?.toDate?.() || Date.now()).toLocaleString()}</span>
                      {rec.error && <span className="text-red-500 dark:text-red-400 text-xs">{rec.error}</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 min-w-[150px]">
                    {getStatusBadge(rec.status)}
                    {rec.status === 'completed' && rec.downloadUrl && (
                      <a
                        href={rec.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white p-2 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

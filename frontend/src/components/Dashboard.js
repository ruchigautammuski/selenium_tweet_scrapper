import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import { Search, Twitter, LogOut, User, Hash, Clock, Book, AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const { logout, token } = useAuth();
  const [keyword, setKeyword] = useState('#ReactJS');
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState('users');
  const [history, setHistory] = useState([]);

  const handleSearch = async (e, searchKeyword) => {
    if (e) e.preventDefault();
    const finalKeyword = searchKeyword || keyword;
    if (!finalKeyword) {
      setError('Please enter a keyword or hashtag.');
      return;
    }
    setIsLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('http://localhost:5001/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ keyword: finalKeyword }),
      });
      const resData = await response.json();
      
      if (response.ok) {
        setResults(resData.data);
        if (!history.includes(finalKeyword)) {
          setHistory([finalKeyword, ...history.slice(0, 4)]);
        }
      } else {
        setError(resData.message || 'An unknown error occurred.');
      }
    } catch (err) {
      setError("A network error occurred. Is the backend server running?");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (isoString) => {
      if (!isoString) return '';
      const date = new Date(isoString);
      const seconds = Math.floor((new Date() - date) / 1000);
      let interval = seconds / 3600;
      if (interval > 1) return `${Math.floor(interval)}h ago`;
      interval = seconds / 60;
      if (interval > 1) return `${Math.floor(interval)}m ago`;
      return `${Math.floor(seconds)}s ago`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="flex justify-between items-center p-4 bg-gray-800/50 border-b border-gray-700 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <Twitter className="h-8 w-8 text-blue-400" />
          <h1 className="text-2xl font-bold">Ruchi Scraper</h1>
        </div>
        <button onClick={logout} className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </button>
      </header>
      
      <main className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
                <h2 className="text-lg font-semibold mb-4">New Search</h2>
                <form onSubmit={handleSearch} className="flex flex-col items-center gap-4">
                    <div className="relative w-full">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Enter keyword..." className="w-full pl-12 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed">
                        {isLoading ? <LoadingSpinner text="" small /> : <><Search className="h-5 w-5 mr-2" />Scrape Now</>}
                    </button>
                </form>
            </div>
            {history.length > 0 && (
                <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
                    <h2 className="text-lg font-semibold mb-4 flex items-center"><Book className="h-5 w-5 mr-2 text-gray-400"/>Search History</h2>
                    <div className="space-y-2">
                        {history.map(item => (
                            <button key={item} onClick={() => {setKeyword(item); handleSearch(null, item);}} disabled={isLoading} className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                               {item}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
        
        <div className="lg:col-span-2">
            {isLoading && <LoadingSpinner text="Scraping live data... This may take a moment." />}
            {error && <div className="flex items-center p-4 bg-red-900/50 border border-red-700 rounded-lg"><AlertTriangle className="h-6 w-6 text-red-400 mr-4 flex-shrink-0" /><p className="text-red-300">{error}</p></div>}
            
            {!isLoading && !results && !error && (
                <div className="flex flex-col items-center justify-center text-center p-10 bg-gray-800 rounded-2xl border-2 border-dashed border-gray-700 h-full">
                    <Search className="h-16 w-16 text-gray-600 mb-4"/>
                    <h2 className="text-xl font-bold text-white">Ready to Scrape</h2>
                    <p className="text-gray-400 mt-2">Enter a keyword on the left and click "Scrape Now" to begin.</p>
                </div>
            )}
            
            {results && (
              <div className="bg-gray-800 rounded-2xl shadow-lg border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-bold">Results for "{keyword}"</h2>
                  <p className="text-gray-400 mt-1">Found <span className="text-blue-400 font-bold">{results.totalPosts.toLocaleString()}</span> posts from <span className="text-green-400 font-bold">{results.uniqueUsers.length.toLocaleString()}</span> unique users.</p>
                </div>
                <div className="p-2 sm:p-4 bg-gray-800/50">
                    <div className="flex border-b border-gray-700">
                        <button onClick={() => setView('users')} className={`px-4 py-2 text-sm font-medium ${view === 'users' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}>Usernames ({results.uniqueUsers.length})</button>
                        <button onClick={() => setView('tweets')} className={`px-4 py-2 text-sm font-medium ${view === 'tweets' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}>Tweet Snippets ({results.tweets.length})</button>
                    </div>
                </div>
                {view === 'users' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-6 max-h-[60vh] overflow-y-auto">
                      {results.uniqueUsers.map(user => (
                        <div key={user} className="flex items-center p-3 bg-gray-700 rounded-lg space-x-3 hover:bg-gray-600 transition-colors">
                          <User className="h-5 w-5 text-gray-400" />
                          <span className="font-mono text-sm truncate">{user}</span>
                        </div>
                      ))}
                    </div>
                ) : (
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        {results.tweets.map((tweet, index) => (
                            <div key={index} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-bold text-blue-400">{tweet.username}</p>
                                    <div className="flex items-center text-xs text-gray-400"><Clock className="h-3 w-3 mr-1.5" /><span>{formatTimeAgo(tweet.timestamp)}</span></div>
                                </div>
                                <p className="text-gray-300 text-sm">{tweet.snippet}</p>
                            </div>
                        ))}
                    </div>
                )}
              </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

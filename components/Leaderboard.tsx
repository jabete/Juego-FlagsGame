import React, { useEffect, useState, useMemo } from 'react';
import { Score, GameMode, User, getTierName } from '../types';
import { Star, Shield, Crown, Globe, ArrowLeft, Calendar } from 'lucide-react';
import Avatar from './Avatar';

interface LeaderboardProps {
  currentScore?: Score;
  onBack: () => void;
  initialMode?: GameMode;
  currentUser?: User | null;
  onViewProfile?: (user: User) => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ currentScore, onBack, initialMode = 10, currentUser, onViewProfile }) => {
  const [scores, setScores] = useState<Score[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<GameMode>(initialMode);
  
  // NR (National Record) Cache: Map<CountryCode, BestTimeMs> (All Time)
  const [nationalRecords, setNationalRecords] = useState<Record<string, number>>({});

  useEffect(() => {
    // Load Scores
    const savedScores = localStorage.getItem('flagtoon_scores');
    let parsedScores: Score[] = savedScores ? JSON.parse(savedScores) : [];
    setScores(parsedScores);

    // Load Users for Hall of Fame
    const savedUsers = localStorage.getItem('flagtoon_users');
    let parsedUsers: User[] = savedUsers ? JSON.parse(savedUsers) : [];
    setUsers(parsedUsers);
  }, [currentScore]);

  useEffect(() => {
     // Calculate NRs for current tab (All Time for the badge)
     if (activeTab !== 'HOF') {
         const modeScores = scores.filter(s => s.mode === activeTab);
         const nrMap: Record<string, number> = {};
         
         modeScores.forEach(s => {
             if (!nrMap[s.avatarCode] || s.timeMs < nrMap[s.avatarCode]) {
                 nrMap[s.avatarCode] = s.timeMs;
             }
         });
         setNationalRecords(nrMap);
     }
  }, [scores, activeTab]);

  // Calculate Best Times (PB/SB) for ALL users in the current mode (All Time History)
  const userStatsMap = useMemo(() => {
      if (activeTab === 'HOF') return {};

      const modeScores = scores.filter(s => s.mode === activeTab);
      const stats: Record<string, { pb: number, sb: number }> = {};
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      modeScores.forEach(s => {
          if (!stats[s.username]) {
              stats[s.username] = { pb: Infinity, sb: Infinity };
          }
          
          // Check PB (All time)
          if (s.timeMs < stats[s.username].pb) {
              stats[s.username].pb = s.timeMs;
          }

          // Check SB (Current Season)
          if (s.date) {
            const d = new Date(s.date);
            if (!isNaN(d.getTime()) && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
                if (s.timeMs < stats[s.username].sb) {
                    stats[s.username].sb = s.timeMs;
                }
            }
          }
      });

      return stats;
  }, [scores, activeTab]);

  const getFilteredData = () => {
    if (activeTab === 'HOF') {
        // HOF uses Lifetime Stats (Level/XP)
        return users
            .sort((a, b) => {
                if (b.level !== a.level) return b.level - a.level;
                return b.xp - a.xp;
            })
            .slice(0, 100); 
    } else {
        // Practice Modes: Show ONLY Current Season (Month) Scores
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return scores
            .filter(s => {
                if (s.mode !== activeTab) return false;
                const d = new Date(s.date);
                // Filter: Must be same month and year
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            })
            .sort((a, b) => a.timeMs - b.timeMs)
            .slice(0, 100); 
    }
  };

  const getBadgeForUser = (username: string) => {
      const user = users.find(u => u.username === username);
      if (user && user.badges && user.badges[0] && user.badges[0].startsWith('LEAGUE_RANK_')) {
          const tier = parseInt(user.badges[0].replace('LEAGUE_RANK_', ''));
          const info = getTierName(tier);
          return <Shield size={16} className={`${info.color} ${info.fill} inline-block ml-1`} />;
      }
      return null;
  };

  const getUserFrame = (username: string) => {
      const u = users.find(user => user.username === username);
      return u?.currentFrame || 'DEFAULT';
  }

  const formatTime = (ms: number) => {
    return (ms / 1000).toFixed(3) + 's';
  };

  const handleRowClick = (username: string) => {
      if (onViewProfile) {
          const user = users.find(u => u.username === username);
          if (user) onViewProfile(user);
      }
  };

  const listData = getFilteredData();
  
  // Calculate All-Time WR Time for current tab (to award the WR badge correctly even in season list)
  const allTimeWRTime = activeTab !== 'HOF' && scores.length > 0 
    ? Math.min(...scores.filter(s => s.mode === activeTab).map(s => s.timeMs))
    : 0;

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto h-full px-4 py-2">
      <div className="w-full flex items-center justify-between mb-4">
        <button onClick={onBack} className="p-2 border-2 border-black rounded-full bg-white hover:bg-gray-100 text-black">
            <ArrowLeft size={24} />
        </button>
        <h2 className="text-3xl font-black text-black cartoon-text-shadow stroke-white">
            Ranking
        </h2>
        <div className="w-10"></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-0 w-full overflow-x-auto scrollbar-hide pb-2 shrink-0">
        {([5, 10, 20, 'HOF'] as const).map((mode) => (
            <button
                key={mode}
                onClick={() => setActiveTab(mode as GameMode)}
                className={`flex-1 py-2 font-bold border-4 border-black rounded-t-xl transition-all whitespace-nowrap px-2 text-sm md:text-base ${
                    activeTab === mode 
                    ? 'bg-white border-b-0 translate-y-1 z-10 text-black' 
                    : 'bg-gray-300 text-gray-600 hover:bg-gray-200'
                }`}
            >
                {mode === 'HOF' ? 'NIVEL' : `${mode} Flags`}
            </button>
        ))}
      </div>
      
      <div className="flex-1 bg-white border-4 border-black rounded-b-xl rounded-tr-xl p-4 w-full cartoon-shadow-lg mb-4 relative z-0 -mt-1 overflow-y-auto scrollbar-hide">
        {activeTab !== 'HOF' && (
             <div className="flex items-center justify-center gap-2 mb-4 text-xs font-bold text-gray-500 uppercase bg-gray-100 p-2 rounded-lg border border-gray-200">
                 <Calendar size={14} />
                 <span>Temporada Actual (Mensual)</span>
             </div>
        )}

        {listData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-gray-500 font-bold mb-2">¡Nueva Temporada!</p>
              <p className="text-xs text-gray-400">Sé el primero en marcar un tiempo este mes.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {listData.map((item, index) => {
                const isUser = activeTab === 'HOF';
                const userItem = item as User;
                const scoreItem = item as Score;
                const name = isUser ? userItem.username : scoreItem.username;
                const badge = getBadgeForUser(name);
                const frameId = getUserFrame(name);
                
                // --- TAG LOGIC ---
                // WR: Is this score equal to GLOBAL ALL-TIME best?
                const isWR = !isUser && scoreItem.timeMs === allTimeWRTime;
                
                // NR: Is this score equal to country best (All Time)?
                const isNR = !isUser && nationalRecords[scoreItem.avatarCode] === scoreItem.timeMs;

                // PB: Is this score equal to this user's best time?
                const userStats = !isUser ? userStatsMap[name] : null;
                const isPB = !isUser && userStats && scoreItem.timeMs === userStats.pb;
                
                // SB: Is this score equal to this user's season best?
                const isSB = !isUser && userStats && userStats.sb !== Infinity && scoreItem.timeMs === userStats.sb;
                
                // Highlight: If this specific row is the one just played by current user
                const targetUser = currentScore ? currentScore.username : (currentUser ? currentUser.username : null);
                const isMyCurrentScore = !isUser && targetUser && scoreItem.username === targetUser && scoreItem.timeMs === (currentScore ? currentScore.timeMs : -1); 
                
                const highlight = isMyCurrentScore;

                return (
                    <li 
                        key={index}
                        onClick={() => handleRowClick(name)} 
                        className={`flex justify-between items-center p-3 rounded-lg border-2 border-black cursor-pointer hover:bg-gray-100 transition-colors ${
                        highlight
                        ? 'bg-yellow-100 border-yellow-400' 
                        : isWR ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-400' : 'bg-gray-50'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            {/* Rank */}
                            <span className={`
                                w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full font-bold border-2 border-black
                                ${index === 0 ? 'bg-yellow-400 text-white' : 
                                index === 1 ? 'bg-gray-300 text-white' : 
                                index === 2 ? 'bg-orange-400 text-white' : 'bg-white text-black'}
                            `}>
                                {index + 1}
                            </span>
                            
                            {/* Avatar */}
                            <Avatar code={isUser ? userItem.avatarCode : scoreItem.avatarCode} frameId={frameId} size="sm" />

                            <div className="flex flex-col justify-center">
                                <span className="font-bold text-lg truncate max-w-[100px] md:max-w-[120px] flex items-center leading-none text-black">
                                    {name} {badge}
                                </span>
                            </div>
                        </div>
                        
                        {isUser ? (
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1 text-yellow-600 bg-yellow-100 px-2 py-1 rounded-lg border border-yellow-300 mb-1">
                                    <Star size={14} fill="currentColor" />
                                    <span className="font-bold text-xs">Lvl {userItem.level}</span>
                                </div>
                                <span className="text-[10px] text-gray-500 font-bold">{userItem.xp} XP</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-end justify-center">
                                <span className={`font-mono font-bold text-lg leading-none ${isWR ? 'text-yellow-600' : 'text-blue-600'}`}>
                                    {formatTime(scoreItem.timeMs)}
                                </span>
                                {/* Changed container to no-wrap and allow width to ensure they stay on one line */}
                                <div className="flex flex-nowrap gap-1 mt-1 justify-end min-w-[100px]">
                                    {isWR && (
                                        <span className="text-[8px] bg-yellow-400 text-black px-1.5 py-0.5 rounded font-black flex items-center gap-0.5 shadow-sm border border-yellow-500 whitespace-nowrap">
                                            <Crown size={8} fill="currentColor"/> WR
                                        </span>
                                    )}
                                    {isNR && (
                                         <span className="text-[8px] bg-blue-400 text-white px-1.5 py-0.5 rounded font-black flex items-center gap-0.5 shadow-sm border border-blue-500 whitespace-nowrap">
                                            NR
                                        </span>
                                    )}
                                    {isPB && (
                                        <span className="text-[8px] bg-green-500 text-white px-1.5 py-0.5 rounded font-black shadow-sm border border-green-600 whitespace-nowrap">PB</span>
                                    )}
                                    {isSB && (
                                        <span className="text-[8px] bg-purple-500 text-white px-1.5 py-0.5 rounded font-black shadow-sm border border-purple-600 whitespace-nowrap">SB</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </li>
                );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
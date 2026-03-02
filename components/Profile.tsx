import React, { useEffect, useState } from 'react';
import { User, getTierName, Score } from '../types';
import Button from './Button';
import Avatar, { FRAMES } from './Avatar';
import { Trophy, Lock, Star, Shield, Crown, Zap, TrendingUp, Calendar, Globe, Swords, Clock, User as UserIcon, Palette, Medal, Target } from 'lucide-react';

interface ProfileProps {
  user: User;
  currentUser?: User | null;
  onBack: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, currentUser, onBack }) => {
  const [stats, setStats] = useState<{mode: number, pb: number, sb: number}[]>([]);
  const [currentEloRank, setCurrentEloRank] = useState<number | null>(null);
  const [tab, setTab] = useState<'STATS' | 'CUSTOMIZE' | 'MISSIONS'>('STATS');
  const [selectedFrameId, setSelectedFrameId] = useState<string>(user.currentFrame || 'DEFAULT');
  const [localUser, setLocalUser] = useState<User>(user); // Local copy for immediate updates

  const isOwner = currentUser?.username === user.username;

  useEffect(() => {
    // Calculate stats
    const scoresStr = localStorage.getItem('flagtoon_scores');
    const scores: Score[] = scoresStr ? JSON.parse(scoresStr) : [];
    const userScores = scores.filter(s => s.username === user.username);
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const modes = [5, 10, 20];
    const newStats = modes.map(mode => {
        const modeScores = userScores.filter(s => typeof s.mode === 'number' ? s.mode === mode : false);
        
        // PB
        const pb = modeScores.length > 0 ? Math.min(...modeScores.map(s => s.timeMs)) : 0;
        
        // SB (Current Month)
        const sbScores = modeScores.filter(s => {
            const d = new Date(s.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        const sb = sbScores.length > 0 ? Math.min(...sbScores.map(s => s.timeMs)) : 0;

        return { mode, pb, sb };
    });
    setStats(newStats);

    // Calculate LIVE Season Elo Rank
    const usersStr = localStorage.getItem('flagtoon_users');
    if (usersStr) {
        const allUsers: User[] = JSON.parse(usersStr);
        // Sort by Season Elo Points (Highest first)
        const activeEloUsers = allUsers.filter(u => (u.seasonEloPoints || 0) > 0);
        activeEloUsers.sort((a, b) => (b.seasonEloPoints || 0) - (a.seasonEloPoints || 0));
        
        const myRankIndex = activeEloUsers.findIndex(u => u.username === user.username);
        if (myRankIndex !== -1) {
            setCurrentEloRank(myRankIndex + 1);
        } else {
            setCurrentEloRank(null);
        }
    }

  }, [user]);

  // New XP Formula Logic
  const getXpRequiredForNextLevel = (currentLvl: number) => {
      if (currentLvl === 1) return 100;
      return Math.floor(100 * Math.pow(currentLvl, 1.5));
  };
  
  const getTotalXpToReachLevel = (targetLvl: number) => {
      let total = 0;
      for (let i = 1; i < targetLvl; i++) {
          total += getXpRequiredForNextLevel(i);
      }
      return total;
  };

  const currentLevelBaseXP = getTotalXpToReachLevel(user.level);
  const nextLevelTotalXP = getTotalXpToReachLevel(user.level + 1);
  const xpNeededForThisLevel = nextLevelTotalXP - currentLevelBaseXP;
  const currentProgressXP = Math.max(0, user.xp - currentLevelBaseXP);
  const progressPercent = Math.min(100, Math.max(0, (currentProgressXP / xpNeededForThisLevel) * 100));

  // Helper to get array safely even if user has old data
  const userBadges = user.badges && user.badges.length >= 6 
    ? user.badges 
    : [...(user.badges || []), "", "", "", "", "", ""].slice(0, 6); 

  const formatTime = (ms: number) => ms > 0 ? (ms / 1000).toFixed(3) + 's' : '--';

  // --- EPIC BADGE RENDERER ---
  const renderBadgeContent = (badgeId: string, index: number) => {
    // 0. CHAMPIONS BADGE (Special Slot 0)
    if (index === 0 && user.championsWins && user.championsWins > 0) {
        return (
             <div className="relative flex flex-col items-center justify-center w-full h-full p-1 rounded-xl bg-blue-900 border border-blue-500 shadow-inner overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.2)_10%,transparent_70%)] animate-pulse"></div>
                <Star size={28} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                <div className="absolute bottom-1 bg-white text-black text-[10px] font-black px-2 rounded-full shadow-lg border border-blue-300 leading-none py-0.5">
                    {user.championsWins}
                </div>
            </div>
        );
    }
    
    // 2. ELO BADGE LOGIC
    if (index === 2) {
        const hasStoredBadge = badgeId && badgeId.startsWith('ELO_RANK_');
        const hasLiveRank = currentEloRank !== null;

        if (hasStoredBadge || hasLiveRank) {
            return (
                <div className="relative flex flex-col w-full h-full rounded-xl overflow-hidden border-2 border-black/20 shadow-inner">
                    
                    {/* TOP HALF: Previous Season (Stored Badge) */}
                    <div className={`flex-1 flex flex-col items-center justify-center relative ${hasStoredBadge ? '' : 'bg-gray-200'}`}>
                        {hasStoredBadge ? (() => {
                            const rank = parseInt(badgeId.replace('ELO_RANK_', ''), 10);
                            let bgClass = "bg-orange-700 from-orange-600 to-orange-800"; 
                            let iconColor = "text-orange-300";
                            if (rank <= 10) {
                                bgClass = "bg-yellow-500 from-yellow-400 to-yellow-600";
                                iconColor = "text-white";
                            } else if (rank <= 29) {
                                bgClass = "bg-gray-400 from-gray-300 to-gray-500";
                                iconColor = "text-white";
                            }
                            return (
                                <div className={`absolute inset-0 bg-gradient-to-br ${bgClass} flex flex-col items-center justify-center`}>
                                     <div className="absolute top-0.5 text-[6px] font-black text-white/70 uppercase tracking-widest">Anterior</div>
                                     <div className="flex items-center gap-1 mt-2">
                                        <Swords size={12} className={`${iconColor} drop-shadow-md`} />
                                        <span className="text-white font-black text-sm drop-shadow-md">#{rank}</span>
                                     </div>
                                </div>
                            );
                        })() : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
                                <div className="text-[6px] font-black text-black/50 uppercase tracking-widest mb-1">Anterior</div>
                                <span className="text-xs font-bold text-black/50">--</span>
                            </div>
                        )}
                    </div>

                    {/* DIVIDER */}
                    <div className="h-[2px] w-full bg-black/30 z-10"></div>

                    {/* BOTTOM HALF: Current Season (Live Rank) */}
                    <div className={`flex-1 flex flex-col items-center justify-center relative ${hasLiveRank ? 'bg-purple-600' : 'bg-gray-200'}`}>
                         {hasLiveRank ? (
                             <div className="absolute inset-0 flex flex-col items-center justify-center">
                                 <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.2)_10%,transparent_70%)] animate-pulse"></div>
                                 <div className="flex items-center gap-1 mt-1 z-10">
                                     <span className="text-white font-black text-sm drop-shadow-md">#{currentEloRank}</span>
                                 </div>
                                 <div className="absolute bottom-0.5 text-[6px] font-black text-purple-200 uppercase tracking-widest">Actual</div>
                             </div>
                         ) : (
                             <div className="absolute inset-0 flex flex-col items-center justify-center opacity-40">
                                <span className="text-xs font-bold text-black/50 mt-1">--</span>
                                <div className="text-[6px] font-black text-black/50 uppercase tracking-widest mt-1">Actual</div>
                             </div>
                         )}
                    </div>

                </div>
            );
        }
    }
    
    if (!badgeId) return <div className="opacity-10"><Lock size={20} /></div>;

    // 1. LEAGUE BADGES
    if (badgeId.startsWith('LEAGUE_RANK_')) {
        const tierStr = badgeId.replace('LEAGUE_RANK_', '');
        const tier = parseInt(tierStr, 10);
        const tierInfo = getTierName(tier);
        
        let mainIcon = <Shield size={32} className="drop-shadow-md" />;
        let overlayIcon = null;
        let gradient = "from-gray-100 to-gray-300";

        if (tier === 8) { // PRO
            mainIcon = <Shield size={32} fill="url(#goldGradient)" className="text-yellow-600 drop-shadow-lg" />;
            overlayIcon = <Crown size={18} className="text-yellow-100 absolute -top-1 animate-pulse" fill="currentColor" />;
            gradient = "from-green-400 to-emerald-600";
        } else if (tier === 7) { // MAESTRO
            mainIcon = <Shield size={32} className="text-yellow-800 fill-yellow-500 drop-shadow-lg" />;
            overlayIcon = <Star size={16} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" fill="currentColor" />;
            gradient = "from-yellow-300 to-amber-500";
        } else if (tier === 6) { // LEGENDARY
            mainIcon = <Shield size={32} className="text-red-800 fill-red-600 drop-shadow-lg" />;
            overlayIcon = <Zap size={16} className="text-yellow-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" fill="currentColor" />;
            gradient = "from-red-400 to-rose-600";
        } else if (tier === 5) { // MYTHIC
             mainIcon = <Shield size={32} className="text-purple-900 fill-purple-500 drop-shadow-lg" />;
            gradient = "from-purple-400 to-indigo-600";
        } else if (tier === 4) { // DIAMOND
            mainIcon = <Shield size={32} className="text-blue-800 fill-cyan-400 drop-shadow-lg" />;
            gradient = "from-cyan-300 to-blue-500";
        } else if (tier >= 2) { // GOLD/PLAT
            mainIcon = <Shield size={32} className="text-yellow-700 fill-yellow-200" />;
            gradient = "from-yellow-100 to-yellow-300";
        } else if (tier === 1) { // SILVER
            mainIcon = <Shield size={32} className="text-gray-600 fill-gray-200" />;
            gradient = "from-gray-200 to-gray-400";
        } else { // BRONZE (0)
            mainIcon = <Shield size={32} className="text-orange-900 fill-orange-700" />;
            gradient = "from-orange-100 to-orange-300";
        }

        return (
            <div className={`relative flex flex-col items-center justify-center w-full h-full p-1 rounded-xl bg-gradient-to-br ${gradient} border border-white/50 shadow-inner overflow-hidden`}>
                <svg width="0" height="0">
                    <linearGradient id="goldGradient" x1="100%" y1="100%" x2="0%" y2="0%">
                        <stop stopColor="#eab308" offset="0%" />
                        <stop stopColor="#fef08a" offset="50%" />
                        <stop stopColor="#ca8a04" offset="100%" />
                    </linearGradient>
                </svg>
                <div className={`absolute inset-0 bg-white opacity-20`}></div>
                
                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative">
                        {mainIcon}
                        {overlayIcon}
                    </div>
                    <span className="text-[8px] font-black uppercase mt-0 leading-none text-black/70 text-center truncate w-full drop-shadow-sm scale-90">
                        {tierInfo.name}
                    </span>
                </div>
            </div>
        );
    }
    
    if (badgeId.startsWith('WR_')) {
        return (
            <div className="relative flex flex-col items-center justify-center w-full h-full p-1 rounded-xl bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 border border-yellow-200 shadow-inner overflow-hidden">
                <div className="absolute inset-0 animate-pulse bg-white opacity-20"></div>
                <Crown size={36} className="text-yellow-900 fill-yellow-100 drop-shadow-md" />
            </div>
        );
    }

    if (badgeId.startsWith('NR_')) {
        return (
            <div className="relative flex flex-col items-center justify-center w-full h-full p-1 rounded-xl bg-blue-50 border border-blue-300 shadow-inner overflow-hidden group">
                <div className="absolute inset-0 transition-opacity">
                     <img src={`https://flagcdn.com/w160/${user.avatarCode}.png`} className="w-full h-full object-cover opacity-90" alt="bg"/>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-1 w-full text-center">
                    <span className="text-white text-[8px] font-black bg-blue-600 px-1.5 py-0.5 rounded shadow-sm border border-blue-400">
                        NR
                    </span>
                </div>
            </div>
        );
    }

    if (badgeId.startsWith('PRO_')) {
        return (
            <div className="relative flex flex-col items-center justify-center w-full h-full p-1 rounded-xl bg-gradient-to-br from-black via-gray-900 to-black border-2 border-yellow-500 shadow-[inset_0_0_15px_rgba(234,179,8,0.5)] overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(234,179,8,0.2)_10%,transparent_70%)] animate-pulse"></div>
                <Crown size={36} className="text-yellow-500 fill-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
            </div>
        );
    }

    if (badgeId.startsWith('GRANDMASTER_')) {
        return (
            <div className="relative flex flex-col items-center justify-center w-full h-full p-1 rounded-xl bg-gradient-to-br from-red-900 via-red-700 to-red-900 border border-red-400 shadow-[inset_0_0_10px_rgba(248,113,113,0.5)] overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:10px_10px] animate-[slide_2s_linear_infinite]"></div>
                <Shield size={36} className="text-red-200 fill-red-500 drop-shadow-lg" />
            </div>
        );
    }

    if (badgeId.startsWith('MASTER_')) {
        return (
            <div className="relative flex flex-col items-center justify-center w-full h-full p-1 rounded-xl bg-gradient-to-br from-purple-900 via-purple-700 to-purple-900 border border-purple-400 shadow-inner overflow-hidden">
                <Shield size={36} className="text-purple-200 fill-purple-500 drop-shadow-md" />
            </div>
        );
    }

    if (badgeId.startsWith('EMERALD_')) {
        return (
            <div className="relative flex flex-col items-center justify-center w-full h-full p-1 rounded-xl bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-700 border border-emerald-200 shadow-[inset_0_0_10px_rgba(255,255,255,0.5)] overflow-hidden">
                <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                <Medal size={36} className="text-emerald-100 fill-emerald-400 drop-shadow-md" />
            </div>
        );
    }

    if (badgeId.startsWith('RUBY_')) {
        return (
            <div className="relative flex flex-col items-center justify-center w-full h-full p-1 rounded-xl bg-gradient-to-br from-rose-400 via-rose-600 to-rose-800 border border-rose-300 shadow-inner overflow-hidden">
                <Medal size={36} className="text-rose-100 fill-rose-500 drop-shadow-md" />
            </div>
        );
    }

    if (badgeId.startsWith('PLATINUM_')) {
        return (
            <div className="relative flex flex-col items-center justify-center w-full h-full p-1 rounded-xl bg-gradient-to-br from-slate-100 via-slate-300 to-slate-400 border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.8)] overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,0.8)_50%,transparent_60%)] animate-[shimmer_2s_infinite]"></div>
                <Medal size={36} className="text-slate-600 fill-slate-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
            </div>
        );
    }

    if (badgeId.startsWith('DIAMOND_')) {
        return (
            <div className="relative flex flex-col items-center justify-center w-full h-full p-1 rounded-xl bg-gradient-to-br from-cyan-300 to-blue-500 border border-cyan-200 shadow-inner overflow-hidden">
                <div className="absolute inset-0 animate-pulse bg-white opacity-20"></div>
                <Medal size={36} className="text-cyan-100 fill-cyan-400 drop-shadow-md" />
            </div>
        );
    }

    if (badgeId.startsWith('GOLD_')) {
        return (
            <div className="relative flex flex-col items-center justify-center w-full h-full p-1 rounded-xl bg-gradient-to-br from-yellow-300 to-yellow-600 border border-yellow-200 shadow-inner overflow-hidden">
                <Medal size={36} className="text-yellow-100 fill-yellow-500 drop-shadow-md" />
            </div>
        );
    }

    if (badgeId.startsWith('SILVER_')) {
        return (
            <div className="relative flex flex-col items-center justify-center w-full h-full p-1 rounded-xl bg-gradient-to-br from-gray-300 to-gray-500 border border-gray-200 shadow-inner overflow-hidden">
                <Medal size={36} className="text-gray-100 fill-gray-400 drop-shadow-md" />
            </div>
        );
    }

    if (badgeId.startsWith('BRONZE_')) {
        return (
            <div className="relative flex flex-col items-center justify-center w-full h-full p-1 rounded-xl bg-gradient-to-br from-orange-300 to-orange-600 border border-orange-200 shadow-inner overflow-hidden">
                <Medal size={36} className="text-orange-100 fill-orange-500 drop-shadow-md" />
            </div>
        );
    }

    return <Trophy className="text-yellow-500 drop-shadow-sm" size={20} />;
  };
  
  const getSlotLabel = (index: number) => {
      if (index === 0) return { text: "UCL", bg: "bg-blue-900", textCol: "text-white" };
      if (index === 1) return { text: "LIGA", bg: "bg-gray-100", textCol: "text-gray-400" };
      if (index === 2) return { text: "ELO SEASON", bg: "bg-purple-100", textCol: "text-purple-600" };
      if (index === 3) return { text: "RÉCORD 5", bg: "bg-green-50", textCol: "text-green-600" };
      if (index === 4) return { text: "RÉCORD 10", bg: "bg-blue-50", textCol: "text-blue-600" };
      if (index === 5) return { text: "RÉCORD 20", bg: "bg-purple-50", textCol: "text-purple-600" };
      return { text: "RÉCORD", bg: "bg-yellow-50", textCol: "text-yellow-600" };
  }

  const renderBadgeSlot = (index: number) => {
      const badgeId = userBadges[index];
      const label = getSlotLabel(index);
      
      // Determine background color logic
      // Slot 2 (Elo): Show background if it has badge OR if it has live rank
      const isEloSlot = index === 2;
      const showEloBg = isEloSlot && (badgeId || currentEloRank !== null);
      
      const showBg = badgeId || (index === 0 && user.championsWins) || showEloBg;

      return (
        <div key={index} className="flex flex-col items-center gap-1 w-full">
            <div 
                className={`w-full aspect-square border-2 border-black rounded-xl flex items-center justify-center relative shrink-0 overflow-hidden ${!showBg ? 'bg-gray-100' : ''}`}
            >
                {renderBadgeContent(badgeId, index)}
            </div>
            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 rounded-full border ${label.bg} ${label.textCol} border-black/10 text-center w-full truncate`}>
                {label.text}
            </span>
        </div>
      );
  };

  const handleEquipFrame = (frameId: string) => {
      const usersStr = localStorage.getItem('flagtoon_users');
      if (usersStr) {
          const users: User[] = JSON.parse(usersStr);
          const updatedUsers = users.map(u => {
              if (u.username === user.username) {
                  return { ...u, currentFrame: frameId };
              }
              return u;
          });
          localStorage.setItem('flagtoon_users', JSON.stringify(updatedUsers));
          
          setSelectedFrameId(frameId);
          setLocalUser({ ...localUser, currentFrame: frameId });
      }
  };

  const renderCustomize = () => {
      return (
          <div className="w-full bg-white border-4 border-black rounded-2xl p-4 cartoon-shadow-lg mb-4">
              <h3 className="text-xl font-black text-black mb-3 border-b-2 border-gray-100 pb-2 flex items-center gap-2">
                 <Palette size={20} className="text-black" /> Marcos de Avatar
              </h3>
              
              <div className="grid grid-cols-3 gap-4">
                  {FRAMES.map((frame) => {
                      const isUnlocked = localUser.unlockedFrames?.includes(frame.id) || frame.id === 'DEFAULT';
                      const isEquipped = selectedFrameId === frame.id;

                      return (
                          <div key={frame.id} className="flex flex-col items-center gap-2">
                                <div 
                                    onClick={() => isUnlocked ? handleEquipFrame(frame.id) : null}
                                    className={`relative p-2 rounded-xl transition-all cursor-pointer ${isEquipped ? 'bg-green-100 border-2 border-green-500 scale-105' : 'hover:bg-gray-50 border-2 border-transparent'}`}
                                >
                                    <Avatar code={user.avatarCode} frameId={frame.id} size="md" className={!isUnlocked ? 'grayscale opacity-50' : ''} />
                                    {!isUnlocked && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Lock size={16} className="text-black" />
                                        </div>
                                    )}
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] font-black uppercase leading-tight">{frame.name}</div>
                                    {!isUnlocked ? (
                                        <div className="text-[9px] text-red-500 font-bold bg-red-100 px-1 rounded mt-1">{frame.conditionText}</div>
                                    ) : isEquipped ? (
                                        <div className="text-[9px] text-green-600 font-bold bg-green-100 px-1 rounded mt-1">EQUIPADO</div>
                                    ) : null}
                                </div>
                          </div>
                      );
                  })}
              </div>
          </div>
      );
  };

  const renderMissions = () => {
    const getNextBadge = (mode: number, pb: number) => {
        if (pb === 0) pb = Infinity;
        if (mode === 5) {
            if (pb < 2600) return { name: "WR/NR", target: 0, current: "Pro" };
            if (pb < 2700) return { name: "Pro", target: 2600, current: "Gran Maestro" };
            if (pb < 2800) return { name: "Gran Maestro", target: 2700, current: "Maestro" };
            if (pb < 2900) return { name: "Maestro", target: 2800, current: "Esmeralda" };
            if (pb < 3000) return { name: "Esmeralda", target: 2900, current: "Rubí" };
            if (pb < 3100) return { name: "Rubí", target: 3000, current: "Platino" };
            if (pb < 3300) return { name: "Platino", target: 3100, current: "Diamante" };
            if (pb < 3500) return { name: "Diamante", target: 3300, current: "Oro" };
            if (pb < 3800) return { name: "Oro", target: 3500, current: "Plata" };
            if (pb < 4000) return { name: "Plata", target: 3800, current: "Bronce" };
            return { name: "Bronce", target: 4000, current: "Ninguna" };
        }
        if (mode === 10) {
            if (pb < 5800) return { name: "WR/NR", target: 0, current: "Pro" };
            if (pb < 5900) return { name: "Pro", target: 5800, current: "Gran Maestro" };
            if (pb < 6000) return { name: "Gran Maestro", target: 5900, current: "Maestro" };
            if (pb < 6100) return { name: "Maestro", target: 6000, current: "Esmeralda" };
            if (pb < 6300) return { name: "Esmeralda", target: 6100, current: "Rubí" };
            if (pb < 6500) return { name: "Rubí", target: 6300, current: "Platino" };
            if (pb < 6750) return { name: "Platino", target: 6500, current: "Diamante" };
            if (pb < 7000) return { name: "Diamante", target: 6750, current: "Oro" };
            if (pb < 7500) return { name: "Oro", target: 7000, current: "Plata" };
            if (pb < 8000) return { name: "Plata", target: 7500, current: "Bronce" };
            return { name: "Bronce", target: 8000, current: "Ninguna" };
        }
        if (mode === 20) {
            if (pb < 13600) return { name: "WR/NR", target: 0, current: "Pro" };
            if (pb < 13800) return { name: "Pro", target: 13600, current: "Gran Maestro" };
            if (pb < 14000) return { name: "Gran Maestro", target: 13800, current: "Maestro" };
            if (pb < 14200) return { name: "Maestro", target: 14000, current: "Esmeralda" };
            if (pb < 14500) return { name: "Esmeralda", target: 14200, current: "Rubí" };
            if (pb < 14800) return { name: "Rubí", target: 14500, current: "Platino" };
            if (pb < 15100) return { name: "Platino", target: 14800, current: "Diamante" };
            if (pb < 15450) return { name: "Diamante", target: 15100, current: "Oro" };
            if (pb < 15700) return { name: "Oro", target: 15450, current: "Plata" };
            if (pb < 16000) return { name: "Plata", target: 15700, current: "Bronce" };
            return { name: "Bronce", target: 16000, current: "Ninguna" };
        }
        return { name: "Desconocido", target: 0, current: "Ninguna" };
    };

    return (
        <div className="space-y-4 animate-fade-in w-full">
            <h3 className="text-xl font-black text-black mb-3 border-b-2 border-gray-100 pb-2 flex items-center gap-2">
                <Target size={20} className="text-black" /> Misiones de Tiempo
            </h3>
            {stats.map(s => {
                const badgeInfo = getNextBadge(s.mode, s.pb);
                const pbText = s.pb > 0 ? (s.pb / 1000).toFixed(3) + "s" : "--";
                const targetText = badgeInfo.target > 0 ? (badgeInfo.target / 1000).toFixed(3) + "s" : "--";
                const diff = s.pb > 0 && badgeInfo.target > 0 ? ((s.pb - badgeInfo.target) / 1000).toFixed(3) + "s" : "--";

                return (
                    <div key={s.mode} className="bg-white border-4 border-black rounded-2xl p-4 w-full cartoon-shadow-lg mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-black text-lg text-black">{s.mode} Banderas</h4>
                            <span className="text-xs font-bold text-gray-500">Actual: {badgeInfo.current}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm font-bold text-black mb-2">
                            <div className="bg-gray-100 p-2 rounded border border-gray-200 text-center">
                                <div className="text-xs text-gray-500">Tu Tiempo</div>
                                <div className="text-lg">{pbText}</div>
                            </div>
                            <div className="bg-blue-50 p-2 rounded border border-blue-200 text-center">
                                <div className="text-xs text-blue-500">Siguiente: {badgeInfo.name}</div>
                                <div className="text-lg text-blue-700">{targetText}</div>
                            </div>
                        </div>
                        {badgeInfo.target > 0 && s.pb > 0 && (
                            <div className="text-center text-xs font-bold text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
                                Estás a {diff} de conseguir la insignia {badgeInfo.name}
                            </div>
                        )}
                        {s.pb === 0 && (
                            <div className="text-center text-xs font-bold text-gray-500 bg-gray-50 p-2 rounded border border-gray-200">
                                ¡Juega una partida para registrar tu primer tiempo!
                            </div>
                        )}
                        {badgeInfo.target === 0 && s.pb > 0 && (
                            <div className="text-center text-xs font-bold text-green-600 bg-green-50 p-2 rounded border border-green-200">
                                ¡Has conseguido el máximo rango de tiempo!
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden animate-fade-in px-4 py-2">
      <div className="flex-1 overflow-y-auto w-full max-w-md mx-auto pb-20 scrollbar-hide">
        
        <div className="bg-white border-4 border-black rounded-2xl p-6 w-full cartoon-shadow-lg mb-4 relative overflow-hidden mt-4">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Trophy size={100} className="text-black" />
            </div>

            <div className="flex flex-col items-center gap-3 relative z-10">
                <Avatar code={user.avatarCode} frameId={localUser.currentFrame} size="xl" />
                <h2 className="text-3xl font-black text-black break-all text-center">{user.username}</h2>
                
                <div className="flex items-center gap-2 bg-yellow-100 px-4 py-1 rounded-full border-2 border-black">
                    <Star className="text-yellow-500 fill-yellow-500" size={20} />
                    <span className="font-bold text-lg text-black">Nivel {user.level}</span>
                </div>
            </div>

            <div className="mt-6">
                <div className="flex justify-between text-xs font-bold mb-1 px-1 text-black">
                    <span>{Math.floor(currentProgressXP)} / {Math.floor(xpNeededForThisLevel)} XP</span>
                    <span>Sig: Nvl {user.level + 1}</span>
                </div>
                <div className="w-full h-5 bg-gray-200 border-2 border-black rounded-full overflow-hidden relative">
                    <div 
                        className="h-full bg-blue-400 border-r-2 border-black transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.2)_50%,rgba(255,255,255,.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] opacity-30"></div>
                </div>
            </div>
        </div>
        
        {isOwner && (
            <div className="flex gap-2 mb-4 w-full">
                <button 
                    onClick={() => setTab('STATS')} 
                    className={`flex-1 py-2 font-black rounded-xl border-4 border-black transition-all text-xs sm:text-sm ${tab === 'STATS' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                >
                    ESTADÍSTICAS
                </button>
                <button 
                    onClick={() => setTab('MISSIONS')} 
                    className={`flex-1 py-2 font-black rounded-xl border-4 border-black transition-all text-xs sm:text-sm ${tab === 'MISSIONS' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                >
                    MISIONES
                </button>
                <button 
                    onClick={() => setTab('CUSTOMIZE')} 
                    className={`flex-1 py-2 font-black rounded-xl border-4 border-black transition-all text-xs sm:text-sm ${tab === 'CUSTOMIZE' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                >
                    PERSONALIZAR
                </button>
            </div>
        )}

        {tab === 'STATS' || !isOwner ? (
            <>
                {/* DAILY RANKS SECTION REMOVED */}
                
                <div className="bg-white border-4 border-black rounded-2xl p-4 w-full cartoon-shadow-lg mb-4">
                    <h3 className="text-xl font-black text-black mb-3 border-b-2 border-gray-100 pb-2">
                        Colección de Insignias
                    </h3>
                    <div className="grid grid-cols-3 gap-3 w-full px-8">
                        {[0, 1, 2, 3, 4, 5].map(i => renderBadgeSlot(i))}
                    </div>
                </div>

                <div className="bg-white border-4 border-black rounded-2xl p-4 w-full cartoon-shadow-lg mb-4">
                    <h3 className="text-xl font-black text-black mb-3 border-b-2 border-gray-100 pb-2 flex items-center gap-2">
                        <TrendingUp size={20} className="text-black" /> Estadísticas de Temporada
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-2 text-center bg-gray-100 p-2 rounded-t-lg font-black text-xs text-black uppercase">
                        <div>Modo</div>
                        <div>PB (Personal)</div>
                        <div>SB (Season)</div>
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                        {stats.map((s) => (
                            <div key={s.mode} className="grid grid-cols-3 gap-2 text-center items-center bg-gray-50 p-2 rounded-lg border-2 border-gray-100">
                                <div className="font-black text-lg text-black">{s.mode}</div>
                                <div className="font-mono font-bold text-black">{formatTime(s.pb)}</div>
                                <div className="font-mono font-bold text-black">{formatTime(s.sb)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        ) : tab === 'MISSIONS' ? (
            renderMissions()
        ) : (
            renderCustomize()
        )}

      </div>

      <div className="w-full max-w-md mx-auto pt-2 shrink-0">
         <Button onClick={onBack} size="lg" className="w-full text-black" variant="secondary">
            Volver
        </Button>
      </div>
    </div>
  );
};

export default Profile;
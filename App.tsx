import React, { useState, useEffect, useCallback } from 'react';
import { Country, GameState, Question, Score, User, GameMode, ChampionsRound } from './types';
import { fetchCountries } from './services/gemini';
import Button from './components/Button';
import Timer from './components/Timer';
import Leaderboard from './components/Leaderboard';
import Auth from './components/Auth';
import Profile from './components/Profile';
import League from './components/League';
import Elo from './components/Elo';
import ChampionsLeague from './components/ChampionsLeague';
import Guide from './components/Guide';
import GameReport from './components/GameReport';
import Avatar, { FRAMES } from './components/Avatar';
import { Trophy, Zap, Target, Timer as TimerIcon, Swords, Calendar, X, BookOpen, Flag, Star, Medal } from 'lucide-react';

const PENALTY_MS = 5000;

function App() {
  const [gameState, setGameState] = useState<GameState>('AUTH');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Navigation State for viewing other profiles
  const [viewingProfileUser, setViewingProfileUser] = useState<User | null>(null);
  const [previousGameState, setPreviousGameState] = useState<GameState>('MENU');

  // Game Configuration
  const [gameMode, setGameMode] = useState<GameMode>(10);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [penaltyMs, setPenaltyMs] = useState(0);
  
  const [lastScore, setLastScore] = useState<Score | undefined>(undefined);
  const [reportData, setReportData] = useState<{
      score: Score, 
      comparison: {wr: number, nr: number, pb: number, sb: number, rank: number, totalPlayers: number}
  } | undefined>(undefined);

  const [shake, setShake] = useState(false);
  const [showPenalty, setShowPenalty] = useState(false);
  
  // Season State
  const [currentSeason, setCurrentSeason] = useState(0);
  const [timeUntilNextSeason, setTimeUntilNextSeason] = useState('');

  // All countries cache
  const [allCountries, setAllCountries] = useState<Country[]>([]);

  // Load countries on mount
  useEffect(() => {
    fetchCountries('europe').then(data => setAllCountries(data));
    checkDailyUpdate();
    
    // Season Timer & Logic
    const updateSeason = () => {
        const now = new Date();
        const startYear = 2026;
        
        // If we are before 2026, it is Pre-season (Season 0)
        if (now.getFullYear() < startYear) {
             setCurrentSeason(0);
             // Count down to Jan 1st 2026
             const nextStart = new Date(startYear, 0, 1);
             const diff = nextStart.getTime() - now.getTime();
             const days = Math.floor(diff / (1000 * 60 * 60 * 24));
             const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
             setTimeUntilNextSeason(`${days}d ${hours}h`);
        } else {
             // Season 1 starts Jan 2026
             const diffYears = now.getFullYear() - startYear;
             const diffMonths = (diffYears * 12) + now.getMonth();
             const season = diffMonths + 1;
             setCurrentSeason(season);

             // Time until next month
             const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
             const diff = nextMonth.getTime() - now.getTime();
             const days = Math.floor(diff / (1000 * 60 * 60 * 24));
             const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
             setTimeUntilNextSeason(`${days}d ${hours}h`);
        }
    };
    
    updateSeason();
    const interval = setInterval(updateSeason, 60000); // Update every minute
    return () => clearInterval(interval);

  }, []);

  // --- DAILY / WEEKLY UPDATE LOGIC ---
  const checkDailyUpdate = () => {
    const lastResetStr = localStorage.getItem('flagtoon_last_reset_v2');
    const todayStr = new Date().toDateString();

    if (lastResetStr && lastResetStr !== todayStr) {
        performDailyUpdate(lastResetStr);
        localStorage.setItem('flagtoon_last_reset_v2', todayStr);
    } else if (!lastResetStr) {
        // Force a reset on first load with the new key
        performDailyUpdate(new Date(Date.now() - 86400000).toDateString());
        localStorage.setItem('flagtoon_last_reset_v2', todayStr);
    }
  };

  const performDailyUpdate = (lastResetStr: string) => {
    const usersStr = localStorage.getItem('flagtoon_users');
    if (!usersStr) return;

    let users: User[] = JSON.parse(usersStr);
    
    // Determine Current Week Day
    const now = new Date();
    const jsDay = now.getDay(); // 0=Sun, 1=Mon... 5=Fri
    
    // Check if Month Changed (Season Reset for ELO)
    const lastResetDate = new Date(lastResetStr);
    const isNewMonth = lastResetDate.getMonth() !== now.getMonth();

    const getStepXP = (lvl: number) => lvl === 1 ? 100 : Math.floor(100 * Math.pow(lvl, 1.5));

    // ==========================
    // 1. ELO DAILY PROCESSING (Add points to SEASON total)
    // ==========================
    const eloPlayers = users.filter(u => u.dailyEloTime !== undefined);
    eloPlayers.sort((a, b) => a.dailyEloTime! - b.dailyEloTime!);

    const pointsMap = new Map<string, number>();
    eloPlayers.forEach((u, index) => {
        if (index < 25) pointsMap.set(u.username, 25 - index);
    });

    users = users.map(u => {
        const pts = pointsMap.get(u.username) || 0;
        return {
            ...u,
            seasonEloPoints: (u.seasonEloPoints || 0) + pts, // Accumulate Monthly
            dailyEloTime: undefined 
        };
    });

    // ==========================
    // 1.5. ELO SEASON RESET (If Month Changed)
    // ==========================
    if (isNewMonth) {
        // Finalize previous season
        const eloRanked = users.filter(u => (u.seasonEloPoints || 0) > 0);
        eloRanked.sort((a, b) => b.seasonEloPoints! - a.seasonEloPoints!);
        
        const eloBadgeMap = new Map<string, string>();
        eloRanked.forEach((u, index) => {
             eloBadgeMap.set(u.username, `ELO_RANK_${index + 1}`);
        });

        users = users.map(u => {
            let badges = u.badges ? [...u.badges] : [];
            while(badges.length < 6) badges.push("");

            const badgeDates = u.badgeDates || {};

            if (eloBadgeMap.has(u.username)) {
                const badgeId = eloBadgeMap.get(u.username)!;
                badges[2] = badgeId; // Badge Slot 2
                badgeDates[badgeId] = new Date().toISOString();
            }

            // Reset Elo Points for new month
            return {
                ...u,
                seasonEloPoints: 0,
                badges: badges,
                badgeDates: badgeDates
            };
        });
    }

    // ==========================
    // 2. CHAMPIONS LEAGUE PROCESSING (New Start Day: Tuesday)
    // ==========================
    // Schedule:
    // Tuesday (2): Groups Day 1 (RESET)
    // Wednesday (3): Groups Day 2
    // Thursday (4): R32
    // Friday (5): R16
    // Saturday (6): QF
    // Sunday (0): SF
    // Monday (1): FINAL

    const championsSurvivors = users.filter(u => !u.isChampionsEliminated);
    
    // Helper to pair users
    const createMatchups = (pool: User[]) => {
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const pairs: {p1: string, p2: string}[] = [];
        for (let i = 0; i < shuffled.length; i += 2) {
            if (i + 1 < shuffled.length) {
                pairs.push({ p1: shuffled[i].username, p2: shuffled[i+1].username });
            } else {
                 pairs.push({ p1: shuffled[i].username, p2: "BYE" });
            }
        }
        return pairs;
    };

    if (jsDay === 2) { // TUESDAY: RESET & GROUPS START
        const groups = ['A','B','C','D','E','F','G','H'];
        const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
        
        users = users.map(u => ({
            ...u,
            isChampionsEliminated: false,
            championsRound: 'GROUP',
            championsOpponent: undefined,
            dailyChampionsTime: undefined
        }));

        shuffledUsers.forEach((u, i) => {
            const targetUser = users.find(user => user.username === u.username);
            if (targetUser) {
                targetUser.championsGroup = groups[i % 8];
            }
        });

    } else if (jsDay === 3) { // WEDNESDAY
        // Groups continue, no reset needed
    } else if (jsDay === 4) { // THURSDAY: R32
        const groups = ['A','B','C','D','E','F','G','H'];
        const qualifiers: string[] = [];

        groups.forEach(g => {
            const groupPlayers = users.filter(u => u.championsGroup === g);
            groupPlayers.sort((a, b) => {
                if (a.dailyChampionsTime === undefined && b.dailyChampionsTime === undefined) return 0;
                if (a.dailyChampionsTime === undefined) return 1;
                if (b.dailyChampionsTime === undefined) return -1;
                return a.dailyChampionsTime! - b.dailyChampionsTime!;
            });
            const top4 = groupPlayers.slice(0, 4);
            top4.forEach(p => qualifiers.push(p.username));
        });

        users.forEach(u => {
            if (!qualifiers.includes(u.username)) {
                u.isChampionsEliminated = true;
                u.championsOpponent = undefined;
            } else {
                u.isChampionsEliminated = false;
                u.championsRound = 'R32';
                u.dailyChampionsTime = undefined;
            }
        });

        const survivors = users.filter(u => !u.isChampionsEliminated);
        const pairs = createMatchups(survivors);
        
        pairs.forEach(pair => {
            const u1 = users.find(u => u.username === pair.p1);
            const u2 = users.find(u => u.username === pair.p2);
            if (u1) u1.championsOpponent = pair.p2;
            if (u2) u2.championsOpponent = pair.p1;
        });

    } else if (jsDay === 5 || jsDay === 6 || jsDay === 0 || jsDay === 1) { // Fri, Sat, Sun, Mon
        // Process previous round elimination
        const survivors = users.filter(u => !u.isChampionsEliminated && u.championsOpponent);
        const processedUsers = new Set<string>();

        survivors.forEach(u => {
            if (processedUsers.has(u.username)) return;

            const oppName = u.championsOpponent;
            const opp = users.find(user => user.username === oppName);
            
            if (!opp && oppName !== "BYE") return; 
            
            processedUsers.add(u.username);
            if (opp) processedUsers.add(opp.username);

            let winner: User | null = null;
            let loser: User | null = null;

            if (oppName === "BYE") {
                winner = u;
            } else if (opp) {
                const t1 = u.dailyChampionsTime;
                const t2 = opp.dailyChampionsTime;

                if (t1 === undefined && t2 === undefined) {
                    winner = u.xp > opp.xp ? u : opp;
                    loser = u.xp > opp.xp ? opp : u;
                } else if (t1 === undefined) {
                    winner = opp;
                    loser = u;
                } else if (t2 === undefined) {
                    winner = u;
                    loser = opp;
                } else {
                    winner = t1 < t2 ? u : opp;
                    loser = t1 < t2 ? opp : u;
                }
            }

            if (winner && loser) {
                winner.isChampionsEliminated = false;
                loser.isChampionsEliminated = true;
                loser.championsOpponent = undefined;
                winner.dailyChampionsTime = undefined;
            } else if (winner && !loser) {
                winner.isChampionsEliminated = false;
                winner.dailyChampionsTime = undefined;
            }
        });

        const nextRoundMap: Record<string, ChampionsRound> = {
            'R32': 'R16',
            'R16': 'QF',
            'QF': 'SF',
            'SF': 'FINAL',
            'FINAL': 'WINNER'
        };

        const remaining = users.filter(u => !u.isChampionsEliminated);
        
        if (remaining.length > 0) {
            const currentR = remaining[0].championsRound || 'R32';
            const nextR = nextRoundMap[currentR] || currentR;

            remaining.forEach(u => {
                u.championsRound = nextR;
                if (nextR === 'WINNER') {
                    u.championsWins = (u.championsWins || 0) + 1;
                    u.championsOpponent = undefined;
                }
            });

            if (nextR !== 'WINNER') {
                const nextPairs = createMatchups(remaining);
                nextPairs.forEach(pair => {
                    const u1 = users.find(u => u.username === pair.p1);
                    const u2 = users.find(u => u.username === pair.p2);
                    if (u1) u1.championsOpponent = pair.p2;
                    if (u2) u2.championsOpponent = pair.p1;
                });
            }
        }
    }


    // ==========================
    // 3. LEAGUE & WEEKLY RESET (NEW DAY: TUESDAY = 2)
    // ==========================
    if (jsDay === 2) { 
        // --- A. LEAGUE RESET ---
        const leagueSurvivors = users.filter(u => !u.isEliminated && u.dailyLeagueTime !== undefined);
        leagueSurvivors.sort((a, b) => a.dailyLeagueTime! - b.dailyLeagueTime!);

        if (leagueSurvivors.length > 0) {
             const winner = leagueSurvivors[0];
             const idx = users.findIndex(u => u.username === winner.username);
             if (idx !== -1) users[idx].xp += 5000; 
        }

        // --- C. APPLY RESETS (Only League fields now) ---
        users = users.map(u => {
            return {
                ...u,
                leagueTier: 0,
                isEliminated: false,
                dailyLeagueTime: undefined,
                // Do NOT reset Elo here anymore
            };
        });

    } else {
        // ==========================
        // 4. DAILY LEAGUE ELIMINATION
        // ==========================
        let eliminationRate = 0.3; 
        // Logic for days:
        // Day 1 (Tue): No elimination, just play.
        // Day 2 (Wed): 30% elimination based on Tue results.
        // Day 3 (Thu): 40% elimination based on Wed results.
        // Day 4 (Fri): 50% elimination based on Thu results.
        // Day 5 (Sat), Day 6 (Sun), Day 7 (Mon): 60% elimination.
        
        if (jsDay === 4) eliminationRate = 0.4; // Thursday
        else if (jsDay === 5) eliminationRate = 0.5; // Friday
        else if (jsDay === 6 || jsDay === 0 || jsDay === 1) eliminationRate = 0.6; // Sat, Sun, Mon

        const pool = users.filter(u => !u.isEliminated);
        const playedPool = pool.filter(u => u.dailyLeagueTime !== undefined);
        const didNotPlayPool = pool.filter(u => u.dailyLeagueTime === undefined); 

        playedPool.sort((a, b) => a.dailyLeagueTime! - b.dailyLeagueTime!);

        const totalSurvivors = playedPool.length;
        const safeCount = Math.ceil(totalSurvivors * (1 - eliminationRate));
        
        const eliminationMap = new Map<string, boolean>();
        const tierMap = new Map<string, number>();

        playedPool.forEach((u, index) => {
            if (index < safeCount) {
                eliminationMap.set(u.username, false); 
                const nextTier = Math.min(7, (u.leagueTier || 0) + 1);
                tierMap.set(u.username, nextTier);
            } else {
                eliminationMap.set(u.username, true); 
            }
        });

        didNotPlayPool.forEach(u => {
            eliminationMap.set(u.username, true); 
        });

        users = users.map(u => {
            const cleanUser = { ...u, dailyLeagueTime: undefined };

            if (!cleanUser.isEliminated) {
                if (eliminationMap.has(u.username)) {
                    cleanUser.isEliminated = eliminationMap.get(u.username);
                    
                    if (!cleanUser.isEliminated) {
                        cleanUser.leagueTier = tierMap.get(u.username)!;
                        cleanUser.xp += 100;
                        if (!cleanUser.badges) cleanUser.badges = [];
                        while(cleanUser.badges.length < 6) cleanUser.badges.push("");
                        const badgeId = `LEAGUE_RANK_${cleanUser.leagueTier}`;
                        cleanUser.badges[1] = badgeId;
                        
                        if (!cleanUser.badgeDates) cleanUser.badgeDates = {};
                        cleanUser.badgeDates[badgeId] = new Date().toISOString();
                    }
                }
            }
            
            let newLevel = 1;
            let xpAccumulator = 0;
            while (cleanUser.xp >= xpAccumulator + getStepXP(newLevel)) {
                xpAccumulator += getStepXP(newLevel);
                newLevel++;
            }
            cleanUser.level = newLevel;

            return cleanUser;
        });
    }

    localStorage.setItem('flagtoon_users', JSON.stringify(users));
  };

  const handleLogin = (user: User) => {
    const usersStr = localStorage.getItem('flagtoon_users');
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];
    const freshUser = users.find(u => u.username === user.username) || user;

    const safeUser = {
        ...freshUser,
        leagueTier: freshUser.leagueTier || 0,
        xp: freshUser.xp || 0,
        level: freshUser.level || 1,
        badges: freshUser.badges || [],
        badgeDates: freshUser.badgeDates || {},
        dailyLeagueTime: freshUser.dailyLeagueTime,
        isEliminated: freshUser.isEliminated || false,
        dailyEloTime: freshUser.dailyEloTime,
        seasonEloPoints: freshUser.seasonEloPoints || 0, // Ensure season points field exists
        championsWins: freshUser.championsWins || 0,
        // Init Frames
        currentFrame: freshUser.currentFrame || 'DEFAULT',
        unlockedFrames: freshUser.unlockedFrames || ['DEFAULT']
    };
    
    while(safeUser.badges.length < 6) {
        if (safeUser.badges.length === 5) {
            safeUser.badges.unshift("");
        } else {
            safeUser.badges.push("");
        }
    }
    
    // SAFETY FAILSAFE: If it is League Day 1 (Tuesday), enforce NOT eliminated
    // This fixes issues if the daily update sync missed or user is coming from an old state
    const now = new Date();
    if (now.getDay() === 2) {
        safeUser.isEliminated = false;
    }

    setCurrentUser(safeUser);
    setGameState('MENU');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setGameState('AUTH');
  };

  const handleExitGame = () => {
    if (typeof gameMode === 'number') {
        setGameState('MENU');
    } else if (gameMode === 'LEAGUE') {
        setGameState('LEAGUE');
    } else if (gameMode === 'ELO') {
        setGameState('ELO_MENU');
    } else if (gameMode === 'CHAMPIONS') {
        setGameState('CHAMPIONS_LEAGUE');
    } else {
        setGameState('MENU');
    }
  };

  // --- NAVIGATION HELPERS ---
  const handleViewProfile = (user: User) => {
      setPreviousGameState(gameState);
      setViewingProfileUser(user);
      setGameState('PROFILE');
  };

  const handleProfileBack = () => {
      // Reload current user to reflect frame changes
      if (currentUser) {
          const usersStr = localStorage.getItem('flagtoon_users');
          if (usersStr) {
              const users: User[] = JSON.parse(usersStr);
              const fresh = users.find(u => u.username === currentUser.username);
              if (fresh) setCurrentUser(fresh);
          }
      }
      setViewingProfileUser(null);
      setGameState(previousGameState);
  };

  const handleMyProfile = () => {
      if (!currentUser) return;
      setPreviousGameState('MENU');
      setViewingProfileUser(currentUser);
      setGameState('PROFILE');
  };

  const prepareGame = useCallback((mode: GameMode) => {
    setGameMode(mode);
    if (allCountries.length < 10) return;

    if (mode === 'LEAGUE' && currentUser) {
        if (currentUser.isEliminated) return;
    }
    if (mode === 'CHAMPIONS' && currentUser) {
        if (currentUser.isChampionsEliminated) return;
        if (currentUser.championsRound === 'WINNER') return;
        
        // --- NEW STRICT JOIN LOGIC ---
        const now = new Date();
        const jsDay = now.getDay();
        
        // Logic: 
        // Tuesday (2) & Wednesday (3) are Group Stage days. 
        // If it's NOT Tue/Wed (Day > 3 or Day < 2) AND user has NO group, they cannot play/join.
        const isGroupStage = jsDay === 2 || jsDay === 3;
        
        if (!currentUser.championsGroup) {
            if (isGroupStage) {
                 // Assign Group Logic (Allow joining)
                 const groups = ['A','B','C','D','E','F','G','H'];
                 const usersStr = localStorage.getItem('flagtoon_users');
                 let users: User[] = usersStr ? JSON.parse(usersStr) : [];

                 const groupCounts: Record<string, number> = {};
                 groups.forEach(g => groupCounts[g] = 0);

                 users.forEach(u => {
                     if (u.championsGroup && groups.includes(u.championsGroup)) {
                         groupCounts[u.championsGroup]++;
                     }
                 });

                 let minCount = Infinity;
                 groups.forEach(g => {
                     if (groupCounts[g] < minCount) minCount = groupCounts[g];
                 });

                 const availableGroups = groups.filter(g => groupCounts[g] === minCount);
                 const assignedGroup = availableGroups[Math.floor(Math.random() * availableGroups.length)];
                 
                 const idx = users.findIndex(u => u.username === currentUser.username);
                 if (idx !== -1) {
                     users[idx].championsGroup = assignedGroup;
                     users[idx].championsRound = 'GROUP'; 
                     localStorage.setItem('flagtoon_users', JSON.stringify(users));
                 }

                 const updated = { ...currentUser, championsGroup: assignedGroup, championsRound: 'GROUP' as ChampionsRound };
                 setCurrentUser(updated);
            } else {
                // LOCK OUT: Missed the group stage window
                return;
            }
        }
    }

    const newQuestions: Question[] = [];
    const usedTargets = new Set<string>();
    
    let roundsToPlay = 10;
    if (mode === 'LEAGUE') roundsToPlay = 10;
    else if (mode === 'ELO') roundsToPlay = 10; 
    else if (mode === 'CHAMPIONS') roundsToPlay = 10;
    else if (typeof mode === 'number') roundsToPlay = mode;

    for (let i = 0; i < roundsToPlay; i++) {
        let target: Country;
        let attempts = 0;
        do {
            target = allCountries[Math.floor(Math.random() * allCountries.length)];
            attempts++;
        } while (usedTargets.has(target.code) && attempts < 100);
        
        usedTargets.add(target.code);
        const options = [target];
        while (options.length < 6) {
            const distractor = allCountries[Math.floor(Math.random() * allCountries.length)];
            if (!options.find(c => c.code === distractor.code)) options.push(distractor);
        }
        options.sort(() => Math.random() - 0.5);
        newQuestions.push({ target, options });
    }
    setQuestions(newQuestions);
    newQuestions.forEach(q => q.options.forEach(opt => {
        const img = new Image();
        img.src = `https://flagcdn.com/w320/${opt.code}.png`;
    }));
    startGame();
  }, [allCountries, currentUser]);

  const startGame = () => {
    setCurrentRound(0);
    setPenaltyMs(0);
    setStartTime(Date.now());
    setGameState('PLAYING');
  };

  const handleAnswer = (selectedCountry: Country) => {
    const currentQuestion = questions[currentRound];
    if (selectedCountry.code === currentQuestion.target.code) {
        const totalRounds = questions.length;
      if (currentRound < totalRounds - 1) {
        setCurrentRound(prev => prev + 1);
      } else {
        finishGame();
      }
    } else {
      triggerPenalty();
    }
  };

  const triggerPenalty = () => {
    setPenaltyMs(prev => prev + PENALTY_MS);
    setShake(true);
    setShowPenalty(true);
    setTimeout(() => setShake(false), 500);
    setTimeout(() => setShowPenalty(false), 1000);
  };

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

  const calculateNewLevel = (totalXp: number) => {
      let level = 1;
      while (totalXp >= getTotalXpToReachLevel(level + 1)) {
          level++;
      }
      return level;
  };

  const finishGame = () => {
    if (!currentUser) return;

    const endTime = Date.now();
    const finalTime = (endTime - startTime) + penaltyMs;
    const finalTimeSeconds = finalTime / 1000;
    
    // Load fresh users
    const usersStr = localStorage.getItem('flagtoon_users');
    let users: User[] = usersStr ? JSON.parse(usersStr) : [];
    
    // Update Current User State (Calculated locally)
    let updatedUser = { ...currentUser };
    const myIndex = users.findIndex(u => u.username === updatedUser.username);
    if (myIndex !== -1) updatedUser = { ...users[myIndex], ...updatedUser }; 
    
    while(updatedUser.badges.length < 6) updatedUser.badges.push("");

    // --- XP CALCULATION ---
    const flagsCount = questions.length;
    let calculatedXp = flagsCount * 10;
    const benchmarkSeconds = flagsCount * 5; 
    const timeSaved = Math.max(0, benchmarkSeconds - finalTimeSeconds);
    calculatedXp += Math.floor(timeSaved * 2);
    if (gameMode === 'LEAGUE' || gameMode === 'ELO' || gameMode === 'CHAMPIONS') calculatedXp = Math.floor(calculatedXp * 1.5);
    
    updatedUser.xp = Math.max(0, (updatedUser.xp || 0) + Math.max(flagsCount * 2, calculatedXp));
    updatedUser.level = calculateNewLevel(updatedUser.xp);

    // --- CHECK FRAME UNLOCKS ---
    if (!updatedUser.unlockedFrames) updatedUser.unlockedFrames = ['DEFAULT'];
    
    FRAMES.forEach(frame => {
        if (!updatedUser.unlockedFrames!.includes(frame.id)) {
            if (frame.unlockCondition(updatedUser.level, updatedUser.xp)) {
                updatedUser.unlockedFrames!.push(frame.id);
            }
        }
    });

    // --- MODE SPECIFIC LOGIC ---
    if (gameMode === 'LEAGUE') {
        if (!updatedUser.dailyLeagueTime || finalTime < updatedUser.dailyLeagueTime) {
            updatedUser.dailyLeagueTime = finalTime;
        }
        updatedUser.lastLeaguePlay = new Date().toISOString();
    }
    if (gameMode === 'ELO') {
        if (!updatedUser.dailyEloTime || finalTime < updatedUser.dailyEloTime) {
            updatedUser.dailyEloTime = finalTime;
        }
    }
    if (gameMode === 'CHAMPIONS') {
        if (!updatedUser.dailyChampionsTime || finalTime < updatedUser.dailyChampionsTime) {
            updatedUser.dailyChampionsTime = finalTime;
        }
    }

    // --- SCORE & BADGE RECALCULATION LOGIC ---
    const score: Score = {
      username: currentUser.username,
      avatarCode: currentUser.avatarCode,
      timeMs: finalTime,
      date: new Date().toISOString(),
      mode: gameMode
    };

    const isPractice = typeof gameMode === 'number';
    let scores: Score[] = [];

    // Load existing scores to calculate comparisons *BEFORE* pushing the new one
    const scoresStr = localStorage.getItem('flagtoon_scores');
    scores = scoresStr ? JSON.parse(scoresStr) : [];

    // --- CALCULATE COMPARISON DATA (OLD RECORDS) ---
    let reportStats = { wr: Infinity, nr: Infinity, pb: 0, sb: 0, rank: 0, totalPlayers: 0 };
    if (isPractice) {
        const oldModeScores = scores.filter(s => s.mode === gameMode);
        
        // Old World Record
        reportStats.wr = oldModeScores.length > 0 ? Math.min(...oldModeScores.map(s => s.timeMs)) : Infinity;
        
        // Old National Record
        const countryScores = oldModeScores.filter(s => s.avatarCode === updatedUser.avatarCode);
        reportStats.nr = countryScores.length > 0 ? Math.min(...countryScores.map(s => s.timeMs)) : Infinity;

        // Old Personal Best
        const myScores = oldModeScores.filter(s => s.username === updatedUser.username);
        reportStats.pb = myScores.length > 0 ? Math.min(...myScores.map(s => s.timeMs)) : 0;
        
        // Old Season Best
        const now = new Date();
        const sbScores = myScores.filter(s => {
            const d = new Date(s.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        reportStats.sb = sbScores.length > 0 ? Math.min(...sbScores.map(s => s.timeMs)) : 0;
    }

    // --- SAVE NEW SCORE ---
    if (isPractice) {
        scores.push(score);
        localStorage.setItem('flagtoon_scores', JSON.stringify(scores));
    }

    // --- CALCULATE BADGES & UPDATE USERS WITH XP ---
    if (isPractice) {
        const relevantScores = scores.filter(s => s.mode === gameMode);
        const globalBest = relevantScores.length > 0 ? Math.min(...relevantScores.map(s => s.timeMs)) : Infinity;
        const bestByCountry: Record<string, number> = {};
        relevantScores.forEach(s => {
            if (!bestByCountry[s.avatarCode] || s.timeMs < bestByCountry[s.avatarCode]) {
                bestByCountry[s.avatarCode] = s.timeMs;
            }
        });
        const badgeIndex = gameMode === 5 ? 3 : gameMode === 10 ? 4 : 5;

        // Update all users (badges) AND specifically update current user (XP)
        users = users.map(u => {
            // CRITICAL FIX: Use the updatedUser object (with new XP) if it matches, otherwise use existing user from array
            const baseUser = u.username === updatedUser.username ? updatedUser : u;

            const userScores = relevantScores.filter(s => s.username === baseUser.username);
            const userBest = userScores.length > 0 ? Math.min(...userScores.map(s => s.timeMs)) : Infinity;
            
            let newBadgeId = "";
            if (userBest !== Infinity) {
                if (userBest === globalBest) {
                    newBadgeId = `WR_${gameMode}`;
                } else if (userBest === bestByCountry[baseUser.avatarCode]) {
                    newBadgeId = `NR_${gameMode}`;
                } else {
                    if (gameMode === 5) {
                        if (userBest < 2600) newBadgeId = `PRO_${gameMode}`;
                        else if (userBest < 2700) newBadgeId = `GRANDMASTER_${gameMode}`;
                        else if (userBest < 2800) newBadgeId = `MASTER_${gameMode}`;
                        else if (userBest < 2900) newBadgeId = `EMERALD_${gameMode}`;
                        else if (userBest < 3000) newBadgeId = `RUBY_${gameMode}`;
                        else if (userBest < 3100) newBadgeId = `PLATINUM_${gameMode}`;
                        else if (userBest < 3300) newBadgeId = `DIAMOND_${gameMode}`;
                        else if (userBest < 3500) newBadgeId = `GOLD_${gameMode}`;
                        else if (userBest < 3800) newBadgeId = `SILVER_${gameMode}`;
                        else if (userBest < 4000) newBadgeId = `BRONZE_${gameMode}`;
                    } else if (gameMode === 10) {
                        if (userBest < 5800) newBadgeId = `PRO_${gameMode}`;
                        else if (userBest < 5900) newBadgeId = `GRANDMASTER_${gameMode}`;
                        else if (userBest < 6000) newBadgeId = `MASTER_${gameMode}`;
                        else if (userBest < 6100) newBadgeId = `EMERALD_${gameMode}`;
                        else if (userBest < 6300) newBadgeId = `RUBY_${gameMode}`;
                        else if (userBest < 6500) newBadgeId = `PLATINUM_${gameMode}`;
                        else if (userBest < 6750) newBadgeId = `DIAMOND_${gameMode}`;
                        else if (userBest < 7000) newBadgeId = `GOLD_${gameMode}`;
                        else if (userBest < 7500) newBadgeId = `SILVER_${gameMode}`;
                        else if (userBest < 8000) newBadgeId = `BRONZE_${gameMode}`;
                    } else if (gameMode === 20) {
                        if (userBest < 13600) newBadgeId = `PRO_${gameMode}`;
                        else if (userBest < 13800) newBadgeId = `GRANDMASTER_${gameMode}`;
                        else if (userBest < 14000) newBadgeId = `MASTER_${gameMode}`;
                        else if (userBest < 14200) newBadgeId = `EMERALD_${gameMode}`;
                        else if (userBest < 14500) newBadgeId = `RUBY_${gameMode}`;
                        else if (userBest < 14800) newBadgeId = `PLATINUM_${gameMode}`;
                        else if (userBest < 15100) newBadgeId = `DIAMOND_${gameMode}`;
                        else if (userBest < 15450) newBadgeId = `GOLD_${gameMode}`;
                        else if (userBest < 15700) newBadgeId = `SILVER_${gameMode}`;
                        else if (userBest < 16000) newBadgeId = `BRONZE_${gameMode}`;
                    }
                }
            }

            const currentBadges = [...(baseUser.badges || [])];
            while (currentBadges.length < 6) currentBadges.push("");
            
            if (currentBadges[badgeIndex] !== newBadgeId) {
                currentBadges[badgeIndex] = newBadgeId;
                if (newBadgeId && (!baseUser.badgeDates || !baseUser.badgeDates[newBadgeId])) {
                    if (!baseUser.badgeDates) baseUser.badgeDates = {};
                    baseUser.badgeDates[newBadgeId] = new Date().toISOString();
                }
            }

            return { ...baseUser, badges: currentBadges };
        });

        // Sync updatedUser with the one in users array to ensure badges are reflected in state immediately
        const me = users.find(u => u.username === updatedUser.username);
        if (me) updatedUser = me;

    } else {
        // If not practice mode, simply ensure the updatedUser (with XP) is saved into the array
        users = users.map(u => u.username === updatedUser.username ? updatedUser : u);
    }

    // --- FINALIZE REPORT RANKING ---
    if (isPractice) {
        const modeScores = scores.filter(s => s.mode === gameMode);
        const allTimeScores = [...modeScores].sort((a,b) => a.timeMs - b.timeMs);
        reportStats.rank = allTimeScores.findIndex(s => s.timeMs === finalTime) + 1;
        reportStats.totalPlayers = allTimeScores.length;
    }
    
    localStorage.setItem('flagtoon_users', JSON.stringify(users));
    setCurrentUser(updatedUser);
    setLastScore(score);
    
    if (isPractice) {
        setReportData({ score, comparison: reportStats });
        setGameState('GAME_REPORT');
    } else if (gameMode === 'LEAGUE') {
        setGameState('LEAGUE'); 
    } else if (gameMode === 'ELO') {
        setGameState('ELO_MENU');
    } else if (gameMode === 'CHAMPIONS') {
        setGameState('CHAMPIONS_LEAGUE');
    }
  };

  const renderMenu = () => (
    <div className="flex flex-col items-center gap-4 animate-fade-in w-full max-w-md px-4 py-6 overflow-y-auto h-full scrollbar-hide relative">
      <div className="flex flex-col items-center gap-2 text-center w-full">
        {currentUser && (
            <div className="w-full flex justify-between items-start mb-2 px-2 relative z-10">
                 <button 
                    onClick={handleMyProfile}
                    className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border-4 border-black cartoon-shadow scale-90 md:scale-100 hover:scale-105 transition-transform"
                >
                    <Avatar 
                        code={currentUser.avatarCode} 
                        frameId={currentUser.currentFrame} 
                        size="sm"
                        className="border border-black" 
                    />
                    <div className="flex flex-col items-start">
                        <span className="font-bold text-lg leading-none truncate max-w-[100px] text-black">{currentUser.username}</span>
                        <span className="text-xs font-bold text-yellow-600">Lvl {currentUser.level}</span>
                    </div>
                </button>
                <div className="flex flex-col gap-1 w-[140px]">
                    <div className="flex gap-1 w-full">
                        <button 
                            onClick={() => { setGameState('GUIDE'); }}
                            className="flex-1 text-xs text-blue-500 font-bold hover:text-blue-700 bg-white border-2 border-black py-1 rounded-lg flex justify-center items-center gap-1"
                        >
                            <BookOpen size={14} /> Guía
                        </button>
                        <button onClick={handleLogout} className="flex-1 text-xs text-red-500 font-bold hover:text-red-700 bg-white border-2 border-black py-1 rounded-lg flex justify-center items-center">
                            Salir
                        </button>
                    </div>
                </div>
            </div>
        )}

        <h1 className="text-5xl font-black text-black cartoon-text-shadow stroke-white tracking-wider transform -rotate-2 break-words">
          FlagToon
        </h1>
        
        {/* Ranking Button Section (Swapped position) */}
        <div className="w-full">
             <button 
                onClick={() => { setGameState('LEADERBOARD'); }} 
                className="w-full bg-white hover:bg-gray-50 border-4 border-black rounded-xl py-3 px-4 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all group"
            >
                <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 p-2 rounded-lg border-2 border-black group-hover:scale-110 transition-transform">
                        <Medal size={28} className="text-yellow-600" />
                    </div>
                    <div className="flex flex-col items-start">
                         <span className="text-xl font-black text-black leading-none">RANKING</span>
                         <span className="text-xs font-bold text-gray-500">Mejores Jugadores</span>
                    </div>
                </div>
                <div className="text-2xl">🏆</div>
            </button>
        </div>

        {/* Season Box (Swapped position) */}
        <div className="w-full bg-black/80 text-white rounded-lg p-2 flex justify-between items-center border-2 border-white/50 shadow-md transform scale-95 md:scale-100">
             <div className="flex items-center gap-2">
                 <Calendar size={18} className="text-yellow-400" />
                 <span className="font-bold text-sm uppercase text-white">Temporada {currentSeason}</span>
             </div>
             <span className="font-mono font-bold text-yellow-300 text-sm">Fin en: {timeUntilNextSeason}</span>
        </div>

      </div>

      <div className="flex flex-col gap-3 w-full pb-8">
        <div className="grid grid-cols-3 gap-2 w-full mb-2">
            <Button onClick={() => prepareGame(5)} className="flex flex-col items-center justify-center py-2 px-1 text-center h-24 bg-green-500 hover:bg-green-400">
                <span className="text-2xl font-black leading-none text-black drop-shadow-md">5</span>
                <span className="text-sm font-bold text-black uppercase mt-1">Rápido</span>
            </Button>
            <Button onClick={() => prepareGame(10)} className="flex flex-col items-center justify-center py-2 px-1 text-center h-24 bg-blue-500 hover:bg-blue-400">
                <span className="text-2xl font-black leading-none text-black drop-shadow-md">10</span>
                <span className="text-sm font-bold text-black uppercase mt-1">Normal</span>
            </Button>
            <Button onClick={() => prepareGame(20)} className="flex flex-col items-center justify-center py-2 px-1 text-center bg-purple-500 hover:bg-purple-400 h-24">
                <span className="text-2xl font-black leading-none text-black drop-shadow-md">20</span>
                <span className="text-sm font-bold text-black uppercase mt-1">Largo</span>
            </Button>
        </div>

        <Button 
          onClick={() => { if (!currentUser?.isEliminated) setGameState('LEAGUE'); }}
          className={`w-full text-lg flex justify-between items-center py-3 relative overflow-hidden group cartoon-shadow-lg ${currentUser?.isEliminated ? 'bg-gray-400 cursor-not-allowed opacity-80' : 'bg-yellow-400 hover:bg-yellow-300'}`}
          disabled={currentUser?.isEliminated}
        >
            <span className="z-10 flex items-center gap-2 font-black text-black"><Trophy size={22} className="stroke-[2.5px]" /> MODO LIGA</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-lg z-10 ${currentUser?.isEliminated ? 'bg-red-600 text-white' : 'bg-black text-white'}`}>
                {currentUser?.isEliminated ? 'Eliminado' : 'Jugar'}
            </span>
            {!currentUser?.isEliminated && <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>}
        </Button>

        <Button 
          onClick={() => { setGameState('CHAMPIONS_LEAGUE'); }}
          className="w-full text-lg flex justify-between items-center bg-blue-900 hover:bg-blue-800 py-3 relative overflow-hidden group cartoon-shadow-lg"
        >
            <span className="z-10 flex items-center gap-2 font-black text-white"><Star size={22} className="stroke-[2.5px]" fill="yellow" /> CHAMPIONS LEAGUE</span>
            <span className="bg-white text-blue-900 text-xs font-bold px-2 py-1 rounded-lg z-10">Jugar</span>
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
        </Button>

        <Button 
          onClick={() => { setGameState('ELO_MENU'); }}
          className="w-full text-lg flex justify-between items-center bg-purple-500 hover:bg-purple-400 py-3 relative overflow-hidden group cartoon-shadow-lg"
        >
            <span className="z-10 flex items-center gap-2 font-black text-black"><Swords size={22} className="stroke-[2.5px]" /> MODO ELO</span>
            <span className="bg-white text-purple-600 text-xs font-bold px-2 py-1 rounded-lg z-10">Jugar</span>
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
        </Button>
      </div>
    </div>
  );

  const renderGame = () => (
      <div className="flex flex-col items-center w-full max-w-md md:max-w-4xl lg:max-w-6xl h-full px-4 py-4 relative transition-all duration-300">
          <div className="w-full flex justify-between items-center mb-6 mt-4">
              <div className="flex items-center gap-2">
                  <button
                      onClick={handleExitGame}
                      className="bg-red-500 hover:bg-red-400 text-white border-4 border-black w-12 h-12 flex items-center justify-center rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
                  >
                      <X size={24} strokeWidth={3} />
                  </button>
                  <div className="bg-white border-4 border-black px-4 py-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <span className="font-black text-xl text-black">
                          {currentRound + 1} / {questions.length}
                      </span>
                  </div>
              </div>
              <Timer startTime={startTime} penaltyMs={penaltyMs} isRunning={true} />
          </div>

          <div className="bg-white p-2 border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-6 transform rotate-1 hover:rotate-0 transition-transform duration-300">
              {questions[currentRound] && (
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-gray-800 uppercase tracking-tight leading-tight p-4">
                    ¿Cuál es la bandera de <br/>
                    <span className="text-blue-600 font-black text-3xl md:text-5xl lg:text-6xl">{questions[currentRound].target.name}</span>?
                  </h2>
              )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-6 w-full mb-4 h-full content-start">
              {questions[currentRound]?.options.map((country) => (
                  <button
                      key={country.code}
                      onClick={() => handleAnswer(country)}
                      className="group relative w-full aspect-[3/2] bg-gray-100 border-4 border-black rounded-xl overflow-hidden cartoon-shadow hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                      <img 
                          src={`https://flagcdn.com/w320/${country.code}.png`} 
                          alt="Bandera" 
                          className="w-full h-full object-cover pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                  </button>
              ))}
          </div>

          {showPenalty && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
                  <span className="text-6xl font-black text-red-600 drop-shadow-[4px_4px_0_#000] animate-bounce">
                      +5s
                  </span>
              </div>
          )}
      </div>
  );

  return (
    <div className="fixed inset-0 bg-amber-100 font-sans select-none overflow-hidden flex items-center justify-center bg-[radial-gradient(circle,rgba(255,255,255,0.4)_20%,transparent_20%),radial-gradient(circle,rgba(255,255,255,0.4)_20%,transparent_20%)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]">
        <div className={`w-full h-full flex flex-col items-center justify-center transition-transform duration-100 ${shake ? 'translate-x-2' : ''} ${!shake ? '' : '-translate-x-2'}`}>
             <style>{`
               @keyframes shake {
                 0%, 100% { transform: translateX(0); }
                 25% { transform: translateX(-5px); }
                 75% { transform: translateX(5px); }
               }
               .animate-shake { animation: shake 0.2s ease-in-out infinite; }
             `}</style>
             <div className={`w-full h-full flex flex-col items-center justify-center ${shake ? 'animate-shake' : ''}`}>
                {gameState === 'AUTH' && <Auth onLogin={handleLogin} />}
                {gameState === 'MENU' && renderMenu()}
                {gameState === 'PLAYING' && renderGame()}
                {gameState === 'GAME_REPORT' && lastScore && reportData && (
                    <GameReport 
                        score={lastScore} 
                        comparison={reportData.comparison} 
                        onReplay={() => prepareGame(gameMode)} 
                        onMenu={() => setGameState('MENU')} 
                    />
                )}
                {gameState === 'LEADERBOARD' && (
                    <Leaderboard 
                        currentScore={lastScore} 
                        onBack={() => setGameState('MENU')} 
                        initialMode={typeof gameMode === 'number' ? gameMode : 10}
                        currentUser={currentUser}
                        onViewProfile={handleViewProfile}
                    />
                )}
                {gameState === 'PROFILE' && viewingProfileUser && (
                    <Profile 
                        user={viewingProfileUser} 
                        currentUser={currentUser}
                        onBack={handleProfileBack} 
                    />
                )}
                {gameState === 'LEAGUE' && currentUser && (
                    <League 
                        user={currentUser} 
                        onPlayLeague={() => prepareGame('LEAGUE')} 
                        onBack={() => setGameState('MENU')}
                        onViewProfile={handleViewProfile}
                    />
                )}
                {gameState === 'ELO_MENU' && currentUser && (
                    <Elo 
                        user={currentUser} 
                        onPlay={() => prepareGame('ELO')} 
                        onBack={() => setGameState('MENU')}
                        onViewProfile={handleViewProfile}
                    />
                )}
                {gameState === 'CHAMPIONS_LEAGUE' && currentUser && (
                    <ChampionsLeague
                        user={currentUser}
                        onPlay={() => prepareGame('CHAMPIONS')}
                        onBack={() => setGameState('MENU')}
                    />
                )}
                {gameState === 'GUIDE' && (
                    <Guide onBack={() => setGameState('MENU')} />
                )}
             </div>
        </div>
    </div>
  );
}

export default App;
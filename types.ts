export interface Country {
  name: string;
  code: string; // ISO 2-letter code
}

export type GameMode = 5 | 10 | 20 | 'LEAGUE' | 'HOF' | 'ELO' | 'CHAMPIONS';

export type ChampionsRound = 'GROUP' | 'R32' | 'R16' | 'QF' | 'SF' | 'FINAL' | 'WINNER';

export interface User {
  username: string;
  password?: string;
  avatarCode: string;
  xp: number;
  level: number;
  badges: string[]; // [Champions, League, ELO_RANK, WR_5/NR_5, WR_10/NR_10, WR_20/NR_20] (Now 6 slots)
  badgeDates?: Record<string, string>; // Key: BadgeID, Value: ISO Date String
  leagueTier: number; // 0 to 8
  dailyLeagueTime?: number; 
  lastLeaguePlay?: string; 
  isEliminated?: boolean;
  
  // Customization
  currentFrame?: string;
  unlockedFrames?: string[];

  // ELO Mode Data
  dailyEloTime?: number; // Best time today for ELO
  seasonEloPoints?: number; // Points accumulated this MONTH/SEASON

  // Champions League Data
  championsWins?: number;
  championsGroup?: string; // 'A' through 'H'
  championsRound?: ChampionsRound;
  championsOpponent?: string; // Username of opponent
  dailyChampionsTime?: number;
  isChampionsEliminated?: boolean;
}

export interface Score {
  username: string;
  avatarCode: string;
  timeMs: number;
  date: string;
  mode: GameMode;
}

export type GameState = 'AUTH' | 'MENU' | 'PLAYING' | 'FINISHED' | 'LEADERBOARD' | 'PROFILE' | 'LEAGUE' | 'ELO_MENU' | 'GUIDE' | 'GAME_REPORT' | 'CHAMPIONS_LEAGUE';

export interface Question {
  target: Country;
  options: Country[];
}

// Helper to map number to Tier Name (Simplified 0-8)
export const getTierName = (tier: number) => {
    switch (tier) {
        case 8: return { name: 'PRO', color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-600', fill: 'fill-green-600' };
        case 7: return { name: 'MAESTRO', color: 'text-yellow-800', bg: 'bg-yellow-100', border: 'border-yellow-800', fill: 'fill-yellow-800' };
        case 6: return { name: 'LEGENDARIO', color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-600', fill: 'fill-red-600' };
        case 5: return { name: 'MÍTICO', color: 'text-purple-900', bg: 'bg-purple-100', border: 'border-purple-900', fill: 'fill-purple-900' };
        case 4: return { name: 'DIAMANTE', color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-600', fill: 'fill-blue-600' };
        case 3: return { name: 'PLATINO', color: 'text-cyan-500', bg: 'bg-cyan-50', border: 'border-cyan-500', fill: 'fill-cyan-500' };
        case 2: return { name: 'ORO', color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-500', fill: 'fill-yellow-500' };
        case 1: return { name: 'PLATA', color: 'text-gray-400', bg: 'bg-gray-100', border: 'border-gray-400', fill: 'fill-gray-400' };
        default: return { name: 'BRONCE', color: 'text-orange-800', bg: 'bg-orange-100', border: 'border-orange-800', fill: 'fill-orange-800' }; // 0
    }
};
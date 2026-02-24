import React, { useEffect, useState } from 'react';
import Button from './Button';
import { Swords, Play, Trophy, Info, List, ArrowLeft, Clock, Medal } from 'lucide-react';
import { User } from '../types';
import Avatar from './Avatar';

interface EloProps {
  user: User;
  onPlay: () => void;
  onBack: () => void;
  onViewProfile?: (user: User) => void;
}

type EloView = 'MAIN' | 'RANKING' | 'INFO';
type RankingTab = 'DAILY' | 'SEASON';

const Elo: React.FC<EloProps> = ({ user, onPlay, onBack, onViewProfile }) => {
  const [view, setView] = useState<EloView>('MAIN');
  const [rankingTab, setRankingTab] = useState<RankingTab>('DAILY');
  const [eloUsers, setEloUsers] = useState<User[]>([]);
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    // Timer
    const updateTimer = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setHours(24, 0, 0, 0); 
        const diff = tomorrow.getTime() - now.getTime();
        
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    const interval = setInterval(updateTimer, 1000);
    updateTimer(); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const usersStr = localStorage.getItem('flagtoon_users');
    if (usersStr) {
        setEloUsers(JSON.parse(usersStr));
    } else {
        setEloUsers([user]);
    }
  }, [user]);

  const handleRowClick = (u: User) => {
      if (onViewProfile) onViewProfile(u);
  }

  const renderRanking = () => {
    let listData: React.ReactNode[] = [];

    if (rankingTab === 'DAILY') {
        // Sort by Daily Time
        const played = eloUsers.filter(u => u.dailyEloTime !== undefined);
        const notPlayed = eloUsers.filter(u => u.dailyEloTime === undefined);
        const myEntry = notPlayed.find(u => u.username === user.username);
        
        played.sort((a, b) => a.dailyEloTime! - b.dailyEloTime!);
        const list = myEntry ? [...played, myEntry] : [...played];

        listData = list.length === 0 ? [<p className="text-center p-4 text-gray-500">Nadie ha jugado hoy aún.</p>] : list.map((u, index) => {
             const isMe = u.username === user.username;
             const hasPlayed = u.dailyEloTime !== undefined;
             const rank = hasPlayed ? index + 1 : '-';
             const points = hasPlayed && index < 25 ? (25 - index) : (hasPlayed ? 1 : 0); 
             
             return (
                <div 
                    key={index} 
                    onClick={() => handleRowClick(u)}
                    className={`flex items-center p-3 border-b-2 border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-100 transition-colors ${isMe ? 'bg-purple-50' : ''} ${!hasPlayed ? 'opacity-50' : ''}`}
                >
                     <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-black w-6 text-center text-gray-400">{rank}</span>
                        <Avatar code={u.avatarCode} frameId={u.currentFrame} size="sm" />
                        <span className="font-bold truncate text-gray-700">{u.username}</span>
                     </div>
                     <div className="text-right">
                        {hasPlayed ? (
                            <div className="flex flex-col items-end">
                                <span className="font-mono font-bold text-gray-800">{(u.dailyEloTime! / 1000).toFixed(3)}s</span>
                                <span className="text-[10px] font-black text-green-600">+{points} pts</span>
                            </div>
                        ) : (
                            <span className="text-[10px] text-gray-400 italic">Pendiente</span>
                        )}
                     </div>
                </div>
             );
         });
    } else {
        // SEASON (Monthly)
        const active = eloUsers.filter(u => (u.seasonEloPoints || 0) > 0);
        active.sort((a, b) => (b.seasonEloPoints || 0) - (a.seasonEloPoints || 0));

        listData = active.length === 0 ? [<p className="text-center p-4 text-gray-500">Aún no hay puntos esta temporada.</p>] : active.map((u, index) => {
             const isMe = u.username === user.username;
             return (
                <div 
                    key={index}
                    onClick={() => handleRowClick(u)} 
                    className={`flex items-center p-3 border-b-2 border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-100 transition-colors ${isMe ? 'bg-purple-50' : ''}`}
                >
                     <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className={`font-black w-6 text-center ${index < 3 ? 'text-purple-600 text-lg' : 'text-gray-400'}`}>{index + 1}</span>
                        <Avatar code={u.avatarCode} frameId={u.currentFrame} size="sm" />
                        <span className="font-bold truncate text-gray-700">{u.username}</span>
                     </div>
                     <div className="font-black text-xl text-purple-600">
                         {u.seasonEloPoints} <span className="text-[10px] text-gray-500 font-bold uppercase">pts</span>
                     </div>
                </div>
             );
         });
    }

    return (
        <div className="flex flex-col items-center w-full max-w-md h-full">
            <div className="w-full flex items-center justify-between mb-4">
                <button onClick={() => setView('MAIN')} className="p-2 border-2 border-black rounded-full bg-white hover:bg-gray-100 text-black">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-black text-black">Ranking ELO</h2>
                <div className="w-10"></div>
            </div>

            <div className="flex gap-1 mb-0 w-full shrink-0">
                <button 
                    onClick={() => setRankingTab('DAILY')} 
                    className={`flex-1 py-2 font-black border-4 border-black rounded-t-xl transition-all ${rankingTab === 'DAILY' ? 'bg-white border-b-0 translate-y-1 z-10' : 'bg-gray-300 text-gray-500 hover:bg-gray-200'}`}
                >
                    DIARIO (Tiempos)
                </button>
                <button 
                    onClick={() => setRankingTab('SEASON')} 
                    className={`flex-1 py-2 font-black border-4 border-black rounded-t-xl transition-all ${rankingTab === 'SEASON' ? 'bg-white border-b-0 translate-y-1 z-10' : 'bg-gray-300 text-gray-500 hover:bg-gray-200'}`}
                >
                    TEMPORADA (Puntos)
                </button>
            </div>

            <div className="flex-1 w-full overflow-y-auto scrollbar-hide bg-white border-4 border-black rounded-b-xl rounded-tr-xl overflow-hidden mb-4 relative z-0 -mt-1 pb-20">
                {listData}
            </div>
        </div>
    );
  };

  const renderInfo = () => (
    <div className="flex flex-col items-center w-full max-w-md h-full overflow-y-auto scrollbar-hide pb-2">
         <div className="w-full flex items-center justify-between mb-4 shrink-0">
             <button onClick={() => setView('MAIN')} className="p-2 border-2 border-black rounded-full bg-white hover:bg-gray-100 text-black">
                <ArrowLeft size={24} />
            </button>
            <h2 className="text-xl font-black text-black">Cómo funciona</h2>
            <div className="w-10"></div>
         </div>
         
         <div className="bg-white border-2 border-black rounded-xl p-4 w-full text-sm text-gray-600 mb-4 pb-20">
            <ul className="list-disc pl-4 space-y-2 font-semibold text-black">
                <li><strong className="text-black">Diario:</strong> Juega cada día para marcar tu mejor tiempo en 10 banderas.</li>
                <li><strong className="text-black">Puntos:</strong> A las 00:00 se reparten puntos según tu posición en la tabla diaria (1º=25pts... 25º=1pt).</li>
                <li><strong className="text-black">Temporada:</strong> Acumula puntos durante todo el mes (la Temporada Elo es Mensual).</li>
                <li><strong className="text-black">Premio:</strong> Al cambiar de mes se reinicia todo y consigues una insignia permanente con tu Ranking de Temporada final.</li>
            </ul>
        </div>
    </div>
  );

  const renderMain = () => (
    <div className="flex flex-col items-center w-full max-w-md h-full overflow-y-auto scrollbar-hide pb-2">
         <div className="w-full flex items-center justify-between mb-4 shrink-0">
             <button onClick={onBack} className="p-2 border-2 border-black rounded-full bg-white hover:bg-gray-100 text-black">
                <ArrowLeft size={24} />
            </button>
            <h2 className="text-3xl font-black text-black cartoon-text-shadow stroke-white">ELO</h2>
            <div className="w-10"></div>
         </div>

         <div className="w-full bg-black text-white p-2 rounded-xl mb-4 flex justify-between items-center px-4 shadow-md shrink-0">
            <span className="text-sm font-bold text-purple-400">RESET DIARIO:</span>
            <div className="flex items-center gap-2 font-mono font-bold text-lg">
                <Clock size={18} /> {timeLeft}
            </div>
        </div>

        <div className="border-4 border-black rounded-3xl p-6 w-full cartoon-shadow-lg flex flex-col items-center text-center gap-4 relative overflow-hidden bg-white shrink-0 mb-4">
             <div className="absolute inset-0 opacity-10 bg-purple-100 pointer-events-none"></div>
             
             <Swords size={64} className="text-purple-600" />
             <h2 className="text-3xl font-black text-purple-600 cartoon-text-shadow">Competitivo ELO</h2>
             
             <div className="bg-purple-50 rounded-xl p-3 border-2 border-purple-200 w-full">
                 <div className="text-xs text-gray-500 font-bold uppercase mb-1">Puntos de Temporada (Mes)</div>
                 <div className="text-4xl font-black text-gray-800">{user.seasonEloPoints || 0}</div>
             </div>

             <div className="w-full mt-2 space-y-3">
                <Button onClick={onPlay} variant="primary" className="w-full flex justify-center items-center gap-2 bg-purple-500 hover:bg-purple-400 border-purple-800 text-white animate-pulse">
                    <Play size={24} fill="white" className="text-black" /> Jugar (10 Banderas)
                </Button>
                
                <Button onClick={() => setView('RANKING')} variant="secondary" className="w-full flex justify-center items-center gap-2">
                    <List size={22} /> Ver Ranking
                </Button>

                <Button onClick={() => setView('INFO')} variant="secondary" className="w-full flex justify-center items-center gap-2 text-base">
                    <Info size={20} /> Información
                </Button>
             </div>
        </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col overflow-hidden animate-fade-in px-4 py-2">
      <div className="flex-1 w-full max-w-md mx-auto pb-4 overflow-hidden flex flex-col">
        {view === 'MAIN' && renderMain()}
        {view === 'RANKING' && renderRanking()}
        {view === 'INFO' && renderInfo()}
      </div>
    </div>
  );
};

export default Elo;
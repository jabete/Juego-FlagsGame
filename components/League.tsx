import React, { useEffect, useState } from 'react';
import Button from './Button';
import { Shield, Play, Trophy, Info, List, ArrowLeft, Clock, XCircle, Skull } from 'lucide-react';
import { User, getTierName } from '../types';
import Avatar from './Avatar';

interface LeagueProps {
  user: User;
  onPlayLeague: () => void;
  onBack: () => void;
  onViewProfile?: (user: User) => void;
}

type LeagueView = 'MAIN' | 'STANDINGS' | 'INFO';

const League: React.FC<LeagueProps> = ({ user, onPlayLeague, onBack, onViewProfile }) => {
  const [view, setView] = useState<LeagueView>('MAIN');
  const currentTier = getTierName(user.leagueTier || 0);
  const [leagueUsers, setLeagueUsers] = useState<User[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  
  // Timer state
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    // Determine Current Week Day
    // NEW SCHEDULE: Tuesday = Day 1
    // JS: 2(Tue) -> 1
    //     3(Wed) -> 2
    //     4(Thu) -> 3
    //     5(Fri) -> 4
    //     6(Sat) -> 5
    //     0(Sun) -> 6
    //     1(Mon) -> 7
    
    const now = new Date();
    const jsDay = now.getDay(); // Sun=0, Mon=1... Fri=5
    
    let day = jsDay >= 2 ? jsDay - 1 : jsDay + 6;
    setCurrentDay(day);

    // Update Timer every second
    const updateTimer = () => {
        const nowT = new Date();
        const tomorrow = new Date(nowT);
        tomorrow.setHours(24, 0, 0, 0); // Next midnight
        const diff = tomorrow.getTime() - nowT.getTime();
        
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        
        setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    
    const interval = setInterval(updateTimer, 1000);
    updateTimer(); // Initial call
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Fetch users and sort by DAILY LEAGUE TIME
    const usersStr = localStorage.getItem('flagtoon_users');
    if (usersStr) {
        let users: User[] = JSON.parse(usersStr);
        
        const eliminated = users.filter(u => u.isEliminated);
        const survivors = users.filter(u => !u.isEliminated);

        const played = survivors.filter(u => u.dailyLeagueTime !== undefined);
        const notPlayed = survivors.filter(u => u.dailyLeagueTime === undefined);

        played.sort((a, b) => (a.dailyLeagueTime!) - (b.dailyLeagueTime!));

        // SHOW ALL PLAYERS who haven't played yet, not just the current user
        // This ensures on Day 2+ we see who is "alive" but hasn't run yet.
        setLeagueUsers([...played, ...notPlayed, ...eliminated]);
    } else {
        setLeagueUsers([user]);
    }
  }, [user]);

  // Logic to determine CUTOFF line based on day
  // Schedule: 
  // Day 1 (Tue): No elimination
  // Day 2 (Wed): 30% out
  // Day 3 (Thu): 40% out
  // Day 4 (Fri): 50% out
  // Day 5-7 (Sat-Mon): 60% out
  
  const getEliminationPercentage = (day: number) => {
    if (day === 1) return 0.3; 
    if (day === 2) return 0.4;
    if (day === 3) return 0.5;
    if (day >= 4) return 0.6;
    return 0.3;
  };

  const currentEliminationRate = getEliminationPercentage(currentDay);

  const getCutoffIndex = () => {
      const survivors = leagueUsers.filter(u => !u.isEliminated).length;
      if (survivors === 0) return 0;
      return Math.ceil(survivors * (1 - currentEliminationRate)); 
  };
  const cutoffIndex = getCutoffIndex();

  const handleRowClick = (u: User) => {
      if (onViewProfile) onViewProfile(u);
  }

  const renderStandings = () => {
    return (
        <div className="flex flex-col items-center w-full max-w-md h-full">
            <div className="w-full flex items-center justify-between mb-4">
                <button onClick={() => setView('MAIN')} className="p-2 border-2 border-black rounded-full bg-white hover:bg-gray-100 text-black">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex flex-col items-center">
                    <h2 className="text-xl font-black text-black leading-none">Clasificación</h2>
                    <span className="text-xs font-bold text-gray-500">Día {currentDay} de 7</span>
                </div>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 w-full overflow-y-auto scrollbar-hide bg-white border-4 border-black rounded-2xl overflow-hidden mb-4 relative pb-20">
                {leagueUsers.length === 0 && <p className="text-center p-4 text-gray-500">Nadie ha jugado hoy aún.</p>}
                
                {leagueUsers.map((u, index) => {
                    const hasPlayed = u.dailyLeagueTime !== undefined;
                    const isMe = u.username === user.username;
                    const isEliminated = u.isEliminated;

                    const showCutoffLine = !isEliminated && index === cutoffIndex - 1 && currentDay < 7;

                    return (
                        <React.Fragment key={index}>
                            <div 
                                onClick={() => handleRowClick(u)}
                                className={`flex items-center p-3 border-b-2 border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-100 transition-colors ${isMe ? 'bg-yellow-50' : ''} ${isEliminated ? 'bg-red-50 opacity-60 grayscale' : ''}`}
                            >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className={`font-black w-6 text-center ${!isEliminated && index < 3 && hasPlayed ? 'text-yellow-600 text-lg' : 'text-gray-400'}`}>
                                        {isEliminated ? 'X' : index + 1}
                                    </span>
                                    <Avatar code={u.avatarCode} frameId={u.currentFrame} size="sm" />
                                    <span className={`font-bold leading-tight truncate ${isMe ? 'text-black' : 'text-gray-700'}`}>
                                        {u.username}
                                    </span>
                                </div>
                                
                                <div className="flex justify-center w-24 shrink-0 px-2">
                                    {isEliminated ? (
                                        <span className="text-[10px] font-black bg-red-200 text-red-800 px-2 py-0.5 rounded">ELIMINADO</span>
                                    ) : hasPlayed ? (
                                        <div className={`text-[10px] font-black px-2 py-1 rounded border border-black/10 ${index < cutoffIndex ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} uppercase tracking-tight text-center w-full`}>
                                            {currentDay === 7 ? (index === 0 ? 'GANADOR' : 'FINALISTA') : (index < cutoffIndex ? 'PASA' : 'ELIMINADO')}
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-black bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded border border-yellow-300 w-full text-center">PENDIENTE</span>
                                    )}
                                </div>

                                <div className="flex justify-end w-20 shrink-0 text-right">
                                    {hasPlayed ? (
                                        <span className="font-mono font-bold text-gray-800">
                                            {(u.dailyLeagueTime! / 1000).toFixed(3)}s
                                        </span>
                                    ) : (
                                        <span className="text-[10px] text-gray-400 italic">--</span>
                                    )}
                                </div>
                            </div>
                            {showCutoffLine && (
                                <div className="w-full h-1 bg-red-500 relative flex items-center justify-center my-0 pointer-events-none">
                                    <span className="bg-red-500 text-white text-[8px] font-black px-2 rounded-full absolute shadow-md z-10">LÍNEA DE CORTE ({Math.round(currentEliminationRate * 100)}% ELIMINADO)</span>
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
  };

  const renderInfo = () => (
    <div className="flex flex-col items-center w-full max-w-md h-full overflow-hidden">
        <div className="w-full flex items-center justify-between mb-4 shrink-0">
            <button onClick={() => setView('MAIN')} className="p-2 border-2 border-black rounded-full bg-white hover:bg-gray-100 text-black">
                <ArrowLeft size={24} />
            </button>
            <h2 className="text-xl font-black text-black">Reglas de Liga</h2>
            <div className="w-10"></div>
        </div>

        <div className="flex-1 w-full overflow-y-auto scrollbar-hide pb-20 relative space-y-4">
             <div className="bg-white border-4 border-black rounded-xl p-4 cartoon-shadow-lg">
                 <h3 className="font-black text-lg mb-2 text-black">📅 La Purga Semanal (Martes)</h3>
                 <p className="text-sm text-black font-bold mb-2">
                    La liga comienza cada Martes. La dificultad aumenta cada día.
                 </p>
                 <ul className="text-xs space-y-2 pl-2 text-gray-600 font-semibold">
                    <li className="flex justify-between border-b border-gray-100 pb-1">
                        <span>Martes (Día 1)</span>
                        <span className="font-black text-green-600">30% Eliminado</span>
                    </li>
                    <li className="flex justify-between border-b border-gray-100 pb-1">
                        <span>Miércoles (Día 2)</span>
                        <span className="font-black text-yellow-600">40% Eliminado</span>
                    </li>
                    <li className="flex justify-between border-b border-gray-100 pb-1">
                        <span>Jueves (Día 3)</span>
                        <span className="font-black text-orange-500">50% Eliminado</span>
                    </li>
                    <li className="flex justify-between border-b border-gray-100 pb-1">
                        <span>Vie-Dom (Días 4-6)</span>
                        <span className="font-black text-red-600">60% Eliminado</span>
                    </li>
                    <li className="flex justify-between pt-1">
                        <span className="font-bold text-purple-600">Lunes (Final)</span>
                        <span className="font-black text-purple-600">¡Sólo 1 Ganador!</span>
                    </li>
                 </ul>
             </div>

             <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-3 text-xs font-bold text-yellow-800">
                 ¡Si eres eliminado o no participas en el Día 1 (Martes), no podrás jugar hasta la próxima semana!
             </div>
        </div>
    </div>
  );

  const renderMain = () => (
    <div className="flex flex-col items-center w-full max-w-md h-full">
         <div className="w-full flex items-center justify-between mb-4 shrink-0">
             <button onClick={onBack} className="p-2 border-2 border-black rounded-full bg-white hover:bg-gray-100 text-black">
                <ArrowLeft size={24} />
            </button>
            <h2 className="text-3xl font-black text-black cartoon-text-shadow stroke-white">Liga</h2>
            <div className="w-10"></div>
         </div>

         <div className="w-full bg-black text-white p-2 rounded-xl mb-2 flex justify-between items-center px-4 shadow-md">
            <span className="text-sm font-bold text-yellow-400">DÍA {currentDay} DE 7</span>
            <div className="flex items-center gap-2 font-mono font-bold text-lg">
                <Clock size={18} /> {timeLeft}
            </div>
        </div>

        {user.isEliminated ? (
             <div className="bg-red-500 border-4 border-black rounded-3xl p-6 w-full cartoon-shadow-lg flex flex-col items-center text-center gap-4 text-white">
                <Skull size={80} />
                <h2 className="text-3xl font-black cartoon-text-shadow">¡ELIMINADO!</h2>
                <p className="font-bold">No registraste tiempo el Día 1 o no superaste el corte. Vuelve el próximo Martes.</p>
                <Button onClick={() => setView('STANDINGS')} variant="secondary" className="mt-4">
                    Ver Resultados
                </Button>
             </div>
        ) : (
            <div className={`border-4 border-black rounded-3xl p-6 w-full cartoon-shadow-lg flex flex-col items-center text-center gap-4 relative overflow-hidden bg-white shrink-0`}>
                <div className={`absolute inset-0 opacity-10 ${currentTier.bg} pointer-events-none`}></div>
                
                <h2 className="text-2xl font-black text-black z-10">Tu División Actual</h2>
                
                <div className="relative z-10">
                    <Shield size={100} className={`${currentTier.color} fill-current opacity-20 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-150 blur-sm`} />
                    <Shield size={80} className={`${currentTier.color} fill-white stroke-[2px]`} />
                </div>

                <div className="z-10">
                    <h3 className={`text-3xl font-black ${currentTier.color} tracking-wider cartoon-text-shadow`}>
                        {currentTier.name}
                    </h3>
                </div>

                <div className="w-full mt-2 space-y-3">
                    <Button onClick={onPlayLeague} variant="success" className="w-full flex justify-center items-center gap-2 animate-pulse">
                        <Play size={24} fill="white" className="text-black"/> Jugar Jornada
                    </Button>
                    
                    <Button onClick={() => setView('STANDINGS')} variant="primary" className="w-full flex justify-center items-center gap-2">
                        <List size={22} /> Clasificación
                    </Button>

                    <Button onClick={() => setView('INFO')} variant="secondary" className="w-full flex justify-center items-center gap-2 text-base">
                        <Info size={20} /> Reglas
                    </Button>
                </div>
            </div>
        )}
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col overflow-hidden animate-fade-in px-4 py-2">
      <div className="flex-1 w-full max-w-md mx-auto pb-4 overflow-hidden flex flex-col">
        {view === 'MAIN' && renderMain()}
        {view === 'STANDINGS' && renderStandings()}
        {view === 'INFO' && renderInfo()}
      </div>
    </div>
  );
};

export default League;
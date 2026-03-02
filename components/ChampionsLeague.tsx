import React, { useEffect, useState } from 'react';
import Button from './Button';
import { Play, ArrowLeft, Clock, Star, Trophy, Users, GitMerge, Layout, Lock } from 'lucide-react';
import { User } from '../types';

interface ChampionsLeagueProps {
  user: User;
  onPlay: () => void;
  onBack: () => void;
}

type ChampionsView = 'MENU' | 'GROUPS' | 'BRACKET';

const ChampionsLeague: React.FC<ChampionsLeagueProps> = ({ user, onPlay, onBack }) => {
  const [view, setView] = useState<ChampionsView>('MENU');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeGroup, setActiveGroup] = useState<string>('A');
  const [timeLeft, setTimeLeft] = useState("");
  const [currentDayName, setCurrentDayName] = useState("");
  const [tournamentDay, setTournamentDay] = useState<number>(0);
  const [isLockedOut, setIsLockedOut] = useState(false);

  useEffect(() => {
    // Load users (Always reload from storage to ensure we have latest times)
    const usersStr = localStorage.getItem('flagtoon_users');
    if (usersStr) setAllUsers(JSON.parse(usersStr));

    // Determine Day & Phase
    const now = new Date();
    const jsDay = now.getDay(); // 0=Sun... 5=Fri
    
    // New Schedule: 
    // Mon (1) -> Registration
    // Tue (2) -> Groups
    // Wed (3) -> R32
    // Thu (4) -> R16
    // Fri (5) -> QF
    // Sat (6) -> SF
    // Sun (0) -> FINAL

    setTournamentDay(jsDay);

    if (jsDay === 1) setCurrentDayName("INSCRIPCIÓN");
    else if (jsDay === 2) setCurrentDayName("FASE DE GRUPOS");
    else if (jsDay === 3) setCurrentDayName("DIECISEISAVOS");
    else if (jsDay === 4) setCurrentDayName("OCTAVOS DE FINAL");
    else if (jsDay === 5) setCurrentDayName("CUARTOS DE FINAL");
    else if (jsDay === 6) setCurrentDayName("SEMIFINALES");
    else if (jsDay === 0) setCurrentDayName("GRAN FINAL");

    // Check Lockout Status
    // If it is NOT Mon AND user has no group/opponent => Locked Out
    if (jsDay !== 1 && !user.championsGroup && !user.championsOpponent) {
        setIsLockedOut(true);
    } else {
        setIsLockedOut(false);
    }

    // Default active group to user's group or A
    if (user.championsGroup) setActiveGroup(user.championsGroup);

    // Timer
    const updateTimer = () => {
        const nowT = new Date();
        const tomorrow = new Date(nowT);
        tomorrow.setHours(24, 0, 0, 0); 
        const diff = tomorrow.getTime() - nowT.getTime();
        
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    const interval = setInterval(updateTimer, 1000);
    updateTimer(); 
    return () => clearInterval(interval);
  }, [user]);

  // Map internal A-H to 1-8 for display
  const getGroupLabel = (groupChar: string) => {
      const map: Record<string, string> = {
          'A': '1', 'B': '2', 'C': '3', 'D': '4',
          'E': '5', 'F': '6', 'G': '7', 'H': '8'
      };
      return map[groupChar] || groupChar;
  };

  const renderGroups = () => {
    const groupUsers = allUsers.filter(u => u.championsGroup === activeGroup);
    // Sort logic
    groupUsers.sort((a, b) => {
        if (a.dailyChampionsTime === undefined && b.dailyChampionsTime === undefined) return 0;
        if (a.dailyChampionsTime === undefined) return 1;
        if (b.dailyChampionsTime === undefined) return -1;
        return a.dailyChampionsTime! - b.dailyChampionsTime!;
    });

    return (
        <div className="flex flex-col w-full h-full overflow-hidden">
             <div className="w-full flex items-center justify-center mb-4 shrink-0 relative">
                <div className="flex flex-col items-center">
                    <h2 className="text-xl font-black text-black flex items-center justify-center gap-2">
                         <Users size={20} className="text-blue-600"/> Fase de Grupos
                    </h2>
                    <p className="text-xs text-gray-500 font-bold">Top 4 clasifican</p>
                </div>
            </div>

            {/* Group Grid Selection - Updated to be compact */}
            <div className="grid grid-cols-4 gap-2 w-full shrink-0 mb-4">
                {['A','B','C','D','E','F','G','H'].map(g => (
                    <button
                        key={g}
                        onClick={() => setActiveGroup(g)}
                        className={`w-full h-12 rounded-xl font-black border-2 border-black flex flex-col items-center justify-center transition-all shadow-sm ${
                            activeGroup === g ? 'bg-blue-600 text-white scale-105 shadow-md ring-2 ring-yellow-400 z-10' : 'bg-white text-black hover:bg-gray-50'
                        } ${user.championsGroup === g && activeGroup !== g ? 'ring-2 ring-blue-300 bg-blue-50' : ''}`}
                    >
                        <div className="flex items-baseline gap-1">
                            <span className="text-[8px] uppercase leading-none opacity-80">GRUPO</span>
                            <span className="text-lg leading-none">{getGroupLabel(g)}</span>
                        </div>
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="flex-1 w-full overflow-y-auto scrollbar-hide bg-white border-4 border-black rounded-xl p-0 relative mb-20">
                {groupUsers.length === 0 ? <div className="text-center p-4 text-gray-400 font-bold mt-4">Grupo vacío</div> : groupUsers.map((u, index) => {
                    const isMe = u.username === user.username;
                    // Note: This displays current stored time.
                    const time = u.dailyChampionsTime ? (u.dailyChampionsTime / 1000).toFixed(3) + 's' : '--';
                    
                    return (
                        <div key={u.username} className="relative">
                            <div className={`flex items-center p-3 border-b-2 border-gray-100 ${isMe ? 'bg-yellow-50' : ''}`}>
                                <span className={`font-black w-8 text-center text-lg ${index < 4 ? 'text-blue-600' : 'text-gray-400'}`}>{index + 1}</span>
                                <img src={`https://flagcdn.com/w40/${u.avatarCode}.png`} className="w-8 h-8 rounded border border-black mx-3 shrink-0" alt="flag"/>
                                <span className={`flex-1 font-bold truncate text-lg ${isMe ? 'text-black' : 'text-gray-600'}`}>{u.username}</span>
                                <span className="font-mono font-bold text-lg text-black">{time}</span>
                            </div>
                            {index === 3 && (
                                <div className="w-full h-1 bg-green-500 relative flex items-center justify-center my-0 pointer-events-none z-10">
                                    <span className="absolute bg-green-500 text-white text-[10px] px-3 rounded-full font-black shadow-sm tracking-wider uppercase">Línea de Clasificación</span>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );
  };

  const renderBracket = () => {
    // Determine which matches to show.
    // We show matches where users have a valid opponent.
    
    let matches: {u1: User, u2?: User}[] = [];
    const processed = new Set<string>();
    
    // Filter active players in tournament (not eliminated or eliminated this round)
    // To simplify: show everyone who has an opponent assigned.
    const activePlayers = allUsers.filter(u => u.championsOpponent);
    
    activePlayers.forEach(u => {
        if (processed.has(u.username)) return;
        
        const oppName = u.championsOpponent;
        const opp = allUsers.find(au => au.username === oppName);
        
        processed.add(u.username);
        if (opp) processed.add(opp.username);
        
        matches.push({ u1: u, u2: opp });
    });

    return (
        <div className="flex flex-col gap-4 w-full h-full pb-20 overflow-y-auto scrollbar-hide">
             <div className="bg-white p-2 rounded-xl border-2 border-black text-center shadow-sm">
                 <h3 className="font-black text-black flex items-center justify-center gap-2">
                    <GitMerge size={20} className="text-red-600"/> Cuadro del Torneo
                 </h3>
                 <p className="text-xs text-black">Enfrentamientos de la ronda actual.</p>
            </div>

            {(tournamentDay === 5 || tournamentDay === 6) ? (
                <div className="flex flex-col items-center justify-center h-40 text-center opacity-50">
                    <Clock size={40} className="mb-2 text-black"/>
                    <p className="font-bold text-black">El cuadro se genera al finalizar la Fase de Grupos (Sábado).</p>
                </div>
            ) : matches.length === 0 ? (
                <div className="text-center p-4 text-gray-500 font-bold">
                    No hay enfrentamientos activos.
                </div>
            ) : (
                <div className="bg-white border-4 border-black rounded-xl p-2 space-y-2">
                    {matches.map((m, i) => {
                        const isMyMatch = m.u1.username === user.username || m.u2?.username === user.username;
                        return (
                            <div key={i} className={`flex justify-between items-center text-xs border-b-2 border-gray-100 pb-2 mb-2 last:mb-0 last:border-0 p-2 rounded ${isMyMatch ? 'bg-yellow-50 border-yellow-200' : ''}`}>
                                <div className="flex flex-col items-center w-[40%]">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                         <img src={`https://flagcdn.com/w20/${m.u1.avatarCode}.png`} className="w-4 h-3 object-cover rounded shadow-sm" alt="flag"/>
                                         <span className="font-bold truncate max-w-[80px] text-black">{m.u1.username}</span>
                                    </div>
                                    {m.u1.dailyChampionsTime && <span className="text-[10px] font-mono bg-gray-100 px-1 rounded text-black border border-gray-300">{(m.u1.dailyChampionsTime/1000).toFixed(3)}s</span>}
                                </div>
                                
                                <span className="font-black px-1 text-red-500 text-lg">VS</span>
                                
                                <div className="flex flex-col items-center w-[40%]">
                                    <div className="flex items-center justify-center gap-1 mb-1">
                                         {m.u2 && <img src={`https://flagcdn.com/w20/${m.u2.avatarCode}.png`} className="w-4 h-3 object-cover rounded shadow-sm" alt="flag"/>}
                                         <span className="font-bold truncate max-w-[80px] text-black">{m.u2 ? m.u2.username : 'BYE'}</span>
                                    </div>
                                    {m.u2 && m.u2.dailyChampionsTime && <span className="text-[10px] font-mono bg-gray-100 px-1 rounded text-black border border-gray-300">{(m.u2.dailyChampionsTime/1000).toFixed(3)}s</span>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
  };

  const renderMenu = () => {
    // Can Play: Not eliminated, not a winner, and phase is valid, AND NOT LOCKED OUT
    const canPlay = !user.isChampionsEliminated && user.championsRound !== 'WINNER' && !isLockedOut;
    const hasPlayedToday = !!user.dailyChampionsTime;

    return (
        <div className="flex flex-col items-center w-full h-full pb-20 overflow-y-auto scrollbar-hide">
            
            {/* Header Banner - Added padding bottom to prevent cut off */}
            <div className="w-full bg-blue-900 text-white pt-4 pb-6 px-4 rounded-xl mb-4 border-4 border-black cartoon-shadow relative overflow-hidden text-center">
                 <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle,rgba(255,255,255,0.1)_10%,transparent_10%)] bg-[length:20px_20px]"></div>
                 <h3 className="text-2xl font-black text-yellow-400 cartoon-text-shadow relative z-10 leading-tight">{currentDayName}</h3>
                 <div className="flex items-center justify-center gap-2 mt-2 relative z-10">
                    <Clock size={16} className="text-white"/>
                    <span className="font-mono font-bold text-lg">{timeLeft}</span>
                 </div>
            </div>

            {/* Status Card */}
            <div className="bg-white border-4 border-black rounded-xl p-4 w-full mb-6 cartoon-shadow flex flex-col items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Tu Estado</span>
                {isLockedOut ? (
                     <div className="text-gray-500 font-black text-xl flex items-center gap-2"><Lock/> NO PARTICIPA</div>
                ) : user.isChampionsEliminated ? (
                    <div className="text-red-500 font-black text-xl flex items-center gap-2"><GitMerge className="rotate-180"/> ELIMINADO</div>
                ) : user.championsRound === 'WINNER' ? (
                    <div className="text-yellow-500 font-black text-xl flex items-center gap-2"><Trophy/> CAMPEÓN</div>
                ) : hasPlayedToday ? (
                     <div className="flex flex-col items-center">
                        <div className="text-green-600 font-black text-xl flex items-center gap-2"><Clock/> {(user.dailyChampionsTime!/1000).toFixed(3)}s</div>
                        <span className="text-[10px] text-gray-400 font-bold">Tiempo registrado</span>
                     </div>
                ) : (
                    <div className="text-blue-600 font-black text-xl flex items-center gap-2"><Play/> PENDIENTE DE JUGAR</div>
                )}
                
                {isLockedOut && (
                    <p className="text-xs text-center text-red-500 font-bold mt-2">
                        No te inscribiste el Lunes. Podrás unirte en el próximo reinicio.
                    </p>
                )}
            </div>

            {/* 3 Buttons Menu */}
            <div className="w-full space-y-4">
                
                <Button 
                    onClick={onPlay} 
                    disabled={!canPlay}
                    className={`w-full flex justify-between items-center py-4 relative group overflow-hidden ${!canPlay ? 'opacity-50 grayscale' : ''}`}
                >
                    <div className="flex items-center gap-3 z-10">
                        <div className="bg-black/10 p-2 rounded-lg"><Play size={24} className="text-black"/></div>
                        <div className="flex flex-col items-start">
                            <span className="text-xl font-black uppercase text-black">{hasPlayedToday ? "Mejorar Tiempo" : "Jugar"}</span>
                            <span className="text-xs opacity-80 font-bold text-black">10 Banderas • Intentos Ilimitados</span>
                        </div>
                    </div>
                </Button>

                <Button 
                    onClick={() => setView('GROUPS')} 
                    variant="secondary"
                    className="w-full flex justify-between items-center py-4 relative group overflow-hidden"
                >
                    <div className="flex items-center gap-3 z-10">
                        <div className="bg-gray-100 p-2 rounded-lg"><Users size={24} className="text-black"/></div>
                        <div className="flex flex-col items-start">
                            <span className="text-xl font-black uppercase text-black">Modo Grupos</span>
                            <span className="text-xs text-gray-500 font-bold text-black">Ver tablas de clasificación</span>
                        </div>
                    </div>
                </Button>

                <Button 
                    onClick={() => setView('BRACKET')} 
                    variant="secondary"
                    className="w-full flex justify-between items-center py-4 relative group overflow-hidden"
                >
                    <div className="flex items-center gap-3 z-10">
                        <div className="bg-gray-100 p-2 rounded-lg"><GitMerge size={24} className="text-black"/></div>
                        <div className="flex flex-col items-start">
                            <span className="text-xl font-black uppercase text-black">Cuadro Final</span>
                            <span className="text-xs text-gray-500 font-bold text-black">Ver eliminatorias</span>
                        </div>
                    </div>
                </Button>

            </div>
        </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden animate-fade-in px-4 py-2">
        <div className="w-full flex items-center justify-between mb-4 shrink-0">
             <button onClick={view === 'MENU' ? onBack : () => setView('MENU')} className="p-2 border-2 border-black rounded-full bg-white hover:bg-gray-100 text-black">
                <ArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-black text-black cartoon-text-shadow stroke-white">Champions</h2>
            <div className="w-10"></div>
         </div>

         {view === 'MENU' && renderMenu()}
         {view === 'GROUPS' && renderGroups()}
         {view === 'BRACKET' && renderBracket()}

    </div>
  );
};

export default ChampionsLeague;
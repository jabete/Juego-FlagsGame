import React from 'react';
import { Score, User } from '../types';
import Button from './Button';
import { Trophy, Clock, RefreshCw, Menu, Crown, Globe, Zap, Calendar } from 'lucide-react';

interface GameReportProps {
  score: Score;
  comparison: {
    wr: number; // Previous World Record
    nr: number; // Previous National Record
    pb: number; // Previous Personal Best
    sb: number; // Previous Season Best
    rank: number;
    totalPlayers: number;
  };
  onReplay: () => void;
  onMenu: () => void;
}

const GameReport: React.FC<GameReportProps> = ({ score, comparison, onReplay, onMenu }) => {
  const formatTime = (ms: number) => (ms / 1000).toFixed(3) + 's';
  
  const getComparisonDisplay = (current: number, target: number) => {
    // If no previous record existed (Infinity or 0), it's a new record.
    if (target === 0 || target === Infinity) {
        return { 
            oldText: "N/A", 
            diffText: "¡Nuevo Récord!", 
            diffColor: "text-green-600 bg-green-100 px-2 rounded" 
        };
    }

    const diff = current - target;
    const isImproved = diff < 0; // Negative diff means faster time
    const symbol = diff > 0 ? "+" : "";
    const diffColor = isImproved ? "text-green-600" : "text-red-500";
    
    return {
        oldText: formatTime(target),
        diffText: `${symbol}${(diff / 1000).toFixed(3)}s`,
        diffColor: diffColor
    };
  };

  // Ensure rank is at least 1 and handle potential missing data
  const safeRank = comparison.rank > 0 ? comparison.rank : 1;
  const totalPlayers = comparison.totalPlayers > 0 ? comparison.totalPlayers : 1;
  
  const percentile = safeRank > 100 
    ? `Top ${Math.ceil((safeRank / totalPlayers) * 100)}%`
    : `#${safeRank}`;

  return (
    <div className="flex flex-col items-center w-full max-w-md h-full mx-auto px-4 py-6 animate-fade-in overflow-y-auto scrollbar-hide">
      
      {/* HEADER: BIG STATS */}
      <div className="w-full bg-white border-4 border-black rounded-3xl p-6 flex flex-col items-center text-center cartoon-shadow-lg mb-6 relative">
        <div className="absolute inset-0 bg-yellow-50 opacity-50 pointer-events-none rounded-3xl"></div>
        
        <h2 className="text-3xl font-black text-black z-10 mb-6 uppercase tracking-tight cartoon-text-shadow stroke-white">
            ¡Partida Terminada!
        </h2>
        
        <div className="grid grid-cols-2 w-full gap-4 z-10">
            {/* Time Box */}
            <div className="flex flex-col items-center justify-center bg-gray-900 text-white rounded-2xl p-4 border-2 border-black cartoon-shadow transform -rotate-1 hover:rotate-0 transition-transform">
                 <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Clock size={12} /> Tiempo
                 </span>
                 <span className="text-3xl md:text-4xl font-mono font-black text-white leading-none">
                    {formatTime(score.timeMs)}
                 </span>
            </div>

            {/* Rank Box */}
            <div className="flex flex-col items-center justify-center bg-white text-black rounded-2xl p-4 border-2 border-black cartoon-shadow transform rotate-1 hover:rotate-0 transition-transform">
                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                    <Trophy size={12} /> Posición
                 </span>
                 <span className="text-3xl md:text-4xl font-black text-gray-800 leading-none">
                    {percentile}
                 </span>
            </div>
        </div>

        {safeRank > 100 && (
            <span className="text-[10px] text-gray-400 font-bold z-10 mt-3">(De {totalPlayers} jugadores)</span>
        )}
      </div>

      {/* COMPARISON TABLE */}
      <div className="w-full bg-white border-4 border-black rounded-2xl p-4 cartoon-shadow-lg mb-6">
          <h3 className="font-black text-lg text-black mb-3 border-b-2 border-gray-100 pb-2 text-center uppercase tracking-wide">
            Comparativa
          </h3>
          <div className="grid grid-cols-1 gap-2">
            
            {/* WR Row */}
            {(() => {
                const comp = getComparisonDisplay(score.timeMs, comparison.wr);
                return (
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border-2 border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="bg-yellow-100 p-1.5 rounded-lg border border-yellow-300">
                                <Crown size={16} className="text-yellow-600" />
                            </div>
                            <span className="font-bold text-sm text-black">Récord Mundial (WR)</span>
                        </div>
                        <div className="text-right flex flex-col items-end">
                             <div className="font-mono text-xs text-gray-400">{comp.oldText}</div>
                             <div className={`font-mono font-black text-sm ${comp.diffColor}`}>
                                {comp.diffText}
                             </div>
                        </div>
                    </div>
                );
            })()}

            {/* NR Row */}
            {(() => {
                const comp = getComparisonDisplay(score.timeMs, comparison.nr);
                return (
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border-2 border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-100 p-1.5 rounded-lg border border-blue-300">
                                <Globe size={16} className="text-blue-600" />
                            </div>
                            <span className="font-bold text-sm text-black">Récord Nacional (NR)</span>
                        </div>
                        <div className="text-right flex flex-col items-end">
                             <div className="font-mono text-xs text-gray-400">{comp.oldText}</div>
                             <div className={`font-mono font-black text-sm ${comp.diffColor}`}>
                                {comp.diffText}
                             </div>
                        </div>
                    </div>
                );
            })()}

             {/* PB Row */}
             {(() => {
                const comp = getComparisonDisplay(score.timeMs, comparison.pb);
                return (
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border-2 border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="bg-green-100 p-1.5 rounded-lg border border-green-300">
                                <Zap size={16} className="text-green-600" />
                            </div>
                            <span className="font-bold text-sm text-black">Mejor Personal (PB)</span>
                        </div>
                        <div className="text-right flex flex-col items-end">
                             <div className="font-mono text-xs text-gray-400">{comp.oldText}</div>
                             <div className={`font-mono font-black text-sm ${comp.diffColor}`}>
                                {comp.diffText}
                             </div>
                        </div>
                    </div>
                );
            })()}

            {/* SB Row */}
            {(() => {
                const comp = getComparisonDisplay(score.timeMs, comparison.sb);
                return (
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border-2 border-gray-100">
                        <div className="flex items-center gap-2">
                            <div className="bg-purple-100 p-1.5 rounded-lg border border-purple-300">
                                <Calendar size={16} className="text-purple-600" />
                            </div>
                            <span className="font-bold text-sm text-black">Mejor Temporada (SB)</span>
                        </div>
                        <div className="text-right flex flex-col items-end">
                             <div className="font-mono text-xs text-gray-400">{comp.oldText}</div>
                             <div className={`font-mono font-black text-sm ${comp.diffColor}`}>
                                {comp.diffText}
                             </div>
                        </div>
                    </div>
                );
            })()}

          </div>
      </div>

      <div className="w-full space-y-3 mt-auto">
        <Button onClick={onReplay} variant="primary" className="w-full flex justify-center items-center gap-2 text-black" size="lg">
            <RefreshCw size={24} /> Volver a Jugar
        </Button>
        <Button onClick={onMenu} variant="secondary" className="w-full flex justify-center items-center gap-2 text-black">
            <Menu size={20} /> Menú Principal
        </Button>
      </div>

    </div>
  );
};

export default GameReport;
import React, { useState } from 'react';
import Button from './Button';
import { ArrowLeft, Star, Trophy, Swords, Crown, Globe, Medal, Flag, Timer, TrendingUp, Calendar, Users, GitMerge } from 'lucide-react';

interface GuideProps {
  onBack: () => void;
}

type GuideTab = 'LEVEL' | 'LEAGUE' | 'ELO' | 'CHAMPIONS' | 'RECORDS';

const Guide: React.FC<GuideProps> = ({ onBack }) => {
  const [tab, setTab] = useState<GuideTab>('LEVEL');

  const renderLevel = () => (
    <div className="space-y-4 animate-fade-in">
        <div className="bg-yellow-50 p-4 rounded-xl border-2 border-yellow-200">
            <h3 className="font-black text-xl text-yellow-800 mb-2 flex items-center gap-2"><Star size={24}/> Sistema de Niveles</h3>
            <p className="text-sm font-semibold text-black">
                Ganas XP jugando cualquier modo. La experiencia necesaria para subir de nivel aumenta progresivamente.
            </p>
        </div>
        
        <div className="bg-white p-4 rounded-xl border-4 border-black cartoon-shadow">
            <h4 className="font-bold text-lg mb-2 text-black">Fórmula de XP</h4>
            <div className="font-mono bg-gray-100 p-2 rounded text-center text-sm mb-2 text-black">
                XP Necesaria = 100 * (Nivel ^ 1.5)
            </div>
            <p className="text-xs text-black italic text-center">
                Ej: Nivel 10 requiere mucho más esfuerzo que Nivel 2.
            </p>
        </div>

        <div className="bg-white p-4 rounded-xl border-4 border-black cartoon-shadow">
             <h4 className="font-bold text-lg mb-2 text-black">Recompensas</h4>
             <ul className="list-disc pl-4 text-sm font-semibold space-y-1 text-black">
                 <li>Cada partida otorga XP base (10 por bandera).</li>
                 <li>Bonificación por velocidad (Tiempo restante).</li>
                 <li>Bonus en Liga y Elo (x1.5 XP).</li>
             </ul>
        </div>
    </div>
  );

  const renderLeague = () => (
    <div className="space-y-4 animate-fade-in">
        <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
            <h3 className="font-black text-xl text-blue-800 mb-2 flex items-center gap-2"><Trophy size={24}/> Liga Semanal</h3>
            <p className="text-sm font-semibold text-black">
                La dificultad aumenta cada día. Es una carrera de supervivencia donde el porcentaje de eliminados crece diariamente.
            </p>
        </div>
        
        <div className="bg-white p-4 rounded-xl border-4 border-black cartoon-shadow">
            <h4 className="font-bold text-lg mb-2 text-center text-black">📅 Calendario de Eliminación</h4>
            <p className="text-xs font-bold text-center text-gray-500 mb-2">Comienza cada Lunes</p>
            <div className="space-y-2 text-sm text-black">
                <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                    <span className="font-bold text-black">Lunes (Día 1)</span>
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">Todos Juegan</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                    <span className="font-bold text-black">Martes (Día 2)</span>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-black">30% Eliminado</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                    <span className="font-bold text-black">Miércoles (Día 3)</span>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-black">40% Eliminado</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                    <span className="font-bold text-black">Jueves (Día 4)</span>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-black">50% Eliminado</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-100 pb-1">
                    <span className="font-bold text-black">Vie-Dom (Días 5-7)</span>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-black">60% Eliminado</span>
                </div>
                <div className="flex justify-between items-center pt-1 bg-yellow-50 rounded px-2 py-1 mt-2">
                    <span className="font-black text-purple-600">Domingo (Final)</span>
                    <span className="text-xs font-black text-purple-600">¡Solo 1 Ganador!</span>
                </div>
            </div>
        </div>

        <div className="bg-white p-4 rounded-xl border-4 border-black cartoon-shadow">
            <h4 className="font-bold text-lg mb-2 text-black">Rangos</h4>
            <div className="flex flex-wrap gap-1">
                {['Bronce', 'Plata', 'Oro', 'Platino', 'Diamante', 'Mítico', 'Legendario', 'Maestro', 'PRO'].map((r, i) => (
                    <span key={r} className={`text-[10px] px-2 py-1 rounded border border-black font-bold text-black ${i === 8 ? 'bg-green-200' : 'bg-gray-100'}`}>{r}</span>
                ))}
            </div>
            <p className="text-xs mt-2 text-black italic">Tu insignia de Liga (Slot 1) mejora cuanto más lejos llegues en la semana.</p>
        </div>
    </div>
  );

  const renderElo = () => (
    <div className="space-y-4 animate-fade-in">
        <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
            <h3 className="font-black text-xl text-purple-800 mb-2 flex items-center gap-2"><Swords size={24}/> Modo Elo</h3>
            <p className="text-sm font-semibold text-black">
                Consistencia pura. Acumula puntos cada día para conseguir la mejor insignia de la Temporada.
            </p>
        </div>
        
        <div className="bg-white p-4 rounded-xl border-4 border-black cartoon-shadow">
            <h4 className="font-bold text-lg mb-2 text-black">Puntuación Diaria (00:00 UTC)</h4>
            <p className="text-sm mb-3 font-semibold text-black">Basado en tu mejor tiempo del día (10 Banderas):</p>
            <div className="grid grid-cols-1 gap-1 text-sm text-black">
                <div className="flex justify-between bg-gray-50 p-2 rounded border border-gray-200">
                    <span>1º Puesto</span>
                    <span className="font-black text-green-600">+25 pts</span>
                </div>
                <div className="flex justify-between bg-gray-50 p-2 rounded border border-gray-200">
                    <span>2º Puesto</span>
                    <span className="font-black text-green-600">+24 pts</span>
                </div>
                 <div className="flex justify-between bg-gray-50 p-2 rounded border border-gray-200">
                    <span>...hasta el 25º</span>
                    <span className="font-black text-green-600 text-xs">(-1 pt por puesto)</span>
                </div>
                <div className="flex justify-between bg-gray-50 p-2 rounded border border-gray-200">
                    <span>Participación</span>
                    <span className="font-black text-gray-500">+1 pt (min)</span>
                </div>
            </div>
        </div>

        <div className="bg-white p-4 rounded-xl border-4 border-black cartoon-shadow">
            <h4 className="font-bold text-lg mb-2 text-black">Insignia de Temporada</h4>
            <p className="text-sm font-semibold text-black mb-2">
                Al final de la temporada, recibes una insignia según tu ranking:
            </p>
            <ul className="text-xs space-y-2 font-bold text-black pl-2">
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400 border border-black"></span> Top 1-10: ORO</li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-300 border border-black"></span> Top 11-29: PLATA</li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-700 border border-black"></span> Top 30+: BRONCE</li>
            </ul>
        </div>
    </div>
  );

  const renderChampions = () => (
    <div className="space-y-4 animate-fade-in">
        <div className="bg-blue-900 p-4 rounded-xl border-2 border-blue-500 text-white">
            <h3 className="font-black text-xl text-yellow-400 mb-2 flex items-center gap-2"><Star size={24} fill="currentColor"/> Champions League</h3>
            <p className="text-sm font-semibold opacity-90">
                El torneo más prestigioso. Competición semanal con Fase de Grupos de 2 días y Eliminatorias Directas.
            </p>
        </div>

        <div className="bg-white p-4 rounded-xl border-4 border-black cartoon-shadow">
             <h4 className="font-bold text-lg mb-2 flex items-center gap-2 text-black">
                 <Users size={20} className="text-blue-600"/> Fase 1: Inscripción (Lunes)
             </h4>
             <p className="text-sm text-black mb-2">
                 Los jugadores se registran jugando una partida el <strong>Lunes</strong>.
             </p>
             <div className="bg-red-100 p-2 rounded border-l-4 border-red-500 text-xs font-bold text-red-800 mb-2">
                 ¡Importante! Debes jugar al menos una vez el Lunes para entrar. Si no participas, quedas fuera hasta la siguiente semana.
             </div>
             <div className="bg-gray-100 p-2 rounded border-l-4 border-green-500 text-xs font-bold text-black">
                 El Martes, los inscritos se dividen en 8 Grupos. Los 4 mejores de cada grupo el Martes por la noche se clasifican.
             </div>
        </div>

        <div className="bg-white p-4 rounded-xl border-4 border-black cartoon-shadow">
             <h4 className="font-bold text-lg mb-2 flex items-center gap-2 text-black">
                 <GitMerge size={20} className="text-red-600"/> Fase 2: El Cuadro
             </h4>
             <p className="text-sm text-black mb-2">
                 Duelos directos 1 vs 1. Quien haga mejor tiempo en el día, avanza.
             </p>
             <ul className="space-y-2 text-xs font-semibold text-black">
                 <li className="flex justify-between border-b border-gray-100 pb-1">
                     <span>Miércoles</span>
                     <span className="font-black text-blue-900">Dieciseisavos (R32)</span>
                 </li>
                 <li className="flex justify-between border-b border-gray-100 pb-1">
                     <span>Jueves</span>
                     <span className="font-black text-blue-800">Octavos de Final (R16)</span>
                 </li>
                 <li className="flex justify-between border-b border-gray-100 pb-1">
                     <span>Viernes</span>
                     <span className="font-black text-blue-700">Cuartos de Final (QF)</span>
                 </li>
                 <li className="flex justify-between border-b border-gray-100 pb-1">
                     <span>Sábado</span>
                     <span className="font-black text-blue-600">Semifinales (SF)</span>
                 </li>
                 <li className="flex justify-between pt-1">
                     <span>Domingo</span>
                     <span className="font-black text-yellow-600 bg-yellow-50 px-2 rounded">GRAN FINAL</span>
                 </li>
             </ul>
        </div>
        
        <div className="bg-white p-4 rounded-xl border-4 border-black cartoon-shadow flex items-center gap-3">
            <div className="bg-blue-900 p-2 rounded-lg text-yellow-400">
                <Star size={24} fill="currentColor"/>
            </div>
            <div>
                <h4 className="font-bold text-sm text-black">Gloria Eterna</h4>
                <p className="text-xs text-black">
                    Ganar otorga una Estrella en tu perfil. ¡Acumúlalas!
                </p>
            </div>
        </div>
    </div>
  );

  const renderRecords = () => (
     <div className="space-y-4 animate-fade-in">
        <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
            <h3 className="font-black text-xl text-green-800 mb-2 flex items-center gap-2"><Medal size={24}/> Récords e Insignias</h3>
            <p className="text-sm font-semibold text-black">
                Demuestra que eres el más rápido del mundo o de tu país en los modos de práctica (5, 10 y 20).
            </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
             {/* WR CARD */}
             <div className="bg-white p-3 rounded-xl border-4 border-yellow-400 cartoon-shadow relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-2 opacity-10"><Crown size={48}/></div>
                 <h4 className="font-black text-lg text-yellow-600 mb-1 flex items-center gap-2">
                    <Crown size={20} fill="currentColor" /> Récord Mundial (WR)
                 </h4>
                 <p className="text-xs text-black font-bold mb-2">
                    Se otorga al jugador con el tiempo más rápido absoluto en una categoría.
                 </p>
                 <div className="flex items-center gap-2 text-xs bg-yellow-50 p-2 rounded border border-yellow-200">
                     <span>👑</span>
                     <span className="font-bold text-black">Otorga la Corona Dorada</span>
                 </div>
             </div>

             {/* NR CARD */}
             <div className="bg-white p-3 rounded-xl border-4 border-blue-400 cartoon-shadow relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-2 opacity-10"><Globe size={48}/></div>
                 <h4 className="font-black text-lg text-blue-600 mb-1 flex items-center gap-2">
                    <Globe size={20} /> Récord Nacional (NR)
                 </h4>
                 <p className="text-xs text-black font-bold mb-2">
                    Se otorga si tienes el mejor tiempo de entre todos los jugadores que usan tu misma bandera (país).
                 </p>
                 <div className="flex items-center gap-2 text-xs bg-blue-50 p-2 rounded border border-blue-200">
                     <span>🎨</span>
                     <span className="font-bold text-black">Insignia personalizada con tu bandera</span>
                 </div>
             </div>

             {/* TIME BADGES CARD */}
             <div className="bg-white p-3 rounded-xl border-4 border-purple-400 cartoon-shadow relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-2 opacity-10"><Timer size={48}/></div>
                 <h4 className="font-black text-lg text-purple-600 mb-1 flex items-center gap-2">
                    <Timer size={20} /> Insignias de Tiempo
                 </h4>
                 <p className="text-xs text-black font-bold mb-2">
                    Si no consigues un WR o NR, puedes ganar insignias por tiempo. El orden de prioridad en tu perfil es: WR &gt; NR &gt; Pro &gt; Gran Maestro &gt; Maestro &gt; Esmeralda &gt; Rubí &gt; Platino &gt; Diamante &gt; Oro &gt; Plata &gt; Bronce.
                 </p>
                 <div className="space-y-2 text-xs font-bold text-black">
                     <div className="bg-gray-50 p-2 rounded border border-gray-200">
                         <span className="text-green-600 font-black">5 Banderas:</span> Pro (&lt;2.60s), GM (&lt;2.70s), Maestro (&lt;2.80s), Esmeralda (&lt;2.90s), Rubí (&lt;3.00s), Platino (&lt;3.10s), Diamante (&lt;3.30s), Oro (&lt;3.50s), Plata (&lt;3.80s), Bronce (&lt;4.00s)
                     </div>
                     <div className="bg-gray-50 p-2 rounded border border-gray-200">
                         <span className="text-green-600 font-black">10 Banderas:</span> Pro (&lt;5.80s), GM (&lt;5.90s), Maestro (&lt;6.00s), Esmeralda (&lt;6.10s), Rubí (&lt;6.30s), Platino (&lt;6.50s), Diamante (&lt;6.75s), Oro (&lt;7.00s), Plata (&lt;7.50s), Bronce (&lt;8.00s)
                     </div>
                     <div className="bg-gray-50 p-2 rounded border border-gray-200">
                         <span className="text-green-600 font-black">20 Banderas:</span> Pro (&lt;13.60s), GM (&lt;13.80s), Maestro (&lt;14.00s), Esmeralda (&lt;14.20s), Rubí (&lt;14.50s), Platino (&lt;14.80s), Diamante (&lt;15.10s), Oro (&lt;15.45s), Plata (&lt;15.70s), Bronce (&lt;16.00s)
                     </div>
                 </div>
             </div>
        </div>

        <div className="bg-white p-4 rounded-xl border-4 border-black cartoon-shadow">
            <h4 className="font-bold text-lg mb-2 text-black">Slots de Perfil</h4>
            <div className="text-xs space-y-2 font-semibold text-black">
                <div className="flex gap-2">
                    <span className="bg-gray-200 px-1 rounded text-black font-bold">1</span>
                    <span>Liga (Rango actual)</span>
                </div>
                <div className="flex gap-2">
                    <span className="bg-purple-200 px-1 rounded text-purple-800 font-bold">2</span>
                    <span>Elo (Rango Season)</span>
                </div>
                <div className="flex gap-2">
                    <span className="bg-yellow-100 px-1 rounded text-yellow-800 font-bold">3, 4, 5</span>
                    <span>Récords (5, 10 y 20 banderas)</span>
                </div>
            </div>
            <p className="text-[10px] mt-2 text-black italic text-center">
                *Si pierdes un récord (WR/NR), se te asignará la insignia de tiempo que te corresponda.
            </p>
        </div>
     </div>
  );

  return (
    <div className="flex flex-col items-center w-full max-w-md h-full mx-auto px-4 py-2">
       <div className="w-full flex items-center justify-between mb-4">
            <button onClick={onBack} className="p-2 border-2 border-black rounded-full bg-white hover:bg-gray-100 text-black">
                <ArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-black text-black">Guía de Juego</h2>
            <div className="w-10"></div>
        </div>

        <div className="flex gap-1 mb-4 w-full overflow-x-auto scrollbar-hide pb-2 shrink-0">
            <button onClick={() => setTab('LEVEL')} className={`flex-1 min-w-[60px] py-2 font-black border-b-4 text-xs md:text-sm ${tab === 'LEVEL' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-400'}`}>NIVEL</button>
            <button onClick={() => setTab('LEAGUE')} className={`flex-1 min-w-[60px] py-2 font-black border-b-4 text-xs md:text-sm ${tab === 'LEAGUE' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-400'}`}>LIGA</button>
            <button onClick={() => setTab('ELO')} className={`flex-1 min-w-[60px] py-2 font-black border-b-4 text-xs md:text-sm ${tab === 'ELO' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-400'}`}>ELO</button>
            <button onClick={() => setTab('CHAMPIONS')} className={`flex-1 min-w-[60px] py-2 font-black border-b-4 text-xs md:text-sm ${tab === 'CHAMPIONS' ? 'border-blue-700 text-blue-800' : 'border-transparent text-gray-400'}`}>UCL</button>
            <button onClick={() => setTab('RECORDS')} className={`flex-1 min-w-[60px] py-2 font-black border-b-4 text-xs md:text-sm ${tab === 'RECORDS' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-400'}`}>RÉCORDS</button>
        </div>

        <div className="flex-1 w-full overflow-y-auto scrollbar-hide pb-4">
            {tab === 'LEVEL' && renderLevel()}
            {tab === 'LEAGUE' && renderLeague()}
            {tab === 'ELO' && renderElo()}
            {tab === 'CHAMPIONS' && renderChampions()}
            {tab === 'RECORDS' && renderRecords()}
        </div>
        
        <div className="w-full pt-2">
             <Button onClick={onBack} size="lg" className="w-full text-black" variant="secondary">
                Entendido
            </Button>
        </div>
    </div>
  );
};

export default Guide;
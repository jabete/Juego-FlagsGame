import React from 'react';

export interface FrameDefinition {
    id: string;
    name: string;
    description: string;
    styleClass: string;
    overlay?: React.ReactNode;
    unlockCondition: (userLevel: number, totalXp: number, gamesPlayed?: number) => boolean;
    conditionText: string;
}

export const FRAMES: FrameDefinition[] = [
    {
        id: 'DEFAULT',
        name: 'Básico',
        description: 'Marco estándar.',
        styleClass: 'border-black',
        unlockCondition: () => true,
        conditionText: 'Gratis'
    },
    {
        id: 'FRAME_BRONZE',
        name: 'Bronce',
        description: 'Un toque de metal.',
        styleClass: 'border-orange-700 ring-2 ring-orange-300',
        unlockCondition: (lvl) => lvl >= 5,
        conditionText: 'Nivel 5'
    },
    {
        id: 'FRAME_SILVER',
        name: 'Plata',
        description: 'Brillo metálico.',
        styleClass: 'border-gray-400 ring-2 ring-white shadow-[0_0_10px_rgba(200,200,200,0.5)]',
        unlockCondition: (lvl) => lvl >= 10,
        conditionText: 'Nivel 10'
    },
    {
        id: 'FRAME_GOLD',
        name: 'Oro',
        description: 'Puro lujo.',
        styleClass: 'border-yellow-400 ring-2 ring-yellow-200 shadow-[0_0_15px_rgba(250,204,21,0.6)]',
        unlockCondition: (lvl) => lvl >= 20,
        conditionText: 'Nivel 20'
    },
    {
        id: 'FRAME_NATURE',
        name: 'Bosque',
        description: 'Siente la naturaleza.',
        styleClass: 'border-green-600 ring-4 ring-green-800 border-dashed',
        unlockCondition: (lvl) => lvl >= 30,
        conditionText: 'Nivel 30'
    },
    {
        id: 'FRAME_OCEAN',
        name: 'Océano',
        description: 'Profundidades marinas.',
        styleClass: 'border-blue-500 ring-4 ring-blue-300 shadow-[0_0_10px_#3b82f6]',
        unlockCondition: (lvl) => lvl >= 40,
        conditionText: 'Nivel 40'
    },
    {
        id: 'FRAME_FIRE',
        name: 'Infernal',
        description: '¡Arde!',
        styleClass: 'border-red-600 ring-2 ring-orange-500 shadow-[0_0_15px_#ef4444] animate-pulse',
        unlockCondition: (lvl) => lvl >= 50,
        conditionText: 'Nivel 50'
    },
    {
        id: 'FRAME_NEON',
        name: 'Ciberpunk',
        description: 'El futuro es hoy.',
        styleClass: 'border-fuchsia-500 ring-2 ring-cyan-400 shadow-[0_0_10px_#d946ef,0_0_20px_#22d3ee]',
        unlockCondition: (lvl) => lvl >= 60,
        conditionText: 'Nivel 60'
    },
    {
        id: 'FRAME_VOID',
        name: 'Vacío',
        description: 'La oscuridad te observa.',
        styleClass: 'border-gray-900 ring-4 ring-black shadow-[inset_0_0_20px_#000]',
        unlockCondition: (lvl) => lvl >= 70,
        conditionText: 'Nivel 70'
    },
    {
        id: 'FRAME_RAINBOW',
        name: 'Prisma',
        description: 'Todos los colores.',
        styleClass: 'border-transparent ring-4 ring-white bg-gradient-to-r from-red-500 via-green-500 to-blue-500 p-[2px]', // Requires wrapping logic usually, but simplified here with border tricks or specific rendering
        unlockCondition: (lvl) => lvl >= 80,
        conditionText: 'Nivel 80'
    },
    {
        id: 'FRAME_DIAMOND',
        name: 'Diamante',
        description: 'Indestructible.',
        styleClass: 'border-cyan-200 ring-2 ring-blue-400 shadow-[0_0_20px_#a5f3fc] bg-blue-50',
        unlockCondition: (lvl) => lvl >= 90,
        conditionText: 'Nivel 90'
    },
    {
        id: 'FRAME_LEGEND',
        name: 'Leyenda',
        description: 'Solo para los mejores.',
        styleClass: 'border-yellow-500 ring-4 ring-purple-600 shadow-[0_0_30px_#fbbf24] animate-pulse',
        unlockCondition: (lvl) => lvl >= 100,
        conditionText: 'Nivel 100'
    }
];

interface AvatarProps {
    code: string;
    frameId?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ code, frameId = 'DEFAULT', size = 'md', className = '' }) => {
    const frame = FRAMES.find(f => f.id === frameId) || FRAMES[0];
    
    // Map size to dimensions and border widths
    const sizeClasses = {
        sm: 'w-8 h-8 border-2',
        md: 'w-12 h-12 border-[3px]',
        lg: 'w-24 h-24 border-4',
        xl: 'w-32 h-32 border-[6px]'
    };

    // Handle Rainbow special case or general styling
    const isRainbow = frameId === 'FRAME_RAINBOW';
    
    return (
        <div className={`relative rounded-full shrink-0 ${className} ${sizeClasses[size]} ${!isRainbow ? frame.styleClass : ''} overflow-hidden bg-white shadow-sm`}>
            {isRainbow && (
                <div className="absolute inset-0 rounded-full border-[4px] border-transparent bg-gradient-to-tr from-red-500 via-yellow-500 to-blue-500 opacity-80 pointer-events-none z-10" style={{maskImage: 'linear-gradient(white, white)', maskMode: 'match-source', WebkitMaskComposite: 'xor', maskComposite: 'exclude'}}></div>
            )}
            <img 
                src={`https://flagcdn.com/${size === 'lg' || size === 'xl' ? 'w160' : 'w40'}/${code}.png`} 
                alt="avatar" 
                className="w-full h-full object-cover"
            />
        </div>
    );
};

export default Avatar;
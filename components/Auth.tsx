import React, { useState } from 'react';
import Button from './Button';
import { REGISTRATION_COUNTRIES } from '../services/gemini';
import { User } from '../types';
import { Eye, EyeOff } from 'lucide-react';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('es');
  const [error, setError] = useState('');

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Capitalize first letter if it exists
    const capitalized = val.charAt(0).toUpperCase() + val.slice(1);
    setUsername(capitalized);
  };

  const handleAuth = () => {
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Por favor rellena todos los campos');
      return;
    }

    const usersStr = localStorage.getItem('flagtoon_users');
    const users: User[] = usersStr ? JSON.parse(usersStr) : [];

    if (isRegistering) {
      if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        setError('El usuario ya existe');
        return;
      }
      
      // Check if it's League Day 1 (Friday = 5)
      // If registering late (Sat-Thu), user enters as eliminated for the current league week
      const now = new Date();
      const day = now.getDay();
      const isLeagueDay1 = day === 5;

      // Initialize new user with XP and Level
      const newUser: User = { 
        username, 
        password, 
        avatarCode: selectedAvatar,
        xp: 0,
        level: 1,
        badges: [],
        leagueTier: 0,
        isEliminated: !isLeagueDay1 // Auto-eliminate if missing the start of the week (Friday)
      };
      users.push(newUser);
      localStorage.setItem('flagtoon_users', JSON.stringify(users));
      onLogin(newUser);
    } else {
      const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
      if (user) {
        // Ensure user has XP/Level properties if they are an old user record
        if (user.xp === undefined) user.xp = 0;
        if (user.level === undefined) user.level = 1;
        if (user.badges === undefined) user.badges = [];
        onLogin(user);
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    }
  };

  const sortedCountries = [...REGISTRATION_COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="w-full max-w-md bg-white border-4 border-black rounded-2xl p-6 cartoon-shadow-lg animate-fade-in mx-4">
      <h2 className="text-3xl md:text-4xl font-black text-center mb-6 text-yellow-400 cartoon-text-shadow stroke-black">
        {isRegistering ? '¡Crea tu Cuenta!' : '¡Bienvenido!'}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block font-bold mb-1 text-black">Usuario</label>
          <input 
            type="text" 
            value={username}
            onChange={handleUsernameChange}
            className="w-full p-3 border-4 border-black rounded-xl font-bold bg-gray-50 text-black focus:outline-none focus:ring-4 focus:ring-yellow-300"
            placeholder="Tu nombre..."
          />
        </div>

        <div>
          <label className="block font-bold mb-1 text-black">Contraseña</label>
          <div className="relative">
            <input 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pr-12 border-4 border-black rounded-xl font-bold bg-gray-50 text-black focus:outline-none focus:ring-4 focus:ring-yellow-300"
                placeholder="******"
            />
            <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-black focus:outline-none"
            >
                {showPassword ? <EyeOff size={24} strokeWidth={2.5} /> : <Eye size={24} strokeWidth={2.5} />}
            </button>
          </div>
        </div>

        {isRegistering && (
          <div>
            <label className="block font-bold mb-2 text-black">Tu País (Avatar):</label>
            <div className="relative">
                <select 
                    value={selectedAvatar}
                    onChange={(e) => setSelectedAvatar(e.target.value)}
                    className="w-full p-3 pl-12 border-4 border-black rounded-xl font-bold bg-gray-50 text-black appearance-none focus:outline-none focus:ring-4 focus:ring-yellow-300"
                >
                    {sortedCountries.map((c) => (
                        <option key={c.code} value={c.code}>
                            {c.name}
                        </option>
                    ))}
                </select>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <img 
                        src={`https://flagcdn.com/w40/${selectedAvatar}.png`} 
                        alt="flag" 
                        className="w-8 h-auto border border-black rounded" 
                    />
                </div>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-xl">
                    ▼
                </div>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 font-bold text-center animate-bounce">{error}</p>}

        {isRegistering ? (
            <div className="flex flex-col gap-3 pt-2">
                <Button onClick={handleAuth} variant="success" className="w-full text-xl" size="lg">
                  Confirmar Registro
                </Button>
                <Button onClick={() => setIsRegistering(false)} variant="secondary" className="w-full text-lg">
                  Cancelar
                </Button>
            </div>
        ) : (
            <div className="flex flex-col gap-3 pt-2">
                <Button onClick={handleAuth} variant="primary" className="w-full text-xl" size="lg">
                  Iniciar Sesión
                </Button>
                <div className="w-full flex items-center justify-center gap-2 opacity-50">
                    <div className="h-1 bg-black flex-1 rounded-full"></div>
                    <span className="font-bold text-sm">O</span>
                    <div className="h-1 bg-black flex-1 rounded-full"></div>
                </div>
                <Button onClick={() => { setIsRegistering(true); setError(''); }} variant="success" className="w-full text-xl" size="lg">
                  Registrarse
                </Button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
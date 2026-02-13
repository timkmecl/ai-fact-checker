import React from 'react';
import { VerifyIcon } from '../utils/icons';

interface LoginPageProps {
  passwordInput: string;
  setPasswordInput: (value: string) => void;
  authError: boolean;
  onLogin: (e: React.FormEvent) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({
  passwordInput,
  setPasswordInput,
  authError,
  onLogin,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F0E7] p-4">
      <div className="w-full max-w-md bg-white border border-[#D1D1D1] rounded-2xl p-10 card-shadow">
        <div className="flex justify-center mb-6">
          <VerifyIcon />
        </div>
        <h1 className="text-4xl font-serif text-center mb-2 text-[#2D2D2D]">AI Fact Checker</h1>
        <p className="text-center text-gray-400 mb-10 font-light">Vnesite geslo za dostop.</p>
        <form onSubmit={onLogin} className="space-y-4">
          <div>
            <input
              type="password"
              className="w-full px-5 py-3 rounded-xl border border-[#D1D1D1] focus:outline-none focus:ring-2 focus:ring-[#BC5A41]/20 focus:border-[#BC5A41] bg-[#FAFAFA] transition-all"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Geslo"
            />
          </div>
          {authError && <p className="text-red-500 text-sm text-center">Napačno geslo.</p>}
          <button
            type="submit"
            className="w-full bg-[#2D2D2D] hover:bg-black text-white font-medium py-3 rounded-xl transition-all duration-300 transform active:scale-[0.98]"
          >
            Vstopi
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
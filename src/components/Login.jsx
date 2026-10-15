import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { X, Eye, EyeOff } from 'lucide-react';

export default function Login({ onClose, onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (isForgotPassword) {
      // Forgot Password Handler
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });

      setLoading(false);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('Password reset link sent to your registered email!');
      }
      return;
    }

    if (isSignUp) {
      // Check if passwords match
      if (password !== confirmPassword) {
        setLoading(false);
        setErrorMsg('Please check password: Passwords do not match!');
        return;
      }

      if (password.length < 6) {
        setLoading(false);
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }

      // Sign Up for new gamers
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      setLoading(false);
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg('Account created successfully! You can now log in.');
        setIsSignUp(false);
        setPassword('');
        setConfirmPassword('');
      }
    } else {
      // Login for existing gamers
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setLoading(false);
      if (error) {
        setErrorMsg(error.message);
      } else {
        onLoginSuccess(data.user);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
      <div className="bg-[#121216] border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl text-white relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg bg-white/5 border border-white/10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-bold mb-2 text-center font-orbitron text-red-500">
          {isForgotPassword ? 'Reset Password' : (isSignUp ? 'Join Stranger’s Gaming' : 'Welcome Back, Gamer')}
        </h2>
        <p className="text-gray-400 text-xs text-center mb-6">
          {isForgotPassword 
            ? 'Enter your registered email to receive password reset link' 
            : (isSignUp ? 'Create an account to manage your cafe bookings' : 'Log in to your gaming account')}
        </p>
        
        {errorMsg && <p className="text-red-400 text-xs mb-4 bg-red-950/50 p-3 rounded-lg border border-red-800">{errorMsg}</p>}
        {successMsg && <p className="text-green-400 text-xs mb-4 bg-green-950/50 p-3 rounded-lg border border-green-800">{successMsg}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-xs uppercase tracking-wider mb-2 text-gray-300">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              className="w-full p-3 rounded-lg bg-[#1a1a20] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500"
              placeholder="gamer@example.com"
            />
          </div>

          {!isForgotPassword && (
            <div className="mb-4 relative">
              <label className="block text-xs uppercase tracking-wider mb-2 text-gray-300">Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                className="w-full p-3 pr-12 rounded-lg bg-[#1a1a20] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 font-mono"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-9 text-gray-400 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* Confirm Password Field (Only shown during Sign Up) */}
          {isSignUp && !isForgotPassword && (
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-wider mb-2 text-gray-300">Confirm Password</label>
              <input 
                type={showPassword ? "text" : "password"} 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required
                className="w-full p-3 rounded-lg bg-[#1a1a20] border border-white/10 text-white text-sm focus:outline-none focus:border-red-500 font-mono"
                placeholder="••••••••"
              />
            </div>
          )}

          {/* Forgot Password Link */}
          {!isSignUp && !isForgotPassword && (
            <div className="text-right mb-6 -mt-2">
              <button 
                type="button"
                onClick={() => { setIsForgotPassword(true); setErrorMsg(''); setSuccessMsg(''); }}
                className="text-xs text-red-400 hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-widest rounded-lg shadow-lg shadow-red-600/30 transition duration-200 cursor-pointer"
          >
            {loading ? 'Please wait...' : (isForgotPassword ? 'Send Reset Link' : (isSignUp ? 'Create Account' : 'Log In'))}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          {isForgotPassword ? (
            <p>
              Remember your password?{' '}
              <button onClick={() => { setIsForgotPassword(false); setErrorMsg(''); setSuccessMsg(''); }} className="text-red-500 font-bold hover:underline cursor-pointer">
                Log In
              </button>
            </p>
          ) : isSignUp ? (
            <p>
              Already have an account?{' '}
              <button onClick={() => setIsSignUp(false)} className="text-red-500 font-bold hover:underline cursor-pointer">
                Log In
              </button>
            </p>
          ) : (
            <p>
              New to Stranger's Gaming Cafe?{' '}
              <button onClick={() => setIsSignUp(true)} className="text-red-500 font-bold hover:underline cursor-pointer">
                Sign Up
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
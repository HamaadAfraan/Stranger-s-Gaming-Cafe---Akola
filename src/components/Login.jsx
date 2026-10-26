import React, { useState } from 'react';
// Firebase Auth Imports + Google Auth Provider
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { X, Eye, EyeOff } from 'lucide-react';

export default function Login({ onClose, onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setGoogleLoading(false);
      onLoginSuccess(result.user);
    } catch (error) {
      setGoogleLoading(false);
      console.error("Google Sign-In Error:", error);
      let message = error.message;
      if (error.code === 'auth/popup-closed-by-user') {
        message = 'Sign-in window was closed. Please try again.';
      } else if (error.code === 'auth/cancelled-popup-request') {
        message = 'Sign-in process was cancelled.';
      }
      setErrorMsg(message);
    }
  };

  // Form Submit Handler (Email & Password)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isForgotPassword) {
        // Firebase Forgot Password Handler
        await sendPasswordResetEmail(auth, email);
        setLoading(false);
        setSuccessMsg('Password reset link sent to your registered email!');
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

        // Firebase Sign Up for new gamers
        await createUserWithEmailAndPassword(auth, email, password);
        setLoading(false);
        setSuccessMsg('Account created successfully! You can now log in.');
        setIsSignUp(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        // Firebase Login for existing gamers
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setLoading(false);
        onLoginSuccess(userCredential.user);
      }
    } catch (error) {
      setLoading(false);
      // Firebase error messages user-friendly banane ke liye
      let message = error.message;
      if (error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password. Please try again.';
      } else if (error.code === 'auth/email-already-in-use') {
        message = 'This email is already registered. Please log in instead.';
      } else if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email.';
      }
      setErrorMsg(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md px-4 font-sans">
      <div className="bg-[#101014] border border-[#ccff00]/30 p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-[0_0_30px_rgba(0,0,0,0.8)] text-white relative animate-fadeIn">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-[#ccff00] p-1.5 rounded-lg bg-white/5 border border-white/10 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl sm:text-2xl font-black mb-1.5 text-center font-orbitron text-[#ccff00] uppercase tracking-wide">
          {isForgotPassword ? 'Reset Password' : (isSignUp ? 'Join Stranger’s Gaming' : 'Welcome Back, Gamer')}
        </h2>
        <p className="text-gray-400 text-xs text-center mb-5 font-mono">
          {isForgotPassword 
            ? 'Enter your registered email to receive password reset link' 
            : (isSignUp ? 'Create an account to manage your cafe bookings' : 'Log in to your gaming account')}
        </p>
        
        {errorMsg && (
          <p className="text-red-400 text-xs mb-4 bg-red-950/50 p-3 rounded-xl border border-red-800/60 font-mono">
            {errorMsg}
          </p>
        )}
        {successMsg && (
          <p className="text-[#ccff00] text-xs mb-4 bg-[#ccff00]/10 p-3 rounded-xl border border-[#ccff00]/40 font-mono">
            {successMsg}
          </p>
        )}
        
        {/* Google Login Button */}
        {!isForgotPassword && (
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition duration-200 cursor-pointer flex items-center justify-center gap-2.5 font-mono shadow-md"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.5s.7 4.8 1.9 7.2l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
                />
              </svg>
              <span>{googleLoading ? 'Connecting...' : 'Continue with Google'}</span>
            </button>

            {/* Divider */}
            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-3 text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                OR EMAIL
              </span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[10px] uppercase tracking-wider mb-1.5 text-gray-300 font-mono">
              Email Address
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              className="w-full p-3 rounded-xl bg-[#0a0a0c] border border-white/10 text-white text-sm focus:outline-none focus:border-[#ccff00] transition-colors font-mono"
              placeholder="gamer@example.com"
            />
          </div>

          {!isForgotPassword && (
            <div className="mb-4 relative">
              <label className="block text-[10px] uppercase tracking-wider mb-1.5 text-gray-300 font-mono">
                Password
              </label>
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required
                className="w-full p-3 pr-12 rounded-xl bg-[#0a0a0c] border border-white/10 text-white text-sm focus:outline-none focus:border-[#ccff00] transition-colors font-mono"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-8.5 text-gray-400 hover:text-[#ccff00] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* Confirm Password Field (Only shown during Sign Up) */}
          {isSignUp && !isForgotPassword && (
            <div className="mb-5">
              <label className="block text-[10px] uppercase tracking-wider mb-1.5 text-gray-300 font-mono">
                Confirm Password
              </label>
              <input 
                type={showPassword ? "text" : "password"} 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                required
                className="w-full p-3 rounded-xl bg-[#0a0a0c] border border-white/10 text-white text-sm focus:outline-none focus:border-[#ccff00] transition-colors font-mono"
                placeholder="••••••••"
              />
            </div>
          )}

          {/* Forgot Password Link */}
          {!isSignUp && !isForgotPassword && (
            <div className="text-right mb-5 -mt-1">
              <button 
                type="button"
                onClick={() => { setIsForgotPassword(true); setErrorMsg(''); setSuccessMsg(''); }}
                className="text-xs text-[#ccff00]/80 hover:text-[#ccff00] hover:underline cursor-pointer font-mono"
              >
                Forgot Password?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3.5 bg-[#ccff00] hover:bg-[#b8e600] text-black font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-[#ccff00]/20 transition duration-200 cursor-pointer font-orbitron"
          >
            {loading ? 'Please wait...' : (isForgotPassword ? 'Send Reset Link' : (isSignUp ? 'Create Account' : 'Log In'))}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-gray-400 font-mono">
          {isForgotPassword ? (
            <p>
              Remember your password?{' '}
              <button 
                onClick={() => { setIsForgotPassword(false); setErrorMsg(''); setSuccessMsg(''); }} 
                className="text-[#ccff00] font-bold hover:underline cursor-pointer"
              >
                Log In
              </button>
            </p>
          ) : isSignUp ? (
            <p>
              Already have an account?{' '}
              <button 
                onClick={() => setIsSignUp(false)} 
                className="text-[#ccff00] font-bold hover:underline cursor-pointer"
              >
                Log In
              </button>
            </p>
          ) : (
            <p>
              New to Stranger's Gaming Cafe?{' '}
              <button 
                onClick={() => setIsSignUp(true)} 
                className="text-[#ccff00] font-bold hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
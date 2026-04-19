import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithGoogle, loginWithEmail, registerWithEmail } from '../firebase';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(true); // Default to registration matching the design
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/api-key-not-valid') {
        setError("Firebase API Key is missing or invalid. Please check your config.");
      } else {
        setError(err.message || 'Failed to sign in with Google.');
      }
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isRegistering && !name)) {
      setError("Please fill out all fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (isRegistering) {
        await registerWithEmail(email, password);
        // Note: Can also update user profile with 'name' here using updateProfile
      } else {
        await loginWithEmail(email, password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/api-key-not-valid') {
        setError("Firebase API Key is missing or invalid. Please check your config.");
      } else {
        setError(err.message || `Failed to ${isRegistering ? 'register' : 'sign in'}.`);
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      {/* Left Side: Brand Area */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-surface-container relative flex-col justify-between p-12 border-r border-outline-variant overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--color-primary-fixed),_var(--color-surface-container),_var(--color-surface-container))] opacity-20 pointer-events-none"></div>
        
        {/* Brand Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-xl">layers</span>
          </div>
          <div className="text-xl font-bold font-headline text-on-surface tracking-tight">
            Streamline Pro
          </div>
        </div>

        {/* Central Branding Content */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-md mx-auto relative z-10 my-12">
          <div className="mb-10 relative">
            <div className="w-full h-64 rounded-2xl overflow-hidden bg-surface relative border border-outline-variant">
              <div className="absolute inset-4 bg-surface-variant rounded-2xl opacity-50 transform -rotate-6 transition-transform"></div>
              <div className="absolute inset-8 bg-surface-container-highest rounded-2xl opacity-70 transform rotate-3"></div>
              <div className="absolute inset-12 bg-surface rounded-2xl shadow-sm flex items-center justify-center overflow-hidden">
                <img alt="Digital Archive Concept" className="w-full h-full object-cover opacity-90 mix-blend-multiply filter grayscale contrast-125" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDO-TxovbGHLm0zF3qgDh7-tIYMWlbCWximD0kCMTt5jh-TBO1x0UP2wgIRObnBDWS77A962e3Rhx0nES5YrGDiXluYwfbVSgcRS2TyFKtE2ouPyqptszkFAaA6bZuYDRun3zQC91x3QRA4IydcXjVUxR5wowe7Lc9NzNdS_fEb0Auz6ewfXmqRz-ecJ_Uv1HYPIEPqxBzlZBgg1eNPDuDFXM3yXOHUmOoj2A55DUkNpt5XH5R7Zb4PoJpYY_xX0_FEhnqdX-SW94I"/>
              </div>
            </div>
            {/* Floating glassmorphism element */}
            <div className="absolute -bottom-6 -right-6 bg-surface/80 backdrop-blur-md rounded-xl p-4 shadow-lg border border-outline-variant/50 flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_done</span>
              <div>
                <p className="font-headline font-semibold text-sm text-on-surface leading-tight">Secure Archive</p>
                <p className="font-body text-xs text-on-surface-variant">End-to-end encryption</p>
              </div>
            </div>
          </div>
          <h2 className="font-headline text-4xl lg:text-5xl font-light leading-tight tracking-tight text-on-surface mb-6">
            Capture the<br/><span className="font-semibold">fleeting stream.</span>
          </h2>
          <p className="font-body text-on-surface-variant text-base leading-relaxed font-light">
            Join the platform designed for curation. Record, archive, and manage your digital broadcasts with museum-grade precision and editorial elegance.
          </p>
        </div>

        {/* Minimal Footer on Brand Side */}
        <div className="relative z-10 flex gap-6 text-sm text-on-surface-variant font-light">
          <span className="font-medium">© 2026</span>
          <div className="w-px h-5 bg-outline-variant opacity-50"></div>
          <a className="hover:text-primary transition-colors" href="#">Privacy</a>
          <a className="hover:text-primary transition-colors" href="#">Terms</a>
        </div>
      </div>

      {/* Right Side: Sign-up Form Area */}
      <div className="flex-1 flex flex-col bg-surface relative">
        {/* TopAppBar */}
        <header className="flex justify-between items-center px-6 lg:px-12 h-20 w-full z-50">
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-white text-sm">layers</span>
            </div>
            <div className="text-lg font-bold font-headline text-on-surface">
              Streamline Pro
            </div>
          </div>
          <div className="hidden lg:block"></div>
          <div className="flex items-center gap-6">
            <button className="text-on-surface-variant hover:text-primary transition-colors text-sm font-medium">Support</button>
          </div>
        </header>

        {/* Main Content Canvas */}
        <main className="flex-grow flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-sm">
            <div className="mb-10">
              <h1 className="font-headline text-4xl font-light text-on-surface tracking-tight mb-3">
                {isRegistering ? 'Create ' : 'Sign into '}
                <span className="font-semibold text-primary">Account</span>
              </h1>
              <p className="font-body text-base text-on-surface-variant font-light">
                {isRegistering ? 'Begin archiving your digital legacy today.' : 'Welcome back to your digital archive.'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-error-container border border-error/20 rounded-lg text-on-error-container text-sm font-body shadow-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-6">
              <div className="space-y-5">
                {isRegistering && (
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1.5" htmlFor="name">Full Name</label>
                    <div className="relative">
                      <input 
                        className="block w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface font-body text-base rounded-md outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-outline-variant/70 placeholder:font-light shadow-sm" 
                        id="name" 
                        name="name" 
                        placeholder="Eleanor Shellstrop" 
                        required={isRegistering} 
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5" htmlFor="email">Email Address</label>
                  <div className="relative">
                    <input 
                      autoComplete="email" 
                      className="block w-full px-4 py-3 bg-surface border border-outline-variant text-on-surface font-body text-base rounded-md outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-outline-variant/70 placeholder:font-light shadow-sm" 
                      id="email" 
                      name="email" 
                      placeholder="eleanor@example.com" 
                      required 
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1.5" htmlFor="password">Password</label>
                  <div className="relative">
                    <input 
                      autoComplete={isRegistering ? "new-password" : "current-password"} 
                      className="block w-full px-4 py-3 pr-12 bg-surface border border-outline-variant text-on-surface font-body text-base rounded-md outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-outline-variant/70 placeholder:font-light shadow-sm" 
                      id="password" 
                      name="password" 
                      placeholder="••••••••" 
                      required 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {isRegistering && <p className="mt-2 text-xs text-on-surface-variant font-body font-light">Must be at least 8 characters long.</p>}
                </div>
              </div>
              
              <div>
                <button 
                  disabled={loading}
                  className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-md text-base font-medium text-on-primary bg-primary hover:bg-primary/90 disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-md shadow-primary/20" 
                  type="submit"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {isRegistering ? 'Create Account' : 'Sign in'}
                </button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant"></div>
                </div>
                <div className="relative flex justify-center text-xs font-body uppercase tracking-wider">
                  <span className="px-4 bg-surface text-outline">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button 
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center py-2.5 px-4 rounded-md bg-surface text-sm font-medium text-on-surface transition-all border border-outline-variant hover:border-primary hover:text-primary hover:bg-primary/5 disabled:opacity-50 shadow-sm"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
                  Google
                </button>
              </div>
            </div>

            <div className="mt-10 text-sm font-body text-on-surface-variant text-center">
              {isRegistering ? 'Already have an account? ' : 'Need an account? '}
              <button 
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                }} 
                className="font-medium text-primary hover:underline transition-all bg-transparent border-none p-0 cursor-pointer"
              >
                {isRegistering ? 'Log in' : 'Register'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

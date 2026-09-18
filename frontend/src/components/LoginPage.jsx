import React, { useState } from 'react';
import { ShieldCheck, LogIn, Lock, Mail, AlertCircle, X, CheckCircle, ArrowRight } from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  signOut
} from '../firebase';
import { isEmailAuthorized } from '../config/authorizedUsers';

export default function LoginPage({ isOpen, onClose, onLoginSuccess, isForced = false, initialError = '' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!isEmailAuthorized(userCredential.user?.email)) {
        await signOut(auth);
        setError(`Access Denied: Email '${userCredential.user?.email}' is not on the authorized personnel whitelist. Contact plant administration.`);
        setLoading(false);
        return;
      }

      setSuccessMsg("Shift Supervisor authenticated successfully.");

      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(userCredential.user);
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Firebase Auth Error:", err);
      let msg = err.message || "Authentication failed.";
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        msg = "Invalid operator email or security credential.";
      } else if (err.code === 'auth/user-disabled') {
        msg = "Operator account disabled. Contact system administrator.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userEmail = result.user?.email;

      if (!isEmailAuthorized(userEmail)) {
        console.warn(`Unauthorized Google SSO attempt: ${userEmail}`);
        await signOut(auth);
        setError(`Access Denied: The Google account '${userEmail}' is not on the authorized list of personnel. Access restricted.`);
        setLoading(false);
        return;
      }

      setSuccessMsg(`Authenticated as ${result.user.displayName || userEmail}`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(result.user);
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Google Auth Error:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setError("Domain authorized check: Please add 'logiq.parvmishra44.workers.dev' under Firebase Console > Authentication > Settings > Authorized Domains.");
      } else {
        setError(err.message || "Google Single-Sign-On failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoName) => {
    setEmail(demoEmail);
    setPassword('DemoShiftPass2026!');
    setLoading(true);
    setError('');

    if (!isEmailAuthorized(demoEmail)) {
      setError(`Access Denied: Demo account '${demoEmail}' is not whitelisted.`);
      setLoading(false);
      return;
    }
    
    // Simulate shift supervisor authentication
    setTimeout(() => {
      const fakeUser = {
        email: demoEmail,
        displayName: demoName,
        uid: `demo-${Date.now()}`
      };
      setSuccessMsg(`Supervisor Access Granted: ${demoName}`);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(fakeUser);
        onClose();
        setLoading(false);
      }, 800);
    }, 400);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(6px)',
      zIndex: 100000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div 
        className="industrial-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '1.75rem',
          boxShadow: '0 20px 48px rgba(0,0,0,0.6)',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-card)',
          position: 'relative'
        }}
      >
        {/* Header Close Button */}
        {!isForced && (
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              padding: '0.25rem 0.5rem'
            }}
          >
            <X size={16} />
          </button>
        )}

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{
            background: 'rgba(2, 132, 199, 0.15)',
            color: 'var(--accent-blue)',
            padding: '0.5rem',
            borderRadius: 'var(--radius)',
            display: 'flex'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Shift Supervisor Authentication
            </h2>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Firebase Security Gate • LogIQ Industrial Operations
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{
            background: 'rgba(220, 38, 38, 0.15)',
            border: '1px solid #DC2626',
            color: '#F87171',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10B981',
            color: '#34D399',
            padding: '0.65rem 0.85rem',
            borderRadius: 'var(--radius)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            <CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Security Notice */}
        <div style={{
          background: 'rgba(2, 132, 199, 0.08)',
          border: '1px solid rgba(2, 132, 199, 0.25)',
          color: 'var(--text-secondary)',
          padding: '0.55rem 0.75rem',
          borderRadius: 'var(--radius)',
          fontSize: '0.75rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Lock size={14} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
          <span>Restricted Portal: Access is limited to pre-approved operators. Self-registration is disabled.</span>
        </div>

        {/* Email / Password Form */}
        <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              OPERATOR EMAIL ADDRESS
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@plant.industrial"
                required
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem 0.6rem 2.4rem',
                  background: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
              SECURITY PIN / PASSWORD
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                minLength={6}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem 0.6rem 2.4rem',
                  background: 'var(--bg-main)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.65rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              marginTop: '0.25rem'
            }}
          >
            <LogIn size={16} />
            <span>{loading ? 'Authenticating...' : 'Authorize Shift Access'}</span>
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>OR SINGLE SIGN-ON</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        {/* Google SSO Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="btn btn-secondary"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '0.6rem',
            fontWeight: 600,
            fontSize: '0.825rem',
            gap: '0.6rem'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Sign In with Google Workspace</span>
        </button>

        {/* Demo Fast Access */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            ⚡ Fast Demo Operator Access
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <button
              onClick={() => handleDemoLogin('p.mishra@factory.io', 'P. Mishra (Supervisor)')}
              className="btn btn-secondary"
              style={{ flex: 1, fontSize: '0.725rem', padding: '0.35rem 0.5rem', justifyContent: 'center' }}
            >
              <ArrowRight size={12} />
              <span>Op: P. Mishra</span>
            </button>
            <button
              onClick={() => handleDemoLogin('j.vance@factory.io', 'J. Vance (Maintenance Lead)')}
              className="btn btn-secondary"
              style={{ flex: 1, fontSize: '0.725rem', padding: '0.35rem 0.5rem', justifyContent: 'center' }}
            >
              <ArrowRight size={12} />
              <span>Op: J. Vance</span>
            </button>
          </div>

          {!isForced && (
            <button
              onClick={onClose}
              className="btn"
              style={{
                width: '100%',
                justifyContent: 'center',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                background: 'transparent',
                border: '1px dashed var(--border-color)',
                padding: '0.4rem'
              }}
            >
              <span>Continue in Guest Preview Mode →</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

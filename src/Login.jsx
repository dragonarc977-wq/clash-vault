import React, { useState } from 'react';
import supabase from './lib/supabase';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/` }
      });
      if (error) throw error;
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` }
        });
        if (error) throw error;
        
        setSuccessMessage("Account created successfully! You can now sign in with your password.");
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        window.location.href = '/';
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>🛡️</div>
          <h1 style={styles.title}>CLASH <span style={{ color: '#eab308' }}>VAULT</span></h1>
          <p style={styles.subtitle}>
            {isSignUp ? "Set up your email and password to create an account." : "Log in via Google or your password."}
          </p>
        </div>

        {errorMessage && <div style={styles.error}>{errorMessage}</div>}
        {successMessage && <div style={styles.success}>{successMessage}</div>}

        <button onClick={handleGoogleLogin} style={styles.googleButton} type="button">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" style={{ width: '20px', height: '20px' }} alt="Google" />
          <span>Continue with Google</span>
        </button>

        <div style={styles.divider}>
          <span style={styles.dividerText}>Or use email & password</span>
        </div>

        <form onSubmit={handleEmailAuth}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={styles.input} />
          </div>

          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? "Processing..." : (isSignUp ? "Create Account" : "Sign In")}
          </button>
        </form>

        <div style={styles.toggleContainer}>
          <button type="button" onClick={() => setIsSignUp(!isSignUp)} style={styles.toggleButton}>
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Create one"}
          </button>
        </div>

        <div style={styles.footer}>
          <a href="/" style={styles.backLink}>&larr; Back to Marketplace</a>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#070708', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 16px 16px 16px', fontFamily: 'sans-serif', color: '#f3f4f6', boxSizing: 'border-box' },
  card: { maxWidth: '420px', width: '100%', backgroundColor: '#121214', borderRadius: '24px', border: '1px solid rgba(234, 179, 8, 0.2)', padding: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)', boxSizing: 'border-box' },
  header: { textAlign: 'center', marginBottom: '24px' },
  icon: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '16px', backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.4)', fontSize: '28px', marginBottom: '16px' },
  title: { fontSize: '24px', fontWeight: '900', letterSpacing: '1px', margin: '0 0 8px 0', color: '#ffffff' },
  subtitle: { color: '#9ca3af', fontSize: '13px', margin: 0 },
  error: { marginBottom: '16px', padding: '10px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '10px', color: '#f87171', fontSize: '12px', textAlign: 'center' },
  success: { marginBottom: '16px', padding: '10px', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '10px', color: '#4ade80', fontSize: '12px', textAlign: 'center' },
  googleButton: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', backgroundColor: '#ffffff', color: '#111827', padding: '14px', borderRadius: '16px', fontWeight: 'bold', fontSize: '15px', border: 'none', cursor: 'pointer', marginBottom: '20px', boxShadow: '0 4px 12px rgba(255,255,255,0.1)' },
  divider: { display: 'flex', alignItems: 'center', textAlign: 'center', margin: '20px 0', color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' },
  dividerText: { padding: '0 10px', background: '#121214' },
  inputGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#9ca3af', marginBottom: '6px' },
  input: { width: '100%', backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '12px 16px', color: '#ffffff', fontSize: '14px', boxSizing: 'border-box', outline: 'none' },
  submitButton: { width: '100%', backgroundColor: '#eab308', color: '#111827', fontWeight: '800', padding: '14px', borderRadius: '16px', border: 'none', cursor: 'pointer', fontSize: '15px', marginTop: '8px', boxShadow: '0 4px 15px rgba(234, 179, 8, 0.2)' },
  toggleContainer: { marginTop: '16px', textAlign: 'center' },
  toggleButton: { background: 'none', border: 'none', color: '#9ca3af', fontSize: '12px', cursor: 'pointer', fontWeight: '600' },
  footer: { marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #27272a', textAlign: 'center' },
  backLink: { color: '#6b7280', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', textDecoration: 'none' }
};

export default Login;
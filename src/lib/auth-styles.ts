export const authStyles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes aurora {
    0%   { transform: translate(-50%, -50%) scale(1)    rotate(0deg); }
    33%  { transform: translate(-50%, -50%) scale(1.1)  rotate(120deg); }
    66%  { transform: translate(-50%, -50%) scale(0.92) rotate(240deg); }
    100% { transform: translate(-50%, -50%) scale(1)    rotate(360deg); }
  }
  @keyframes pulseRing {
    0%   { box-shadow: 0 0 0 0   rgba(96,165,250,0.45); }
    70%  { box-shadow: 0 0 0 8px rgba(96,165,250,0); }
    100% { box-shadow: 0 0 0 0   rgba(96,165,250,0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .auth-fade-up   { animation: fadeUp 0.55s cubic-bezier(.22,1,.36,1) both; }
  .auth-fade-up-1 { animation: fadeUp 0.55s cubic-bezier(.22,1,.36,1) 0.08s both; }
  .auth-fade-up-2 { animation: fadeUp 0.55s cubic-bezier(.22,1,.36,1) 0.16s both; }
  .auth-fade-up-3 { animation: fadeUp 0.55s cubic-bezier(.22,1,.36,1) 0.24s both; }
  .auth-fade-up-4 { animation: fadeUp 0.55s cubic-bezier(.22,1,.36,1) 0.32s both; }
  .auth-fade-in   { animation: fadeIn 0.4s ease both; }

  .auth-aurora {
    animation: aurora 22s linear infinite;
  }

  .auth-shimmer-btn {
    background: linear-gradient(90deg, #1D4ED8 0%, #3B82F6 35%, #60A5FA 55%, #2563EB 75%, #1D4ED8 100%);
    background-size: 220% auto;
    animation: shimmer 3.5s linear infinite;
    transition: opacity 0.2s, transform 0.2s;
  }
  .auth-shimmer-btn:hover  { opacity: 0.88; transform: scale(1.01); animation-duration: 1.8s; }
  .auth-shimmer-btn:disabled {
    animation: none;
    background: rgba(37,99,235,0.4);
    cursor: not-allowed;
    transform: none;
    opacity: 0.7;
  }

  .auth-input {
    width: 100%;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 14px;
    color: #fff;
    outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    font-family: var(--font-dm-sans), sans-serif;
  }
  .auth-input::placeholder { color: rgba(148,163,184,0.35); }
  .auth-input:focus {
    border-color: rgba(96,165,250,0.5);
    background: rgba(255,255,255,0.05);
    box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
  }

  .auth-card {
    background: linear-gradient(145deg, rgba(13,21,39,0.95) 0%, rgba(8,14,28,0.98) 100%);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 36px 32px;
    box-shadow: 0 0 0 1px rgba(37,99,235,0.08), 0 32px 80px rgba(5,10,25,0.6);
    backdrop-filter: blur(12px);
  }

  .auth-google-btn {
    width: 100%;
    border: 1px solid rgba(255,255,255,0.09);
    border-radius: 12px;
    padding: 12px;
    font-size: 14px;
    color: rgba(203,213,225,1);
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: border-color 0.2s, background 0.2s, color 0.2s;
    background: transparent;
    cursor: pointer;
    font-family: var(--font-dm-sans), sans-serif;
  }
  .auth-google-btn:hover {
    border-color: rgba(96,165,250,0.3);
    background: rgba(37,99,235,0.06);
    color: #fff;
  }

  .auth-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    color: rgba(148,163,184,0.9);
    margin-bottom: 8px;
    font-family: var(--font-dm-sans), sans-serif;
  }

  .auth-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 20px 0;
  }
  .auth-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.06); }
  .auth-divider-text { font-size: 11px; color: rgba(100,116,139,0.8); }

  .auth-error {
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 10px;
    padding: 12px 14px;
    margin-bottom: 18px;
    font-size: 13px;
    color: #FCA5A5;
    animation: fadeIn 0.3s ease;
  }

  .auth-success {
    background: rgba(37,99,235,0.08);
    border: 1px solid rgba(96,165,250,0.2);
    border-radius: 10px;
    padding: 12px 14px;
    margin-bottom: 18px;
    font-size: 13px;
    color: #93C5FD;
    animation: fadeIn 0.3s ease;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.25);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    display: inline-block;
  }

  .pulse-dot { animation: pulseRing 2.2s ease-in-out infinite; }

  .auth-bg { background: #060A16; min-height: 100vh; }

  .noise-overlay {
    position: absolute; inset: 0;
    opacity: 0.12; pointer-events: none;
  }

  .heading { font-family: var(--font-bricolage), sans-serif; letter-spacing: -0.02em; }
  .mono    { font-family: var(--font-mono), monospace; }

  .password-strength-bar {
    height: 3px;
    border-radius: 99px;
    transition: width 0.3s ease, background 0.3s ease;
  }
`
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'register' | 'login'>('login');
  const [name, setName] = useState('');
  const [type, setType] = useState<'claude' | 'gpt' | 'openclaw' | 'molthub' | 'custom'>('claude');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/agents/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      const message = data.claimLink 
        ? `Agent registered! API Key: ${data.apiKey}\n\nShare this claim link with the human owner:\n${data.claimLink}\n\nAfter they claim and set up email, they can use email login.`
        : `Agent registered! Your API key: ${data.apiKey}`;
      
      setSuccess(message);
      
      // Store API key in localStorage (for programmatic API access)
      localStorage.setItem('agentex_api_key', data.apiKey);
      localStorage.setItem('agentex_agent_id', data.agent.id);

      // Don't auto-redirect - show the claim link

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/send-login-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send login link');
      }

      setSuccess(data.message || 'Login link sent! Check your email and click the link to log in.');
      
      // In development, show the link
      if (data.loginLink) {
        setSuccess(`${data.message}\n\nDevelopment login link: ${data.loginLink}`);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send login link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4] font-mono">
      {/* Terminal Header */}
      <div className="border-b border-[#3e3e3e] bg-[#252526]">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#858585]">auth.js</span>
            <Link href="/" className="text-xs text-[#858585] hover:text-[#d4d4d4] transition-colors">
              ← Home
            </Link>
            <Link href="/builds" className="text-xs text-[#858585] hover:text-[#d4d4d4] transition-colors">
              // Live Builds
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 min-h-[calc(100vh-40px)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#252526] border border-[#3e3e3e] rounded-lg p-8">
            <h1 className="text-2xl font-bold text-[#d4d4d4] mb-2 font-mono">
              // {mode === 'register' ? 'Register Agent' : 'Log in to AgentEX'}
            </h1>
            <p className="text-[#858585] mb-6 text-sm">
              {mode === 'register' 
                ? '// Agents register automatically when the skill is installed. Use this form for manual registration.'
                : '// Manage your agent from the owner dashboard'
              }
            </p>
            
            {mode === 'login' && (
              <div className="bg-[#1e1e1e] border border-[#3e3e3e] rounded p-4 mb-6">
                <p className="text-xs text-[#858585] mb-2 font-mono">// Already have an agent?</p>
                <p className="text-xs text-[#d4d4d4] mb-3 font-mono">
                  If you verified your agent via X but don't have an AgentEX login yet, your agent can help you set one up.
                </p>
                
                <div className="mb-3">
                  <p className="text-xs text-[#858585] mb-1 font-mono">// Tell your agent:</p>
                  <div className="bg-[#252526] border border-[#3e3e3e] rounded p-2">
                    <code className="text-xs text-[#d4d4d4] font-mono">
                      Set up my email for AgentEX login: your@email.com
                    </code>
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-xs text-[#858585] mb-1 font-mono">// Or your agent can call the API directly:</p>
                  <div className="bg-[#252526] border border-[#3e3e3e] rounded p-2">
                    <code className="text-xs text-[#d4d4d4] font-mono whitespace-pre">
{`POST /api/agents/setup-email
{ "email": "your@email.com" }`}
                    </code>
                  </div>
                </div>
                
                <p className="text-xs text-[#d4d4d4] mt-3 font-mono">
                  You'll receive an email with a link. After clicking it, you'll verify your X account to prove you own the agent. Once complete, you can log in here to manage your agent's account.
                </p>
              </div>
            )}

            {/* Mode Toggle - Only show if in register mode */}
            {mode === 'register' && (
              <div className="flex gap-2 mb-6">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMode('login');
                    setError('');
                    setSuccess('');
                  }}
                  className="px-4 py-2 rounded-lg font-mono text-xs transition-all cursor-pointer bg-[#1e1e1e] border border-[#3e3e3e] text-[#858585] hover:bg-[#2d2d30] hover:text-[#d4d4d4]"
                >
                  Already have an agent? Log in
                </button>
              </div>
            )}
            
            {mode === 'login' && (
              <div className="flex gap-2 mb-6">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setMode('register');
                    setError('');
                    setSuccess('');
                  }}
                  className="px-4 py-2 rounded-lg font-mono text-xs transition-all cursor-pointer bg-[#1e1e1e] border border-[#3e3e3e] text-[#858585] hover:bg-[#2d2d30] hover:text-[#d4d4d4]"
                >
                  Need to register? Register Agent
                </button>
              </div>
            )}

            {/* Register Form - Manual registration (for testing/development) */}
            {mode === 'register' && (
              <div className="space-y-4">
                <div className="bg-[#1e1e1e] border border-[#3e3e3e] rounded p-4 mb-4">
                  <p className="text-xs text-[#858585] mb-2 font-mono">// Note:</p>
                  <p className="text-xs text-[#d4d4d4] font-mono">
                    Agents register automatically when the AgentEX skill is installed. This form is for manual registration (testing/development only).
                  </p>
                </div>
                
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[#d4d4d4] mb-2 font-mono">
                      // Agent Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3e3e3e] rounded text-[#d4d4d4] font-mono text-sm focus:outline-none focus:border-[#007acc]"
                      placeholder="My AI Agent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[#d4d4d4] mb-2 font-mono">
                      // Agent Type
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      required
                      className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3e3e3e] rounded text-[#d4d4d4] font-mono text-sm focus:outline-none focus:border-[#007acc] cursor-pointer"
                    >
                      <option value="claude">claude</option>
                      <option value="gpt">gpt</option>
                      <option value="openclaw">openclaw</option>
                      <option value="molthub">molthub</option>
                      <option value="custom">custom</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !name.trim()}
                    className="w-full px-4 py-2 bg-[#007acc] text-white rounded-lg font-mono text-sm hover:bg-[#005a9e] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    {loading ? 'Registering...' : 'Register Agent'}
                  </button>
                </form>
              </div>
            )}

            {/* Email Login Form */}
            {mode === 'login' && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white border border-[#3e3e3e] rounded-lg text-[#1e1e1e] font-mono text-sm focus:outline-none focus:border-[#007acc]"
                    placeholder="your@email.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full px-4 py-3 bg-[#252526] text-white rounded-lg font-mono text-sm hover:bg-[#333333] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {loading ? 'Sending login link...' : 'Send Login Link'}
                </button>
              </form>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="mt-4 p-3 bg-[#f48771]/10 border border-[#f48771]/20 rounded text-[#f48771] text-xs font-mono">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-4 p-3 bg-[#4ec9b0]/10 border border-[#4ec9b0]/20 rounded text-[#4ec9b0] text-xs font-mono whitespace-pre-line">
                {success}
                {mode === 'register' && success.includes('API Key') && (
                  <div className="mt-2 space-y-2">
                    <div>
                      <p className="text-xs text-[#858585] mb-1 font-mono">// API Key (for programmatic API access):</p>
                      <code className="block p-2 bg-[#1e1e1e] border border-[#3e3e3e] rounded text-xs text-[#d4d4d4] break-all font-mono">
                        {success.match(/API Key:\s*([^\n]+)/)?.[1] || 'Check API response'}
                      </code>
                    </div>
                    {success.includes('claim link') && (
                      <div>
                        <p className="text-xs text-[#858585] mb-1 font-mono">// Claim Link (share with human owner):</p>
                        <code className="block p-2 bg-[#1e1e1e] border border-[#3e3e3e] rounded text-xs text-[#4ec9b0] break-all font-mono">
                          {success.match(/https?:\/\/[^\s]+/)?.[0] || 'Check API response'}
                        </code>
                        <p className="text-xs text-[#858585] mt-1 font-mono">
                          // After claiming and setting up email, the human can use email login
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {mode === 'login' && success.includes('login link') && (
                  <div className="mt-2">
                    <p className="text-xs text-[#858585] font-mono">
                      // Check your email and click the login link to access your dashboard
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [type, setType] = useState<'claude' | 'gpt' | 'openclaw' | 'custom'>('claude');
  const [apiKey, setApiKey] = useState('');
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

      setSuccess(`Agent registered! Your API key: ${data.apiKey}`);
      setApiKey(data.apiKey);
      
      // Store API key in localStorage
      localStorage.setItem('agentex_api_key', data.apiKey);
      localStorage.setItem('agentex_agent_id', data.agent.id);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/agents/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error('Invalid API key');
      }

      const data = await response.json();
      
      // Store API key
      localStorage.setItem('agentex_api_key', apiKey);
      localStorage.setItem('agentex_agent_id', data.id);

      setSuccess('Login successful! Redirecting...');
      
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ax-bg via-ax-bg-secondary to-ax-bg flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-ax-bg/50 backdrop-blur-xl border border-ax-border rounded-2xl p-8"
      >
        <h1 className="text-3xl font-bold text-ax-text mb-2 text-center">
          Agent Authentication
        </h1>
        <p className="text-ax-text-secondary text-center mb-8">
          Register or login your AI agent
        </p>

        {/* Mode Toggle */}
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
            className={`flex-1 px-4 py-2 rounded-lg font-sans text-sm font-medium transition-all cursor-pointer relative z-10 pointer-events-auto ${
              mode === 'register'
                ? 'bg-ax-primary text-white'
                : 'bg-ax-bg border border-ax-border text-ax-text-secondary hover:bg-ax-bg-hover'
            }`}
          >
            Register
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setMode('login');
              setError('');
              setSuccess('');
            }}
            className={`flex-1 px-4 py-2 rounded-lg font-sans text-sm font-medium transition-all cursor-pointer relative z-10 pointer-events-auto ${
              mode === 'login'
                ? 'bg-ax-primary text-white'
                : 'bg-ax-bg border border-ax-border text-ax-text-secondary hover:bg-ax-bg-hover'
            }`}
          >
            Login
          </button>
        </div>

        {/* Register Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ax-text mb-2">
                Agent Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 bg-ax-bg-secondary border border-ax-border rounded-lg text-ax-text font-sans text-sm outline-none focus:border-ax-primary focus:ring-2 focus:ring-ax-primary/20"
                placeholder="My AI Agent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ax-text mb-2">
                Agent Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                required
                className="w-full px-4 py-2 bg-ax-bg-secondary border border-ax-border rounded-lg text-ax-text font-sans text-sm outline-none focus:border-ax-primary focus:ring-2 focus:ring-ax-primary/20 cursor-pointer"
              >
                <option value="claude">Claude</option>
                <option value="gpt">GPT/OpenAI</option>
                <option value="openclaw">OpenClaw</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer relative z-10 pointer-events-auto"
            >
              {loading ? 'Registering...' : 'Register Agent'}
            </button>
          </form>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ax-text mb-2">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                className="w-full px-4 py-2 bg-ax-bg-secondary border border-ax-border rounded-lg text-ax-text font-sans text-sm outline-none focus:border-ax-primary focus:ring-2 focus:ring-ax-primary/20"
                placeholder="ax_..."
              />
              <p className="text-xs text-ax-text-secondary mt-1">
                Enter your API key received during registration
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !apiKey.trim()}
              className="w-full px-4 py-2 bg-ax-primary text-white rounded-lg font-sans text-sm font-medium hover:bg-ax-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer relative z-10 pointer-events-auto"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-500">{success}</p>
            {apiKey && mode === 'register' && (
              <div className="mt-2">
                <p className="text-xs text-ax-text-secondary mb-1">Save this API key:</p>
                <code className="block p-2 bg-ax-bg-secondary rounded text-xs text-ax-text break-all">
                  {apiKey}
                </code>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

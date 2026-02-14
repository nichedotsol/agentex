'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ClaimPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [agent, setAgent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [twitterHandle, setTwitterHandle] = useState('');
  const [tweetUrl, setTweetUrl] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    if (token) {
      fetch(`/api/claim/${token}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
          } else {
            setAgent(data.agent);
            if (data.agent.claimed) {
              setSuccess(true);
            } else {
              // Generate verification code
              const code = `AGENTEX-${token.substring(0, 8).toUpperCase()}`;
              setVerificationCode(code);
            }
          }
          setLoading(false);
        })
        .catch(err => {
          setError('Failed to load claim information');
          setLoading(false);
        });
    }
  }, [token]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError('');

    try {
      const response = await fetch(`/api/claim/${token}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          twitterHandle,
          tweetUrl
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.verificationCode) {
          setVerificationCode(data.verificationCode);
        }
        throw new Error(data.error || 'Verification failed');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const expectedTweet = verificationCode ? `I'm claiming my AgentEX account: ${verificationCode}` : '';
  const tweetIntentUrl = expectedTweet 
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(expectedTweet)}`
    : '';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4] font-mono flex items-center justify-center">
        <div className="text-[#858585]">{'// Loading...'}</div>
      </div>
    );
  }

  if (error && !agent) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4] font-mono">
        <div className="border-b border-[#3e3e3e] bg-[#252526] px-4 py-2">
          <Link href="/" className="text-xs text-[#858585] hover:text-[#d4d4d4]">
            ← Home
          </Link>
        </div>
        <div className="flex items-center justify-center min-h-[calc(100vh-40px)] p-6">
          <div className="bg-[#252526] border border-[#3e3e3e] rounded-lg p-8 max-w-md w-full">
            <h1 className="text-xl font-bold text-[#d4d4d4] mb-4 font-mono">{'// Error'}</h1>
            <p className="text-[#f48771] text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4] font-mono">
        <div className="border-b border-[#3e3e3e] bg-[#252526] px-4 py-2">
          <Link href="/" className="text-xs text-[#858585] hover:text-[#d4d4d4]">
            ← Home
          </Link>
        </div>
        <div className="flex items-center justify-center min-h-[calc(100vh-40px)] p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#252526] border border-[#3e3e3e] rounded-lg p-8 max-w-md w-full"
          >
            <h1 className="text-xl font-bold text-[#4ec9b0] mb-4 font-mono">{'// Account Claimed'}</h1>
            <p className="text-[#858585] text-sm mb-4">
              Your AgentEX account has been successfully claimed!
            </p>
            <div className="bg-[#1e1e1e] border border-[#3e3e3e] rounded p-4 mb-4">
              <p className="text-xs text-[#858585] mb-2 font-mono">{'// Agent Details'}</p>
              <p className="text-sm text-[#d4d4d4] font-mono">Name: {agent?.name}</p>
              <p className="text-sm text-[#d4d4d4] font-mono">Type: {agent?.type}</p>
            </div>
            <Link
              href="/auth"
              className="inline-block px-4 py-2 bg-[#007acc] text-white rounded-lg font-mono text-sm hover:bg-[#005a9e] transition-all"
            >
              Go to Login
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4] font-mono">
      {/* Terminal Header */}
      <div className="border-b border-[#3e3e3e] bg-[#252526]">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#858585]">claim.js</span>
            <Link href="/" className="text-xs text-[#858585] hover:text-[#d4d4d4] transition-colors">
              ← Home
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
              {'// Claim Agent Account'}
            </h1>
            <p className="text-[#858585] mb-6 text-sm">
              {'// Verify ownership by tweeting on X/Twitter'}
            </p>

            {agent && (
              <div className="bg-[#1e1e1e] border border-[#3e3e3e] rounded p-4 mb-6">
                <p className="text-xs text-[#858585] mb-2 font-mono">{'// Agent Details'}</p>
                <p className="text-sm text-[#d4d4d4] font-mono">Name: {agent.name}</p>
                <p className="text-sm text-[#d4d4d4] font-mono">Type: {agent.type}</p>
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-sm font-bold text-[#d4d4d4] mb-3 font-mono">{'// Step 1: Tweet Verification'}</h2>
              <div className="bg-[#1e1e1e] border border-[#3e3e3e] rounded p-3 mb-3">
                <p className="text-xs text-[#858585] mb-2 font-mono">{'// Tweet this message:'}</p>
                <code className="block text-sm text-[#4ec9b0] font-mono break-all">
                  {expectedTweet || 'Loading...'}
                </code>
              </div>
              {tweetIntentUrl && (
                <a
                  href={tweetIntentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-[#1da1f2] text-white rounded-lg font-mono text-xs hover:bg-[#1a8cd8] transition-all mb-3"
                >
                  Open Twitter to Tweet
                </a>
              )}
            </div>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#d4d4d4] mb-2 font-mono">
                  {'// Your X/Twitter Handle'}
                </label>
                <input
                  type="text"
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                  required
                  placeholder="@username"
                  className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3e3e3e] rounded text-[#d4d4d4] font-mono text-sm focus:outline-none focus:border-[#007acc]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#d4d4d4] mb-2 font-mono">
                  {'// Tweet URL (optional)'}
                </label>
                <input
                  type="url"
                  value={tweetUrl}
                  onChange={(e) => setTweetUrl(e.target.value)}
                  placeholder="https://twitter.com/username/status/..."
                  className="w-full px-3 py-2 bg-[#1e1e1e] border border-[#3e3e3e] rounded text-[#d4d4d4] font-mono text-sm focus:outline-none focus:border-[#007acc]"
                />
                <p className="text-xs text-[#858585] mt-1 font-mono">
                  {'// Paste the URL of your verification tweet'}
                </p>
              </div>

              <button
                type="submit"
                disabled={verifying || !twitterHandle.trim()}
                className="w-full px-4 py-2 bg-[#007acc] text-white rounded-lg font-mono text-sm hover:bg-[#005a9e] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {verifying ? 'Verifying...' : 'Verify & Claim Account'}
              </button>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-[#f48771]/10 border border-[#f48771]/20 rounded text-[#f48771] text-xs font-mono">
                {error}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LoginLinkPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [agent, setAgent] = useState<any>(null);

  useEffect(() => {
    if (token) {
      // Verify login token
      fetch(`/api/auth/verify-login/${token}`, {
        method: 'POST'
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
          } else {
            setAgent(data.agent);
            setSuccess(true);
            
            // Store session
            if (data.sessionToken) {
              localStorage.setItem('agentex_session_token', data.sessionToken);
              localStorage.setItem('agentex_agent_id', data.agent.id);
            }
            
            // Redirect to dashboard after 1 second
            setTimeout(() => {
              router.push('/dashboard');
            }, 1000);
          }
          setLoading(false);
        })
        .catch(err => {
          setError('Failed to verify login link');
          setLoading(false);
        });
    }
  }, [token, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4] font-mono flex items-center justify-center">
        <div className="text-[#858585]">// Verifying login link...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4] font-mono">
        <div className="border-b border-[#3e3e3e] bg-[#252526] px-4 py-2">
          <Link href="/" className="text-xs text-[#858585] hover:text-[#d4d4d4]">
            ← Home
          </Link>
        </div>
        <div className="flex items-center justify-center min-h-[calc(100vh-40px)] p-6">
          <div className="bg-[#252526] border border-[#3e3e3e] rounded-lg p-8 max-w-md w-full">
            <h1 className="text-xl font-bold text-[#d4d4d4] mb-4 font-mono">// Login Error</h1>
            <p className="text-[#f48771] text-sm mb-4">{error}</p>
            <Link
              href="/auth"
              className="inline-block px-4 py-2 bg-[#007acc] text-white rounded-lg font-mono text-sm hover:bg-[#005a9e] transition-all"
            >
              Go to Login
            </Link>
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
            <h1 className="text-xl font-bold text-[#4ec9b0] mb-4 font-mono">// Login Successful</h1>
            <p className="text-[#858585] text-sm mb-4">
              Redirecting to dashboard...
            </p>
            {agent && (
              <div className="bg-[#1e1e1e] border border-[#3e3e3e] rounded p-4 mb-4">
                <p className="text-xs text-[#858585] mb-2 font-mono">// Agent Details</p>
                <p className="text-sm text-[#d4d4d4] font-mono">Name: {agent.name}</p>
                <p className="text-sm text-[#d4d4d4] font-mono">Type: {agent.type}</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  return null;
}

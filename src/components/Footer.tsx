'use client'

export default function Footer() {
  return (
    <footer className="border-t border-ax-border py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-mono text-sm text-ax-cyan mb-4">AGENTEX</h3>
            <p className="font-sans text-xs text-ax-text-dim">
              The universal standard for building and deploying AI agents.
            </p>
          </div>
          
          <div>
            <h3 className="font-mono text-sm text-ax-cyan mb-4">LINKS</h3>
            <ul className="space-y-2 font-sans text-xs text-ax-text-dim">
              <li>
                <a href="/builder" className="hover:text-ax-cyan transition-colors">
                  Builder
                </a>
              </li>
              <li>
                <a href="#components" className="hover:text-ax-cyan transition-colors">
                  Components
                </a>
              </li>
              <li>
                <a href="/docs" className="hover:text-ax-cyan transition-colors">
                  Documentation
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-mono text-sm text-ax-cyan mb-4">INFO</h3>
            <ul className="space-y-2 font-sans text-xs text-ax-text-dim">
              <li>License: MIT</li>
              <li>Version: 0.1.0</li>
              <li>Built by @albs</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-ax-border pt-8 text-center">
          <p className="font-mono text-xs text-ax-text-dim">
            © 2025 AGENTEX. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  )
}

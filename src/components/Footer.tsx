'use client'

export default function Footer() {
  return (
    <footer className="border-t border-ax-border py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="font-sans text-sm font-semibold text-ax-text mb-4">AgentEX</h3>
            <p className="font-sans text-sm text-ax-text-secondary leading-relaxed">
              The universal standard for building and deploying AI agents.
            </p>
          </div>
          
          <div>
            <h3 className="font-sans text-sm font-semibold text-ax-text mb-4">Links</h3>
            <ul className="space-y-2 font-sans text-sm text-ax-text-secondary">
              <li>
                <a href="/builder" className="hover:text-ax-primary transition-colors">
                  Builder
                </a>
              </li>
              <li>
                <a href="#components" className="hover:text-ax-primary transition-colors">
                  Components
                </a>
              </li>
              <li>
                <a href="/docs" className="hover:text-ax-primary transition-colors">
                  Documentation
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-sans text-sm font-semibold text-ax-text mb-4">Info</h3>
            <ul className="space-y-2 font-sans text-sm text-ax-text-secondary">
              <li>License: MIT</li>
              <li>Version: 0.1.0</li>
              <li>Built by @albs</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-ax-border pt-8 text-center">
          <p className="font-sans text-sm text-ax-text-tertiary">
            © 2025 AgentEX. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GeneratedFile } from '@/lib/utils/codeGenerator'

interface CodePreviewProps {
  files: GeneratedFile[]
}

export default function CodePreview({ files }: CodePreviewProps) {
  const [activeFile, setActiveFile] = useState(0)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    if (files[activeFile]) {
      navigator.clipboard.writeText(files[activeFile].content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (files.length === 0) return null

  return (
    <div className="bg-ax-bg/50 border border-ax-border">
      {/* File Tabs */}
      <div className="flex border-b border-ax-border overflow-x-auto">
        {files.map((file, index) => (
          <button
            key={index}
            onClick={() => setActiveFile(index)}
            className={`px-4 py-2 font-mono text-[10px] border-b-2 transition-all whitespace-nowrap ${
              activeFile === index
                ? 'border-ax-cyan text-ax-cyan'
                : 'border-transparent text-ax-text-dim hover:text-ax-text'
            }`}
          >
            {file.path.split('/').pop()}
          </button>
        ))}
      </div>

      {/* Code Content */}
      <div className="relative">
        <button
          onClick={copyToClipboard}
          className="absolute top-2 right-2 px-2 py-1 bg-ax-bg border border-ax-border font-mono text-[9px] text-ax-text hover:border-ax-cyan hover:text-ax-cyan transition-all z-10"
        >
          {copied ? 'COPIED' : 'COPY'}
        </button>
        <pre className="p-4 overflow-x-auto font-mono text-[10px] text-ax-text leading-relaxed">
          <code>{files[activeFile]?.content || ''}</code>
        </pre>
      </div>
    </div>
  )
}

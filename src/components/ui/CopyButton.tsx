'use client'

// Tiny client component for the payment link copy button.
// Can't use navigator.clipboard.writeText in a server component.

import { useState } from 'react'

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 text-xs font-medium transition-colors"
      style={{ color: copied ? '#34D399' : '#60A5FA' }}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}
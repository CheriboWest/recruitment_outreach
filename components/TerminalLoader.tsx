'use client';

import { useEffect, useState } from 'react';

interface TerminalLoaderProps {
  messages: string[];
  isComplete?: boolean;
}

export default function TerminalLoader({ messages, isComplete = false }: TerminalLoaderProps) {
  const [displayed, setDisplayed] = useState<string[]>([]);

  useEffect(() => {
    setDisplayed(messages);
  }, [messages]);

  return (
    <div className="bg-[#0F172A] rounded-xl p-6 font-mono text-sm w-full max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-2 text-white/30 text-xs">advance-academy — strategy engine</span>
      </div>

      <div className="space-y-1.5 min-h-[120px]">
        {displayed.map((msg, i) => (
          <div
            key={i}
            className="animate-fade-in-up"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <span
              className={
                msg.startsWith('[SUCCESS]')
                  ? 'text-green-400'
                  : msg.startsWith('[ERROR]')
                  ? 'text-red-400'
                  : msg.startsWith('[WARN]')
                  ? 'text-yellow-400'
                  : 'text-blue-400'
              }
            >
              {msg.match(/^\[.*?\]/)?.[0] || ''}
            </span>
            <span className="text-white/80">
              {msg.replace(/^\[.*?\]\s*/, ' ')}
            </span>
          </div>
        ))}
        {!isComplete && (
          <div className="flex items-center gap-2 text-white/40">
            <span className="cursor-blink">█</span>
          </div>
        )}
      </div>
    </div>
  );
}

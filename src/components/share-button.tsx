'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

const APP_URL = 'https://mpl-2026-hazel.vercel.app';
const HASHTAGS = '#MPL2026 #CricketAuction #PredictAndWin #MPLPredictions';

interface ShareButtonProps {
  /** The main share message. Defaults to auction prediction text. */
  message?: string;
  /** Hashtags string. Defaults to MPL2026 tags. */
  hashtags?: string;
}

export function ShareButton({
  message = "I'm using this app for the MPL 2026 Auction Predictions 🏏\nWould you do the same and increase your chances of winning prizes? 🏆",
  hashtags = HASHTAGS,
}: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullText = `${message}\n\n${APP_URL}\n\n${hashtags}`;

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MPL 2026',
          text: `${message}\n\n${hashtags}`,
          url: APP_URL,
        });
        return;
      } catch {
        // User cancelled or not supported
      }
    }
    setShowMenu((prev) => !prev);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const twitterHashtags = hashtags
    .replace(/#/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .join(',');

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    message
  )}&url=${encodeURIComponent(APP_URL)}&hashtags=${encodeURIComponent(twitterHashtags)}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(fullText)}`;

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={handleShare}
        className="gap-1.5"
      >
        <Share2 className="size-3.5" />
        <span className="hidden sm:inline">Share</span>
      </Button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-border bg-white p-2 shadow-lg">
            {/* Preview */}
            <div className="mb-2 rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                {fullText}
              </p>
            </div>

            <button
              onClick={handleCopy}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <span className="text-base">📋</span>
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
              onClick={() => setShowMenu(false)}
            >
              <span className="text-base">💬</span>
              Share on WhatsApp
            </a>
            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
              onClick={() => setShowMenu(false)}
            >
              <span className="text-base">🐦</span>
              Share on X / Twitter
            </a>
            <div className="my-1.5 border-t border-border" />
            <p className="px-3 py-1 text-[11px] text-muted-foreground">
              Tip: Copy and paste into your Instagram story caption!
            </p>
          </div>
        </>
      )}
    </div>
  );
}

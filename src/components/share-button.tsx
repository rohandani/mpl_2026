'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { generateShareCard, type ShareCardData } from '@/lib/share-card';

const APP_URL = 'https://mpl-2026-hazel.vercel.app';
const HASHTAGS = '#MPL2026 #CricketAuction #PredictAndWin #MPLPredictions';
const SHARE_TEXT = `I'm using this app for MPL 2026 Predictions 🏏\nWould you do the same and increase your chances of winning prizes? 🏆\n\n${APP_URL}\n\n${HASHTAGS}`;

interface ShareButtonProps {
  cardData?: ShareCardData;
}

export function ShareButton({ cardData }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function handleDownloadCard() {
    if (!cardData || generating) return;
    setGenerating(true);
    try {
      const blob = await generateShareCard(cardData);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'mpl-2026-prediction.png';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setGenerating(false);
    }
  }

  async function handleNativeShare() {
    if (!navigator.share) return;
    try {
      const shareData: ShareData = {
        title: 'MPL 2026',
        text: SHARE_TEXT,
        url: APP_URL,
      };

      // Try to include the image if possible
      if (cardData) {
        const blob = await generateShareCard(cardData);
        const file = new File([blob], 'mpl-2026-prediction.png', { type: 'image/png' });
        if (navigator.canShare?.({ files: [file] })) {
          shareData.files = [file];
        }
      }

      await navigator.share(shareData);
    } catch {
      // User cancelled
    }
    setShowMenu(false);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(SHARE_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowMenu((prev) => !prev)}
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
            {/* Download share card */}
            {cardData && (
              <button
                onClick={handleDownloadCard}
                disabled={generating}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-emerald-50 transition-colors"
              >
                <span className="text-base">📸</span>
                {generating ? 'Generating…' : 'Download Share Card'}
              </button>
            )}

            {/* Native share (WhatsApp, Instagram, etc.) */}
            {'share' in navigator && (
              <button
                onClick={handleNativeShare}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
              >
                <span className="text-base">📤</span>
                Share via WhatsApp, Insta...
              </button>
            )}

            {/* Copy text */}
            <button
              onClick={handleCopy}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <span className="text-base">📋</span>
              {copied ? 'Copied!' : 'Copy text to clipboard'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

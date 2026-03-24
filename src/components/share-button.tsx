'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { generateShareCard, type ShareCardData } from '@/lib/share-card';

interface ShareButtonProps {
  cardData?: ShareCardData;
}

export function ShareButton({ cardData }: ShareButtonProps) {
  const [generating, setGenerating] = useState(false);

  async function handleDownload() {
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

  if (!cardData) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={generating}
      className="gap-1.5"
    >
      <Share2 className="size-3.5" />
      <span className="hidden sm:inline">
        {generating ? 'Generating…' : 'Share'}
      </span>
    </Button>
  );
}

'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { updateShareConfig } from './actions';
import type { ShareConfig } from '@/types/share-config';

interface Props {
  config: ShareConfig;
}

export function ShareConfigForm({ config }: Props) {
  const [title, setTitle] = useState(config.title);
  const [hashtagsInput, setHashtagsInput] = useState(config.hashtags.join(', '));
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  function handleSave() {
    setMessage(null);
    const hashtags = hashtagsInput
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean);

    startTransition(async () => {
      const res = await updateShareConfig(title, hashtags);
      if (res.success) {
        setMessage({ type: 'success', text: 'Saved!' });
      } else {
        setMessage({ type: 'error', text: res.error });
      }
    });
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      {message && (
        <p
          className={`text-sm ${
            message.type === 'success' ? 'text-emerald-600' : 'text-destructive'
          }`}
        >
          {message.text}
        </p>
      )}

      <div className="space-y-1.5">
        <label htmlFor="title" className="text-sm font-medium">
          Card Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Auction Predictions"
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
        />
        <p className="text-xs text-muted-foreground">
          Shown as the subtitle on the share card image.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="hashtags" className="text-sm font-medium">
          Custom Hashtags
        </label>
        <input
          id="hashtags"
          type="text"
          value={hashtagsInput}
          onChange={(e) => setHashtagsInput(e.target.value)}
          placeholder="#CricketAuction, #MyTag"
          className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
        />
        <p className="text-xs text-muted-foreground">
          Comma-separated. #MPL2026 and #PredictAndWin are always added automatically.
        </p>
      </div>

      {/* Preview */}
      <div className="rounded-lg bg-muted/50 p-3 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Preview hashtags on card:</p>
        <p className="text-sm">
          {hashtagsInput
            .split(',')
            .map((h) => h.trim())
            .filter(Boolean)
            .map((h) => (h.startsWith('#') ? h : `#${h}`))
            .join('  ')}
          {'  #MPL2026  #PredictAndWin'}
        </p>
      </div>

      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? 'Saving…' : 'Save Changes'}
      </Button>
    </div>
  );
}

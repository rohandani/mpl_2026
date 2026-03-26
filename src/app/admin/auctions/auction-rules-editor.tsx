'use client';

import { useState, useTransition } from 'react';
import { updateAuctionRulesHtml } from './actions';

interface Props {
  initialHtml: string;
}

export function AuctionRulesEditor({ initialHtml }: Props) {
  const [html, setHtml] = useState(initialHtml);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      const res = await updateAuctionRulesHtml(html);
      if (res.success) setSaved(true);
    });
  }

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div>
        <p className="text-sm font-medium">📋 Auction Rules (HTML)</p>
        <p className="text-xs text-muted-foreground">
          Use HTML tags like &lt;b&gt;, &lt;i&gt;, &lt;ul&gt;, &lt;li&gt; to format the rules shown on the predictions page.
        </p>
      </div>
      <textarea
        value={html}
        onChange={(e) => {
          setHtml(e.target.value);
          setSaved(false);
        }}
        rows={6}
        className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-mono outline-none focus:border-ring focus:ring-2 focus:ring-ring/50"
      />
      {html && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
          <p className="text-xs font-medium text-blue-800 mb-1">Preview:</p>
          <div
            className="prose prose-sm prose-blue max-w-none [&_ul]:list-disc [&_ul]:list-inside [&_ol]:list-decimal [&_ol]:list-inside [&_li]:my-0.5"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save Rules'}
        </button>
        {saved && <span className="text-xs text-green-600">Saved ✓</span>}
      </div>
    </div>
  );
}

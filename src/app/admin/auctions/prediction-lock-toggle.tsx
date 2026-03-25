'use client';

import { useTransition, useState } from 'react';
import { togglePredictionLock } from './actions';

interface Props {
  initialLocked: boolean;
}

export function PredictionLockToggle({ initialLocked }: Props) {
  const [locked, setLocked] = useState(initialLocked);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !locked;
    startTransition(async () => {
      const result = await togglePredictionLock(next);
      if (result.success) {
        setLocked(next);
      }
    });
  }

  return (
    <div className={`flex items-center justify-between rounded-xl border p-4 ${locked ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950' : 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950'}`}>
      <div>
        <p className="text-sm font-medium">
          Predictions are currently{' '}
          <span className={locked ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
            {locked ? 'locked' : 'open'}
          </span>
        </p>
        <p className="text-xs text-muted-foreground">
          {locked ? 'Users cannot submit or update predictions.' : 'Users can submit and update predictions.'}
        </p>
      </div>
      <button
        onClick={handleToggle}
        disabled={isPending}
        className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${locked ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
      >
        {isPending ? 'Updating…' : locked ? 'Unlock Predictions' : 'Lock Predictions'}
      </button>
    </div>
  );
}

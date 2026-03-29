'use client';

import { useState } from 'react';
import type { ScoreRow } from './page';

type SortKey = 'playerName' | 'totalPoints' | 'predictedPrice' | 'soldPrice';
type Filter = 'all' | 'results' | 'pending';

interface Props {
  rows: ScoreRow[];
}

export function ScoresTable({ rows }: Props) {
  const [filter, setFilter] = useState<Filter>('all');
  const [sortKey, setSortKey] = useState<SortKey>('totalPoints');
  const [sortAsc, setSortAsc] = useState(false);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(key === 'playerName'); }
  }

  const filtered = rows.filter((r) => {
    if (filter === 'results') return r.hasResult;
    if (filter === 'pending') return !r.hasResult;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'playerName': cmp = a.playerName.localeCompare(b.playerName); break;
      case 'totalPoints': cmp = a.totalPoints - b.totalPoints; break;
      case 'predictedPrice': cmp = a.predictedPrice - b.predictedPrice; break;
      case 'soldPrice': cmp = (a.soldPrice ?? 0) - (b.soldPrice ?? 0); break;
    }
    return sortAsc ? cmp : -cmp;
  });

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: rows.length },
    { key: 'results', label: '📊 Results', count: rows.filter((r) => r.hasResult).length },
    { key: 'pending', label: '⏳ Pending', count: rows.filter((r) => !r.hasResult).length },
  ];

  const arrow = (key: SortKey) =>
    sortKey === key ? (sortAsc ? ' ↑' : ' ↓') : '';

  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No predictions yet. Head to the auction page to start predicting.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-white text-muted-foreground ring-1 ring-border hover:bg-muted'
            }`}
          >
            {f.label}
            <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
              filter === f.key
                ? 'bg-primary-foreground/20 text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-left text-xs text-muted-foreground">
              <th
                className="px-3 py-2 font-medium cursor-pointer select-none"
                onClick={() => toggleSort('playerName')}
              >
                Player{arrow('playerName')}
              </th>
              <th
                className="px-3 py-2 font-medium cursor-pointer select-none"
                onClick={() => toggleSort('predictedPrice')}
              >
                Your Prediction{arrow('predictedPrice')}
              </th>
              <th
                className="px-3 py-2 font-medium cursor-pointer select-none"
                onClick={() => toggleSort('soldPrice')}
              >
                Actual{arrow('soldPrice')}
              </th>
              <th
                className="px-3 py-2 font-medium cursor-pointer select-none text-right"
                onClick={() => toggleSort('totalPoints')}
              >
                Points{arrow('totalPoints')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.playerName} className="border-t border-border">
                <td className="px-3 py-2">
                  <span className="font-medium">{row.playerName}</span>
                  <span className="ml-1.5 text-xs text-muted-foreground">{row.role}</span>
                </td>
                <td className="px-3 py-2">
                  <span className="text-sm">${row.predictedPrice.toLocaleString()}</span>
                  <span
                    className="ml-1.5 text-xs font-medium"
                    style={{ color: row.predictedTeamColor }}
                  >
                    {row.predictedTeamName}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {row.hasResult ? (
                    <>
                      <span className="text-sm">${row.soldPrice!.toLocaleString()}</span>
                      <span
                        className="ml-1.5 text-xs font-medium"
                        style={{ color: row.soldTeamColor ?? undefined }}
                      >
                        {row.soldTeamName}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">Pending</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  {row.hasResult ? (
                    <div>
                      <span className="font-semibold text-primary">{row.totalPoints}</span>
                      <div className="text-[10px] text-muted-foreground">
                        🎯 {row.teamPoints} · 💰 {row.pricePoints}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

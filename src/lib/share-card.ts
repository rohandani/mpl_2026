/**
 * Generates a branded MPL 2026 share card as a PNG blob using Canvas API.
 */

import QRCode from 'qrcode';

export interface ShareCardData {
  userName: string;
  /** Configurable subtitle, e.g. "Auction Predictions" */
  title?: string;
  /** Configurable hashtags from admin, e.g. ["#CricketAuction"] */
  customHashtags?: string[];
  /** e.g. "12 / 20 predicted" */
  predictionsText?: string;
  /** e.g. "195 pts" */
  scoreText?: string;
  /** e.g. "#3 on Leaderboard" */
  rankText?: string;
  /** Custom tagline */
  tagline?: string;
}

const APP_URL = 'https://mpl-2026-hazel.vercel.app';
const CARD_W = 1080;
const CARD_H = 1350; // Taller to fit QR code (4:5 ratio, ideal for Instagram)
const PERMANENT_HASHTAGS = ['#MPL2026', '#PredictAndWin'];

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function generateShareCard(data: ShareCardData): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext('2d')!;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  bg.addColorStop(0, '#f0fdf4');
  bg.addColorStop(0.5, '#ffffff');
  bg.addColorStop(1, '#fefce8');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Top accent bar
  const bar = ctx.createLinearGradient(0, 0, CARD_W, 0);
  bar.addColorStop(0, '#059669');
  bar.addColorStop(0.6, '#10b981');
  bar.addColorStop(1, '#f59e0b');
  ctx.fillStyle = bar;
  ctx.fillRect(0, 0, CARD_W, 12);

  // Load and draw logo
  try {
    const logo = await loadImage('/mpl-logo.png');
    ctx.drawImage(logo, CARD_W / 2 - 60, 60, 120, 120);
  } catch {
    // Logo failed to load, skip
  }

  // Title
  ctx.textAlign = 'center';
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 64px system-ui, -apple-system, sans-serif';
  ctx.fillText('MPL', CARD_W / 2 - 60, 250);
  ctx.fillStyle = '#059669';
  ctx.fillText('2026', CARD_W / 2 + 80, 250);

  // Configurable subtitle
  const subtitle = data.title ?? 'Auction Predictions';
  ctx.fillStyle = '#6b7280';
  ctx.font = '32px system-ui, -apple-system, sans-serif';
  ctx.fillText(subtitle, CARD_W / 2, 300);

  // User name
  ctx.fillStyle = '#1a1a1a';
  ctx.font = 'bold 48px system-ui, -apple-system, sans-serif';
  ctx.fillText(data.userName, CARD_W / 2, 400);

  // Stats cards
  const stats: { label: string; value: string }[] = [];
  if (data.predictionsText) stats.push({ label: 'Predictions', value: data.predictionsText });
  if (data.scoreText) stats.push({ label: 'Score', value: data.scoreText });
  if (data.rankText) stats.push({ label: 'Rank', value: data.rankText });

  let nextY = 460;

  if (stats.length > 0) {
    const cardW = 260;
    const cardH = 120;
    const gap = 30;
    const totalW = stats.length * cardW + (stats.length - 1) * gap;
    const startX = (CARD_W - totalW) / 2;

    stats.forEach((stat, i) => {
      const x = startX + i * (cardW + gap);
      roundRect(ctx, x, nextY, cardW, cardH, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#059669';
      ctx.font = 'bold 40px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(stat.value, x + cardW / 2, nextY + 55);

      ctx.fillStyle = '#9ca3af';
      ctx.font = '24px system-ui, -apple-system, sans-serif';
      ctx.fillText(stat.label, x + cardW / 2, nextY + 95);
    });

    nextY += cardH + 50;
  }

  // Tagline
  const tagline = data.tagline ?? 'Think you can beat me? Join now!';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#374151';
  ctx.font = '36px system-ui, -apple-system, sans-serif';
  ctx.fillText(tagline, CARD_W / 2, nextY);
  nextY += 50;

  // QR Code
  try {
    const qrDataUrl = await QRCode.toDataURL(APP_URL, {
      width: 200,
      margin: 1,
      color: { dark: '#1a1a1a', light: '#00000000' },
    });
    const qrImg = await loadImage(qrDataUrl);
    const qrSize = 200;

    // QR background card
    roundRect(ctx, CARD_W / 2 - qrSize / 2 - 20, nextY - 10, qrSize + 40, qrSize + 70, 16);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.drawImage(qrImg, CARD_W / 2 - qrSize / 2, nextY, qrSize, qrSize);

    // "Scan to join" label
    ctx.fillStyle = '#6b7280';
    ctx.font = '22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Scan to join', CARD_W / 2, nextY + qrSize + 35);

    nextY += qrSize + 90;
  } catch {
    // QR generation failed, skip
    nextY += 20;
  }

  // Hashtags: custom from config + permanent
  const allHashtags = [...(data.customHashtags ?? []), ...PERMANENT_HASHTAGS];
  const uniqueHashtags = [...new Set(allHashtags)];
  ctx.fillStyle = '#9ca3af';
  ctx.font = '26px system-ui, -apple-system, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(uniqueHashtags.join('  '), CARD_W / 2, nextY);

  // Bottom accent bar
  ctx.fillStyle = bar;
  ctx.fillRect(0, CARD_H - 12, CARD_W, 12);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), 'image/png');
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

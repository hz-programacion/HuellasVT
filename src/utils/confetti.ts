import confetti from 'canvas-confetti';

export function triggerHappyEndingConfetti(): void {
  try {
    // Left side burst
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 60,
      origin: { x: 0.1, y: 0.7 },
      colors: ['#10B981', '#F59E0B', '#FF4D38', '#7C3AED'],
    });

    // Right side burst
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 60,
      origin: { x: 0.9, y: 0.7 },
      colors: ['#10B981', '#F59E0B', '#FF4D38', '#7C3AED'],
    });

    // Center gold stars shower
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 100,
        origin: { x: 0.5, y: 0.4 },
        colors: ['#F59E0B', '#FBBF24', '#10B981'],
        shapes: ['circle'],
        scalar: 1.2,
      });
    }, 250);
  } catch (err) {
    console.warn('Confetti effect error:', err);
  }
}

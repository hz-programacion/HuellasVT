import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTargetDimensions, formatFileSize } from './imageCompressor';

test('calculateTargetDimensions scales down images larger than max boundary preserving ratio', () => {
  // Horizontal landscape 1200x800 with max 600
  const landscape = calculateTargetDimensions(1200, 800, 600);
  assert.equal(landscape.width, 600);
  assert.equal(landscape.height, 400);

  // Vertical portrait 900x1800 with max 600
  const portrait = calculateTargetDimensions(900, 1800, 600);
  assert.equal(portrait.width, 300);
  assert.equal(portrait.height, 600);

  // Already smaller image 400x300 with max 600 should stay 400x300
  const small = calculateTargetDimensions(400, 300, 600);
  assert.equal(small.width, 400);
  assert.equal(small.height, 300);
});

test('formatFileSize converts KB and MB properly', () => {
  assert.equal(formatFileSize(45), '45 KB');
  assert.equal(formatFileSize(1024), '1.0 MB');
  assert.equal(formatFileSize(3500), '3.4 MB');
});

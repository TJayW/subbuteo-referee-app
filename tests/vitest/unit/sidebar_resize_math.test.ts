/**
 * Unit tests for pure sidebar resize math functions
 */

import { describe, it, expect } from 'vitest';
import {
  clampWidth,
  nearestSnap,
  nextSnap,
  computeWidthFromDrag,
  isCollapsed,
  applySnap,
} from '@/utils/sidebar-resize';

const SNAP_POINTS = [80, 280, 320] as const;
const SNAP_THRESHOLD = 12;
const MIN_WIDTH = 80;
const MAX_WIDTH = 360;
const COLLAPSE_THRESHOLD = 120;

describe('Sidebar Resize - Pure Functions', () => {
  describe('clampWidth', () => {
    it('clamps below minimum', () => {
      expect(clampWidth(50, MIN_WIDTH, MAX_WIDTH)).toBe(80);
    });

    it('clamps above maximum', () => {
      expect(clampWidth(400, MIN_WIDTH, MAX_WIDTH)).toBe(360);
    });

    it('keeps value within bounds', () => {
      expect(clampWidth(200, MIN_WIDTH, MAX_WIDTH)).toBe(200);
    });

    it('returns min when equal to min', () => {
      expect(clampWidth(80, MIN_WIDTH, MAX_WIDTH)).toBe(80);
    });

    it('returns max when equal to max', () => {
      expect(clampWidth(360, MIN_WIDTH, MAX_WIDTH)).toBe(360);
    });
  });

  describe('nearestSnap', () => {
    it('snaps to 80 when within threshold', () => {
      expect(nearestSnap(75, SNAP_POINTS, SNAP_THRESHOLD)).toBe(80);
      expect(nearestSnap(85, SNAP_POINTS, SNAP_THRESHOLD)).toBe(80);
      expect(nearestSnap(92, SNAP_POINTS, SNAP_THRESHOLD)).toBe(80);
    });

    it('snaps to 280 when within threshold', () => {
      expect(nearestSnap(275, SNAP_POINTS, SNAP_THRESHOLD)).toBe(280);
      expect(nearestSnap(285, SNAP_POINTS, SNAP_THRESHOLD)).toBe(280);
      expect(nearestSnap(292, SNAP_POINTS, SNAP_THRESHOLD)).toBe(280);
    });

    it('snaps to 320 when within threshold', () => {
      expect(nearestSnap(315, SNAP_POINTS, SNAP_THRESHOLD)).toBe(320);
      expect(nearestSnap(325, SNAP_POINTS, SNAP_THRESHOLD)).toBe(320);
      expect(nearestSnap(332, SNAP_POINTS, SNAP_THRESHOLD)).toBe(320);
    });

    it('returns null when outside all thresholds', () => {
      expect(nearestSnap(150, SNAP_POINTS, SNAP_THRESHOLD)).toBe(null);
      expect(nearestSnap(250, SNAP_POINTS, SNAP_THRESHOLD)).toBe(null);
      expect(nearestSnap(340, SNAP_POINTS, SNAP_THRESHOLD)).toBe(null);
    });

    it('snaps to closest when between two snap points', () => {
      // 180 is closer to 280 than 80, but outside threshold of both
      expect(nearestSnap(180, SNAP_POINTS, SNAP_THRESHOLD)).toBe(null);
    });
  });

  describe('nextSnap', () => {
    it('cycles 80 → 280', () => {
      expect(nextSnap(80, SNAP_POINTS)).toBe(280);
    });

    it('cycles 280 → 320', () => {
      expect(nextSnap(280, SNAP_POINTS)).toBe(320);
    });

    it('cycles 320 → 80 (wraps around)', () => {
      expect(nextSnap(320, SNAP_POINTS)).toBe(80);
    });

    it('goes to first snap when not on any snap', () => {
      expect(nextSnap(150, SNAP_POINTS)).toBe(80);
      expect(nextSnap(250, SNAP_POINTS)).toBe(80);
    });
  });

  describe('computeWidthFromDrag', () => {
    it('adds positive delta', () => {
      expect(computeWidthFromDrag(200, 50, MIN_WIDTH, MAX_WIDTH)).toBe(250);
    });

    it('subtracts negative delta', () => {
      expect(computeWidthFromDrag(200, -50, MIN_WIDTH, MAX_WIDTH)).toBe(150);
    });

    it('clamps to min on large negative delta', () => {
      expect(computeWidthFromDrag(200, -200, MIN_WIDTH, MAX_WIDTH)).toBe(80);
    });

    it('clamps to max on large positive delta', () => {
      expect(computeWidthFromDrag(200, 200, MIN_WIDTH, MAX_WIDTH)).toBe(360);
    });
  });

  describe('isCollapsed', () => {
    it('returns true when width is below threshold', () => {
      expect(isCollapsed(80, COLLAPSE_THRESHOLD)).toBe(true);
      expect(isCollapsed(100, COLLAPSE_THRESHOLD)).toBe(true);
      expect(isCollapsed(120, COLLAPSE_THRESHOLD)).toBe(true);
    });

    it('returns false when width is above threshold', () => {
      expect(isCollapsed(121, COLLAPSE_THRESHOLD)).toBe(false);
      expect(isCollapsed(280, COLLAPSE_THRESHOLD)).toBe(false);
    });
  });

  describe('applySnap', () => {
    it('snaps when within threshold', () => {
      expect(applySnap(275, SNAP_POINTS, SNAP_THRESHOLD)).toBe(280);
      expect(applySnap(85, SNAP_POINTS, SNAP_THRESHOLD)).toBe(80);
    });

    it('keeps width when outside threshold', () => {
      expect(applySnap(150, SNAP_POINTS, SNAP_THRESHOLD)).toBe(150);
      expect(applySnap(250, SNAP_POINTS, SNAP_THRESHOLD)).toBe(250);
    });
  });
});

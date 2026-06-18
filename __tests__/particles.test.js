const { random, computeMouseInfluence, computeLineAlpha, wrapCoordinate } = require('../particles');

describe('particles.js', () => {
  describe('random', () => {
    it('returns a value within [min, max]', () => {
      for (let i = 0; i < 100; i++) {
        const val = random(5, 10);
        expect(val).toBeGreaterThanOrEqual(5);
        expect(val).toBeLessThanOrEqual(10);
      }
    });

    it('returns min when Math.random returns 0', () => {
      const spy = jest.spyOn(Math, 'random').mockReturnValue(0);
      expect(random(3, 7)).toBe(3);
      spy.mockRestore();
    });

    it('returns max when Math.random returns 1', () => {
      const spy = jest.spyOn(Math, 'random').mockReturnValue(1);
      expect(random(3, 7)).toBeCloseTo(7);
      spy.mockRestore();
    });

    it('handles negative ranges', () => {
      for (let i = 0; i < 50; i++) {
        const val = random(-10, -5);
        expect(val).toBeGreaterThanOrEqual(-10);
        expect(val).toBeLessThanOrEqual(-5);
      }
    });

    it('handles zero-width range', () => {
      expect(random(5, 5)).toBe(5);
    });
  });

  describe('computeMouseInfluence', () => {
    it('returns zero displacement when particle is outside influence radius', () => {
      const result = computeMouseInfluence(200, 200, 0, 0, 180, 0.2, 1);
      expect(result.dx).toBe(0);
      expect(result.dy).toBe(0);
    });

    it('returns non-zero displacement when particle is within influence radius', () => {
      const result = computeMouseInfluence(50, 50, 40, 40, 180, 0.2, 1);
      expect(result.dx).not.toBe(0);
      expect(result.dy).not.toBe(0);
    });

    it('repels particle away from mouse (positive direction)', () => {
      // Particle at (100,100), mouse at (90,90) -> particle moves in positive direction
      const result = computeMouseInfluence(100, 100, 90, 90, 180, 0.2, 1);
      expect(result.dx).toBeGreaterThan(0);
      expect(result.dy).toBeGreaterThan(0);
    });

    it('repels particle away from mouse (negative direction)', () => {
      // Particle at (50,50), mouse at (60,60) -> particle moves in negative direction
      const result = computeMouseInfluence(50, 50, 60, 60, 180, 0.2, 1);
      expect(result.dx).toBeLessThan(0);
      expect(result.dy).toBeLessThan(0);
    });

    it('stronger force per unit distance when closer to mouse', () => {
      // Use same offset from mouse to isolate force factor
      const close = computeMouseInfluence(100, 90, 90, 90, 180, 0.2, 1);
      const far = computeMouseInfluence(160, 90, 90, 90, 180, 0.2, 1);
      // Normalize by dx to compare force: close has dx=10, far has dx=70
      const closeForce = close.dx / 10;
      const farForce = far.dx / 70;
      expect(closeForce).toBeGreaterThan(farForce);
    });

    it('scales with delta parameter', () => {
      const d1 = computeMouseInfluence(100, 100, 90, 90, 180, 0.2, 1);
      const d2 = computeMouseInfluence(100, 100, 90, 90, 180, 0.2, 2);
      expect(d2.dx).toBeCloseTo(d1.dx * 2);
      expect(d2.dy).toBeCloseTo(d1.dy * 2);
    });

    it('returns zero when particle is exactly at boundary', () => {
      // Distance = exactly influenceRadius
      const result = computeMouseInfluence(180, 0, 0, 0, 180, 0.2, 1);
      expect(result.dx).toBe(0);
      expect(result.dy).toBe(0);
    });
  });

  describe('computeLineAlpha', () => {
    it('returns 0 when distance >= connectDistance', () => {
      expect(computeLineAlpha(140, 140, 0.12)).toBe(0);
      expect(computeLineAlpha(200, 140, 0.12)).toBe(0);
    });

    it('returns full lineAlpha when distance is 0', () => {
      expect(computeLineAlpha(0, 140, 0.12)).toBeCloseTo(0.12);
    });

    it('returns proportional alpha for intermediate distances', () => {
      const alpha = computeLineAlpha(70, 140, 0.12);
      expect(alpha).toBeCloseTo(0.06); // half distance = half alpha
    });

    it('scales linearly with distance', () => {
      const a1 = computeLineAlpha(35, 140, 0.12);
      const a2 = computeLineAlpha(105, 140, 0.12);
      // a1 should be 3x a2 (75% vs 25% remaining)
      expect(a1).toBeCloseTo(a2 * 3);
    });
  });

  describe('wrapCoordinate', () => {
    it('wraps to opposite side when below negative margin', () => {
      expect(wrapCoordinate(-25, 800, 20)).toBe(820);
    });

    it('wraps to opposite side when above limit + margin', () => {
      expect(wrapCoordinate(825, 800, 20)).toBe(-20);
    });

    it('returns value unchanged when within bounds', () => {
      expect(wrapCoordinate(400, 800, 20)).toBe(400);
    });

    it('returns value at exact negative margin boundary', () => {
      expect(wrapCoordinate(-20, 800, 20)).toBe(-20);
    });

    it('returns value at exact positive boundary', () => {
      expect(wrapCoordinate(820, 800, 20)).toBe(820);
    });

    it('handles zero limit', () => {
      expect(wrapCoordinate(-25, 0, 20)).toBe(20);
    });
  });
});

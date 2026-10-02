/**
 * @jest-environment jsdom
 */

// Mock browser APIs not available in jsdom
global.IntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

const {
  computeMousePercent,
  computeHeroPercent,
  computeStartupVisuals,
  computeScrollProgress,
  findActiveSection,
  splitTextIntoWords,
  STARTUP_RING_LENGTH,
  STARTUP_STATUSES,
} = require('../script');

describe('script.js', () => {
  describe('computeMousePercent', () => {
    it('computes center as 50%', () => {
      const result = computeMousePercent(512, 384, 1024, 768);
      expect(result.x).toBe(50);
      expect(result.y).toBe(50);
    });

    it('computes top-left corner as 0%', () => {
      const result = computeMousePercent(0, 0, 1024, 768);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it('computes bottom-right corner as 100%', () => {
      const result = computeMousePercent(1024, 768, 1024, 768);
      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
    });

    it('handles arbitrary positions correctly', () => {
      const result = computeMousePercent(256, 192, 1024, 768);
      expect(result.x).toBe(25);
      expect(result.y).toBe(25);
    });
  });

  describe('computeHeroPercent', () => {
    const rect = { left: 100, top: 50, width: 800, height: 600 };

    it('computes center of hero', () => {
      const result = computeHeroPercent(500, 350, rect);
      expect(result.x).toBe(50);
      expect(result.y).toBe(50);
    });

    it('clamps to 0 when cursor is before hero', () => {
      const result = computeHeroPercent(0, 0, rect);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it('clamps to 100 when cursor is past hero', () => {
      const result = computeHeroPercent(1000, 800, rect);
      expect(result.x).toBe(100);
      expect(result.y).toBe(100);
    });

    it('handles exact boundaries', () => {
      const result = computeHeroPercent(100, 50, rect);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });
  });

  describe('computeStartupVisuals', () => {
    it('returns 0% state correctly', () => {
      const result = computeStartupVisuals(0, STARTUP_RING_LENGTH, STARTUP_STATUSES);
      expect(result.width).toBe('0%');
      expect(result.label).toBe('0%');
      expect(result.dashoffset).toBe(STARTUP_RING_LENGTH);
      expect(result.statusText).toBe('Booting environment');
    });

    it('returns 100% state correctly', () => {
      const result = computeStartupVisuals(100, STARTUP_RING_LENGTH, STARTUP_STATUSES);
      expect(result.width).toBe('100%');
      expect(result.label).toBe('100%');
      expect(result.dashoffset).toBe(0);
      expect(result.statusText).toBe('Almost ready');
    });

    it('returns 50% state correctly', () => {
      const result = computeStartupVisuals(50, STARTUP_RING_LENGTH, STARTUP_STATUSES);
      expect(result.width).toBe('50%');
      expect(result.label).toBe('50%');
      expect(result.dashoffset).toBe(STARTUP_RING_LENGTH * 0.5);
      expect(result.statusText).toBe('Preparing interface');
    });

    it('returns correct status for 75%', () => {
      const result = computeStartupVisuals(75, STARTUP_RING_LENGTH, STARTUP_STATUSES);
      expect(result.statusText).toBe('Almost ready');
    });

    it('rounds label for fractional percents', () => {
      const result = computeStartupVisuals(33.3, STARTUP_RING_LENGTH, STARTUP_STATUSES);
      expect(result.label).toBe('33%');
    });

    it('handles custom ring length', () => {
      const result = computeStartupVisuals(25, 1000, STARTUP_STATUSES);
      expect(result.dashoffset).toBe(750);
    });
  });

  describe('computeScrollProgress', () => {
    it('returns 0 at top of page', () => {
      expect(computeScrollProgress(0, 2000, 800)).toBe(0);
    });

    it('returns 100 at bottom of page', () => {
      expect(computeScrollProgress(1200, 2000, 800)).toBe(100);
    });

    it('returns 50 at midpoint', () => {
      expect(computeScrollProgress(600, 2000, 800)).toBe(50);
    });

    it('returns 0 when document height equals window height', () => {
      expect(computeScrollProgress(0, 800, 800)).toBe(0);
    });

    it('handles very short documents', () => {
      expect(computeScrollProgress(0, 100, 800)).toBe(0);
    });
  });

  describe('findActiveSection', () => {
    const sections = [
      { id: 'about', top: 500 },
      { id: 'work', top: 1000 },
      { id: 'contact', top: 1500 },
    ];

    it('returns home when at top', () => {
      expect(findActiveSection(0, sections, 120)).toBe('home');
    });

    it('returns about when scrolled past about section', () => {
      expect(findActiveSection(400, sections, 120)).toBe('about');
    });

    it('returns work when scrolled past work section', () => {
      expect(findActiveSection(900, sections, 120)).toBe('work');
    });

    it('returns contact when scrolled past contact section', () => {
      expect(findActiveSection(1400, sections, 120)).toBe('contact');
    });

    it('uses offset to activate section early', () => {
      // 500 - 120 = 380, so scrollTop of 380 should activate about
      expect(findActiveSection(380, sections, 120)).toBe('about');
    });

    it('returns home with empty sections', () => {
      expect(findActiveSection(1000, [], 120)).toBe('home');
    });
  });

  describe('splitTextIntoWords', () => {
    it('splits simple sentence into words', () => {
      const result = splitTextIntoWords('hello world');
      expect(result).toEqual([
        { isSpace: false, text: 'hello' },
        { isSpace: true, text: ' ' },
        { isSpace: false, text: 'world' },
      ]);
    });

    it('handles multiple spaces', () => {
      const result = splitTextIntoWords('a  b');
      expect(result).toEqual([
        { isSpace: false, text: 'a' },
        { isSpace: true, text: '  ' },
        { isSpace: false, text: 'b' },
      ]);
    });

    it('handles single word', () => {
      const result = splitTextIntoWords('hello');
      expect(result).toEqual([{ isSpace: false, text: 'hello' }]);
    });

    it('handles leading whitespace', () => {
      const result = splitTextIntoWords(' hi');
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ isSpace: false, text: '' });
      expect(result[1]).toEqual({ isSpace: true, text: ' ' });
      expect(result[2]).toEqual({ isSpace: false, text: 'hi' });
    });

    it('handles tabs and newlines as spaces', () => {
      const result = splitTextIntoWords('a\tb');
      expect(result[1].isSpace).toBe(true);
    });
  });

  describe('constants', () => {
    it('STARTUP_RING_LENGTH is 942', () => {
      expect(STARTUP_RING_LENGTH).toBe(942);
    });

    it('STARTUP_STATUSES has 4 entries', () => {
      expect(STARTUP_STATUSES).toHaveLength(4);
    });

    it('STARTUP_STATUSES are all strings', () => {
      STARTUP_STATUSES.forEach((s) => {
        expect(typeof s).toBe('string');
      });
    });
  });
});

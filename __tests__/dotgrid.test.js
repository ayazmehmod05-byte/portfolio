/**
 * @jest-environment jsdom
 */

const { clamp, createCanvas, DevicePixelRatioScale, initDotGrid } = require('../dotgrid');

describe('dotgrid.js', () => {
  describe('clamp', () => {
    it('returns value when within bounds', () => {
      expect(clamp(5, 0, 10)).toBe(5);
    });

    it('clamps to minimum when value is below', () => {
      expect(clamp(-3, 0, 10)).toBe(0);
    });

    it('clamps to maximum when value is above', () => {
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it('returns min when value equals min', () => {
      expect(clamp(0, 0, 10)).toBe(0);
    });

    it('returns max when value equals max', () => {
      expect(clamp(10, 0, 10)).toBe(10);
    });

    it('handles negative ranges', () => {
      expect(clamp(-5, -10, -1)).toBe(-5);
      expect(clamp(-15, -10, -1)).toBe(-10);
      expect(clamp(0, -10, -1)).toBe(-1);
    });

    it('handles zero-width range', () => {
      expect(clamp(5, 3, 3)).toBe(3);
      expect(clamp(1, 3, 3)).toBe(3);
    });
  });

  describe('createCanvas', () => {
    it('creates a canvas element inside container', () => {
      const container = document.createElement('div');
      const canvas = createCanvas(container);

      expect(canvas.tagName).toBe('CANVAS');
      expect(container.contains(canvas)).toBe(true);
    });

    it('sets canvas to absolute positioning', () => {
      const container = document.createElement('div');
      const canvas = createCanvas(container);

      expect(canvas.style.position).toBe('absolute');
      expect(canvas.style.left).toBe('0px');
      expect(canvas.style.top).toBe('0px');
      expect(canvas.style.width).toBe('100%');
      expect(canvas.style.height).toBe('100%');
      expect(canvas.style.pointerEvents).toBe('none');
    });

    it('sets container to relative if not already positioned', () => {
      const container = document.createElement('div');
      createCanvas(container);
      expect(container.style.position).toBe('relative');
    });

    it('preserves existing container position', () => {
      const container = document.createElement('div');
      container.style.position = 'fixed';
      createCanvas(container);
      expect(container.style.position).toBe('fixed');
    });
  });

  describe('DevicePixelRatioScale', () => {
    it('returns an object with ctx and resize function', () => {
      const canvas = document.createElement('canvas');
      const mockCtx = { setTransform: jest.fn() };
      jest.spyOn(canvas, 'getContext').mockReturnValue(mockCtx);

      const result = DevicePixelRatioScale(canvas);

      expect(result).toHaveProperty('ctx');
      expect(result.ctx).toBe(mockCtx);
      expect(result).toHaveProperty('resize');
      expect(typeof result.resize).toBe('function');

      canvas.getContext.mockRestore();
    });

    it('resize scales canvas to device pixel ratio', () => {
      const canvas = document.createElement('canvas');
      const mockCtx = { setTransform: jest.fn() };
      jest.spyOn(canvas, 'getContext').mockReturnValue(mockCtx);
      jest.spyOn(canvas, 'getBoundingClientRect').mockReturnValue({
        width: 400, height: 300, left: 0, top: 0,
      });
      Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true });

      const { resize } = DevicePixelRatioScale(canvas);
      resize();

      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(600);
      expect(mockCtx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);

      canvas.getContext.mockRestore();
      canvas.getBoundingClientRect.mockRestore();
    });
  });

  describe('initDotGrid', () => {
    it('returns null when container is falsy', () => {
      const result = initDotGrid(null);
      expect(result).toBeUndefined();
    });

    it('returns an object with destroy method when container is valid', () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'getBoundingClientRect', {
        value: () => ({ width: 200, height: 200, left: 0, top: 0 }),
      });
      // Mock canvas getContext
      const mockCtx = {
        setTransform: jest.fn(),
        clearRect: jest.fn(),
        fillStyle: '',
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
      };
      jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockCtx);

      const result = initDotGrid(container);
      expect(result).toHaveProperty('destroy');
      expect(typeof result.destroy).toBe('function');

      result.destroy();
      HTMLCanvasElement.prototype.getContext.mockRestore();
    });

    it('accepts custom configuration options', () => {
      const container = document.createElement('div');
      Object.defineProperty(container, 'getBoundingClientRect', {
        value: () => ({ width: 100, height: 100, left: 0, top: 0 }),
      });
      const mockCtx = {
        setTransform: jest.fn(),
        clearRect: jest.fn(),
        fillStyle: '',
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
      };
      jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockCtx);

      const result = initDotGrid(container, { dotSize: 8, gap: 40 });
      expect(result).toHaveProperty('destroy');
      result.destroy();
      HTMLCanvasElement.prototype.getContext.mockRestore();
    });
  });
});

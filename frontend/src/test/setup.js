import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { server } from '../mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => {
  server.resetHandlers();
  cleanup(); // ensure every test gets a clean DOM
});
afterAll(() => server.close());

// jsdom doesn't implement matchMedia — patch it so framer-motion / recharts don't crash
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Silence framer-motion ResizeObserver warning in jsdom
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// useCanvasCursor calls canvas.getContext('2d') — stub every method it uses
const noop = () => {};
HTMLCanvasElement.prototype.getContext = () => new Proxy({}, { get: () => noop });

import '@testing-library/jest-dom/vitest';
import 'vitest-canvas-mock';

if (typeof document !== 'undefined') document.queryCommandSupported = () => false;

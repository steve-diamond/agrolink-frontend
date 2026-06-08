export const server: {
  listen: (...args: unknown[]) => void;
  resetHandlers: (...args: unknown[]) => void;
  close: (...args: unknown[]) => void;
  use: (...args: unknown[]) => void;
};

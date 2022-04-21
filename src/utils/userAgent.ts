import { UAParser } from 'ua-parser-js';

export const isMobile = (windowUserAgent: string) => {
  const parser = new UAParser(windowUserAgent);
  const { type } = parser.getDevice();

  return type === 'mobile' || type === 'tablet';
};

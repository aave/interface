import { useColorScheme } from '@mui/material/styles';
import { useEffect } from 'react';

const SVG_ICON_SELECTOR = 'link[rel="icon"][type="image/svg+xml"]';

const ICONS = {
  light: '/favicon-light.svg',
  dark: '/favicon-dark.svg',
} as const;

export const FaviconSwitcher = () => {
  const { mode, systemMode } = useColorScheme();
  const resolvedMode = mode === 'system' ? systemMode : mode;

  useEffect(() => {
    if (!resolvedMode) return;

    let link = document.querySelector<HTMLLinkElement>(SVG_ICON_SELECTOR);
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      document.head.appendChild(link);
    }
    link.href = ICONS[resolvedMode];
  }, [resolvedMode]);

  return null;
};

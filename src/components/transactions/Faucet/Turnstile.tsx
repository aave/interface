/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    turnstile: {
      render: (idOrContainer: string | HTMLElement, options: TurnstileOptions) => string;
      reset: (widgetIdOrContainer?: string | HTMLElement) => void;
      getResponse: (widgetIdOrContainer?: string | HTMLElement) => string | undefined;
      remove: (widgetIdOrContainer?: string | HTMLElement) => void;
    };
  }
}

export interface TurnstileOptions {
  sitekey: string;
  action?: string;
  cData?: string;
  callback?: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  'timeout-callback'?: () => void;
  theme?: 'light' | 'dark' | 'auto'; // defaults to auto
  tabindex?: number;
  'response-field'?: boolean; // defaults to true
  'response-field-name'?: string; // defaults to cf-turnstile-response
  size?: 'normal' | 'invisible' | 'compact';
  retry?: 'auto' | 'never';
  'retry-interval'?: number; // up to 15m (900_000) in ms, default is 8s
}

const global = globalThis ?? window;
let turnstileState = typeof (global as any).turnstile !== 'undefined' ? 'ready' : 'unloaded';
let ensureTurnstile: () => Promise<any>;

// Functions responsible for loading the turnstile api, while also making sure
// to only load it once
{
  const TURNSTILE_LOAD_FUNCTION = 'cf__reactTurnstileOnLoad';
  const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js';

  let turnstileLoad: {
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  };
  const turnstileLoadPromise = new Promise((resolve, reject) => {
    turnstileLoad = { resolve, reject };
    if (turnstileState === 'ready') resolve(undefined);
  });
  (global as any)[TURNSTILE_LOAD_FUNCTION] = () => {
    turnstileLoad.resolve();
    turnstileState = 'ready';
  };

  ensureTurnstile = () => {
    if (turnstileState === 'unloaded') {
      turnstileState = 'loading';
      const url = `${TURNSTILE_SRC}?onload=${TURNSTILE_LOAD_FUNCTION}&render=explicit`;
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.addEventListener('error', () => {
        turnstileLoad.reject('Failed to load Turnstile.');
      });
      document.head.appendChild(script);
    }
    return turnstileLoadPromise;
  };
}

export default function Turnstile({
  id,
  ref: userRef,
  className,
  style,
  sitekey,
  action,
  cData,
  theme,
  size,
  tabIndex,
  responseField,
  responseFieldName,
  retry,
  retryInterval,
  autoResetOnExpire,
  onVerify,
  onLoad,
  onError,
  onExpire,
  onTimeout,
}: TurnstileProps) {
  const ownRef = useRef<HTMLDivElement | null>(null);
  const inplaceState = useState<TurnstileCallbacks>({ onVerify })[0];

  const ref = userRef ?? ownRef;

  useEffect(() => {
    if (!ref.current) return;
    let cancelled = false;
    let widgetId = '';
    (async () => {
      // load turnstile
      if (turnstileState !== 'ready') {
        try {
          await ensureTurnstile();
        } catch (e) {
          inplaceState.onError?.(e);
          return;
        }
      }
      if (cancelled || !ref.current) return;
      const turnstileOptions: TurnstileOptions = {
        sitekey,
        action,
        cData,
        theme,
        size,
        tabindex: tabIndex,
        callback: (token: string) => inplaceState.onVerify(token),
        'error-callback': () => inplaceState.onError?.(),
        'expired-callback': () => {
          inplaceState.onExpire?.();
          if (autoResetOnExpire) window.turnstile.reset(widgetId);
        },
        'timeout-callback': () => inplaceState.onTimeout?.(),
        'response-field': responseField,
        'response-field-name': responseFieldName,
        retry,
        'retry-interval': retryInterval,
      };

      widgetId = window.turnstile.render(ref.current, turnstileOptions);
      inplaceState.onLoad?.(widgetId);
    })();
    return () => {
      cancelled = true;
      if (widgetId) window.turnstile.remove(widgetId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sitekey,
    action,
    cData,
    theme,
    size,
    tabIndex,
    responseField,
    responseFieldName,
    retry,
    retryInterval,
    autoResetOnExpire,
  ]);
  useEffect(() => {
    inplaceState.onVerify = onVerify;
    inplaceState.onLoad = onLoad;
    inplaceState.onError = onError;
    inplaceState.onExpire = onExpire;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onVerify, onLoad, onError, onExpire, onTimeout]);

  return <div ref={ref} id={id} className={className} style={style} />;
}

interface TurnstileProps extends TurnstileCallbacks {
  sitekey: string;
  action?: string;
  cData?: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'invisible' | 'compact';
  tabIndex?: number;
  responseField?: boolean;
  responseFieldName?: string;
  retry?: 'auto' | 'never';
  retryInterval?: number;
  autoResetOnExpire?: boolean;

  id?: string;
  ref?: React.MutableRefObject<HTMLDivElement>;
  className?: string;
  style?: React.CSSProperties;
}

interface TurnstileCallbacks {
  onVerify: (token: string) => void;
  onLoad?: (widgetId: string) => void;
  onError?: (error?: Error | any) => void;
  onExpire?: () => void;
  onTimeout?: () => void;
}

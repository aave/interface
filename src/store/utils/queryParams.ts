import Router from 'next/router';

/**
 * Pushes a history entry with `key` set to `value`. Pass `currentValue` when the param is state
 * that Back should restore: if the entry being left has no `key` yet, it is stamped with
 * `currentValue` first (in place, no new entry), so going back returns to what it showed.
 */
export const setQueryParameter = (key: string, value: string, currentValue?: string) => {
  if (typeof window === 'undefined') return;

  const push = () =>
    Router.push({ query: { ...getAllQueryParameters(), [key]: value } }, undefined, {
      shallow: true,
    });

  const query = getAllQueryParameters() ?? {};
  if (currentValue && !(key in query)) {
    Router.replace({ query: { ...query, [key]: currentValue } }, undefined, {
      shallow: true,
    }).then(push);
  } else {
    push();
  }
};

export const getQueryParameter = (key: string) => {
  if (typeof window !== 'undefined' && 'URLSearchParams' in window) {
    const proxy = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop as string),
    });
    return (proxy as unknown as { [key: string]: string })[key];
  }
};

export const getAllQueryParameters = () => {
  if (typeof window !== 'undefined' && 'URLSearchParams' in window) {
    const urlSearchParams = new URLSearchParams(window.location.search);
    return Object.fromEntries(urlSearchParams.entries());
  }
};

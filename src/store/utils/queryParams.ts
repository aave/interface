import Router from 'next/router';

export const setQueryParameter = (key: string, value: string) => {
  if (typeof window !== 'undefined') {
    Router.push({ query: { [key]: value } }, undefined, { shallow: true });
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

export const tFetch = <T>(url: string, opts?: RequestInit): Promise<T> => {
  return fetch(url, opts).then((response) => {
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    // HEAD Method doesn't return anything in the body, so response.json() fails, since it's only a method to check
    // if the resource is available it's okay to return never
    if (opts?.method === 'HEAD') return Promise.resolve() as Promise<never>;
    return response.json() as Promise<T>;
  });
};

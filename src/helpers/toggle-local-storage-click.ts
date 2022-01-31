export const toggleLocalStorageClick = (
  value: boolean,
  func: (val: boolean) => void,
  localStorageName: string
) => {
  if (value) {
    localStorage.setItem(localStorageName, 'false');
    func(false);
  } else {
    localStorage.setItem(localStorageName, 'true');
    func(true);
  }
};

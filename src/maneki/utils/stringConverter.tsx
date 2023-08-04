export const countDecimals = (value: string) => {
  const splited = value.split('.');
  if (splited.length === 1) return 0;
  return splited[1].length || 0;
};

export const removeDecimals = (value: string) => {
  const splited = value.split('.');
  return splited.join('');
};

// Converts string with decimal to without decimals multiply by 18
// 0.1 = 100_000_000_000_000_000
export const toWeiString = (value: string) => {
  let splited = removeDecimals(value);
  const decimals = countDecimals(value);
  for (let i = 0; i < 18 - decimals; i++) {
    splited += '0';
  }
  return splited;
};

export const manekiParseUnits = (value: string, units: number) => {
  let splited = removeDecimals(value);
  const decimals = countDecimals(value);
  for (let i = 0; i < units - decimals; i++) {
    splited += '0';
  }
  return splited;
};

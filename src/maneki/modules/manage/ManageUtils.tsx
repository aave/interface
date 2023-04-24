export const countDecimals = (value: string) => {
  const splited = value.split('.');
  if (splited.length === 1) return 0;
  return splited[1].length || 0;
};

export const removeDecimals = (value: string) => {
  const splited = value.split('.');
  return splited.join('');
};

export const toWeiString = (value: string) => {
  let splited = removeDecimals(value);
  const decimals = countDecimals(value);
  for (let i = 0; i < 18 - decimals; i++) {
    splited += '0';
  }
  return splited;
};

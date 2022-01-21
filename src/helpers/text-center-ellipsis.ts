export const textCenterEllipsis = (str: string, from: number, to: number) => {
  return `${str.substr(0, from)}...${str.substr(str.length - to, str.length)}`;
};

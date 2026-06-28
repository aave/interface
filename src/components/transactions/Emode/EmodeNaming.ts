export const getEmodeMessage = (label: string): string => {
  if (label === '') {
    return 'Disabled';
  }
  return label;
};

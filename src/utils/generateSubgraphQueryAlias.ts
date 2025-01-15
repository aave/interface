// subgraph requires aliasing multiple queries of the same entity with alphanumeric characters only
export const generateAliases = (length: number): string[] => {
  const aliases: string[] = [];
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';

  for (let i = 0; i < length; i++) {
    let alias = '';
    let num = i;

    while (num >= 0) {
      alias = alphabet[num % 26] + alias;
      num = Math.floor(num / 26) - 1;
    }

    aliases.push(alias);
  }

  return aliases;
};

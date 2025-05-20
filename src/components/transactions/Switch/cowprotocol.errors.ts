const MESSAGE_MAP: { [key: string]: string } = {
  NoLiquidity: 'No liquidity found for the given amount and asset pair.',
  NoRoutesFound: 'No routes found with enough liquidity.',
  SellAmountDoesNotCoverFee: 'Sell amount is too small to cover the fee.',
};

const MESSAGE_REGEX_MAP: Array<{ regex: RegExp; message: string }> = [
  {
    regex: /^Source and destination tokens cannot be the same$/,
    message: 'Source and destination tokens cannot be the same',
  },
];

export function convertCowProtocolErrorMessage(message: string): string | undefined {
  if (message in MESSAGE_MAP) {
    return MESSAGE_MAP[message];
  }

  const newMessage = MESSAGE_REGEX_MAP.find((mapping) => mapping.regex.test(message))?.message;
  return newMessage;
}

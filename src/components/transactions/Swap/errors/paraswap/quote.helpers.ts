export const MESSAGE_MAP: { [key: string]: string } = {
  ESTIMATED_LOSS_GREATER_THAN_MAX_IMPACT:
    'Price impact too high. Please try a different amount or asset pair.',
  // not sure why this error-code is not upper-cased
  'No routes found with enough liquidity': 'No routes found with enough liquidity.',
};

export const MESSAGE_REGEX_MAP: Array<{ regex: RegExp; message: string }> = [
  {
    regex: /^Amount \d+ is too small to proceed$/,
    message: 'Amount is too small. Please try larger amount.',
  },
];

/**
 * Converts Paraswap error message to message for displaying in interface
 * @param message Paraswap error message
 * @returns Message for displaying in interface
 */
export function convertParaswapErrorMessage(message: string): string | undefined {
  if (message in MESSAGE_MAP) {
    return MESSAGE_MAP[message];
  }

  const newMessage = MESSAGE_REGEX_MAP.find((mapping) => mapping.regex.test(message))?.message;
  return newMessage;
}

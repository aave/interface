// Re-export the SWAP enum from the events file, for clarity within the analytics folder
export { SWAP } from 'src/utils/events';

export enum SwapInputChanges {
  /// The user has changed the input amount
  INPUT_AMOUNT = 'INPUT_AMOUNT',

  /// The user has changed the output amount
  OUTPUT_AMOUNT = 'OUTPUT_AMOUNT',

  /// The user has changed the rate
  RATE_CHANGE = 'RATE_CHANGE',

  /// The user has switched the reserves
  SWITCH_RESERVES = 'SWITCH_RESERVES',

  /// The user has changed the slippage
  SLIPPAGE = 'SLIPPAGE',

  /// The user has changed the network
  NETWORK = 'NETWORK',

  /// The user has changed the input token
  INPUT_TOKEN = 'INPUT_TOKEN',

  /// The user has added a custom token
  ADD_CUSTOM_TOKEN = 'ADD_CUSTOM_TOKEN',

  /// The user has changed the output token
  OUTPUT_TOKEN = 'OUTPUT_TOKEN',

  /// The user has changed the order type
  ORDER_TYPE = 'ORDER_TYPE',

  /// The user has changed the expiry
  EXPIRY = 'EXPIRY',

  /// The user has changed the gas limit
  GAS_LIMIT = 'GAS_LIMIT',

  /// The user approved high price impact warning
  HIGH_PRICE_IMPACT_CONFIRM = 'HIGH_PRICE_IMPACT_CONFIRM',
}

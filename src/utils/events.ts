export const AUTH = {
  CONNECT_WALLET: 'Connect Wallet',
  SWITCH_WALLET: 'Switch Wallet',
  MOCK_WALLET: 'Mock Wallet',
  DISCONNECT_WALLET: 'Disconnect Wallet',
  COPY_ADDRESS: 'Copy Address',
  VIEW_EXPLORER: 'View Explorer',
  VIEW_TX_HISTORY: 'View Transaction History',
  WALLET_CONNECT_START: 'Wallet Connect Start',
  WALLET_CONNECT_SUCCESS: 'Wallet Connect Success',
  WALLET_CONNECT_ABORT: 'Wallet Connect Abort',
} as const;

export const GENERAL = {
  SWITCH_NETWORK: 'Switch network',
  BUY_WITH_FIAT: 'Navigate to fiat onramp', //done
  TOOL_TIP: 'Tool Tip', //done
  EXTERNAL_LINK: 'External Link Navigaton',
  SET_SLIPPAGE: 'Set slippage',
  TOKEN_APPROVAL: 'Token Approval',
  ACCEPT_RISK: 'Accept Risk',
  TRANSACTION: 'Transaction',
  SWAP: 'Swap',
  SWAP_FAILED: 'Swap Failed',
  SWAP_COMPLETED: 'Swap Completed',
  COLLATERAL_SWAP_WITHOUT_FLASHLOAN: 'Collateral Swap without Flashloan',
  COLLATERAL_SWAP_WITH_FLASHLOAN: 'Collateral Swap with Flashloan',
  TRANSACTION_ERROR: 'Transaction Error',
  OPEN_MODAL: 'Open Modal',
  MAX_INPUT_SELECTION: 'Select Max input',
  LIMIT_ORDER: 'Limit Order',
};

export enum SWAP {
  /// The user has requested a quote
  QUOTE = 'SWAP_QUOTE',

  /// The quote has been refreshed
  QUOTE_REFRESHED = 'SWAP_QUOTE_REFRESHED',

  /// The user has changed inputs
  INPUT_CHANGES = 'SWAP_INPUT_CHANGES',

  /// An error has occurred
  ERROR = 'SWAP_ERROR',

  /// The user sent the approval transaction
  APPROVAL = 'SWAP_APPROVAL',

  /// The user has sent the swap order
  SWAP = 'SWAP_EXECUTION',

  /// The user's order has been filled
  SWAP_FILLED = 'SWAP_FILLED',

  /// The user's order has failed
  SWAP_FAILED = 'SWAP_FAILED',
}

export const REWARDS = {
  CLAIM_ALL_REWARDS: 'Claim All Rewards',
  CLAIM_PROTOCOL_REWARDS: 'Claim Protocol Rewards',
  CLAIM_MERIT_REWARDS: 'Claim Merit Rewards',
  CLAIM_INDIVIDUAL_REWARD: 'Claim Individual Reward',
} as const;

export const DASHBOARD = {
  CHANGE_MARKET: 'Change market on dashboard', //done
  VIEW_MARKETS: 'View markets on dashboard', // can be viewed in PAGEVIEW
  VIEW_RISK_DETAILS: 'View risk details on dashboard', // done
  DETAILS_NAVIGATION: 'View reserve details',
  E_MODE: 'E-Mode Actions',
  E_MODE_INFO_DASHBOARD: 'E-Mode toggle dashboard', // done
  VIEW_LM_DETAILS_DASHBOARD: 'View LM details dashboard', // done
  NOTIFY_DASHBOARD: 'Notify dashboard', // done
  TILE_VISBILITY: 'Tile visibility',
  SHOW_ASSETS_0_BALANCE: 'Show assets with zero balance dashboard', // done
  SHOW_ASSETS_SMALL_BALANCE: 'Show assets with small balance dashboard',
  SELECT_V3_ETH_MARKET: 'Clicks a V3 ETH market from dashboard', // done
};

export const MARKETS = {
  DETAILS_NAVIGATION: 'View reserve details markets',
  SEARCH_ASSET: 'Search asset markets', // how to handle
  SORT: 'Sort',
  SELECT_V3_ETH_MARKET: 'Clicks a V3 ETH market from markets', // done
};

export const RESERVE_DETAILS = {
  RESERVE_TOKENS_DROPDOWN: 'View reserve tokens', // done
  RESERVE_TOKEN_ACTIONS: 'Reserve Token Action',
  ADD_TO_WALLET: 'Add token to wallet',
  ADD_TOKEN_TO_WALLET_DROPDOWN: 'View add token to wallet dropdown', //done
  GO_DASHBOARD_EMODE: 'Click Dashboard from E-Mode section', //done
  GRAPH_TIME_PERIOD: 'Graph Time Period Selector',
  GHO_CALCULATOR_ADD: 'Add stkAAVE to borrow at max discount',
  GHO_CALCULATOR_AMOUNT_CHANGE: 'Slider amount change',
};

export const YOUR_INFO_RESERVE_DETAILS = {
  SUPPLY_RESERVE: 'Supply assets your info reserve page', // done removed for DASHBOARD.BORROW_DASHBOARD with funnel property
  BORROW_RESERVE: 'Borrow assets your info reserve page', // done removed for DASHBOARD.BORROW_DASHBOARD with funnel property
};

export const TRANSACTION_HISTORY = {
  COPY_TX_ADDRESS: 'Copy Tx Address',
  DOWNLOAD: 'Tx History Download',
  FILTER: 'Tx History Filter Selected',
};

// TODO proper events here
export const REPAY_MODAL = {
  SWITCH_REPAY_TYPE: 'Change repay type',
};

export const WITHDRAW_MODAL = {
  SWITCH_WITHDRAW_TYPE: 'Change withdraw type',
};

export const SAFETY_MODULE = {
  STAKE_SAFETY_MODULE: 'Stake Safety Module',
  OPEN_STAKE_MODAL: 'Open Safety Module Stake Modal',
  OPEN_COOLDOWN_MODAL: 'Open Safety Module Cooldown Modal',
  OPEN_WITHDRAW_MODAL: 'Open Safety Module Withdraw Modal',
  OPEN_CLAIM_MODAL: 'Open Safety Module Claim Modal',
};

export const STAKE = {
  STAKE_TOKEN: 'Stake Umbrella Action',
  OPEN_STAKE_MODAL: 'Open Stake Modal',
  OPEN_COOLDOWN_MODAL: 'Open Stake Cooldown Modal',
  OPEN_WITHDRAW_MODAL: 'Open Stake Withdraw Modal',
  OPEN_CLAIM_MODAL: 'Open Stake Claim Modal',
};

export const GOVERNANCE_PAGE = {
  FILTER: 'Filter governance page', // done
  SEARCH_GOVERNANCE_PAGE: 'Search governance page: Term = ', //not sure how to do this
  VIEW_AIP: 'View aip information governance page', //done
};

export const AIP = {
  VIEW_ALL_VOTES: 'View all votes modal AIP page', //done (not sure why we don't use normal modal context)
  VOTE: 'Vote on proposal transaction', //need help
  GO_BACK: 'GO Back: AIP', //done
  SHARE_VOTE_ON_LENS: 'Share vote to lens: Vote Modal', //done
};
export const NAV_BAR = {
  MAIN_MENU: 'Main menu navigation', //done
  MORE: 'More View', //done
  MORE_NAV: 'More navigation', //done
};

export const SETTINGS = {
  DARK_MODE: 'Dark Mode Toggle',
  TESTNET_MODE: 'Testnet mode toggled: ',
  LANGUAGE: 'Language selector',
  LANGUAGE_SELECTED: 'Language selected',
};

export const GHO_SUCCESS_MODAL = {
  GHO_SHARE_TWITTER: 'Click share GHO borrow on Twitter',
  GHO_SHARE_HEY: 'Click share GHO borrow on Hey',
  GHO_COPY_IMAGE: 'Click copy image on GHO borrow',
  GHO_DOWNLOAD_IMAGE: 'Click download image on GHO borrow',
  GHO_BORROW_VIEW_TX_DETAILS: 'Click view TX details on GHO borrow',
  GHO_FAIL_COPY_IMAGE: 'Failed to copy image to clipboard',
};
export const SWITCH_MODAL = {
  SWITCH_TYPE: 'Change switch type',
};

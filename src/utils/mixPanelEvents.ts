export const AUTH = {
  CONNECT_WALLET: 'Connect wallet', //done
  SWITCH_WALLET: 'Switch wallet', //done
  MOCK_WALLET: 'Mock wallet', //done
  DISCONNECT_WALLET: 'Disconnect wallet', //done
  COPY_ADDRESS: 'Copy address', // done
  VIEW_EXPLORER: 'View explorer', // done
  VIEW_TX_HISTORY: 'View Tx History',
};

export const GENERAL = {
  SWITCH_NETWORK: 'Switch network',
  BUY_WITH_FIAT: 'Navigate to fiat onramp', //done
  TOOL_TIP: 'Tool Tip', //done
  EXTERNAL_LINK: 'External Link Navigaton',
  SET_SLIPPAGE: 'Set slippage',
  TOKEN_APPROVAL: 'Token Approval',
  ACCEPT_RISK: 'Accept Risk',
  TRANSACTION: 'Transaction',
  OPEN_MODAL: 'Open Modal',
  MAX_INPUT_SELECTION: 'Select Max input',
};

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
};

export const MARKETS = {
  DETAILS_NAVIGATION: 'View reserve details markets',
  SEARCH_ASSET: 'Search asset markets', // how to handle
  SORT: 'Sort',
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

export const STAKE = {
  STAKE_TOKEN: 'Stake Action',
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

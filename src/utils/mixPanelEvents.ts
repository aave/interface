export const PAGEVIEW = 'Pageview';

export const AUTH = {
  CONNECT_WALLET_MODAL: 'Open Connect Wallet Modal', //done
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
  OPEN_BUY_WITH_FIAT: 'Open buy with fiat modal', //done
  BUY_WITH_FIAT: 'Navigate to fiat onramp', //done
  TOOL_TIP: 'Tool Tip', //done
  EXTERNAL_LINK: 'External Link Navigaton',
  SET_SLIPPAGE: 'Set slippage',
};

export const DASHBOARD = {
  CHANGE_MARKET: 'Change market on dashboard', //done
  VIEW_MARKETS: 'View markets on dashboard', // can be viewed in PAGEVIEW
  VIEW_RISK_DETAILS: 'View risk details on dashboard', // done
  SUPPLY_DASHBOARD: 'Supply dashboard', //done
  REPAY_DASHBOARD: 'Repay dashboard', // done
  SWAP_DASHBOARD: 'Swap dashboard', //done
  WITHDRAWL_DASHBOARD: 'Withdrawl dashboard', //done

  BORROW_DASHBOARD: 'Borrow dashboard', // done
  DETAILS_ROW_DASHBOARD: 'Details Row dashboard', // done
  DETAILS_BUTTON_DASHBOARD: 'Details button dashboard', // done
  COLLATERAL_TOGGLE_DASHBOARD: 'Collateral toggle dashboard', // done
  APY_DROPDOWN_DASHBOARD: 'APY dropdown dashboard', // todo
  APY_CHANGE_DASHBOARD: 'Change APY type dashboard', // todo
  APY_SEE_CHARTS_DASHBOARD: 'See APY charts dashboard',
  E_MODE_INFO_DASHBOARD: 'E-Mode toggle dashboard', // done
  E_MODE_ACTION_ENABLE_DASHBOARD: 'E-Mode action button enable dashboard', //done
  E_MODE_ACTION_DISABLE_DASHBOARD: 'E-Mode action button disable dashboard', // done
  E_MODE_ACTION_SWITCH_DASHBOARD: 'E-Mode action button switch dashboard', //done

  VIEW_LM_DETAILS_DASHBOARD: 'View LM details dashboard', // done
  NOTIFY_DASHBOARD: 'Notify dashboard', // done
  HIDE_SUPPLY_TILE: 'Hide supply tile dashboard', // done
  HIDE_BORROW_TILE: 'Hide borrow tile dashboard', // done
  HIDE_YOUR_SUPPLY_TILE: 'Hide your supply tile dashboard', // done
  HIDE_YOUR_BORROW_TILE: 'Hide your borrow tile dashboard', // done
  SHOW_ASSETS_0_BALANCE: 'Show assets with zero balance dashboard', // done
};

export const MARKETS = {
  SEARCH_ASSET: 'Search asset markets', // how to handle
  DETAILS_BUTTON: 'Details button markets page', // done
  DETAILS_ROW_CLICK: 'Details row markets page', // done
  VIEW_LM_DETAILS_MARKETS: 'View LM details markets page',
  SORT_ASSET_MARKET: 'Sort by asset on markets page', // done
  SORT_SUPPLY_MARKET: 'Sort by supply on markets page', // done
  SORT_SUPPY_APY_MARKET: 'Sort by supply APY on markets page', //done
  SORT_BORROW_MARKET: 'Sort by borrow on markets page', //done
  SORT_BORROW_APY_V_MARKET: 'Sort by borrow APY variable on markets page', //done
  SORT_BORROW_APY_S_MARKET: 'Sort by borrow APY stable on markets page', //done
  VIEW_FROZEN_GOV_POST_MARKET: 'View frozen gov post from markets page', //done
};

export const RESERVE_DETAILS = {
  RESERVE_TOKENS_DROPDOWN: 'View reserve tokens', // done
  RESERVE_TOKENS_UNDERLYING: 'View underlying reserve token: ', //done
  RESERVE_TOKENS_ATOKEN: 'View underlying aTOKEN: ', //done
  RESERVE_TOKENS_DEBT_TOKEN: 'View underlying debt token: ', //done
  RESERVE_TOKENS_STABLE_DEBT_TOKEN: 'View underlying stable debt token: ', //done
  ADD_TOKEN_TO_WALLET_DROPDOWN: 'View add token to wallet dropdown', //done
  ADD_UNDERLYING_TO_WALLET: 'Add underlying token to wallet reserve page: ', //done
  ADD_ATOKEN_TO_WALLET: 'Add aToken to wallet reserve page: ', // done
  GO_DASHBOARD_EMODE: 'Click Dashboard from E-Mode section', //done
  GRAPH_TIME_PERIOD: 'Graph Time Period Selector',
};

export const YOUR_INFO_RESERVE_DETAILS = {
  SUPPLY_RESERVE: 'Supply assets your info reserve page', // done removed for DASHBOARD.BORROW_DASHBOARD with funnel property
  BORROW_RESERVE: 'Borrow assets your info reserve page', // done removed for DASHBOARD.BORROW_DASHBOARD with funnel property
};

export const TRANSACTION_HISTORY = {
  COPY_TX_ADDRESS: 'Copy Tx Address',
  DOWNLOAD: 'Tx Histoy Download',
  FILTER: 'Tx History Filter Selected',
};

export const SUPPLY_MODAL = {
  SWITCH_NETWORK: 'Switch network supply modal', // done
  MAX_SUPPLY: 'Max supply input supply modal', // done
  APPROVE_TOKEN: 'Approve token',
  SUPPLY_TOKEN: 'Supply token',
  SUPPLY_WITH_PERMIT: 'Supply token with permit', // done
};

export const BORROW_MODAL = {
  SWITCH_NETWORK: 'Switch network borrow modal', // done
  MAX_BORROW: 'Max borrow input borrow modal', // done
  BORROW_TOKEN: 'Borrow token', // done
  UNWRAP_UNDERLYING: 'Unwrap toggle borrow modal', //done
  ACCEPT_RISK: 'Accept risk check box borrow modal', // done
};

// TODO proper events here
export const REPAY_MODAL = {
  // SWITCH_NETWORK: 'Switch network borrow modal',
  // MAX_BORROW: 'Max supply input borrow modal',
  // BORROW_TOKEN: 'Borrow token',
  // UNWRAP_UNDERLYING: 'Unwrap toggle borrow modal',
  // ACCEPT_RISK: 'Accept risk check box borrow modal',
  REPAY_TOKEN: 'Repays borrowed position',
  SWITCH_REPAY_TYPE: 'Change repay type',
};

export const STAKE = {
  OPEN_STAKE_MODAL: 'Open stake modal staking page', //done
  OPEN_UNSTAKE_MODAL: 'Open unstake modal staking page', //done
  STAKE_TOKEN: 'Stake Action',
  MAX_AMOUNT_AAVE: 'Max amount of AAVE to stake in staking modal',
  OPEN_COOLDOWN_MODAL: 'Open cooldown modal staking page', //done
  ACCEPT_COOLDOWN_CHECKBOX: 'Accept cooldown risks cooldwon modal', //done
  ACTIVATE_COOLDOWN: 'Activate cooldown button cooldown modal',
  OPEN_CLAIM_STAKE_REWARDS: 'Open claim stake rewards modal staking page', //done
  CLAIM_STAKE_REWARDS: 'Claim staking rewards button',
  OPEN_GET_ABP_TOKEN: 'Open get abpt token', //done
  CONNECT_WALLET_STAKING: 'Connect wallet staking page', //--done
};

export const GOVERNANCE_PAGE = {
  FILTER: 'Filter governance page', // done
  SEARCH_GOVERNANCE_PAGE: 'Search governance page: Term = ', //not sure how to do this
  VIEW_AIP: 'View aip information governance page', //done
  SET_UP_DELEGATION_BUTTON: 'Set up delegation governance page', //done
  REVOKE_POWER_BUTTON: 'Revoke power button governance page', //done
  LEARN_MORE_DELEGATION: 'Learn More Delgation Panel', //done
};

export const AIP = {
  VIEW_ALL_VOTES: 'View all votes modal AIP page', //done (not sure why we don't use normal modal context)
  VOTE: 'Vote on proposal transaction', //need help
  VOTE_BUTTON_MODAL: 'Vote on AIP modal', //done
  GO_BACK: 'GO Back: AIP', //done
  SHARE_VOTE_ON_LENS: 'Share vote to lens: Vote Modal', //done
};

export const DELEGATION = {
  DELEGATE_BUTTON: 'Delegate power', //will be in the txhander section
  REVOKE_POWER: 'Revoke power', //will be in the txhandler section
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

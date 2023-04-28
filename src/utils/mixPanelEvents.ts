export const PAGEVIEW = 'Pageview';

export const AUTH = {
  CONNECT_WALLET: 'Connect wallet',
  SWITCH_WALLET: 'Switch wallet',
  MOCK_WALLET: 'Mock wallet',
  DISCONNECT_WALLET: 'Disconnect wallet',
  COPY_ADDRESS: 'Copy address',
  VIEW_EXPLORER: 'View explorer',
};

export const GENERAL = {
  SWITCH_NETWORK: 'Switch network',
  OPEN_BUY_WITH_FIAT: 'Open buy with fiat modal', //done
  BUY_WITH_FIAT: 'Navigate to fiat onramp', //done
  ETHERSCAN_LINK: 'Open etherscan of address', //done
};

export const DASHBOARD = {
  TOOLTIP_NET_APY: 'Click Tooltip Dashboard NetAPY', // done
  TOOLTIP_BORROW_CAP: 'Click Tooltip Borrow Cap', //done
  TOOLTIP_APY_VAR: 'Click Tooltip Borrow Variable APY', //done
  TOOLTIP_APY_STB: 'Click tooltip Borrow Stable APY', //done
  TOOLTIP_SUPPLIED_COLLATERAL: 'Click tooltip supplied assets collateral', //done
  TOOLTIP_COLLATERAL_SWITCH: 'Click tooltip supply collateral switch', //done

  TOTAL_SUPPLIED_TOOLTIP_APY: 'Click tooltip total supplied assets APY', //done
  TOOLTIP_BORROWED_POSITIONS_APY: 'Click tooltip borrwed position APY', //done
  TOOLTIP_BORROWED_POWER_USED: 'Click tooltip borrowing power %', // done

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
  BRIDGE_LINK_DASHBOARD: 'L2 Bridge Link dashboard', // done
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
  DASHBOARD_RISK_DETAILS: 'Show risk details on HF', // todo
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

  ORACLE_PRICE: 'View oracle price: ', //done
  ADD_TOKEN_TO_WALLET_DROPDOWN: 'View add token to wallet dropdown', //done
  ADD_UNDERLYING_TO_WALLET: 'Add underlying token to wallet reserve page: ', //done
  ADD_ATOKEN_TO_WALLET: 'Add aToken to wallet reserve page: ', // done
  TOTAL_SUPPLY_INFO_ICON: 'View Total Supply info: ', // done
  MAX_LTV_INFO_ICON: 'View Max LTV info reserve page: ', // done
  LIQUIDATION_THRESHOLD_INFO_ICON: 'View liquidation threshold info reserve page: ', // done
  LIQUIDATION_PENALTY_INFO_ICON: 'View liquidation penalty info reserve page: ', // done
  TOTAL_BORROW_INFO_ICON: 'View Total Borrow info reserve page: ', // done
  BORROW_APY_V_INFO: 'View borrow APY variable info reserve page', //done
  BORROW_APY_S_INFO: 'View borrow APY stable info reserve page', //done
  RESERVE_FACTOR_INFO: 'View reserve factor info reserve page', //done
  COLLECTOR_CONTRACT: 'View collector contract reserve page', // done
  EMODE_MAX_LTV_INFO_ICON: 'View E-Mode Max LTV info reserve page: ', //done
  EMODE_LIQUIDATION_THRESHOLD_INFO_ICON: 'View E-Mode liquidation threshold info reserve page: ', //done
  EMODE_LIQUIDATION_PENALTY_INFO_ICON: 'View E-Mode liquidation penalty info reserve page: ', //done
  VIEW_INTEREST_STRATEGY: 'View interest rate strategy link reserve page', //done
  GO_DASHBOARD_EMODE: 'Click Dashboard from E-Mode section', //done
  GO_FAQ: 'Go to FAQ from reserve page', // done
  GO_TECH_PAPER: 'Go to tech paper from reserve page', // done
};

export const YOUR_INFO_RESERVE_DETAILS = {
  BRIDGE_LINK_RESERVE: 'L2 bridge link your info reserve page',
  SUPPLY_INFO_ICON: 'View supply info icon your info reserve page', // done
  BORROW_INFO_ICON: 'View borrow info icon your info reserve page', // done
  SUPPLY_RESERVE: 'Supply assets your info reserve page', // done removed for DASHBOARD.BORROW_DASHBOARD with funnel property
  BORROW_RESERVE: 'Borrow assets your info reserve page', // done removed for DASHBOARD.BORROW_DASHBOARD with funnel property
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
  MAX_BORROW: 'Max supply input borrow modal', // done
  BORROW_TOKEN: 'Borrow token', // done
  UNWRAP_UNDERLYING: 'Unwrap toggle borrow modal', //done
  GOV_LINK: 'Governance link borrow modal', // done
  ACCEPT_RISK: 'Accept risk check box borrow modal', // done
};

// TODO proper events here
export const REPAY_MODAL = {
  // SWITCH_NETWORK: 'Switch network borrow modal',
  // MAX_BORROW: 'Max supply input borrow modal',
  // BORROW_TOKEN: 'Borrow token',
  // UNWRAP_UNDERLYING: 'Unwrap toggle borrow modal',
  // GOV_LINK: 'Governance link borrow modal',
  // ACCEPT_RISK: 'Accept risk check box borrow modal',
  REPAY_TOKEN: 'Repays borrowed position',
};

export const STAKE = {
  OPEN_STAKE_MODAL: 'Open stake modal staking page', //done
  OPEN_UNSTAKE_MODAL: 'Open unstake modal staking page', //done
  STAKE_TOKEN: 'Stake Action',
  COOLDOWN_WARNING_LINK: 'Cooldown warning link staking modal', //done
  MAX_AMOUNT_AAVE: 'Max amount of AAVE to stake in staking modal',
  COOLDOWN_INFO: 'Cooldown info icon staking page', //done
  OPEN_COOLDOWN_MODAL: 'Open cooldown modal staking page', //done
  COOLDOWN_LEARN_MORE: 'Learn more link cooldown modal', //done
  ACCEPT_COOLDOWN_CHECKBOX: 'Accept cooldown risks cooldwon modal', //done
  ACTIVATE_COOLDOWN: 'Activate cooldown button cooldown modal',
  OPEN_CLAIM_STAKE_REWARDS: 'Open claim stake rewards modal staking page', //done
  CLAIM_STAKE_REWARDS: 'Claim staking rewards button',
  OPEN_GET_ABP_TOKEN: 'Open get abpt token', //done
  GET_ABP_TOKEN: 'Navigate to Balancer for ABP Tokens',
  STAKING_RISKS_LINK: 'Staking risks link staking page', //done
  CONNECT_WALLET_STAKING: 'Connect wallet staking page', //--done
};

export const GOVERNANCE_PAGE = {
  AIP_EXTERNAL_LINKS: 'Navigate to external link from AIP', //done
  FILTER: 'Filter governance page', // done
  SEARCH_GOVERNANCE_PAGE: 'Search governance page: Term = ', //not sure how to do this
  VIEW_AIP: 'View aip information governance page', //done
  VOTING_POWER_INFO_ICON: 'View voting power info governance page', //done
  PROP_POWER_INFO_ICON: 'View prop power info governance page', //done
  SET_UP_DELEGATION_BUTTON: 'Set up delegation governance page', //done
  REVOKE_POWER_BUTTON: 'Revoke power button governance page', //done
  LEARN_MORE_DELEGATION: 'Learn More Delgation Panel', //done
};

export const AIP = {
  RAW_IPFS_LINK: 'Raw IPFS link AIP page', //done
  SHARE_ON_TWITTER: 'Share on twitter AIP page', //done
  SHARE_ON_LENS: 'Share on lens AIP page', //done
  FORUM_DISCUSSION: 'Forum discussion link AIP page', //doine
  VIEW_ALL_VOTES: 'View all votes modal AIP page', //done (not sure why we don't use normal modal context)
  VOTE: 'Vote on proposal transaction', //need help
  VOTE_BUTTON_MODAL: 'Vote on AIP modal', //done
  SEATBELT_REPORT: 'Open Seatbelt Report', //done
  GO_BACK: 'GO Back: AIP', //done
  SHARE_VOTE_ON_LENS: 'Share vote to lens: Vote Modal', //done
};

export const DELEGATION = {
  BALANCE_TO_DELEGATE_INFO_ICON: 'Balance to delegate info icon delegation modal', // done
  DELEGATE_BUTTON: 'Delegate power', //will be in the txhander section
  REVOKE_POWER: 'Revoke power', //will be in the txhandler section
};

export const NAV_BAR = {
  FAQ: 'FAQ Link',
  DEVELOPERS: 'Developers Link',
  DISCORD: 'Discord Link',
  GITHUB: 'Github Link',
  BUY_WITH_CRYPTO: 'Buy with crypto link',
};

export const SETTINGS = {
  DARK_MODE: 'Dark Mode Toggle',
  TESTNET_MODE: 'Testnet mode toggled: ',
  LANGUAGE: 'Language selector',
  LANGUAGE_SELECTED: 'Language selected',
};

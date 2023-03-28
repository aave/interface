export const PAGEVIEW = 'Pageview';

export const AUTH = {
  CONNECT_WALLET: 'Connect wallet',
  SWITCH_WALLET: 'Switch wallet',
  MOCK_WALLET: 'Mock wallet',
  DISCONNECT_WALLET: 'Disconnect wallet',
  COPY_ADDRESS: 'Copy address',
  VIEW_EXPLORER: 'View explorer',
};

export const DASHBOARD = {
  CHANGE_MARKET: 'Change market on dashboard',
  VIEW_MARKETS: 'View markets on dashboard',
  VIEW_RISK_DETAILS: 'View risk details on dashboard',
  SUPPLY_DASHBOARD: 'Supply dashboard',
  REPAY_DASHBOARD: 'Repay dashboard',
  SWAP_DASHBOARD: 'Swap dashboard',
  BORROW_DASHBOARD: 'Borrow dashboard',
  DETAILS_DASHBOARD: 'Details dashboard',
  DETAILS_BUTTON_DASHBOARD: 'Details button dashboard',
  BRIDGE_LINK_DASHBOARD: 'L2 Bridge Link dashboard',
  COLLATERAL_TOGGLE_DASHBOARD: 'Collateral toggle dashboard',
  APY_DROPDWON_DASHBOARD: 'APY dropdown dashboard',
  APY_CHANGE_DASHBOARD: 'Change APY type dashboard',
  APY_SEE_CHARTS_DASHBOARD: 'See APY charts dashboard',
  E_MODE_INFO_DASHBOARD: 'E-Mode toggle dashboard',
  E_MODE_ACTION_DASHBOARD: 'E-Mode action button dashboard',
  VIEW_LM_DETAILS_DASHBOARD: 'View LM details dashboard',
  NOTIFY_DASHBOARD: 'Notify dashboard',
  HIDE_SUPPLY_TILE: 'Hide supply tile dashboard',
  HIDE_BORROW_TILE: 'Hide borrow tile dashboard',
  HIDE_YOUR_SUPPLY_TILE: 'Hide your supply tile dashboard',
  HIDE_YOUR_BORROW_TILE: 'Hide your borrow tile dashboard',
  SHOW_ASSETS_0_BALANCE: 'Show assets with zero balance dashboard',
};

export const MARKETS = {
  SEARCH_ASSET: 'Search asset markets',
  DETAILS_BUTTON: 'Details button markets page',
  DETAILS_ROW_BUTTON: 'Details row markets page',
  VIEW_LM_DETAILS_MARKETS: 'View LM details markets page',
  SORT_ASSET_MARKET: 'Sort by asset on markets page',
  SORT_SUPPLY_MARKET: 'Sort by supply on markets page',
  SORT_SUPPY_APY_MARKET: 'Sort by supply APY on markets page',
  SORT_BORROW_MARKET: 'Sort by borrow on markets page',
  SORT_BORROW_APY_V_MARKET: 'Sort by borrow APY variable on markets page',
  SORT_BORROW_APY_S_MARKET: 'Sort by borrow APY stable on markets page',
  VIEW_FROZEN_GOV_POST_MARKET: 'View frozen gov post from markets page',
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
};

export const YOUR_INFO_RESERVE_DETAILS = {
  BRIDGE_LINK_RESERVE: 'L2 bridge link your info reserve page',
  SUPPLY_INFO_ICON: 'View supply info icon your info reserve page', // done
  BORROW_INFO_ICON: 'View borrow info icon your info reserve page', // done
  SUPPLY_RESERVE: 'Supply assets your info reserve page', // done
  BORROW_RESERVE: 'Borrow assets your info reserve page', // done
};

export const SUPPLY_MODAL = {
  SWITCH_NETWORK: 'Switch network supply modal',
  MAX_SUPPLY: 'Max supply input supply modal',
  APPROVE_TOKEN: 'Approve token',
  SUPPLY_TOKEN: 'Supply token',
};

export const BORROW_MODAL = {
  SWITCH_NETWORK: 'Switch network borrow modal',
  MAX_BORROW: 'Max supply input borrow modal',
  BORROW_TOKEN: 'Borrow token',
  UNWRAP_UNDERLYING: 'Unwrap toggle borrow modal',
  GOV_LINK: 'Governance link borrow modal',
  ACCEPT_RISK: 'Accept risk check box borrow modal',
};

export const STAKE = {
  BUY_AAVE_WITH_FIAT: 'Buy AAVE with FIAT staking page',
  STAKE_BUTTON: 'Open stake AAVE modal staking page',
  STAKE_BUTTON_MODAL: 'Stake AAVE button staking modal',
  COOLDOWN_WARNING_LINK: 'Cooldown warning link staking modal',
  MAX_AMOUNT_AAVE: 'Max amount of AAVE to stake in staking modal',
  COOLDOWN_INFO: 'Cooldown info icon staking page',
  COOLDOWN_BUTTON: 'Open cooldown modal staking page',
  COOLDOWN_LEARN_MORE: 'Learn more link cooldown modal',
  ACCEPT_COOLDOWN_CHECKBOX: 'Accept cooldown risks cooldwon modal',
  ACTIVATE_COOLDOWN_MODAL: 'Activate cooldown button cooldown modal',
  OPEN_CLAIM_STAKE_REWARDS: 'Open claim stake rewards modal staking page',
  CLAIM_STAKE_REWARDS: 'Claim staking rewards button claim aave modal',
  GET_ABP_TOKEN: 'Get abp token link staking page',
  STAKE_ABPT_BUTTON: 'Open stake ABPT modal staking page',
  STAKE_ABPT_BUTTON_MODAL: 'Stake ABPT button staking modal',
  COOLDOWN_ABPT_INFO: 'Cooldown info ABPT icon staking page',
  COOLDOWN_ABPT_BUTTON: 'Open cooldown ABPT modal staking page',
  COOLDOWN_ABPT_LEARN_MORE: 'Learn more link ABPT cooldown modal',
  ACCEPT_ABPT_COOLDOWN_CHECKBOX: 'Accept cooldown risks ABPT cooldwon modal',
  ACTIVATE_ABPT_COOLDOWN_MODAL: 'Activate cooldown button ABPT cooldown modal',
  OPEN_CLAIM_ABPT_STAKE_REWARDS: 'Open ABPT claim stake rewards modal staking page',
  CLAIM_STAKE_ABPT_REWARDS: 'Claim ABPT staking rewards button claim aave modal',
  STAKING_RISKS_LINK: 'Staking risks link staking page',
};

export const GOVERNANCE_PAGE = {
  GOVERNANCE_DOCS_LINK: 'Governance documentation governance page',
  SNAPSHOT_LINK: 'Snapshot link governance page',
  GOVERNANCE_FORUM_LINK: 'Governance forum link governance page',
  FAQ_LINK: 'FAQ link governance page',
  FILTER: 'Filter governance page',
  SEARCH_GOVERNANCE_PAGE: 'Search governance page: Term = ',
  VIEW_AIP: 'View aip information governance page',
  YOUR_INFO_ETHERSCAN_LINK: 'Open etherscan of your address governance page',
  VOTING_POWER_INFO_ICON: 'View voting power info governance page',
  PROP_POWER_INFO_ICON: 'View prop power info governance page',
  SET_UP_DELEGATION_BUTTON: 'Set up delegation governance page',
  REVOKE_POWER_BUTTON: 'Revoke power button governance page',
};

export const AIP = {
  RAW_IPFS_LINK: 'Raw IPFS link AIP page',
  SHARE_ON_TWITTER: 'Share on twitter AIP page',
  SHARE_ON_LENS: 'Share on lens AIP page',
  FORUM_DISCUSSION: 'Forum discussion link AIP page',
  VIEW_ALL_VOTES: 'View all votes modal AIP page',
  VOTE_YAE: 'Vote yae button AIP page',
  VOTE_NAE: 'Vote nae button AIP page',
  VOTE_BUTTON_MODAL: 'Vote on AIP modal',
};

export const DELEGATION = {
  POWER_TO_DELEGATE: 'Power to delegate toggle delegation modal: ',
  BALANCE_TO_DELEGATE_INFO_ICON: 'Balance to delegate info icon delegation modal',
  BALANCE_TO_DELEGATE_SELECTON: 'Balance to delegate option delegation modal: ',
  RECPIPIENT_ADDRESS: 'Address of recipient of delegation modal: ',
  DELEGATE_BUTTON: 'Delegate power button delegation modal',
  REVOKE_POWER: 'Revoke power button revoke modal',
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
  LANGUAGE: 'Language selected: ',
};

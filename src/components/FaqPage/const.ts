export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqCategory = {
  key: string;
  title: string;
  items: FaqItem[];
};

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    key: 'general',
    title: 'GENERAL',
    items: [
      {
        question: 'What is K613?',
        answer:
          'K613 is a modern lending protocol designed for simplicity and efficiency. The platform offers an intuitive interface, low fees, and a wide selection of tokens for supplying and borrowing.',
      },
      {
        question: 'Is it safe?',
        answer:
          'Security is built around audited smart contracts, transparent risk parameters, and ongoing monitoring. As with any DeFi product, you should still manage your own risk and position size.',
      },
      {
        question: 'Do I need to pass KYC?',
        answer:
          'KYC requirements depend on your jurisdiction and the services you use. For standard on-chain interaction with the protocol, a connected wallet is typically enough.',
      },
      {
        question: 'How do I get started?',
        answer:
          'Connect your wallet, choose a market, and either supply assets to earn yield or use supplied collateral to borrow. Start small to understand rates and liquidation parameters.',
      },
    ],
  },
  {
    key: 'supplying',
    title: 'SUPPLYING',
    items: [
      {
        question: 'How do I supply assets?',
        answer:
          'Open the market, pick an asset from the supply list, enter the amount, and confirm the transaction in your wallet. Once mined, your supplied balance appears on the dashboard.',
      },
      {
        question: 'Are there limits on supplying assets?',
        answer:
          'Each asset has its own caps and risk configuration. If a cap is reached, additional supplying for that reserve may be temporarily unavailable until governance updates parameters.',
      },
      {
        question: 'Where are my supplied tokens stored?',
        answer:
          'Your funds are held by the protocol smart contracts. In return, you receive position tokens that represent your claim and accrue yield over time.',
      },
      {
        question: 'Can I opt out of using my asset as collateral?',
        answer:
          'Yes. You can disable collateral usage per asset when your health factor remains safe. This controls borrowing power and liquidation exposure.',
      },
    ],
  },
  {
    key: 'withdrawing',
    title: 'WITHDRAWING',
    items: [
      {
        question: 'How do I withdraw my assets?',
        answer:
          'Go to your supplied positions, click withdraw, choose an amount, and confirm in your wallet. If the reserve has enough liquidity and your position remains healthy, withdrawal completes immediately.',
      },
    ],
  },
  {
    key: 'borrowing',
    title: 'BORROWING',
    items: [
      {
        question: 'How do I borrow?',
        answer:
          'Enable collateral on supplied assets, choose a borrowable reserve, set the amount, and confirm the borrow transaction. Your borrowing capacity depends on collateral value and risk settings.',
      },
      {
        question: 'How do I repay my borrow?',
        answer:
          'Open the borrowed position, click repay, select partial or full repayment, and approve/confirm in your wallet. Your debt balance is updated once the transaction is mined.',
      },
      {
        question: 'When do I need to repay?',
        answer:
          'There is no fixed maturity date for most variable-rate loans, but interest accrues continuously. Keep your health factor above liquidation threshold by repaying or adding collateral.',
      },
      {
        question: 'How much interest will I pay?',
        answer:
          'Interest depends on the reserve utilization and selected rate mode. Current rates are shown in the UI and can change over time with market conditions.',
      },
    ],
  },
  {
    key: 'risk-liquidation',
    title: 'RISK & LIQUIDATION',
    items: [
      {
        question: 'What is Health Factor?',
        answer:
          'Health factor is a safety score of your account. It is based on collateral value, debt value, and liquidation thresholds. Higher values mean lower liquidation risk.',
      },
      {
        question: 'What happens if my Health Factor drops?',
        answer:
          'If health factor approaches 1, your account becomes risky. You can improve it by repaying debt, adding collateral, or closing part of your position.',
      },
      {
        question: 'What are liquidations?',
        answer:
          'Liquidations are automated actions that repay part of risky debt using your collateral when health factor falls below threshold. This protects protocol solvency.',
      },
      {
        question: 'How can I avoid liquidation?',
        answer:
          'Maintain a healthy collateral buffer, monitor volatility, avoid excessive leverage, and react quickly when your health factor declines.',
      },
    ],
  },
];

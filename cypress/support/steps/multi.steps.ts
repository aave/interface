import { skipState } from './common';
import { borrow, repay, supply } from './main.steps';
import { verifyBorrowsEmpty } from './verification.steps';

export const repayCollateral = (
  testCase: {
    deposit: {
      asset: { shortName: string; fullName: string };
      amount: number;
      hasApproval: boolean;
    };
    borrow: {
      asset: { shortName: string; fullName: string };
      amount: number;
      apyType?: string | undefined;
      hasApproval: boolean;
    };
    repay: {
      asset: { shortName: string; fullName: string };
      apyType: string;
      amount: number;
      repayOption: string;
      repayableAsset?: { shortName: string } | undefined;
      hasApproval: boolean;
    };
  },
  // eslint-disable-next-line @typescript-eslint/ban-types
  configFunction: Function
) => {
  describe('Functional testing of repay as collateral', () => {
    const skipTestState = skipState(false);
    configFunction();
    supply(testCase.deposit, skipTestState, true);
    borrow(testCase.borrow, skipTestState, true);
    repay(testCase.repay, skipTestState, true);
    verifyBorrowsEmpty(skipTestState);
  });
};

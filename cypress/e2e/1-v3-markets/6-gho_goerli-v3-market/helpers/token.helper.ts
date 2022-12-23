import { TokenRequest } from '../../../../support/actions/tenderly.actions';
import donors from '../fixtures/donors.json';

export const tokenSet = ({ stkAave = 0, aAAVE = 0 }) => {
  const tokenRequest: TokenRequest[] = [];
  if (stkAave != 0) {
    tokenRequest.push({
      tokenAddress: donors.stkAAVE.tokenAddress,
      donorAddress: donors.stkAAVE.donorWalletAddress,
      tokenCount: stkAave.toString(),
    });
  }
  if (aAAVE != 0) {
    tokenRequest.push({
      tokenAddress: donors.aAAVE.tokenAddress,
      donorAddress: donors.aAAVE.donorWalletAddress,
      tokenCount: aAAVE.toString(),
    });
  }
  return tokenRequest;
};

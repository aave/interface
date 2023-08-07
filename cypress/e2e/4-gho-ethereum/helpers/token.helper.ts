import { TokenRequest } from '../../../support/actions/tenderly.actions';
import donors from '../fixtures/donors.json';

export const tokenSet = ({ stkAave = 0, aAAVE = 0, aDAI = 0 }) => {
  const tokenRequest: TokenRequest[] = [];
  if (stkAave != 0) {
    tokenRequest.push({
      tokenAddress: donors.stkAAVE.tokenAddress,
      donorAddress: donors.stkAAVE.donorWalletAddress,
      tokenCount: stkAave.toString(),
      name: donors.stkAAVE.name,
    });
  }
  if (aAAVE != 0) {
    tokenRequest.push({
      tokenAddress: donors.aAAVE.tokenAddress,
      donorAddress: donors.aAAVE.donorWalletAddress,
      tokenCount: aAAVE.toString(),
      name: donors.aAAVE.name,
    });
  }
  if (aDAI != 0) {
    tokenRequest.push({
      tokenAddress: donors.aDAI.tokenAddress,
      donorAddress: donors.aDAI.donorWalletAddress,
      tokenCount: aDAI.toString(),
      name: donors.aDAI.name,
    });
  }
  return tokenRequest;
};

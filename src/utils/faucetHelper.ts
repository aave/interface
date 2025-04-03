import {
  DEFAULT_NULL_VALUE_ON_TX,
  eEthereumTxType,
  EthereumTransactionTypeExtended,
  mintAmountsPerToken,
  transactionType,
  V3FaucetParamsType,
  V3FaucetService,
  valueToWei,
} from '@aave/contract-helpers';
import { providers } from 'ethers';

// import { extendedMintAmountsPerToken } from './reservesHelper';

const extendedMintAmountsPerToken: Record<string, string> = {
  ...mintAmountsPerToken,
  UNI_FAVORETH: valueToWei('0.00005', 18),
  UNI_FAVORUSDT: valueToWei('0.0000000001', 18),
};

export class CustomFaucetService extends V3FaucetService {
  constructor(provider: providers.Provider, faucetAddress?: string) {
    super(provider, faucetAddress);
  }

  /**
   * Override the mint function to use our extended mint amounts
   */
  public mint({
    userAddress,
    reserve,
    tokenSymbol,
    owner,
  }: V3FaucetParamsType): EthereumTransactionTypeExtended[] {
    const defaultAmount = valueToWei('1000', 18);
    const amount: string = extendedMintAmountsPerToken[tokenSymbol]
      ? extendedMintAmountsPerToken[tokenSymbol]
      : defaultAmount;

    const faucetV3Contract = this.getContractInstance(this.faucetAddress);
    const txCallback: () => Promise<transactionType> = this.generateTxCallback({
      rawTxMethod: async () =>
        faucetV3Contract.populateTransaction.mint(reserve, userAddress, amount),
      from: owner ?? userAddress,
      value: DEFAULT_NULL_VALUE_ON_TX,
    });

    return [
      {
        tx: txCallback,
        txType: eEthereumTxType.FAUCET_V2_MINT,
        gas: this.generateTxPriceEstimation([], txCallback),
      },
    ];
  }
}

// import BaseService from '@aave/contract-helpers/src/commons/BaseService';
// import {
//   eEthereumTxType,
//   EthereumTransactionTypeExtended,
//   LendingPoolMarketConfig,
//   tEthereumAddress,
//   transactionType,
// } from '@aave/contract-helpers/src/commons/types';
// // import { FaucetValidator } from '@aave/contract-helpers/src/commons/validators/methodValidators';
// // import { isEthAddress } from '@aave/contract-helpers/src/commons/validators/paramValidators';
// import { IERC20FaucetOwnable } from '@aave/contract-helpers/src/v3-faucet-contract/typechain/IERC20FaucetOwnable';
// import { IERC20FaucetOwnable__factory } from '@aave/contract-helpers/src/v3-faucet-contract/typechain/IERC20FaucetOwnable__factory';
// import { providers } from 'ethers';

// const mintAmountsPerTokenExtended: Record<string, string> = {
//   ...mintAmountsPerToken,
//   UNI_FAVORETH: valueToWei('1000', 18),
//   UNI_FAVORUSDT: valueToWei('1000', 6),
// };

// export type V3FaucetParamsType = {
//   userAddress: tEthereumAddress;
//   reserve: tEthereumAddress;
//   tokenSymbol: string;
//   owner?: tEthereumAddress;
// };

// export interface FaucetV2Interface {
//   mint: (args: V3FaucetParamsType) => EthereumTransactionTypeExtended[];
// }

// export class V3FaucetService extends BaseService<IERC20FaucetOwnable> implements FaucetV2Interface {
//   readonly faucetAddress: string;

//   readonly faucetConfig: LendingPoolMarketConfig | undefined;

//   constructor(provider: providers.Provider, faucetAddress?: string) {
//     super(provider, IERC20FaucetOwnable__factory);

//     this.faucetAddress = faucetAddress ?? '';
//   }

//   /**
//    * @dev This mint function will only work if the IERC20FaucetOwnable "isPermissioned()" boolean getter returns "false".
//    * If the "isPermissioned" returns true, them only the owner can sign the function.
//    */
//   public mint({
//     userAddress,
//     reserve,
//     tokenSymbol,
//     owner,
//   }: V3FaucetParamsType): EthereumTransactionTypeExtended[] {
//     const defaultAmount = valueToWei('1000', 18);
//     const amount: string = mintAmountsPerTokenExtended[tokenSymbol]
//       ? mintAmountsPerTokenExtended[tokenSymbol]
//       : defaultAmount;

//     const faucetV3Contract = this.getContractInstance(this.faucetAddress);
//     const txCallback: () => Promise<transactionType> = this.generateTxCallback({
//       rawTxMethod: async () =>
//         faucetV3Contract.populateTransaction.mint(reserve, userAddress, amount),
//       from: owner ?? userAddress,
//       value: DEFAULT_NULL_VALUE_ON_TX,
//     });

//     return [
//       {
//         tx: txCallback,
//         txType: eEthereumTxType.FAUCET_V2_MINT,
//         gas: this.generateTxPriceEstimation([], txCallback),
//       },
//     ];
//   }

//   public async isPermissioned(): Promise<boolean> {
//     const faucetV3Contract = this.getContractInstance(this.faucetAddress);

//     return faucetV3Contract.isPermissioned();
//   }
// }

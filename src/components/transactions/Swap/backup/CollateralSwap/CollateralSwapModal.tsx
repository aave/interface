// import { BasicModal } from 'src/components/primitives/BasicModal';
// import {
//   ComputedReserveData,
//   useAppDataContext,
// } from 'src/hooks/app-data-provider/useAppDataProvider';
// import { TokenInfoWithBalance } from 'src/hooks/generic/useTokensBalance';
// import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
// import { useRootStore } from 'src/store/root';
// import { TOKEN_LIST, TokenInfo } from 'src/ui-config/TokenList';
// import { displayGhoForMintableMarket } from 'src/utils/ghoUtilities';

// import { BaseSwitchModal } from '../BaseSwitchModal';

// export const CollateralSwapModal = () => {
//   return (
//     <BasicModal open={type === ModalType.CollateralSwap} setOpen={close}>
//       <BaseSwitchModal
//         modalType={ModalType.CollateralSwap}
//         tokensFrom={tokensFrom}
//         tokensTo={tokensTo}
//         forcedDefaultInputToken={defaultInputToken}
//         forcedDefaultOutputToken={undefined}
//         suggestedDefaultOutputToken={defaultOutputToken}
//         showSwitchInputAndOutputAssetsButton={false}
//         forcedChainId={currentNetworkConfig.wagmiChain.id}
//       />
//     </BasicModal>
//   );
// };

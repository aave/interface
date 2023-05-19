import { API_ETH_MOCK_ADDRESS, PERMISSION } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import React, { useEffect, useState } from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import { getLatestPriceFeeds } from 'src/helpers/pythHelpers';
import {
  ComputedReserveData,
  ComputedUserReserveData,
  useAppDataContext,
} from 'src/hooks/app-data-provider/useAppDataProvider';
import { useWalletBalances } from 'src/hooks/app-data-provider/useWalletBalances';
import { ModalContextType, ModalType, useModalContext } from 'src/hooks/useModal';
import { usePermissions } from 'src/hooks/usePermissions';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { getNetworkConfig, isFeatureEnabled } from 'src/utils/marketsAndNetworksConfig';

import { BasicModal } from '../../primitives/BasicModal';
import { TxErrorView } from '../FlowCommons/Error';
import { ModalWrapper, ModalWrapperProps } from '../FlowCommons/ModalWrapper';
import { SupplyModalContent } from './SupplyModalContent';

export const SupplyModal = () => {
  const { type, close, args } = useModalContext() as ModalContextType<{
    underlyingAsset: string;
  }>;

  const [price, setPrice] = useState<string>();
  const [expo, setExpo] = useState<number>();

  // // const makeSupplyModal = async(params: ModalWrapper)
  // async function MakeSupplyModal(underlyingAsset: string, title: ReactElement, requiredPermission?: PERMISSION): Promise<ModalWrapperProps>{ //Promise<JSX.Element> {

  //   const { chainId: connectedChainId, watchModeOnlyAddress } = useWeb3Context();
  //   const { walletBalances } = useWalletBalances();
  //   const {
  //     currentChainId: marketChainId,
  //     currentNetworkConfig,
  //     currentMarketData,
  //   } = useProtocolDataContext();
  //   const { user, reserves } = useAppDataContext();
  //   // const { txError, mainTxState } = useModalContext();
  //   const { permissions } = usePermissions();

  //   // if (txError && txError.blocking) {
  //   //   return <TxErrorView txError={txError} />;
  //   // }

  //   // if (
  //   //   requiredPermission &&
  //   //   isFeatureEnabled.permissions(currentMarketData) &&
  //   //   !permissions.includes(requiredPermission) &&
  //   //   currentMarketData.permissionComponent
  //   // ) {
  //   //   return <>{currentMarketData.permissionComponent}</>;
  //   // }

  //   const isWrongNetwork = connectedChainId !== marketChainId;

  //   const poolReserve = reserves.find((reserve) => {
  //     if (underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase())
  //       return reserve.isWrappedBaseAsset;
  //     return underlyingAsset === reserve.underlyingAsset;
  //   }) as ComputedReserveData;

  //   const userReserve = user?.userReservesData.find((userReserve) => {
  //     if (underlyingAsset.toLowerCase() === API_ETH_MOCK_ADDRESS.toLowerCase())
  //       return userReserve.reserve.isWrappedBaseAsset;
  //     return underlyingAsset === userReserve.underlyingAsset;
  //   }) as ComputedUserReserveData;

  //   const symbol =
  //     // poolReserve.isWrappedBaseAsset && !keepWrappedSymbol
  //       // ?
  //       currentNetworkConfig.baseAssetSymbol
  //       // : poolReserve.symbol
  //       ;

  //   const params: ModalWrapperProps = {isWrongNetwork,
  //     nativeBalance: walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount || '0',
  //     tokenBalance: walletBalances[poolReserve.underlyingAsset.toLowerCase()]?.amount || '0',
  //     poolReserve,
  //     symbol,
  //     underlyingAsset,
  //     userReserve,
  //   };

  //   return params;

  //   // const response = await SupplyModalContent(params);
  //   // return (
  //   //   <BasicModal open={type === ModalType.Supply} setOpen={close}>
  //   //     <ModalWrapper
  //   //       title={<Trans>Supply</Trans>}
  //   //       underlyingAsset={args.underlyingAsset}
  //   //       requiredPermission={PERMISSION.DEPOSITOR}
  //   //     >
  //   //       {(params) => response}
  //   //     </ModalWrapper>
  //   //   </BasicModal>
  //   // );
  // }

  // const title = <Trans>Supply</Trans>;
  // const underlyingAsset = args.underlyingAsset;
  // const requiredPermission = PERMISSION.DEPOSITOR;

  // console.log("INPUT ARGS TITLE: ", title);
  // console.log("INPUT ARGS UNDERLYING ASSET: ", underlyingAsset);
  // console.log("INPUT ARGS REQUIRED PERMISSION: ", requiredPermission);
  // console.log("data pre", data);
  // console.log("data2 pre", data2);

  // useEffect(() => {
  //   async function getSupplyModalContent(title: ReactElement, underlyingAsset: string, requiredPermission: PERMISSION) {
  //     const content = await MakeSupplyModal(underlyingAsset, title, requiredPermission);
  //     setData(content);
  //     setData2(2);
  //   }
  //   getSupplyModalContent(title, underlyingAsset, requiredPermission);
  // }, []);

  // console.log("data after", data);
  // console.log("data2 after", data2);

  // return (
  //   <BasicModal open={type === ModalType.Supply} setOpen={close}>
  //     <ModalWrapper
  //       title={<Trans>Supply</Trans>}
  //       underlyingAsset={args.underlyingAsset}
  //       requiredPermission={PERMISSION.DEPOSITOR}
  //     >
  //       {(params) => SupplyModalContent(data!)}
  //     </ModalWrapper>
  //   </BasicModal>
  // );

  useEffect(() => {
    async function getLatestPriceInfo() {
      const latestPriceFeeds = await getLatestPriceFeeds([args['underlyingAsset']]); //TODO: replace with underlying asset
      const latestPriceRaw = latestPriceFeeds ? latestPriceFeeds[0]['price']['price'] : '0';
      setPrice(latestPriceRaw);
      const latestPriceExpo = latestPriceFeeds ? latestPriceFeeds[0]['price']['expo'] : '0';
      setExpo(latestPriceExpo);
    }
    getLatestPriceInfo();
  }, []);

  return (
    <BasicModal open={type === ModalType.Supply} setOpen={close}>
      <ModalWrapper
        title={<Trans>Supply</Trans>}
        underlyingAsset={args.underlyingAsset}
        requiredPermission={PERMISSION.DEPOSITOR}
      >
        {(params) => (
          <SupplyModalContent
            modalWrapperProps={params}
            latestPriceRaw={price!}
            latestPriceExpo={expo!}
          />
        )}
      </ModalWrapper>
    </BasicModal>
  );
};

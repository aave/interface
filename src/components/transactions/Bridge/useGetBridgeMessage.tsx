import { constants, Contract, utils } from 'ethers';
import { formatEther, parseUnits } from 'ethers/lib/utils';
import debounce from 'lodash/debounce';
import { useEffect, useMemo, useState } from 'react';
import { getProvider } from 'src/utils/marketsAndNetworksConfig';

import { MessageDetails, TokenAmount } from './BridgeActions';
import { getChainSelectorFor, getRouterFor } from './BridgeConfig';
import routerAbi from './Router-abi.json';

export const useGetBridgeMessage = ({
  sourceChainId,
  destinationChainId,
  amount,
  sourceTokenAddress,
  destinationAccount,
}: {
  sourceChainId: number;
  destinationChainId: number;
  amount: string;
  sourceTokenAddress: string;
  destinationAccount: string;
}) => {
  const [message, setMessage] = useState<MessageDetails>();
  const [bridgeFee, setBridgeFee] = useState('');
  const [bridgeFeeFormatted, setBridgeFeeFormatted] = useState('');
  const [loading, setLoading] = useState(false);

  const debounced = useMemo(() => {
    return debounce(async () => {
      const providerWithSend = getProvider(sourceChainId);

      // Get the router's address for the specified chain
      const sourceRouterAddress = getRouterFor(sourceChainId);

      const destinationChainSelector = getChainSelectorFor(destinationChainId);

      const sourceRouter = new Contract(sourceRouterAddress, routerAbi, providerWithSend);

      // ==================================================
      //     Section: Check token validity
      //     Check first if the token you would like to
      //     transfer is supported.
      // ==================================================
      // */
      const supportedTokens = await sourceRouter.getSupportedTokens(destinationChainSelector);

      if (supportedTokens.length <= 0) {
        setLoading(false);
        throw Error('No supported tokens found');
      }

      const tokenAddressLower = sourceTokenAddress.toLowerCase();

      // Convert each supported token to lowercase and check if the list includes the lowercase token address
      const isSupported = supportedTokens
        .map((token: string) => token.toLowerCase())
        .includes(tokenAddressLower);

      if (!isSupported) {
        setLoading(false);
        throw Error(
          `Token address ${sourceTokenAddress} not in the list of supportedTokens ${supportedTokens}`
        );
      }
      /*
      ==================================================
        Section: BUILD CCIP MESSAGE
        build CCIP message that you will send to the
        Router contract.
      ==================================================
    */

      try {
        const tokenAmounts: TokenAmount[] = [
          {
            token: sourceTokenAddress,
            amount: parseUnits(amount, 18).toString() || '0',
          },
        ];

        // Encoding the data
        const functionSelector = utils.id('CCIP EVMExtraArgsV1').slice(0, 10);
        //  "extraArgs" is a structure that can be represented as [ 'uint256']
        // extraArgs are { gasLimit: 0 }
        // we set gasLimit specifically to 0 because we are not sending any data so we are not expecting a receiving contract to handle data

        const extraArgs = utils.defaultAbiCoder.encode(['uint256'], [0]);

        const encodedExtraArgs = functionSelector + extraArgs.slice(2);

        const message: MessageDetails = {
          receiver: utils.defaultAbiCoder.encode(['address'], [destinationAccount]),
          data: '0x', // no data
          tokenAmounts: tokenAmounts,
          feeToken: constants.AddressZero, // If fee token address is provided then fees must be paid in fee token.
          // feeToken: feeTokenAddress ? feeTokenAddress : ethers.constants.AddressZero, // If fee token address is provided then fees must be paid in fee token.

          extraArgs: encodedExtraArgs,
        };

        /*
         ==================================================
        Section: CALCULATE THE FEES
        Call the Router to estimate the fees for sending tokens.
        ==================================================
      */
        const fees = await sourceRouter.getFee(destinationChainSelector, message);

        setMessage(message);
        setBridgeFeeFormatted(formatEther(fees));
        setBridgeFee(fees);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 500);
  }, [amount, destinationChainId, sourceChainId, sourceTokenAddress, destinationAccount]);

  useEffect(() => {
    if (amount && sourceTokenAddress) {
      setLoading(true);
      debounced();
    } else {
      setLoading(false);
      setMessage(undefined);
      setBridgeFee('');
      setBridgeFeeFormatted('');
    }

    return () => {
      debounced.cancel();
    };
  }, [amount, debounced, sourceTokenAddress]);

  return {
    message,
    bridgeFee,
    bridgeFeeFormatted,
    loading,
  };
};

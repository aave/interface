import { SupportedChainId } from '@cowprotocol/cow-sdk';
import { ModalType } from 'src/hooks/useModal';

export const COW_UNSUPPORTED_ASSETS: Partial<
  Record<ModalType, Partial<Record<SupportedChainId, string[] | 'ALL'>>>
> = {
  [ModalType.CollateralSwap]: {
    [SupportedChainId.POLYGON]: 'ALL', // Polygon not supported for collateral swap, waiting better solvers support
    [SupportedChainId.AVALANCHE]: 'ALL', // Disabled until we have better solvers liquidity
    [SupportedChainId.GNOSIS_CHAIN]: [
      '0xedbc7449a9b594ca4e053d9737ec5dc4cbccbfb2'.toLowerCase(), // EURe USD Price not supported
      '0x3FdCeC11B4f15C79d483Aedc56F37D302837Cf4d'.toLowerCase(), // aGHO not supported
    ],
    [SupportedChainId.ARBITRUM_ONE]: [
      '0xeBe517846d0F36eCEd99C735cbF6131e1fEB775D'.toLowerCase(), // aGHO not supported
      '0x62fC96b27a510cF4977B59FF952Dc32378Cc221d'.toLowerCase(), // atBTC does not have good solver liquidity
    ],
    [SupportedChainId.BASE]: [
      '0x067ae75628177FD257c2B1e500993e1a0baBcBd1'.toLowerCase(), // aGHO not supported
      '0x90072A4aA69B5Eb74984Ab823EFC5f91e90b3a72'.toLowerCase(), // alBTC does not have good solver liquidity
      '0x7C307e128efA31F540F2E2d976C995E0B65F51F6'.toLowerCase(), // aWETH does not have good solver liquidity
    ],
    [SupportedChainId.MAINNET]: [
      '0x00907f9921424583e7ffBfEdf84F92B7B2Be4977'.toLowerCase(), // aGHO not supported
      '0x18eFE565A5373f430e2F809b97De30335B3ad96A'.toLowerCase(), // aGHO not supported
    ],
    [SupportedChainId.SEPOLIA]: [
      '0xd190eF37dB51Bb955A680fF1A85763CC72d083D4'.toLowerCase(), // aGHO not supported
    ],
  },
};

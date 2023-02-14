import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk';

export const RampWidget = (walletAddress: string) => {
    return new RampInstantSDK({
        hostAppName: 'Aave',
        hostLogoUrl: 'https://app.aave.com/aaveLogo.svg',
        hostApiKey: 'm6u6xt7342vvp8cburbwvkjdpghjd76vuqd7pscy',
        userAddress: walletAddress,
        enabledFlows: ['ONRAMP','OFFRAMP'],
        defaultFlow: 'ONRAMP',
        swapAsset: 'ETH_*,ARBITRUM_*,AVAX_*,FANTOM_*,HARMONY_*,OPTIMISM_*,MATIC_*',
        offrampAsset: 'ETH_*,ARBITRUM_*,AVAX_*,FANTOM_*,OPTIMISM_*,MATIC_*',
        defaultAsset: 'ETH_ETH',
        variant: 'auto',
    }).show();
}

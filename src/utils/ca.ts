import { CA } from '@arcana/ca-sdk'
import { EthereumProvider } from '@arcana/ca-sdk/dist/types/typings'

let caSDK: CA | null = null
let balances: { symbol: string; balance: string; balanceInFiat: number; decimals: number; icon: string | undefined; breakdown: { chain: { id: number; name: string; logo: string }; network: "evm"; contractAddress: `0x${string}`; isNative: boolean | undefined; balance: string; balanceInFiat: number }[]; local: boolean | undefined; abstracted: boolean | undefined }[] | null = null


const useCaSdkAuth = async () => {
    console.log("initializeCA function called")
    const initializeCA = async (provider: EthereumProvider) => {
        try {
            if (!caSDK) {
                console.log('CA SDK not initialized, initializing...')
                caSDK = new CA(provider, {
                    network: 'dev',
                })
                await caSDK.init()
                console.log('CA SDK initialized:', caSDK)
                balances = await caSDK.getUnifiedBalances()
                console.log('Balances:', balances)
            }
            return caSDK;
        } catch (error) {
            console.error('Error initializing CA SDK:', error)
        }
    }
    //@ts-expect-error
    const ethereum = window.ethereum
    const provider = await initializeCA(ethereum)
    return provider
}

const getBalance = () => {
    return balances
}

const useBridge = async (amount: string | number, chainId: number, symbol: string) => {
    console.log("useBridge function called")
    console.log("parameters:", amount, chainId, symbol)
    await caSDK?.bridge().amount(amount).chain(chainId).token(symbol).exec();
}
export { useCaSdkAuth, getBalance, useBridge}
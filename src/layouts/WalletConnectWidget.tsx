import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/system";
import { ColorModeContext } from "./MainLayout";
import { Button, Modal } from "@mui/material";
import ConnectWalletModal from "../components/ConnectWalletModal";
import { useUserWalletDataContext } from "../libs/web3-data-provider";
import { getNetworkConfig, getSupportedChainIds } from "../helpers/config/markets-and-network-config";
// import Web3Modal from 'web3modal';
import { ethers } from "ethers";
import WalletConnect from "@walletconnect/web3-provider";
// import Torus from "@toruslabs/torus-embed";
import WalletLink from "walletlink";
// import MewConnect from "@myetherwallet/mewconnect-web-client";
import ethProvider from "eth-provider";
import { ChainId } from "@aave/contract-helpers";
import dynamic from "next/dynamic";
// @ts-ignore
// const Web3Modal = dynamic(() => import('web3modal'), { ssr: false })
// @ts-ignore
// const ethProvider = dynamic(() => import('eth-provider'), { ssr: false })
// @ts-ignore
// const MewConnect = dynamic(() => import('@myetherwallet/mewconnect-web-client'), { ssr: false })

// @ts-ignore
// const WalletConnect = dynamic(() => import('@walletconnect/web3-provider'), { ssr: false })
// @ts-ignore
// const Torus = dynamic(() => import('@toruslabs/torus-embed'), { ssr: false })
// @ts-ignore
// const WalletLink = dynamic(() => import('walletlink'), { ssr: false })


const POLLING_INTERVAL = 12000;
const APP_NAME = 'Aave';
const APP_LOGO_URL = 'https://aave.com/favicon.ico';

export default function WalletConnectWidget() {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const {handleUnlockWallet, supportedChainIds} = useUserWalletDataContext();
  const [isConnectorOpen, setConnectorOpen] = useState(false);


  const [showModal, setShowModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null as unknown as ethers.providers.Provider);
  const [selectedInstance, setSelectedInstance] = useState(null as any);

  const [web3Modal, setWeb3Modal] = useState(null as any);
  const [ethProvider, setEthProvider] = useState(null as any);
  const [mewConnect, setMewConnect] = useState(null as any);
  const [walletConnect, setWalletConnect] = useState(null as any);
  const [torus, setTorus] = useState(null as any);
  const [walletLink, setWalletLink] = useState(null as any);

  useEffect(() => {
    // if (!ethProvider) {
    //   try {
    //     import('eth-provider').then(ethProvider => {
    //       setEthProvider(ethProvider)
    //     })
    //   } catch (e) {
    //     console.log('Error while creating Web3Modal');
    //   }
    // }
    // if (!mewConnect) {
    //   try {
    //     import("@myetherwallet/mewconnect-web-client").then(MewConnect => {
    //       setMewConnect(MewConnect)
    //     })
    //   } catch (e) {
    //     console.log('Error while creating Web3Modal');
    //   }
    // }
    // if (!walletConnect) {
    //   try {
    //     import("@walletconnect/web3-provider").then(WalletConnect => {
    //       setWalletConnect(WalletConnect)
    //     })
    //   } catch (e) {
    //     console.log('Error while creating Web3Modal');
    //   }
    // }
    if (!torus) {
      try {
        import("@toruslabs/torus-embed").then(Torus => {
          setTorus(Torus)
        })
      } catch (e) {
        console.log('Error while creating Web3Modal');
      }
    }

    // if (!walletLink) {
    //   try {
    //     import("walletlink").then(WalletLink => {
    //       setWalletLink(WalletLink)
    //     })
    //   } catch (e) {
    //     console.log('Error while creating Web3Modal');
    //   }
    // }
    if (!web3Modal) {
      try {
        import("web3modal").then(Web3Modal => {
          // @ts-ignore
          setWeb3Modal(new Web3Modal.default({
            cacheProvider: false,
            providerOptions: getProviderOptions()
          }))
        })
      } catch (e) {
        console.log('Error while creating Web3Modal');
      }
    }
  }, [])

  const subscribeProvider = async (provider: any) => {
    if (!provider.on) {
      return;
    }
    provider.on("accountsChanged", (accounts: string[]) => {
      console.log('new account: ', accounts[0]);
    });
    provider.on("close", () => resetApp());

    provider.on('connect', (info: any) => {
      console.log('connected: ', info)
    })

    provider.on("networkChanged", async (networkId: number) => {
      console.log('network changed:: ', networkId)
      localStorage.setItem('preferredChainId', networkId as unknown as string);
      // const chainId = await web3.eth.chainId();
      // await this.setState({ chainId, networkId });
    });
  };


  const getProviderOptions = () => {
    const chainId: ChainId = 1;
    const networkConfig = getNetworkConfig(chainId);
    const providerOptions = {
      walletconnect: {
        package: WalletConnect,
        options: {
          rpc: supportedChainIds.reduce((acc, network) => {
            const config = getNetworkConfig(network);
            acc[network] = config.privateJsonRPCUrl || config.publicJsonRPCUrl[0];
            return acc;
          }, {} as { [networkId: number]: string }),
          bridge: 'https://aave.bridge.walletconnect.org',
          qrcode: true,
          pollingInterval: POLLING_INTERVAL,
          preferredNetworkId: chainId,
        }
      },
      // torus: {
      //   package: torus,
      //   options: {
      //     chainId,
      //     initOptions: {
      //       network: {
      //         host: chainId === ChainId.polygon ? 'matic' : chainId,
      //       },
      //       showTorusButton: false,
      //       enableLogging: false,
      //       enabledVerifiers: false,
      //     }
      //   }
      // },
      walletlink: {
        package: WalletLink,
        options: {
          appName: APP_NAME,
          appLogoUrl: APP_LOGO_URL,
          url: networkConfig.privateJsonRPCUrl || networkConfig.publicJsonRPCUrl[0]
        }
      },
      // mewconnect: {
      //   package: mewConnect, // required
      //   options: {
      //     url:
      //     networkConfig.privateJsonRPCWSUrl ||
      //     networkConfig.privateJsonRPCUrl ||
      //     networkConfig.publicJsonRPCWSUrl ||
      //     networkConfig.publicJsonRPCUrl[0],
      //     windowClosedError: true,
      //   }
      // },
      frame: {
        package: ethProvider, // required
        options: { supportedChainIds }
      }
    };
    return providerOptions;
  };

  const resetApp = async () => {
    console.log('reset entro')
    // console.log('prov::: ', selectedProvider)
    if (selectedInstance && selectedInstance.currentProvider && selectedInstance.currentProvider.close ) {
      console.log('reset-------- workiing')
      await selectedInstance.currentProvider.close();
    }
    await web3Modal.clearCachedProvider();
  };


  // const web3Modal: Web3Modal = new Web3Modal({
  //   cacheProvider: true,
  //   providerOptions: getProviderOptions()
  // });

    // web 3 modal 
  const onConnect = async () => {
    if (web3Modal) {
      console.log('--------------')
      const instance = await web3Modal.connect();
      await subscribeProvider(instance);
      await instance.enable();
      

      const provider = new ethers.providers.Web3Provider(instance);
      setSelectedProvider(provider);
      setSelectedInstance(instance);
    }
  };

  console.log('provider: ', selectedProvider)
  
  return (
    <div>
      {/* <ConnectWalletModal 
        preferredChainId={1}
        supportedChainIds={supportedChainIds}
        onBackdropPress={() => setConnectorOpen(false)}
        isVisible={isConnectorOpen}
        onUnlockExternalWallet={handleUnlockWallet}
      /> */}
      <Button
        // onClick={() => setConnectorOpen(!isConnectorOpen)}
        onClick={onConnect}
      >
        Connect Wallet
      </Button>
      <Button onClick={resetApp}>
        Disconnect
      </Button>
      {/* <Modal open={showModal} onClose={setShowModal(false)}>
        
            
          ) : result ? (
            <SModalContainer>
              <SModalTitle>{"Call Request Approved"}</SModalTitle>
              <ModalResult>{result}</ModalResult>
            </SModalContainer>
          ) : (
            <SModalContainer>
              <SModalTitle>{"Call Request Rejected"}</SModalTitle>
            </SModalContainer>
          )}
        </Modal> */}
    </div>
  )
  
}
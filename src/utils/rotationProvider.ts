import { BaseProvider, Network, StaticJsonRpcProvider } from '@ethersproject/providers';
import { logger } from 'ethers';

const DEFAULT_ROTATION_DELAY = 5000;
const DEFAULT_FALL_FORWARD_DELAY = 60000;

interface RotationProviderConfig {
  rotationDelay?: number;
  fallFowardDelay?: number;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Returns the network as long as all agree. Throws an error if any two networks do not match
 * @param networks the list of networks to verify
 * @returns Network
 */
export function checkNetworks(networks: Network[]): Network {
  if (networks.length === 0) {
    logger.throwArgumentError('no networks provided', 'networks', networks);
  }

  let result: Network | undefined;

  for (let i = 0; i < networks.length; i++) {
    const network = networks[i];

    if (!network) {
      logger.throwArgumentError('network not defined', 'networks', networks);
    }

    if (!result) {
      result = network;
      continue;
    }

    // Make sure the network matches the previous networks
    if (
      !(
        result.name === network.name &&
        result.chainId === network.chainId &&
        (result.ensAddress === network.ensAddress ||
          (result.ensAddress == null && network.ensAddress == null))
      )
    ) {
      logger.throwArgumentError('provider mismatch', 'networks', networks);
    }
  }

  if (!result) {
    logger.throwArgumentError('no networks defined', 'networks', networks);
  }

  return result;
}

/**
 * The provider will rotate rpcs on error.
 * If provider rotates away from the first RPC, rotate back after a set interval to prioritize using most reliable RPC.
 * If provider rotates through all rpcs, delay to avoid spamming rpcs with requests.
 */
export class RotationProvider extends BaseProvider {
  readonly providers: StaticJsonRpcProvider[];
  private currentProviderIndex = 0;
  private firstRotationTimestamp = 0;
  // after completing a full rotation of the RotationProvider, delay to avoid spamming rpcs with requests
  private rotationDelay: number;
  // if we rotate away from first rpc, return back after this delay
  private fallForwardDelay: number;

  constructor(urls: string[], chainId: number, config?: RotationProviderConfig) {
    super(chainId);
    this.providers = urls.map((url) => new StaticJsonRpcProvider(url, chainId));

    this.rotationDelay = config?.rotationDelay || DEFAULT_ROTATION_DELAY;
    this.fallForwardDelay = config?.fallFowardDelay || DEFAULT_FALL_FORWARD_DELAY;
  }

  /**
   * If we rotate away from the first RPC, rotate back after a set interval to prioritize using most reliable RPC
   */
  async fallForwardRotation() {
    const now = new Date().getTime();
    const diff = now - this.firstRotationTimestamp;
    if (diff < this.fallForwardDelay) {
      await sleep(this.fallForwardDelay - diff);
      this.currentProviderIndex = 0;
    }
  }

  /**
   * If rpc fails, rotate to next available and trigger rotation or fall forward delay where applicable
   * @param prevIndex last updated index, checked to avoid having multiple active rotations
   */
  private async rotateUrl(prevIndex: number) {
    // don't rotate when another rotation was already triggered
    if (prevIndex !== this.currentProviderIndex) return;
    // if we rotate away from the first url, switch back after FALL_FORWARD_DELAY
    if (this.currentProviderIndex === 0) {
      this.currentProviderIndex += 1;
      this.firstRotationTimestamp = new Date().getTime();
      this.fallForwardRotation();
    } else if (this.currentProviderIndex === this.providers.length - 1) {
      await sleep(this.rotationDelay);
      this.currentProviderIndex = 0;
    } else {
      this.currentProviderIndex += 1;
    }
  }

  async detectNetwork(): Promise<Network> {
    const networks = await Promise.all(this.providers.map((c) => c.getNetwork()));
    return checkNetworks(networks);
  }

  // eslint-disable-next-line
  async perform(method: string, params: any): Promise<any> {
    const index = this.currentProviderIndex;
    try {
      return await this.providers[index].perform(method, params);
    } catch (e) {
      console.error(e.message);
      this.emit('debug', {
        action: 'perform',
        provider: this.providers[index],
      });
      await this.rotateUrl(index);
      return await this.perform(method, params);
    }
  }
}

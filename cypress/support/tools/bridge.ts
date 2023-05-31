/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// eslint-disable @typescript-eslint/ban-ts-comment

import { Eip1193Bridge } from '@ethersproject/experimental/lib/eip1193-bridge';
import { JsonRpcProvider } from '@ethersproject/providers';
import { providers, Signer, utils } from 'ethers';

export class CustomizedBridge extends Eip1193Bridge {
  chainId: number;

  constructor(signer: Signer, provider?: providers.Provider, chainId?: number) {
    super(signer, provider);
    this.chainId = chainId || 3030;
  }

  async sendAsync(...args: unknown[]) {
    console.debug('sendAsync called', ...args);
    return this.send(...args);
  }

  async send(...args: unknown[]) {
    console.debug('send called', ...args);
    const isCallbackForm = typeof args[0] === 'object' && typeof args[1] === 'function';
    let callback;
    let method;
    let params;
    console.log(args);
    if (isCallbackForm) {
      callback = args[1];
      // @ts-ignore
      method = args[0].method;
      // @ts-ignore
      params = args[0].params;
    } else {
      method = args[0];
      params = args[1];
    }
    if (method === 'personal_sign') {
      if (!this.signer) {
        throw new Error('personal_sign requires an account');
      }

      const address = await this.signer.getAddress();
      if (address !== utils.getAddress(params[1])) {
        throw new Error(
          `personal_sign account mismatch or account not found: ${params[1] as string}`
        );
      }
      return this.signer.signMessage(utils.arrayify(params[0]));
    }
    if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
      if (isCallbackForm) {
        // @ts-ignore
        callback({ result: [await this.signer.getAddress()] });
      } else {
        return Promise.resolve([await this.signer.getAddress()]);
      }
    }
    if (method === 'eth_signTypedData_v4') {
      if (!this.signer) {
        throw new Error('eth_signTypedData_v4 requires an account');
      }
      const parsed = JSON.parse(params[1]);
      delete parsed.types.EIP712Domain;
      // not sure why _signTypedData exist
      const tx = await (this.signer as any)._signTypedData(
        parsed.domain,
        parsed.types,
        parsed.message
      );
      return tx;
    }
    if (method === 'eth_chainId') {
      if (isCallbackForm) {
        // @ts-ignore
        callback(null, { result: this.chainId });
      } else {
        return Promise.resolve(this.chainId);
      }
    }
    if (method === 'eth_sendTransaction') {
      if (!this.signer) {
        throw new Error('eth_sendTransaction requires an account');
      }

      params[0].gasLimit = params[0].gas;
      delete params[0].gas;

      const req = JsonRpcProvider.hexlifyTransaction(params[0], { from: true, gas: true });

      req.gasLimit = req.gas;
      delete req.gas;

      const tx = await this.signer.sendTransaction(req);
      return tx.hash;
    }
    try {
      const result = await super.send(method, params);
      console.debug('result received', method, params, result);
      if (isCallbackForm) {
        // @ts-ignore
        callback(null, { result });
      } else {
        return result;
      }
    } catch (error) {
      if (isCallbackForm) {
        // @ts-ignore
        callback(error, null);
      } else {
        throw error;
      }
    }
  }
}

import { Address, beginCell, Cell, Dictionary, Slice } from '@ton/core';
import { sha256_sync } from '@ton/crypto';
import axios from 'axios';
import { buffer } from 'stream/consumers';
import { KeyPair, mnemonicNew, mnemonicToPrivateKey, sign } from 'ton-crypto';

// import { JettonDictValueSerializer } from '../utils/contents/jetton';
import { makeSnakeCell } from '../helpers/snake-cell';

const ONCHAIN_CONTENT_PREFIX = 0x00;
const OFFCHAIN_CONTENT_PREFIX = 0x01;
const SNAKE_PREFIX = 0x00;

export type JettonMetaDataKeys =
  | 'name'
  | 'description'
  | 'image'
  | 'symbol'
  | 'image_data'
  | 'decimals'
  | 'uri';

const jettonOnChainMetadataSpec: {
  [key in JettonMetaDataKeys]: 'utf8' | 'ascii' | undefined;
} = {
  name: 'utf8',
  description: 'utf8',
  image: 'ascii',
  decimals: 'utf8',
  symbol: 'utf8',
  image_data: undefined,
  uri: 'ascii',
};

export type DataPrice = {
  usd: string;
  decimal: bigint;
  symbol: string;
  priceNumber: number;
  timestamp: number;
  address: Address;
  signature: Buffer;
};

/**
 * Builds a cell containing on-chain metadata for a jetton.
 *
 * @param data - An object containing the metadata key-value pairs.
 * @returns A cell containing the serialized on-chain metadata.
 * @throws Will throw an error if an unsupported on-chain key is provided.
 */
export function buildJettonOnChainMetadata(data: { [s: string]: string | undefined }): Cell {
  const KEYLEN = 256;
  const dict = Dictionary.empty(Dictionary.Keys.BigUint(KEYLEN), Dictionary.Values.Cell());

  Object.entries(data).forEach(([k, v]: [string, string | undefined]) => {
    if (!jettonOnChainMetadataSpec[k as JettonMetaDataKeys])
      throw new Error(`Unsupported onchain key: ${k}`);
    if (v === undefined || v === '') return;

    const bufferToStore = Buffer.from(v, jettonOnChainMetadataSpec[k as JettonMetaDataKeys]);

    const cell = makeSnakeCell(bufferToStore);

    dict.set(BigInt('0x' + sha256_sync(k).toString('hex')), cell);
  });

  return beginCell().storeUint(ONCHAIN_CONTENT_PREFIX, 8).storeDict(dict).endCell();

  // const CELL_MAX_SIZE_BYTES = Math.floor((1023 - 8) / 8);

  // Object.entries(data).forEach(([k, v]: [string, string | undefined]) => {
  //     if (!jettonOnChainMetadataSpec[k as JettonMetaDataKeys]) throw new Error(`Unsupported onchain key: ${k}`);
  //     if (v === undefined || v === '') return;

  //     let bufferToStore = Buffer.from(v, jettonOnChainMetadataSpec[k as JettonMetaDataKeys]);

  //     const rootCell = beginCell();
  //     rootCell.storeUint(SNAKE_PREFIX, 8);
  //     let currCell = rootCell;

  //     while (bufferToStore.length > 0) {
  //         currCell.storeBuffer(bufferToStore.slice(0, CELL_MAX_SIZE_BYTES));
  //         bufferToStore = bufferToStore.slice(CELL_MAX_SIZE_BYTES);

  //         if (bufferToStore.length > 0) {
  //             const newCell = beginCell();
  //             currCell.storeRef(newCell);
  //             currCell = newCell;
  //         }
  //     }

  //     dict.set(BigInt('0x' + sha256_sync(k).toString('hex')), { content: rootCell.endCell() });
  // });

  // return beginCell().storeUint(ONCHAIN_CONTENT_PREFIX, 8).storeDict(dict).endCell();
}

export function buildJettonOffChainMetadata(contentUri: string): Cell {
  return beginCell()
    .storeUint(OFFCHAIN_CONTENT_PREFIX, 8)
    .storeBuffer(Buffer.from(contentUri, 'ascii'))
    .endCell();
}

export type PersistenceType = 'onchain' | 'offchain_private_domain' | 'offchain_ipfs';

export async function readJettonMetadata(contentCell: Cell): Promise<{
  persistenceType: PersistenceType;
  metadata: { [s in JettonMetaDataKeys]?: string };
}> {
  const contentSlice = contentCell.beginParse();

  switch (Number(contentSlice.loadUint(8))) {
    case ONCHAIN_CONTENT_PREFIX: {
      const metadata = parseJettonOnChainMetadata(contentSlice);

      const persistenceType: PersistenceType = 'onchain';

      if (metadata.uri) {
        // handle semi onchain metadata
      }

      return {
        persistenceType: persistenceType,
        metadata,
      };
    }
    case OFFCHAIN_CONTENT_PREFIX:
      const { metadata, isIpfs } = await parseJettonOffchainMetadata(contentSlice);
    default:
      throw new Error('Unexpected jetton metadata content prefix');
  }
}

export function parseJettonOnChainMetadata(contentSlice: Slice) {
  const KEYLEN = 256;
  const dict = contentSlice.loadDict(Dictionary.Keys.BigUint(KEYLEN), Dictionary.Values.Cell());

  const metadata: { [s in JettonMetaDataKeys]?: string } = {};

  Object.keys(jettonOnChainMetadataSpec).forEach((k) => {
    const key = BigInt('0x' + sha256_sync(k).toString('hex'));
    const val = dict.get(key)?.beginParse().skip(8).loadStringTail();

    if (val) metadata[k as JettonMetaDataKeys] = val;
  });

  return metadata;
}

async function parseJettonOffchainMetadata(contentSlice: Slice): Promise<{
  metadata: { [s in JettonMetaDataKeys]?: string };
  isIpfs: boolean;
}> {
  return getJettonMetadataFromExternalUri(
    Buffer.from(contentSlice.loadStringTail()).toString('ascii')
  );
}

async function getJettonMetadataFromExternalUri(uri: string) {
  const jsonURI = uri.replace('ipfs://', 'https://ipfs.io/ipfs/');

  return {
    metadata: (await axios.get(jsonURI)).data,
    isIpfs: /(^|\/)ipfs[.:]/.test(jsonURI),
  };
}

export async function getPublicKey() {
  // TODO get from BE api
  return (await getKeyPair()).publicKey;
}

export async function getKeyPair(): Promise<KeyPair> {
  const mnemonic =
    'tooth file stomach split degree van excite sausage soup simple onion merry list depend keep garbage admit client engine other expose six put curious';
  // TODO get from BE api
  const mnemonicsString = process.env.WALLET_MNEMONIC_BE ?? mnemonic;
  const kpBE = await mnemonicToPrivateKey(mnemonicsString.split(' '));
  return kpBE;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getPrice(symbol: any): Promise<DataPrice> {
  const res = await fetch('https://aave-ton-api.sotatek.works/crawler/price');
  const data = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dataFilter: any = Object.values(data).filter((item: any) => item.symbol == symbol)[0];

  return {
    usd: dataFilter.usd ?? '',
    decimal: dataFilter.decimal ?? 0,
    timestamp: dataFilter.timestamp ?? 0,
    symbol: dataFilter.symbol ?? '',
    priceNumber: dataFilter.priceNumber ?? 0,
    address: dataFilter.address ?? NaN,
    signature: Buffer.from(dataFilter.signature ?? '', 'hex'),
  };
}

export async function getPriceAll(): Promise<DataPrice[]> {
  const res = await fetch('https://aave-ton-api.sotatek.works/crawler/price');
  const data = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let resultPrices: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Object.values(data).forEach((item: any) => {
    const resultItem: DataPrice = {
      usd: item.usd ?? '',
      decimal: item.decimal ?? 0,
      timestamp: item.timestamp ?? 0,
      symbol: item.symbol ?? '',
      priceNumber: item.priceNumber ?? 0,
      address: item.address ?? NaN,
      signature: Buffer.from(item.signature ?? '', 'hex'),
    };
    resultPrices.push(resultItem);
  });

  return resultPrices;
}

export type ResultPriceSig = {
  price_data: Cell;
  sig: Buffer;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getSig(symbol: any): Promise<ResultPriceSig> {
  const priceAPI = await getPrice(symbol);
  // priceAPI.signature  fb79bbe1959f7d
  const dataPrice = beginCell()
    .storeInt(priceAPI.priceNumber, 64)
    .storeInt(priceAPI.timestamp, 64)
    .storeAddress(Address.parse(priceAPI.address.toString()))
    .endCell();

  return { price_data: dataPrice, sig: priceAPI.signature };
}

/* listJettonAddressMock: need for mock test script
const listJettonAddressMock = {
    isMock : true,
    TON : pool.address,
    USDT : USDT.address,
    USDC : USDC.address,
    DAI : DAI.address,
}; */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getMultiSig(listJettonAddressMock: any): Promise<Dictionary<bigint, Cell>> {
  const KEYLEN = 256;
  const dict = Dictionary.empty(Dictionary.Keys.BigUint(KEYLEN), Dictionary.Values.Cell());

  const res = await fetch('https://aave-ton-api.sotatek.works/crawler/price');
  const data = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Object.values(data).forEach((item: any) => {
    const resultItem: DataPrice = {
      usd: item.usd ?? '',
      decimal: item.decimal ?? 0,
      timestamp: item.timestamp ?? 0,
      symbol: item.symbol ?? '',
      priceNumber: item.priceNumber ?? 0,
      address: item.address ?? NaN,
      signature: Buffer.from(item.signature ?? '', 'hex'),
    };

    const dataPriceToCell = beginCell()
      .storeInt(resultItem.priceNumber, 64)
      .storeInt(resultItem.timestamp, 64)
      .storeAddress(Address.parse(resultItem.address.toString()))
      .endCell();
    const itemDict = beginCell()
      .storeRef(dataPriceToCell)
      .storeBuffer(resultItem.signature)
      .endCell();

    let assetHash = BigInt(
      '0x' + Address.parse(resultItem.address.toString()).hash.toString('hex')
    );
    console.log('assetHash real ', assetHash);

    if (listJettonAddressMock.isMock) {
      assetHash = BigInt(
        '0x' +
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          Address.parse(listJettonAddressMock[resultItem.symbol as any].toString()).hash.toString(
            'hex'
          )
      );
    }

    dict.set(assetHash, itemDict);
  });

  return dict;
}

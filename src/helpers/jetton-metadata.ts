import { beginCell, Cell, Dictionary, Slice } from '@ton/core';
import { sha256_sync } from '@ton/crypto';

import { makeSnakeCell } from './snake-cell';

const ONCHAIN_CONTENT_PREFIX = 0x00;
const OFFCHAIN_CONTENT_PREFIX = 0x01;

export type JettonMetaDataKeys =
  | 'name'
  | 'description'
  | 'image'
  | 'symbol'
  | 'image_data'
  | 'decimals'
  | 'uri';

export type PersistenceType = 'onchain' | 'offchain_private_domain' | 'offchain_ipfs';

export type Metadata = {
  [s in JettonMetaDataKeys]?: string;
};

export type JettonMetadata = {
  persistenceType: PersistenceType;
  metadata: Metadata;
};

export type JettonOnChainMetadataSpec = {
  [key in JettonMetaDataKeys]: 'utf8' | 'ascii' | undefined;
};

const JETTON_ONCHAIN_METADATA_SPEC: JettonOnChainMetadataSpec = {
  name: 'utf8',
  description: 'utf8',
  image: 'ascii',
  decimals: 'utf8',
  symbol: 'utf8',
  image_data: undefined,
  uri: 'ascii',
};

export const buildJettonOffChainMetadata = (uri: string): Cell => {
  return beginCell()
    .storeUint(OFFCHAIN_CONTENT_PREFIX, 8)
    .storeBuffer(Buffer.from(uri, 'ascii'))
    .endCell();
};

export const buildJettonOnChainMetadata = (data: Metadata): Cell => {
  const KEYLEN = 256;
  const dict = Dictionary.empty(Dictionary.Keys.BigUint(KEYLEN), Dictionary.Values.Cell());

  Object.entries(data).forEach(([k, v]: [string, string | undefined]) => {
    if (!JETTON_ONCHAIN_METADATA_SPEC[k as JettonMetaDataKeys])
      throw new Error(`Unsupported onchain key: ${k}`);
    if (v === undefined || v === '') return;

    const bufferToStore = Buffer.from(v, JETTON_ONCHAIN_METADATA_SPEC[k as JettonMetaDataKeys]);
    const cell = makeSnakeCell(bufferToStore);
    dict.set(BigInt('0x' + sha256_sync(k).toString('hex')), cell);
  });

  return beginCell().storeUint(ONCHAIN_CONTENT_PREFIX, 8).storeDict(dict).endCell();
};

export const parseJettonOnChainMetadata = (content: Slice): Metadata => {
  const KEYLEN = 256;
  const dict = content.loadDict(Dictionary.Keys.BigUint(KEYLEN), Dictionary.Values.Cell());

  const metadata: Metadata = {};

  Object.keys(JETTON_ONCHAIN_METADATA_SPEC).forEach((k) => {
    const key = BigInt('0x' + sha256_sync(k).toString('hex'));
    const val = dict.get(key)?.beginParse().skip(8).loadStringTail();

    if (val) metadata[k as JettonMetaDataKeys] = val;
  });

  return metadata;
};

export const readJettonMetadata = async (content: Cell): Promise<JettonMetadata> => {
  const contentSlice = content.beginParse();

  switch (Number(contentSlice.loadUint(8))) {
    case ONCHAIN_CONTENT_PREFIX: {
      const metadata = parseJettonOnChainMetadata(contentSlice);

      if (metadata.uri) {
        // TODO: Handle semi onchain metadata
      }

      return {
        persistenceType: 'onchain',
        metadata,
      };
    }
    case OFFCHAIN_CONTENT_PREFIX:
      // TODO: Handle offchain content
      throw new Error('Not supported yet');
    // return { persistenceType: 'offchain_private_domain', metadata: {} };
    default:
      throw new Error('Unexpected jetton metadata content prefix');
  }
};

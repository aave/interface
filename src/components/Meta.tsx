import Head from 'next/head';
import React from 'react';

type MetaProps = {
  title: string;
  description: string;
  imageUrl?: string;
  timestamp?: string;
};

export function Meta({ title, description, imageUrl, timestamp }: MetaProps) {
  return (
    <Head>
      <title>Maneki - {title}</title>
      <meta name="description" content={description} key="description" />
      <meta property="og:title" content={`Maneki - ${title}`} key="title" />
      <meta property="og:description" content={description} key="ogdescription" />
      {imageUrl && <meta property="og:image" content={imageUrl} key="ogimage" />}
      {imageUrl && <meta name="twitter:image" content={imageUrl} key="twitterimage" />}
      {imageUrl && (
        <meta name="twitter:image:alt" content={`Maneki governance image`} key="twitteralt" />
      )}
      <meta name="twitter:site" content="@Maneki_Protocol" key="twittersite" />
      <meta
        property="twitter:card"
        content={imageUrl ? 'summary_large_image' : 'summary'}
        key="twittercard"
      />
      <meta name="twitter:title" content={title} key="twittertitle" />
      <meta name="twitter:description" content={description} key="twitterdescription" />
      {timestamp && <meta name="revised" content={timestamp} key="timestamp" />}
      <meta
        name="keywords"
        key="keywords"
        content="Decentralized Finance, DeFi, lending, lending protocol, borrowing, stablecoins, Ethereum, BNB, BSC, Binance Coin, binance smart chain, BNB Chain, erc-20, bep-20, smart contracts, open finance, liquidity pool, venus, venus protocol, venus finance, radiant, radiant capital, radiant finance, crypto, cryptocurrencies, pancakeswap"
      />
    </Head>
  );
}

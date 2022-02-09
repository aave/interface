import React from 'react';
import Head from 'next/head';

type MetaProps = {
  title: string;
  description: string;
  imageUrl?: string;
  timestamp?: string;
};

export function Meta({ title, description, imageUrl, timestamp }: MetaProps) {
  return (
    <Head>
      <title>{title}</title>
      <link rel="icon" href="/favicon.ico" />
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
      {imageUrl && <meta name="twitter:image:alt" content={`tokenizedBTC over time`} />}
      <meta name="twitter:site" content="@sakulstra" />
      <meta property="twitter:card" content={imageUrl ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {timestamp && <meta name="revised" content={timestamp} />}
    </Head>
  );
}

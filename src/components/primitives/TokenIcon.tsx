import { Badge, Box, Icon, IconProps } from '@mui/material';
import { forwardRef, useEffect, useRef, useState } from 'react';
import LazyLoad from 'react-lazy-load';

/**
 * To save some bundle size we stopped base64 encoding & inlining svgs as base encoding increases size by up to 30%
 * and most users will never need all token icons.
 * The aToken icons have previously been separate icons also adding to bundle size. Now they are composed on the fly.
 * When adding a token to metamask, you can either supply a url or a base64 encoded string.
 * Supplying a url seems not very rational, but supplying a base64 for an external svg image that is composed with a react component is non trivial.
 * Therefore the solution we came up with is:
 * 1. rendering the svg component as an object
 * 2. rendering the aToken ring as a react component
 * 3. using js to manipulate the dome to have the object without the subdocument inside the react component
 * 4. base64 encode the composed dom svg
 *
 * This component is probably hugely over engineered & unnecessary.
 * I'm looking forward for the pr which evicts it.
 */
interface ATokenIconProps {
  symbol?: string;
  waToken?: boolean; // Add waToken prop
}

// Modified Base64Token to support waToken
export function Base64Token({
  symbol,
  onImageGenerated,
  aToken,
  waToken,
}: {
  symbol: string;
  aToken?: boolean;
  waToken?: boolean;
  onImageGenerated: (base64: string) => void;
}) {
  const ref = useRef<HTMLObjectElement>(null);
  const tokenRef = useRef<SVGSVGElement>(null);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!loading && ref.current && ref.current?.contentDocument) {
      if (aToken || waToken) {
        // eslint-disable-next-line
        const inner = ref.current?.contentDocument?.childNodes?.[0] as any;
        const oldWidth = inner.getAttribute('width');
        const oldHeight = inner.getAttribute('height');
        const vb = inner.getAttribute('viewBox');
        inner.setAttribute('x', 25);
        inner.setAttribute('width', 206);
        inner.setAttribute('y', 25);
        inner.setAttribute('height', 206);
        if (!vb) {
          inner.setAttribute('viewBox', `0 0 ${oldWidth} ${oldHeight}`);
        }

        tokenRef.current?.appendChild(inner);
        const s = new XMLSerializer().serializeToString(tokenRef.current as unknown as Node);

        onImageGenerated(
          `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(s)))}`
        );
      } else {
        const s = new XMLSerializer().serializeToString(ref.current?.contentDocument);
        onImageGenerated(
          `data:image/svg+xml;base64,${window.btoa(unescape(encodeURIComponent(s)))}`
        );
      }
    }
  }, [loading, aToken, waToken]);
  return (
    <div
      style={{
        visibility: 'hidden',
        height: 0,
        width: 0,
        overflow: 'hidden',
      }}
    >
      <object
        style={{ opacity: 1 }}
        ref={ref}
        id="svg"
        data={`/icons/tokens/${symbol.toLowerCase()}.svg`}
        onLoad={() => setLoading(false)}
      />
      {(aToken || waToken) && <TokenRing ref={tokenRef} waToken={waToken} />}
    </div>
  );
}

// Renamed from ATokenIcon to TokenRing to better reflect its purpose
export const TokenRing = forwardRef<SVGSVGElement, ATokenIconProps>(({ symbol, waToken }, ref) => {
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
      ref={ref}
      id="Group_30952"
      width="256"
      height="256"
      viewBox="0 0 256 256"
    >
      <defs id="defs10">
        <linearGradient
          id="linear-gradient"
          x1=".843"
          x2=".206"
          y1=".135"
          y2=".886"
          gradientUnits="objectBoundingBox"
        >
          <stop offset="0" stopColor="#b6509e" id="stop2" />
          <stop offset="1" stopColor="#2ebac6" id="stop4" />
        </linearGradient>
      </defs>
      <g id="Group_29109">
        {waToken ? (
          // Dotted border path for waToken
          <path
            id="Subtraction_108"
            fill="none"
            stroke="url(#linear-gradient)"
            strokeWidth="13.713"
            strokeDasharray="8,8"
            d="M128 256a128.976 128.976 0 0 1-25.8-2.6 127.309 127.309 0 0 1-45.77-19.261 128.366 128.366 0 0 1-46.375-56.315A127.357 127.357 0 0 1 2.6 153.8a129.251 129.251 0 0 1 0-51.593 127.31 127.31 0 0 1 19.26-45.77 128.372 128.372 0 0 1 56.317-46.378A127.33 127.33 0 0 1 102.2 2.6a129.244 129.244 0 0 1 51.593 0 127.308 127.308 0 0 1 45.77 19.26 128.367 128.367 0 0 1 46.375 56.316A127.343 127.343 0 0 1 253.4 102.2a129.248 129.248 0 0 1 0 51.593 127.3 127.3 0 0 1-19.26 45.77 128.382 128.382 0 0 1-56.316 46.375A127.4 127.4 0 0 1 153.8 253.4 128.977 128.977 0 0 1 128 256z"
          />
        ) : (
          // Original filled path for aToken
          <path
            id="Subtraction_108"
            fill="url(#linear-gradient)"
            d="M128 256a128.976 128.976 0 0 1-25.8-2.6 127.309 127.309 0 0 1-45.77-19.261 128.366 128.366 0 0 1-46.375-56.315A127.357 127.357 0 0 1 2.6 153.8a129.251 129.251 0 0 1 0-51.593 127.31 127.31 0 0 1 19.26-45.77 128.372 128.372 0 0 1 56.317-46.378A127.33 127.33 0 0 1 102.2 2.6a129.244 129.244 0 0 1 51.593 0 127.308 127.308 0 0 1 45.77 19.26 128.367 128.367 0 0 1 46.375 56.316A127.343 127.343 0 0 1 253.4 102.2a129.248 129.248 0 0 1 0 51.593 127.3 127.3 0 0 1-19.26 45.77 128.382 128.382 0 0 1-56.316 46.375A127.4 127.4 0 0 1 153.8 253.4 128.977 128.977 0 0 1 128 256zm0-242.287a115.145 115.145 0 0 0-23.033 2.322A113.657 113.657 0 0 0 64.1 33.232a114.622 114.622 0 0 0-41.4 50.283 113.7 113.7 0 0 0-6.659 21.452 115.4 115.4 0 0 0 0 46.065 113.66 113.66 0 0 0 17.2 40.866 114.627 114.627 0 0 0 50.282 41.407 113.75 113.75 0 0 0 21.453 6.658 115.381 115.381 0 0 0 46.065 0 113.609 113.609 0 0 0 40.866-17.2 114.622 114.622 0 0 0 41.393-50.278 113.741 113.741 0 0 0 6.659-21.453 115.4 115.4 0 0 0 0-46.065 113.662 113.662 0 0 0-17.2-40.865A114.619 114.619 0 0 0 172.485 22.7a113.74 113.74 0 0 0-21.453-6.659A115.145 115.145 0 0 0 128 13.714z"
          />
        )}
        {symbol && (
          <image
            x="25"
            y="25"
            href={`/icons/tokens/${symbol.toLowerCase()}.svg`}
            width="206"
            height="206"
          />
        )}
      </g>
    </svg>
  );
});
TokenRing.displayName = 'TokenRing';

interface TokenIconProps extends IconProps {
  symbol: string;
  aToken?: boolean;
  waToken?: boolean;
  aTokens?: boolean[];
  waTokens?: boolean[];
}

function SingleTokenIcon({ symbol, aToken, waToken, ...rest }: TokenIconProps) {
  const [tokenSymbol, setTokenSymbol] = useState(symbol.toLowerCase());

  useEffect(() => {
    setTokenSymbol(symbol.toLowerCase());
  }, [symbol]);

  return (
    <Icon {...rest} sx={{ display: 'flex', position: 'relative', borderRadius: '50%', ...rest.sx }}>
      {aToken || waToken ? (
        <TokenRing symbol={tokenSymbol} waToken={waToken} />
      ) : (
        <img
          src={`/icons/tokens/${tokenSymbol}.svg`}
          onError={() => setTokenSymbol('default')}
          width="100%"
          height="100%"
          alt={`${symbol} icon`}
        />
      )}
    </Icon>
  );
}

/**
 * Renders a tokenIcon specified by url.
 * TokenIcons are expected to be non protocol related assets for swaps
 * @param param0
 * @returns
 */

interface ExternalTokenIconProps extends IconProps {
  symbol: string;
  logoURI?: string;
}

export function ExternalTokenIcon({ symbol, logoURI, ...rest }: ExternalTokenIconProps) {
  const [tokenSymbol, setTokenSymbol] = useState(symbol.toLowerCase());
  return (
    <Icon {...rest} sx={{ display: 'flex', position: 'relative', borderRadius: '50%', ...rest.sx }}>
      <LazyLoad>
        <img
          src={tokenSymbol === 'default' || !logoURI ? '/icons/tokens/default.svg' : logoURI}
          width="100%"
          height="100%"
          alt={`${symbol} icon`}
          onError={() => setTokenSymbol('default')}
        />
      </LazyLoad>
    </Icon>
  );
}

interface MultiTokenIconProps extends IconProps {
  symbols: string[];
  badgeSymbol?: string;
  aToken?: boolean;
  waToken?: boolean;
  aTokens?: boolean[];
  waTokens?: boolean[];
}

export function MultiTokenIcon({
  symbols,
  badgeSymbol,
  aToken = false,
  waToken = false,
  aTokens: providedATokens,
  waTokens: providedWaTokens,
  ...rest
}: MultiTokenIconProps) {
  const aTokens = providedATokens || symbols.map((_, index) => (index === 0 ? aToken : false));
  const waTokens = providedWaTokens || symbols.map((_, index) => (index === 0 ? waToken : false));

  if (!badgeSymbol)
    return (
      <Box sx={{ display: 'inline-flex', position: 'relative' }}>
        {symbols.map((symbol, ix) => (
          <SingleTokenIcon
            {...rest}
            key={symbol}
            symbol={symbol}
            aToken={aTokens[ix]}
            waToken={waTokens[ix]}
            sx={{ ml: ix === 0 ? 0 : `calc(-1 * 0.5em)`, ...rest.sx }}
          />
        ))}
      </Box>
    );
  return (
    <Badge
      badgeContent={
        <SingleTokenIcon symbol={badgeSymbol} sx={{ border: '1px solid #fff' }} fontSize="small" />
      }
      sx={{ '.MuiBadge-anchorOriginTopRight': { top: 9 } }}
    >
      {symbols.map((symbol, ix) => (
        <SingleTokenIcon
          {...rest}
          key={symbol}
          symbol={symbol}
          aToken={aTokens[ix]}
          waToken={waTokens[ix]}
          sx={{ ml: ix === 0 ? 0 : 'calc(-1 * 0.5em)', ...rest.sx }}
        />
      ))}
    </Badge>
  );
}

export function TokenIcon({ symbol, aToken, waToken, aTokens, waTokens, ...rest }: TokenIconProps) {
  const symbolChunks = symbol.split('_');
  if (symbolChunks.length > 1) {
    if (symbolChunks[0].startsWith('pools/')) {
      const [badge, ...symbols] = symbolChunks;
      return <MultiTokenIcon {...rest} symbols={symbols} badgeSymbol={'/pools/' + badge} />;
    }
    return (
      <MultiTokenIcon
        {...rest}
        symbols={symbolChunks}
        aToken={aToken}
        waToken={waToken}
        aTokens={aTokens}
        waTokens={waTokens}
      />
    );
  }

  return <SingleTokenIcon symbol={symbol} aToken={aToken} waToken={waToken} {...rest} />;
}

import { Box } from '@mui/material';
import { Fragment, memo, useId } from 'react';
import { figVars, onAccent } from 'src/utils/figmaColors';

const GLOW_PULSE = 'v4-migration-icon-glow-pulse';

const LOGO_PATH =
  'M19.27 19.3015C20.9294 18.7874 22.6918 19.7151 23.2062 21.3744C23.7205 23.034 22.7918 24.7964 21.1323 25.3108C19.4728 25.8251 17.7106 24.8971 17.1961 23.2378C16.6817 21.5782 17.6104 19.8159 19.27 19.3015ZM27.4126 18.1571C29.0721 17.6429 30.8344 18.5706 31.3488 20.2301C31.8632 21.8896 30.9345 23.652 29.2749 24.1664C27.6155 24.6807 25.8532 23.7527 25.3387 22.0934C24.8244 20.4339 25.7531 18.6715 27.4126 18.1571ZM22.4594 8.8753C30.9174 7.6866 38.7582 13.7109 39.968 22.3293L36.0553 22.8792C35.1475 16.4206 29.3467 11.8964 23.0091 12.787C16.6717 13.6779 12.3435 19.6256 13.2511 26.0841L9.33836 26.634C8.12505 18.0162 14.0008 10.0643 22.4594 8.8753Z';

const LOGO_EDGE_PATH =
  'M19.27 19.3015L18.974 18.3463L18.974 18.3463L19.27 19.3015ZM23.2062 21.3744L24.1613 21.0784L24.1613 21.0784L23.2062 21.3744ZM21.1323 25.3108L21.4283 26.2659L21.4283 26.2659L21.1323 25.3108ZM17.1961 23.2378L16.2409 23.5339L16.2409 23.534L17.1961 23.2378ZM27.4126 18.1571L27.1166 17.2019L27.1166 17.2019L27.4126 18.1571ZM31.3488 20.2301L32.304 19.934L32.304 19.934L31.3488 20.2301ZM29.2749 24.1664L29.5709 25.1216L29.5709 25.1216L29.2749 24.1664ZM25.3387 22.0934L24.3835 22.3895L24.3836 22.3896L25.3387 22.0934ZM22.4594 8.8753L22.3202 7.88503L22.3202 7.88503L22.4594 8.8753ZM39.968 22.3293L40.1072 23.3195L41.0973 23.1804L40.9583 22.1902L39.968 22.3293ZM36.0553 22.8792L35.065 23.0183L35.2042 24.0086L36.1945 23.8694L36.0553 22.8792ZM23.0091 12.787L22.8699 11.7968L22.8699 11.7968L23.0091 12.787ZM13.2511 26.0841L13.3902 27.0744L14.3805 26.9352L14.2413 25.9449L13.2511 26.0841ZM9.33836 26.634L8.34812 26.7734L8.4875 27.7634L9.47753 27.6242L9.33836 26.634ZM19.27 19.3015L19.5659 20.2567C20.6983 19.9059 21.9003 20.539 22.251 21.6705L23.2062 21.3744L24.1613 21.0784C23.4833 18.8911 21.1606 17.6688 18.974 18.3463L19.27 19.3015ZM23.2062 21.3744L22.251 21.6705C22.6018 22.8023 21.9684 24.0047 20.8362 24.3556L21.1323 25.3108L21.4283 26.2659C23.6152 25.5881 24.8392 23.2656 24.1613 21.0784L23.2062 21.3744ZM21.1323 25.3108L20.8362 24.3556C19.7042 24.7065 18.5022 24.0734 18.1512 22.9416L17.1961 23.2378L16.2409 23.534C16.9191 25.7208 19.2415 26.9437 21.4283 26.2659L21.1323 25.3108ZM17.1961 23.2378L18.1513 22.9418C17.8004 21.8099 18.4338 20.6076 19.566 20.2567L19.27 19.3015L18.974 18.3463C16.787 19.0241 15.563 21.3466 16.2409 23.5339L17.1961 23.2378ZM27.4126 18.1571L27.7086 19.1123C28.8409 18.7614 30.0428 19.3945 30.3936 20.5262L31.3488 20.2301L32.304 19.934C31.626 17.7468 29.3033 16.5243 27.1166 17.2019L27.4126 18.1571ZM31.3488 20.2301L30.3936 20.5261C30.7444 21.658 30.111 22.8603 28.9789 23.2112L29.2749 24.1664L29.5709 25.1216C31.7579 24.4438 32.9819 22.1213 32.304 19.934L31.3488 20.2301ZM29.2749 24.1664L28.9789 23.2112C27.8468 23.5621 26.6448 22.929 26.2938 21.7973L25.3387 22.0934L24.3836 22.3896C25.0617 24.5765 27.3842 25.7993 29.5709 25.1216L29.2749 24.1664ZM25.3387 22.0934L26.2939 21.7974C25.9431 20.6655 26.5765 19.4632 27.7087 19.1123L27.4126 18.1571L27.1166 17.2019C24.9296 17.8798 23.7056 20.2022 24.3835 22.3895L25.3387 22.0934ZM22.4594 8.8753L22.5985 9.86557C30.4923 8.75617 37.8422 14.3794 38.9777 22.4683L39.968 22.3293L40.9583 22.1902C39.6741 13.0424 31.3425 6.61702 22.3202 7.88503L22.4594 8.8753ZM39.968 22.3293L39.8288 21.339L35.9161 21.8889L36.0553 22.8792L36.1945 23.8694L40.1072 23.3195L39.968 22.3293ZM36.0553 22.8792L37.0456 22.74C36.0646 15.7605 29.7802 10.8256 22.8699 11.7968L23.0091 12.787L23.1483 13.7773C28.9133 12.9671 34.2304 17.0806 35.065 23.0183L36.0553 22.8792ZM23.0091 12.787L22.8699 11.7968C15.9598 12.7681 11.28 19.244 12.2608 26.2232L13.2511 26.0841L14.2413 25.9449C13.4069 20.0071 17.3836 14.5877 23.1483 13.7773L23.0091 12.787ZM13.2511 26.0841L13.1119 25.0938L9.19918 25.6437L9.33836 26.634L9.47753 27.6242L13.3902 27.0744L13.2511 26.0841ZM9.33836 26.634L10.3286 26.4946C9.18984 18.4063 14.7042 10.9752 22.5986 9.86556L22.4594 8.8753L22.3202 7.88503C13.2973 9.15331 7.06026 17.6261 8.34812 26.7734L9.33836 26.634Z';

const BADGE = { cx: '42.2427', cy: '38.8706', transform: 'rotate(8 32.2427 28.8706)' };

const OPAQUE = '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0';
const BLACK_25 = '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0';
const WHITE_50 = '0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0';
const NOISE_THRESHOLD = `${'1 '.repeat(51)}${'0 '.repeat(49)}`.trim();

const INNER_HIGHLIGHTS = [
  { dx: '0', dy: '0.78125', stdDeviation: '0.195312' },
  { dx: '0', dy: '-0.46875', stdDeviation: '0.234375' },
  { dx: '0.625', dy: '0.15625', stdDeviation: '0.234375' },
  { dx: '-0.625', dy: '0.15625', stdDeviation: '0.234375' },
];

export const V4MigrationIcon = memo(() => {
  const uid = useId();
  const id = (name: string) => `${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;

  return (
    <Box aria-hidden sx={{ position: 'relative', flexShrink: 0, width: '3rem', height: '3rem' }}>
      <Box
        sx={{
          position: 'absolute',
          inset: '-3.5rem',
          zIndex: -1,
          pointerEvents: 'none',
          backgroundImage: `radial-gradient(closest-side, ${figVars['purple-1']} 70%, transparent)`,
          opacity: 0.04,
          [`@keyframes ${GLOW_PULSE}`]: {
            '50%': { opacity: 0.025, transform: 'scale(0.8)' },
          },
          animation: `${GLOW_PULSE} 4s ease-in-out infinite`,
        }}
      />
      <Box
        component="svg"
        viewBox="-2 -2 56 56"
        fill="none"
        sx={{
          position: 'absolute',
          top: '-0.125rem',
          left: '-0.125rem',
          width: '3.5rem',
          height: '3.5rem',
        }}
      >
        <g filter={url('tile-shadow')} mask={url('badge-cutout')}>
          <g clipPath={url('tile-clip')}>
            <path
              d="M2 6.97803L41.6107 1.4111L47.1776 41.0218L7.56692 46.5887L2 6.97803Z"
              fill={url('tile-fill')}
            />
            <g filter={url('logo-effects')}>
              <mask id={id('logo-inside')} fill="white">
                <path d={LOGO_PATH} />
              </mask>
              <path d={LOGO_PATH} fill={url('logo-fill')} fillOpacity="0.94" />
              <path d={LOGO_EDGE_PATH} fill="white" fillOpacity="0.3" mask={url('logo-inside')} />
            </g>
          </g>
          <rect
            x="2.56472"
            y="7.40357"
            width="39"
            height="39"
            rx="9.5"
            transform="rotate(-8 2.56472 7.40357)"
            stroke="white"
            strokeOpacity="0.09"
          />
        </g>
        <circle {...BADGE} r="9" fill={url('badge-fill')} />
        <path
          d="M37.2525 41.1031L44.2072 39.2396M42.0554 42.922L44.2072 39.2396L40.5025 37.1265"
          stroke={onAccent}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <mask
            id={id('badge-cutout')}
            maskUnits="userSpaceOnUse"
            x="-2"
            y="-2"
            width="56"
            height="56"
          >
            <rect x="-2" y="-2" width="56" height="56" fill="white" />
            <circle {...BADGE} r="11" fill="black" />
          </mask>
          <filter
            id={id('tile-shadow')}
            x="0"
            y="0.411133"
            width="49.1777"
            height="49.1777"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="bg" />
            <feColorMatrix in="SourceAlpha" type="matrix" values={OPAQUE} />
            <feOffset dy="1" />
            <feGaussianBlur stdDeviation="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.03 0" />
            <feBlend mode="normal" in2="bg" result="shadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="shadow" />
          </filter>
          <filter
            id={id('logo-effects')}
            x="6.21094"
            y="5.75684"
            width="36.7258"
            height="23.8459"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="bg" />
            <feColorMatrix in="SourceAlpha" type="matrix" values={OPAQUE} />
            <feOffset dy="0.15625" />
            <feGaussianBlur stdDeviation="0.703125" />
            <feColorMatrix type="matrix" values={BLACK_25} />
            <feBlend mode="normal" in2="bg" result="drop1" />
            <feColorMatrix in="SourceAlpha" type="matrix" values={OPAQUE} result="alpha" />
            <feOffset dy="0.15625" />
            <feGaussianBlur stdDeviation="0.546875" />
            <feComposite in2="alpha" operator="out" />
            <feColorMatrix type="matrix" values={BLACK_25} />
            <feBlend mode="normal" in2="drop1" result="drop2" />
            <feColorMatrix in="SourceAlpha" type="matrix" values={OPAQUE} result="alpha" />
            <feOffset dy="-0.15625" />
            <feGaussianBlur stdDeviation="0.078125" />
            <feComposite in2="alpha" operator="out" />
            <feColorMatrix type="matrix" values={BLACK_25} />
            <feBlend mode="normal" in2="drop2" result="drops" />
            <feBlend mode="normal" in="SourceGraphic" in2="bg" result="inner0" />
            {INNER_HIGHLIGHTS.map(({ dx, dy, stdDeviation }, index) => (
              <Fragment key={index}>
                <feColorMatrix in="SourceAlpha" type="matrix" values={OPAQUE} result="alpha" />
                <feOffset dx={dx} dy={dy} />
                <feGaussianBlur stdDeviation={stdDeviation} />
                <feComposite in2="alpha" operator="arithmetic" k2="-1" k3="1" />
                <feColorMatrix type="matrix" values={WHITE_50} />
                <feBlend mode="normal" in2={`inner${index}`} result={`inner${index + 1}`} />
              </Fragment>
            ))}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="25.6"
              stitchTiles="stitch"
              numOctaves="3"
              seed="141"
              result="noise"
            />
            <feComponentTransfer in="noise" result="grain">
              <feFuncR type="linear" slope="2" intercept="-0.5" />
              <feFuncG type="linear" slope="2" intercept="-0.5" />
              <feFuncB type="linear" slope="2" intercept="-0.5" />
              <feFuncA type="discrete" tableValues={NOISE_THRESHOLD} />
            </feComponentTransfer>
            <feComposite operator="in" in="grain" in2={`inner${INNER_HIGHLIGHTS.length}`} />
            <feComponentTransfer result="grainTint">
              <feFuncA type="table" tableValues="0 0.14" />
            </feComponentTransfer>
            <feMerge result="textured">
              <feMergeNode in={`inner${INNER_HIGHLIGHTS.length}`} />
              <feMergeNode in="grainTint" />
            </feMerge>
            <feBlend mode="normal" in="textured" in2="drops" />
          </filter>
          <clipPath id={id('tile-clip')}>
            <rect
              x="2"
              y="6.97803"
              width="40"
              height="40"
              rx="10"
              transform="rotate(-8 2 6.97803)"
            />
          </clipPath>
          <linearGradient
            id={id('tile-fill')}
            x1="21.8054"
            y1="4.19457"
            x2="27.3723"
            y2="43.8053"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              stopColor="#454445"
              style={{ stopColor: 'color(display-p3 0.2706 0.2667 0.2706)' }}
            />
            <stop
              offset="1"
              stopColor="#2B2B2B"
              style={{ stopColor: 'color(display-p3 0.1686 0.1686 0.1686)' }}
            />
          </linearGradient>
          <linearGradient
            id={id('logo-fill')}
            x1="22.4598"
            y1="8.87523"
            x2="24.705"
            y2="24.8502"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" />
            <stop
              offset="1"
              stopColor="#B4B4B4"
              style={{ stopColor: 'color(display-p3 0.7068 0.7068 0.7068)' }}
            />
          </linearGradient>
          <linearGradient
            id={id('badge-fill')}
            x1="35.3762"
            y1="28.2261"
            x2="86.2936"
            y2="62.2732"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#9B99FF" style={{ stopColor: 'color(display-p3 0.6078 0.6 1)' }} />
            <stop
              offset="0.326923"
              stopColor="#716EF3"
              style={{ stopColor: 'color(display-p3 0.4431 0.4314 0.9529)' }}
            />
            <stop
              offset="1"
              stopColor="#9B99FF"
              style={{ stopColor: 'color(display-p3 0.6078 0.6 1)' }}
            />
          </linearGradient>
        </defs>
      </Box>
    </Box>
  );
});

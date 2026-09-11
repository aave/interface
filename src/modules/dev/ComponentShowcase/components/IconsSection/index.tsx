import {
  ArrowCircleRightIcon as OlArrowCircleRightIcon,
  ArrowDownIcon as OlArrowDownIcon,
  ArrowNarrowRightIcon as OlArrowNarrowRightIcon,
  BookOpenIcon as OlBookOpenIcon,
  CalendarIcon as OlCalendarIcon,
  CheckCircleIcon as OlCheckCircleIcon,
  CheckIcon as OlCheckIcon,
  ChevronDownIcon as OlChevronDownIcon,
  ChevronRightIcon as OlChevronRightIcon,
  ChevronUpIcon as OlChevronUpIcon,
  ClockIcon as OlClockIcon,
  CreditCardIcon as OlCreditCardIcon,
  DocumentDownloadIcon as OlDocumentDownloadIcon,
  DuplicateIcon as OlDuplicateIcon,
  ExclamationCircleIcon as OlExclamationCircleIcon,
  ExclamationIcon as OlExclamationIcon,
  ExternalLinkIcon as OlExternalLinkIcon,
  InformationCircleIcon as OlInformationCircleIcon,
  LogoutIcon as OlLogoutIcon,
  MenuIcon as OlMenuIcon,
  PlusIcon as OlPlusIcon,
  QuestionMarkCircleIcon as OlQuestionMarkCircleIcon,
  RefreshIcon as OlRefreshIcon,
  SearchIcon as OlSearchIcon,
  ShieldExclamationIcon as OlShieldExclamationIcon,
  SwitchHorizontalIcon as OlSwitchHorizontalIcon,
  SwitchVerticalIcon as OlSwitchVerticalIcon,
  XIcon as OlXIcon,
} from '@heroicons/react/outline';
import {
  ArrowLeftIcon as SoArrowLeftIcon,
  ArrowNarrowRightIcon as SoArrowNarrowRightIcon,
  CheckCircleIcon as SoCheckCircleIcon,
  CheckIcon as SoCheckIcon,
  ChevronRightIcon as SoChevronRightIcon,
  CogIcon as SoCogIcon,
  DotsHorizontalIcon as SoDotsHorizontalIcon,
  DownloadIcon as SoDownloadIcon,
  ExclamationIcon as SoExclamationIcon,
  ExternalLinkIcon as SoExternalLinkIcon,
  EyeIcon as SoEyeIcon,
  LightningBoltIcon as SoLightningBoltIcon,
  MinusSmIcon as SoMinusSmIcon,
  QuestionMarkCircleIcon as SoQuestionMarkCircleIcon,
  SearchIcon as SoSearchIcon,
  XCircleIcon as SoXCircleIcon,
} from '@heroicons/react/solid';
import MuiAccessTime from '@mui/icons-material/AccessTime';
import MuiAddOutlined from '@mui/icons-material/AddOutlined';
import MuiArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import MuiArrowDownward from '@mui/icons-material/ArrowDownward';
import MuiArrowOutward from '@mui/icons-material/ArrowOutward';
import MuiCheck from '@mui/icons-material/Check';
import MuiCheckRounded from '@mui/icons-material/CheckRounded';
import MuiClose from '@mui/icons-material/Close';
import MuiContentCopy from '@mui/icons-material/ContentCopy';
import MuiExpandMore from '@mui/icons-material/ExpandMore';
import MuiGitHub from '@mui/icons-material/GitHub';
import MuiInstagram from '@mui/icons-material/Instagram';
import MuiKeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import MuiKeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import MuiLaunch from '@mui/icons-material/Launch';
import MuiLinkedIn from '@mui/icons-material/LinkedIn';
import MuiLocalGasStation from '@mui/icons-material/LocalGasStation';
import MuiMoreHoriz from '@mui/icons-material/MoreHoriz';
import MuiSort from '@mui/icons-material/Sort';
import MuiStart from '@mui/icons-material/Start';
import MuiTwitter from '@mui/icons-material/Twitter';
import MuiWarningAmber from '@mui/icons-material/WarningAmber';
import MuiX from '@mui/icons-material/X';
import { Box, Typography } from '@mui/material';
import { DuneIcon, TikTok } from 'public/icons/footer/icons';
import { ReactNode } from 'react';
import { AaveLogo } from 'src/components/icons/AaveLogo';
import { ArrowUpRightIcon } from 'src/components/icons/ArrowUpRightIcon';
import { BridgeIcon } from 'src/components/icons/BridgeIcon';
import { ChevronDownIcon } from 'src/components/icons/ChevronDownIcon';
import { ChevronRightIcon } from 'src/components/icons/ChevronRightIcon';
import { ChevronUpDownIcon } from 'src/components/icons/ChevronUpDownIcon';
import { CloseIcon } from 'src/components/icons/CloseIcon';
import { DotsHorizontalIcon } from 'src/components/icons/DotsHorizontalIcon';
import { HeyIcon } from 'src/components/icons/HeyIcon';
import { LensIcon } from 'src/components/icons/LensIcon';
import { MinusIcon } from 'src/components/icons/MinusIcon';
import { SearchIcon } from 'src/components/icons/SearchIcon';
import { SettingsIcon } from 'src/components/icons/SettingsIcon';
import { StarIcon } from 'src/components/icons/StarIcon';
import { SwapIcon } from 'src/components/icons/SwapIcon';
import { WalletIcon } from 'src/components/icons/WalletIcon';
import { WalletOutlineIcon } from 'src/components/icons/WalletOutlineIcon';
import { IncentivesIcon } from 'src/components/incentives/IncentivesButton';
import { figVars } from 'src/utils/figmaColors';

import { Section } from '../Section';

// Auto-inventoried from the codebase: EVERY icon in the project. Icon components come first
// (project glyphs, heroicons outline/solid, @mui/icons-material, and bespoke ones), followed by
// every .svg asset under public/icons (token/network/wallet/flag logos, etc.) rendered as <img>.
// Third-party component names are aliased (Ol*/So*/Mui*) to avoid clashing with project icons.
const SIZE = 28;
const heroStyle = { width: SIZE, height: SIZE } as const;
const assetImgStyle = { height: SIZE, width: 'auto', maxWidth: 56 } as const;

type Entry = { name: string; node: ReactNode };
type Group = { title: string; icons: Entry[] };

const GROUPS: Group[] = [
  {
    title: 'Project — src/components/icons',
    icons: [
      { name: 'AaveLogo', node: <AaveLogo /> },
      { name: 'ArrowUpRightIcon', node: <ArrowUpRightIcon sx={{ fontSize: SIZE }} /> },
      { name: 'BridgeIcon', node: <BridgeIcon sx={{ fontSize: SIZE }} /> },
      { name: 'ChevronDownIcon', node: <ChevronDownIcon sx={{ fontSize: SIZE }} /> },
      { name: 'ChevronRightIcon', node: <ChevronRightIcon sx={{ fontSize: SIZE }} /> },
      { name: 'ChevronUpDownIcon', node: <ChevronUpDownIcon sx={{ fontSize: SIZE }} /> },
      { name: 'CloseIcon', node: <CloseIcon sx={{ fontSize: SIZE }} /> },
      { name: 'DotsHorizontalIcon', node: <DotsHorizontalIcon sx={{ fontSize: SIZE }} /> },
      { name: 'HeyIcon', node: <HeyIcon sx={{ fontSize: SIZE }} /> },
      { name: 'LensIcon', node: <LensIcon color="currentColor" /> },
      { name: 'MinusIcon', node: <MinusIcon sx={{ fontSize: SIZE }} /> },
      { name: 'SearchIcon', node: <SearchIcon sx={{ fontSize: SIZE }} /> },
      { name: 'SettingsIcon', node: <SettingsIcon sx={{ fontSize: SIZE }} /> },
      { name: 'StarIcon', node: <StarIcon sx={{ fontSize: SIZE }} /> },
      { name: 'SwapIcon', node: <SwapIcon sx={{ fontSize: SIZE }} /> },
      { name: 'WalletIcon', node: <WalletIcon sx={{ fontSize: SIZE }} /> },
      { name: 'WalletOutlineIcon', node: <WalletOutlineIcon sx={{ fontSize: SIZE }} /> },
    ],
  },
  {
    title: 'Heroicons — outline',
    icons: [
      { name: 'ArrowCircleRightIcon', node: <OlArrowCircleRightIcon style={heroStyle} /> },
      { name: 'ArrowDownIcon', node: <OlArrowDownIcon style={heroStyle} /> },
      { name: 'ArrowNarrowRightIcon', node: <OlArrowNarrowRightIcon style={heroStyle} /> },
      { name: 'BookOpenIcon', node: <OlBookOpenIcon style={heroStyle} /> },
      { name: 'CalendarIcon', node: <OlCalendarIcon style={heroStyle} /> },
      { name: 'CheckCircleIcon', node: <OlCheckCircleIcon style={heroStyle} /> },
      { name: 'CheckIcon', node: <OlCheckIcon style={heroStyle} /> },
      { name: 'ChevronDownIcon', node: <OlChevronDownIcon style={heroStyle} /> },
      { name: 'ChevronRightIcon', node: <OlChevronRightIcon style={heroStyle} /> },
      { name: 'ChevronUpIcon', node: <OlChevronUpIcon style={heroStyle} /> },
      { name: 'ClockIcon', node: <OlClockIcon style={heroStyle} /> },
      { name: 'CreditCardIcon', node: <OlCreditCardIcon style={heroStyle} /> },
      { name: 'DocumentDownloadIcon', node: <OlDocumentDownloadIcon style={heroStyle} /> },
      { name: 'DuplicateIcon', node: <OlDuplicateIcon style={heroStyle} /> },
      { name: 'ExclamationCircleIcon', node: <OlExclamationCircleIcon style={heroStyle} /> },
      { name: 'ExclamationIcon', node: <OlExclamationIcon style={heroStyle} /> },
      { name: 'ExternalLinkIcon', node: <OlExternalLinkIcon style={heroStyle} /> },
      { name: 'InformationCircleIcon', node: <OlInformationCircleIcon style={heroStyle} /> },
      { name: 'LogoutIcon', node: <OlLogoutIcon style={heroStyle} /> },
      { name: 'MenuIcon', node: <OlMenuIcon style={heroStyle} /> },
      { name: 'PlusIcon', node: <OlPlusIcon style={heroStyle} /> },
      { name: 'QuestionMarkCircleIcon', node: <OlQuestionMarkCircleIcon style={heroStyle} /> },
      { name: 'RefreshIcon', node: <OlRefreshIcon style={heroStyle} /> },
      { name: 'SearchIcon', node: <OlSearchIcon style={heroStyle} /> },
      { name: 'ShieldExclamationIcon', node: <OlShieldExclamationIcon style={heroStyle} /> },
      { name: 'SwitchHorizontalIcon', node: <OlSwitchHorizontalIcon style={heroStyle} /> },
      { name: 'SwitchVerticalIcon', node: <OlSwitchVerticalIcon style={heroStyle} /> },
      { name: 'XIcon', node: <OlXIcon style={heroStyle} /> },
    ],
  },
  {
    title: 'Heroicons — solid',
    icons: [
      { name: 'ArrowLeftIcon', node: <SoArrowLeftIcon style={heroStyle} /> },
      { name: 'ArrowNarrowRightIcon', node: <SoArrowNarrowRightIcon style={heroStyle} /> },
      { name: 'CheckCircleIcon', node: <SoCheckCircleIcon style={heroStyle} /> },
      { name: 'CheckIcon', node: <SoCheckIcon style={heroStyle} /> },
      { name: 'ChevronRightIcon', node: <SoChevronRightIcon style={heroStyle} /> },
      { name: 'CogIcon', node: <SoCogIcon style={heroStyle} /> },
      { name: 'DotsHorizontalIcon', node: <SoDotsHorizontalIcon style={heroStyle} /> },
      { name: 'DownloadIcon', node: <SoDownloadIcon style={heroStyle} /> },
      { name: 'ExclamationIcon', node: <SoExclamationIcon style={heroStyle} /> },
      { name: 'ExternalLinkIcon', node: <SoExternalLinkIcon style={heroStyle} /> },
      { name: 'EyeIcon', node: <SoEyeIcon style={heroStyle} /> },
      { name: 'LightningBoltIcon', node: <SoLightningBoltIcon style={heroStyle} /> },
      { name: 'MinusSmIcon', node: <SoMinusSmIcon style={heroStyle} /> },
      { name: 'QuestionMarkCircleIcon', node: <SoQuestionMarkCircleIcon style={heroStyle} /> },
      { name: 'SearchIcon', node: <SoSearchIcon style={heroStyle} /> },
      { name: 'XCircleIcon', node: <SoXCircleIcon style={heroStyle} /> },
    ],
  },
  {
    title: 'MUI — @mui/icons-material',
    icons: [
      { name: 'AccessTime', node: <MuiAccessTime sx={{ fontSize: SIZE }} /> },
      { name: 'AddOutlined', node: <MuiAddOutlined sx={{ fontSize: SIZE }} /> },
      { name: 'ArrowBackOutlined', node: <MuiArrowBackOutlined sx={{ fontSize: SIZE }} /> },
      { name: 'ArrowDownward', node: <MuiArrowDownward sx={{ fontSize: SIZE }} /> },
      { name: 'ArrowOutward', node: <MuiArrowOutward sx={{ fontSize: SIZE }} /> },
      { name: 'Check', node: <MuiCheck sx={{ fontSize: SIZE }} /> },
      { name: 'CheckRounded', node: <MuiCheckRounded sx={{ fontSize: SIZE }} /> },
      { name: 'Close', node: <MuiClose sx={{ fontSize: SIZE }} /> },
      { name: 'ContentCopy', node: <MuiContentCopy sx={{ fontSize: SIZE }} /> },
      { name: 'ExpandMore', node: <MuiExpandMore sx={{ fontSize: SIZE }} /> },
      { name: 'GitHub', node: <MuiGitHub sx={{ fontSize: SIZE }} /> },
      { name: 'Instagram', node: <MuiInstagram sx={{ fontSize: SIZE }} /> },
      { name: 'KeyboardArrowDown', node: <MuiKeyboardArrowDown sx={{ fontSize: SIZE }} /> },
      { name: 'KeyboardArrowUp', node: <MuiKeyboardArrowUp sx={{ fontSize: SIZE }} /> },
      { name: 'Launch', node: <MuiLaunch sx={{ fontSize: SIZE }} /> },
      { name: 'LinkedIn', node: <MuiLinkedIn sx={{ fontSize: SIZE }} /> },
      { name: 'LocalGasStation', node: <MuiLocalGasStation sx={{ fontSize: SIZE }} /> },
      { name: 'MoreHoriz', node: <MuiMoreHoriz sx={{ fontSize: SIZE }} /> },
      { name: 'Sort', node: <MuiSort sx={{ fontSize: SIZE }} /> },
      { name: 'Start', node: <MuiStart sx={{ fontSize: SIZE }} /> },
      { name: 'Twitter', node: <MuiTwitter sx={{ fontSize: SIZE }} /> },
      { name: 'WarningAmber', node: <MuiWarningAmber sx={{ fontSize: SIZE }} /> },
      { name: 'X', node: <MuiX sx={{ fontSize: SIZE }} /> },
    ],
  },
  {
    title: 'Bespoke / brand components',
    icons: [
      { name: 'IncentivesIcon', node: <IncentivesIcon width={SIZE} height={SIZE} /> },
      { name: 'TikTok', node: <TikTok sx={{ fontSize: SIZE }} /> },
      { name: 'DuneIcon', node: <DuneIcon sx={{ fontSize: SIZE }} /> },
    ],
  },
  {
    title: 'Assets — Icons (public/icons root)',
    icons: [
      {
        name: 'discord',
        node: <img loading="lazy" src="/icons/discord.svg" alt={'discord'} style={assetImgStyle} />,
      },
      {
        name: 'github',
        node: <img loading="lazy" src="/icons/github.svg" alt={'github'} style={assetImgStyle} />,
      },
      {
        name: 'lens-logo',
        node: (
          <img loading="lazy" src="/icons/lens-logo.svg" alt={'lens-logo'} style={assetImgStyle} />
        ),
      },
      {
        name: 'lenster',
        node: <img loading="lazy" src="/icons/lenster.svg" alt={'lenster'} style={assetImgStyle} />,
      },
    ],
  },
  {
    title: 'Assets — Public root',
    icons: [
      {
        name: 'aave-com-logo-header',
        node: (
          <img
            loading="lazy"
            src="/aave-com-logo-header.svg"
            alt={'aave-com-logo-header'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'aave-logo-purple',
        node: (
          <img
            loading="lazy"
            src="/aave-logo-purple.svg"
            alt={'aave-logo-purple'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'aave',
        node: <img loading="lazy" src="/aave.svg" alt={'aave'} style={assetImgStyle} />,
      },
      {
        name: 'aaveLogo',
        node: <img loading="lazy" src="/aaveLogo.svg" alt={'aaveLogo'} style={assetImgStyle} />,
      },
      {
        name: 'aave_santa',
        node: <img loading="lazy" src="/aave_santa.svg" alt={'aave_santa'} style={assetImgStyle} />,
      },
      {
        name: 'gho-group',
        node: <img loading="lazy" src="/gho-group.svg" alt={'gho-group'} style={assetImgStyle} />,
      },
      {
        name: 'illustration-green',
        node: (
          <img
            loading="lazy"
            src="/illustration-green.svg"
            alt={'illustration-green'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'lightningBoltGradient',
        node: (
          <img
            src="/lightningBoltGradient.svg"
            alt={'lightningBoltGradient'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'resting-gho-hat-purple',
        node: (
          <img
            src="/resting-gho-hat-purple.svg"
            alt={'resting-gho-hat-purple'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'sgho-banner',
        node: (
          <img loading="lazy" src="/sgho-banner.svg" alt={'sgho-banner'} style={assetImgStyle} />
        ),
      },
    ],
  },
  {
    title: 'Assets — Bridge',
    icons: [
      {
        name: 'arbitrum',
        node: (
          <img
            loading="lazy"
            src="/icons/bridge/arbitrum.svg"
            alt={'arbitrum'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'avalanche',
        node: (
          <img
            loading="lazy"
            src="/icons/bridge/avalanche.svg"
            alt={'avalanche'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'optimism',
        node: (
          <img
            loading="lazy"
            src="/icons/bridge/optimism.svg"
            alt={'optimism'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'polygon',
        node: (
          <img
            loading="lazy"
            src="/icons/bridge/polygon.svg"
            alt={'polygon'}
            style={assetImgStyle}
          />
        ),
      },
    ],
  },
  {
    title: 'Assets — Flags',
    icons: [
      {
        name: 'cn',
        node: <img loading="lazy" src="/icons/flags/cn.svg" alt={'cn'} style={assetImgStyle} />,
      },
      {
        name: 'el',
        node: <img loading="lazy" src="/icons/flags/el.svg" alt={'el'} style={assetImgStyle} />,
      },
      {
        name: 'en',
        node: <img loading="lazy" src="/icons/flags/en.svg" alt={'en'} style={assetImgStyle} />,
      },
      {
        name: 'es',
        node: <img loading="lazy" src="/icons/flags/es.svg" alt={'es'} style={assetImgStyle} />,
      },
      {
        name: 'fr',
        node: <img loading="lazy" src="/icons/flags/fr.svg" alt={'fr'} style={assetImgStyle} />,
      },
      {
        name: 'it',
        node: <img loading="lazy" src="/icons/flags/it.svg" alt={'it'} style={assetImgStyle} />,
      },
      {
        name: 'jp',
        node: <img loading="lazy" src="/icons/flags/jp.svg" alt={'jp'} style={assetImgStyle} />,
      },
      {
        name: 'kr',
        node: <img loading="lazy" src="/icons/flags/kr.svg" alt={'kr'} style={assetImgStyle} />,
      },
      {
        name: 'pr',
        node: <img loading="lazy" src="/icons/flags/pr.svg" alt={'pr'} style={assetImgStyle} />,
      },
      {
        name: 'tr',
        node: <img loading="lazy" src="/icons/flags/tr.svg" alt={'tr'} style={assetImgStyle} />,
      },
      {
        name: 'vt',
        node: <img loading="lazy" src="/icons/flags/vt.svg" alt={'vt'} style={assetImgStyle} />,
      },
    ],
  },
  {
    title: 'Assets — Health factor',
    icons: [
      {
        name: 'HAL',
        node: (
          <img loading="lazy" src="/icons/healthFactor/HAL.svg" alt={'HAL'} style={assetImgStyle} />
        ),
      },
      {
        name: 'HALHover',
        node: (
          <img
            loading="lazy"
            src="/icons/healthFactor/HALHover.svg"
            alt={'HALHover'}
            style={assetImgStyle}
          />
        ),
      },
    ],
  },
  {
    title: 'Assets — Markets',
    icons: [
      {
        name: 'aptos',
        node: (
          <img loading="lazy" src="/icons/markets/aptos.svg" alt={'aptos'} style={assetImgStyle} />
        ),
      },
      {
        name: 'etherfi',
        node: (
          <img
            loading="lazy"
            src="/icons/markets/etherfi.svg"
            alt={'etherfi'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'horizon',
        node: (
          <img
            loading="lazy"
            src="/icons/markets/horizon.svg"
            alt={'horizon'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'lido',
        node: (
          <img loading="lazy" src="/icons/markets/lido.svg" alt={'lido'} style={assetImgStyle} />
        ),
      },
      {
        name: 'linea',
        node: (
          <img loading="lazy" src="/icons/markets/linea.svg" alt={'linea'} style={assetImgStyle} />
        ),
      },
    ],
  },
  {
    title: 'Assets — Network logos',
    icons: [
      {
        name: 'arbitrum',
        node: (
          <img
            loading="lazy"
            src="/icons/networks/arbitrum.svg"
            alt={'arbitrum'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'avalanche',
        node: (
          <img
            loading="lazy"
            src="/icons/networks/avalanche.svg"
            alt={'avalanche'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'base',
        node: (
          <img loading="lazy" src="/icons/networks/base.svg" alt={'base'} style={assetImgStyle} />
        ),
      },
      {
        name: 'binance',
        node: (
          <img
            loading="lazy"
            src="/icons/networks/binance.svg"
            alt={'binance'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'celo',
        node: (
          <img loading="lazy" src="/icons/networks/celo.svg" alt={'celo'} style={assetImgStyle} />
        ),
      },
      {
        name: 'ethereum',
        node: (
          <img
            loading="lazy"
            src="/icons/networks/ethereum.svg"
            alt={'ethereum'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'gnosis',
        node: (
          <img
            loading="lazy"
            src="/icons/networks/gnosis.svg"
            alt={'gnosis'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'ink',
        node: (
          <img loading="lazy" src="/icons/networks/ink.svg" alt={'ink'} style={assetImgStyle} />
        ),
      },
      {
        name: 'linea',
        node: (
          <img loading="lazy" src="/icons/networks/linea.svg" alt={'linea'} style={assetImgStyle} />
        ),
      },
      {
        name: 'mantle',
        node: (
          <img
            loading="lazy"
            src="/icons/networks/mantle.svg"
            alt={'mantle'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'megaeth',
        node: (
          <img
            loading="lazy"
            src="/icons/networks/megaeth.svg"
            alt={'megaeth'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'metis',
        node: (
          <img loading="lazy" src="/icons/networks/metis.svg" alt={'metis'} style={assetImgStyle} />
        ),
      },
      {
        name: 'monad',
        node: (
          <img loading="lazy" src="/icons/networks/monad.svg" alt={'monad'} style={assetImgStyle} />
        ),
      },
      {
        name: 'optimism',
        node: (
          <img
            loading="lazy"
            src="/icons/networks/optimism.svg"
            alt={'optimism'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'plasma',
        node: (
          <img
            loading="lazy"
            src="/icons/networks/plasma.svg"
            alt={'plasma'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'polygon',
        node: (
          <img
            loading="lazy"
            src="/icons/networks/polygon.svg"
            alt={'polygon'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'scroll',
        node: (
          <img
            loading="lazy"
            src="/icons/networks/scroll.svg"
            alt={'scroll'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'soneium',
        node: (
          <img
            loading="lazy"
            src="/icons/networks/soneium.svg"
            alt={'soneium'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'sonic',
        node: (
          <img loading="lazy" src="/icons/networks/sonic.svg" alt={'sonic'} style={assetImgStyle} />
        ),
      },
      {
        name: 'xlayer',
        node: (
          <img
            loading="lazy"
            src="/icons/networks/xlayer.svg"
            alt={'xlayer'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'zksync',
        node: (
          <img
            loading="lazy"
            src="/icons/networks/zksync.svg"
            alt={'zksync'}
            style={assetImgStyle}
          />
        ),
      },
    ],
  },
  {
    title: 'Assets — On-ramp services',
    icons: [
      {
        name: 'transak',
        node: (
          <img
            loading="lazy"
            src="/icons/onRampServices/transak.svg"
            alt={'transak'}
            style={assetImgStyle}
          />
        ),
      },
    ],
  },
  {
    title: 'Assets — Other',
    icons: [
      {
        name: 'aci-black',
        node: (
          <img
            loading="lazy"
            src="/icons/other/aci-black.svg"
            alt={'aci-black'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'aci-white',
        node: (
          <img
            loading="lazy"
            src="/icons/other/aci-white.svg"
            alt={'aci-white'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'ethena',
        node: (
          <img loading="lazy" src="/icons/other/ethena.svg" alt={'ethena'} style={assetImgStyle} />
        ),
      },
      {
        name: 'ether.fi',
        node: (
          <img
            loading="lazy"
            src="/icons/other/ether.fi.svg"
            alt={'ether.fi'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'kernel',
        node: (
          <img loading="lazy" src="/icons/other/kernel.svg" alt={'kernel'} style={assetImgStyle} />
        ),
      },
      {
        name: 'merkl-black',
        node: (
          <img
            loading="lazy"
            src="/icons/other/merkl-black.svg"
            alt={'merkl-black'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'merkl-white',
        node: (
          <img
            loading="lazy"
            src="/icons/other/merkl-white.svg"
            alt={'merkl-white'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'spark',
        node: (
          <img loading="lazy" src="/icons/other/spark.svg" alt={'spark'} style={assetImgStyle} />
        ),
      },
      {
        name: 'superfest',
        node: (
          <img
            loading="lazy"
            src="/icons/other/superfest.svg"
            alt={'superfest'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'velora',
        node: (
          <img loading="lazy" src="/icons/other/velora.svg" alt={'velora'} style={assetImgStyle} />
        ),
      },
      {
        name: 'zksync-ignite',
        node: (
          <img
            loading="lazy"
            src="/icons/other/zksync-ignite.svg"
            alt={'zksync-ignite'}
            style={assetImgStyle}
          />
        ),
      },
    ],
  },
  {
    title: 'Assets — Staking',
    icons: [
      {
        name: 'emission-staking-icon',
        node: (
          <img
            src="/icons/staking/emission-staking-icon.svg"
            alt={'emission-staking-icon'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'trust-staking-icon',
        node: (
          <img
            src="/icons/staking/trust-staking-icon.svg"
            alt={'trust-staking-icon'}
            style={assetImgStyle}
          />
        ),
      },
    ],
  },
  {
    title: 'Assets — Token logos',
    icons: [
      {
        name: '1inch',
        node: (
          <img loading="lazy" src="/icons/tokens/1inch.svg" alt={'1inch'} style={assetImgStyle} />
        ),
      },
      {
        name: 'aave-token-round',
        node: (
          <img
            src="/icons/tokens/aave-token-round.svg"
            alt={'aave-token-round'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'aave',
        node: (
          <img loading="lazy" src="/icons/tokens/aave.svg" alt={'aave'} style={assetImgStyle} />
        ),
      },
      {
        name: 'acred',
        node: (
          <img loading="lazy" src="/icons/tokens/acred.svg" alt={'acred'} style={assetImgStyle} />
        ),
      },
      {
        name: 'ampl',
        node: (
          <img loading="lazy" src="/icons/tokens/ampl.svg" alt={'ampl'} style={assetImgStyle} />
        ),
      },
      {
        name: 'arb',
        node: <img loading="lazy" src="/icons/tokens/arb.svg" alt={'arb'} style={assetImgStyle} />,
      },
      {
        name: 'ausd',
        node: (
          <img loading="lazy" src="/icons/tokens/ausd.svg" alt={'ausd'} style={assetImgStyle} />
        ),
      },
      {
        name: 'avax',
        node: (
          <img loading="lazy" src="/icons/tokens/avax.svg" alt={'avax'} style={assetImgStyle} />
        ),
      },
      {
        name: 'bal',
        node: <img loading="lazy" src="/icons/tokens/bal.svg" alt={'bal'} style={assetImgStyle} />,
      },
      {
        name: 'bat',
        node: <img loading="lazy" src="/icons/tokens/bat.svg" alt={'bat'} style={assetImgStyle} />,
      },
      {
        name: 'bnb',
        node: <img loading="lazy" src="/icons/tokens/bnb.svg" alt={'bnb'} style={assetImgStyle} />,
      },
      {
        name: 'bpt',
        node: <img loading="lazy" src="/icons/tokens/bpt.svg" alt={'bpt'} style={assetImgStyle} />,
      },
      {
        name: 'btc',
        node: <img loading="lazy" src="/icons/tokens/btc.svg" alt={'btc'} style={assetImgStyle} />,
      },
      {
        name: 'buidl',
        node: (
          <img loading="lazy" src="/icons/tokens/buidl.svg" alt={'buidl'} style={assetImgStyle} />
        ),
      },
      {
        name: 'busd',
        node: (
          <img loading="lazy" src="/icons/tokens/busd.svg" alt={'busd'} style={assetImgStyle} />
        ),
      },
      {
        name: 'cake',
        node: (
          <img loading="lazy" src="/icons/tokens/cake.svg" alt={'cake'} style={assetImgStyle} />
        ),
      },
      {
        name: 'cbbtc',
        node: (
          <img loading="lazy" src="/icons/tokens/cbbtc.svg" alt={'cbbtc'} style={assetImgStyle} />
        ),
      },
      {
        name: 'cbeth',
        node: (
          <img loading="lazy" src="/icons/tokens/cbeth.svg" alt={'cbeth'} style={assetImgStyle} />
        ),
      },
      {
        name: 'celo',
        node: (
          <img loading="lazy" src="/icons/tokens/celo.svg" alt={'celo'} style={assetImgStyle} />
        ),
      },
      {
        name: 'crv',
        node: <img loading="lazy" src="/icons/tokens/crv.svg" alt={'crv'} style={assetImgStyle} />,
      },
      {
        name: 'crvusd',
        node: (
          <img loading="lazy" src="/icons/tokens/crvusd.svg" alt={'crvusd'} style={assetImgStyle} />
        ),
      },
      {
        name: 'cvx',
        node: <img loading="lazy" src="/icons/tokens/cvx.svg" alt={'cvx'} style={assetImgStyle} />,
      },
      {
        name: 'dai',
        node: <img loading="lazy" src="/icons/tokens/dai.svg" alt={'dai'} style={assetImgStyle} />,
      },
      {
        name: 'default',
        node: (
          <img
            loading="lazy"
            src="/icons/tokens/default.svg"
            alt={'default'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'dpi',
        node: <img loading="lazy" src="/icons/tokens/dpi.svg" alt={'dpi'} style={assetImgStyle} />,
      },
      {
        name: 'ebtc',
        node: (
          <img loading="lazy" src="/icons/tokens/ebtc.svg" alt={'ebtc'} style={assetImgStyle} />
        ),
      },
      {
        name: 'enj',
        node: <img loading="lazy" src="/icons/tokens/enj.svg" alt={'enj'} style={assetImgStyle} />,
      },
      {
        name: 'ens',
        node: <img loading="lazy" src="/icons/tokens/ens.svg" alt={'ens'} style={assetImgStyle} />,
      },
      {
        name: 'eth-round',
        node: (
          <img
            loading="lazy"
            src="/icons/tokens/eth-round.svg"
            alt={'eth-round'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'eth',
        node: <img loading="lazy" src="/icons/tokens/eth.svg" alt={'eth'} style={assetImgStyle} />,
      },
      {
        name: 'ethfi',
        node: (
          <img loading="lazy" src="/icons/tokens/ethfi.svg" alt={'ethfi'} style={assetImgStyle} />
        ),
      },
      {
        name: 'ethx',
        node: (
          <img loading="lazy" src="/icons/tokens/ethx.svg" alt={'ethx'} style={assetImgStyle} />
        ),
      },
      {
        name: 'eura',
        node: (
          <img loading="lazy" src="/icons/tokens/eura.svg" alt={'eura'} style={assetImgStyle} />
        ),
      },
      {
        name: 'eurc',
        node: (
          <img loading="lazy" src="/icons/tokens/eurc.svg" alt={'eurc'} style={assetImgStyle} />
        ),
      },
      {
        name: 'eure',
        node: (
          <img loading="lazy" src="/icons/tokens/eure.svg" alt={'eure'} style={assetImgStyle} />
        ),
      },
      {
        name: 'eurm',
        node: (
          <img loading="lazy" src="/icons/tokens/eurm.svg" alt={'eurm'} style={assetImgStyle} />
        ),
      },
      {
        name: 'eurs',
        node: (
          <img loading="lazy" src="/icons/tokens/eurs.svg" alt={'eurs'} style={assetImgStyle} />
        ),
      },
      {
        name: 'eusde',
        node: (
          <img loading="lazy" src="/icons/tokens/eusde.svg" alt={'eusde'} style={assetImgStyle} />
        ),
      },
      {
        name: 'ezeth',
        node: (
          <img loading="lazy" src="/icons/tokens/ezeth.svg" alt={'ezeth'} style={assetImgStyle} />
        ),
      },
      {
        name: 'fbtc',
        node: (
          <img loading="lazy" src="/icons/tokens/fbtc.svg" alt={'fbtc'} style={assetImgStyle} />
        ),
      },
      {
        name: 'fdusd',
        node: (
          <img loading="lazy" src="/icons/tokens/fdusd.svg" alt={'fdusd'} style={assetImgStyle} />
        ),
      },
      {
        name: 'fei',
        node: <img loading="lazy" src="/icons/tokens/fei.svg" alt={'fei'} style={assetImgStyle} />,
      },
      {
        name: 'frax',
        node: (
          <img loading="lazy" src="/icons/tokens/frax.svg" alt={'frax'} style={assetImgStyle} />
        ),
      },
      {
        name: 'ftm',
        node: <img loading="lazy" src="/icons/tokens/ftm.svg" alt={'ftm'} style={assetImgStyle} />,
      },
      {
        name: 'fxs',
        node: <img loading="lazy" src="/icons/tokens/fxs.svg" alt={'fxs'} style={assetImgStyle} />,
      },
      {
        name: 'gho',
        node: <img loading="lazy" src="/icons/tokens/gho.svg" alt={'gho'} style={assetImgStyle} />,
      },
      {
        name: 'ghst',
        node: (
          <img loading="lazy" src="/icons/tokens/ghst.svg" alt={'ghst'} style={assetImgStyle} />
        ),
      },
      {
        name: 'gno',
        node: <img loading="lazy" src="/icons/tokens/gno.svg" alt={'gno'} style={assetImgStyle} />,
      },
      {
        name: 'gnosissdai',
        node: (
          <img
            loading="lazy"
            src="/icons/tokens/gnosissdai.svg"
            alt={'gnosissdai'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'gusd',
        node: (
          <img loading="lazy" src="/icons/tokens/gusd.svg" alt={'gusd'} style={assetImgStyle} />
        ),
      },
      {
        name: 'jaaa',
        node: (
          <img loading="lazy" src="/icons/tokens/jaaa.svg" alt={'jaaa'} style={assetImgStyle} />
        ),
      },
      {
        name: 'jeur',
        node: (
          <img loading="lazy" src="/icons/tokens/jeur.svg" alt={'jeur'} style={assetImgStyle} />
        ),
      },
      {
        name: 'jtrsy',
        node: (
          <img loading="lazy" src="/icons/tokens/jtrsy.svg" alt={'jtrsy'} style={assetImgStyle} />
        ),
      },
      {
        name: 'kbtc',
        node: (
          <img loading="lazy" src="/icons/tokens/kbtc.svg" alt={'kbtc'} style={assetImgStyle} />
        ),
      },
      {
        name: 'knc',
        node: <img loading="lazy" src="/icons/tokens/knc.svg" alt={'knc'} style={assetImgStyle} />,
      },
      {
        name: 'kncl',
        node: (
          <img loading="lazy" src="/icons/tokens/kncl.svg" alt={'kncl'} style={assetImgStyle} />
        ),
      },
      {
        name: 'lbtc',
        node: (
          <img loading="lazy" src="/icons/tokens/lbtc.svg" alt={'lbtc'} style={assetImgStyle} />
        ),
      },
      {
        name: 'ldo',
        node: <img loading="lazy" src="/icons/tokens/ldo.svg" alt={'ldo'} style={assetImgStyle} />,
      },
      {
        name: 'lend',
        node: (
          <img loading="lazy" src="/icons/tokens/lend.svg" alt={'lend'} style={assetImgStyle} />
        ),
      },
      {
        name: 'link',
        node: (
          <img loading="lazy" src="/icons/tokens/link.svg" alt={'link'} style={assetImgStyle} />
        ),
      },
      {
        name: 'lusd',
        node: (
          <img loading="lazy" src="/icons/tokens/lusd.svg" alt={'lusd'} style={assetImgStyle} />
        ),
      },
      {
        name: 'mai',
        node: <img loading="lazy" src="/icons/tokens/mai.svg" alt={'mai'} style={assetImgStyle} />,
      },
      {
        name: 'mana',
        node: (
          <img loading="lazy" src="/icons/tokens/mana.svg" alt={'mana'} style={assetImgStyle} />
        ),
      },
      {
        name: 'maticx',
        node: (
          <img loading="lazy" src="/icons/tokens/maticx.svg" alt={'maticx'} style={assetImgStyle} />
        ),
      },
      {
        name: 'mega',
        node: (
          <img loading="lazy" src="/icons/tokens/mega.svg" alt={'mega'} style={assetImgStyle} />
        ),
      },
      {
        name: 'megausd',
        node: (
          <img
            loading="lazy"
            src="/icons/tokens/megausd.svg"
            alt={'megausd'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'metis',
        node: (
          <img loading="lazy" src="/icons/tokens/metis.svg" alt={'metis'} style={assetImgStyle} />
        ),
      },
      {
        name: 'mglobal',
        node: (
          <img
            loading="lazy"
            src="/icons/tokens/mglobal.svg"
            alt={'mglobal'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'mkr',
        node: <img loading="lazy" src="/icons/tokens/mkr.svg" alt={'mkr'} style={assetImgStyle} />,
      },
      {
        name: 'mnt',
        node: <img loading="lazy" src="/icons/tokens/mnt.svg" alt={'mnt'} style={assetImgStyle} />,
      },
      {
        name: 'mon',
        node: <img loading="lazy" src="/icons/tokens/mon.svg" alt={'mon'} style={assetImgStyle} />,
      },
      {
        name: 'musd',
        node: (
          <img loading="lazy" src="/icons/tokens/musd.svg" alt={'musd'} style={assetImgStyle} />
        ),
      },
      {
        name: 'okb',
        node: <img loading="lazy" src="/icons/tokens/okb.svg" alt={'okb'} style={assetImgStyle} />,
      },
      {
        name: 'one',
        node: <img loading="lazy" src="/icons/tokens/one.svg" alt={'one'} style={assetImgStyle} />,
      },
      {
        name: 'op',
        node: <img loading="lazy" src="/icons/tokens/op.svg" alt={'op'} style={assetImgStyle} />,
      },
      {
        name: 'oseth',
        node: (
          <img loading="lazy" src="/icons/tokens/oseth.svg" alt={'oseth'} style={assetImgStyle} />
        ),
      },
      {
        name: 'pax',
        node: <img loading="lazy" src="/icons/tokens/pax.svg" alt={'pax'} style={assetImgStyle} />,
      },
      {
        name: 'pol',
        node: <img loading="lazy" src="/icons/tokens/pol.svg" alt={'pol'} style={assetImgStyle} />,
      },
      {
        name: 'bpt',
        node: (
          <img loading="lazy" src="/icons/tokens/pools/bpt.svg" alt={'bpt'} style={assetImgStyle} />
        ),
      },
      {
        name: 'guni',
        node: (
          <img
            loading="lazy"
            src="/icons/tokens/pools/guni.svg"
            alt={'guni'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'uni',
        node: (
          <img loading="lazy" src="/icons/tokens/pools/uni.svg" alt={'uni'} style={assetImgStyle} />
        ),
      },
      {
        name: 'pteusde',
        node: (
          <img
            loading="lazy"
            src="/icons/tokens/pteusde.svg"
            alt={'pteusde'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'ptsrusde',
        node: (
          <img
            loading="lazy"
            src="/icons/tokens/ptsrusde.svg"
            alt={'ptsrusde'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'ptsusde',
        node: (
          <img
            loading="lazy"
            src="/icons/tokens/ptsusde.svg"
            alt={'ptsusde'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'ptusde',
        node: (
          <img loading="lazy" src="/icons/tokens/ptusde.svg" alt={'ptusde'} style={assetImgStyle} />
        ),
      },
      {
        name: 'ptusdg',
        node: (
          <img loading="lazy" src="/icons/tokens/ptusdg.svg" alt={'ptusdg'} style={assetImgStyle} />
        ),
      },
      {
        name: 'pyusd',
        node: (
          <img loading="lazy" src="/icons/tokens/pyusd.svg" alt={'pyusd'} style={assetImgStyle} />
        ),
      },
      {
        name: 'rai',
        node: <img loading="lazy" src="/icons/tokens/rai.svg" alt={'rai'} style={assetImgStyle} />,
      },
      {
        name: 'ren',
        node: <img loading="lazy" src="/icons/tokens/ren.svg" alt={'ren'} style={assetImgStyle} />,
      },
      {
        name: 'renfil',
        node: (
          <img loading="lazy" src="/icons/tokens/renfil.svg" alt={'renfil'} style={assetImgStyle} />
        ),
      },
      {
        name: 'rep',
        node: <img loading="lazy" src="/icons/tokens/rep.svg" alt={'rep'} style={assetImgStyle} />,
      },
      {
        name: 'reth',
        node: (
          <img loading="lazy" src="/icons/tokens/reth.svg" alt={'reth'} style={assetImgStyle} />
        ),
      },
      {
        name: 'rez',
        node: <img loading="lazy" src="/icons/tokens/rez.svg" alt={'rez'} style={assetImgStyle} />,
      },
      {
        name: 'rlusd',
        node: (
          <img loading="lazy" src="/icons/tokens/rlusd.svg" alt={'rlusd'} style={assetImgStyle} />
        ),
      },
      {
        name: 'rpl',
        node: <img loading="lazy" src="/icons/tokens/rpl.svg" alt={'rpl'} style={assetImgStyle} />,
      },
      {
        name: 'rseth',
        node: (
          <img loading="lazy" src="/icons/tokens/rseth.svg" alt={'rseth'} style={assetImgStyle} />
        ),
      },
      {
        name: 's',
        node: <img loading="lazy" src="/icons/tokens/s.svg" alt={'s'} style={assetImgStyle} />,
      },
      {
        name: 'savax',
        node: (
          <img loading="lazy" src="/icons/tokens/savax.svg" alt={'savax'} style={assetImgStyle} />
        ),
      },
      {
        name: 'scr',
        node: <img loading="lazy" src="/icons/tokens/scr.svg" alt={'scr'} style={assetImgStyle} />,
      },
      {
        name: 'sd',
        node: <img loading="lazy" src="/icons/tokens/sd.svg" alt={'sd'} style={assetImgStyle} />,
      },
      {
        name: 'sdai',
        node: (
          <img loading="lazy" src="/icons/tokens/sdai.svg" alt={'sdai'} style={assetImgStyle} />
        ),
      },
      {
        name: 'seth',
        node: (
          <img loading="lazy" src="/icons/tokens/seth.svg" alt={'seth'} style={assetImgStyle} />
        ),
      },
      {
        name: 'sgho',
        node: (
          <img loading="lazy" src="/icons/tokens/sgho.svg" alt={'sgho'} style={assetImgStyle} />
        ),
      },
      {
        name: 'snx',
        node: <img loading="lazy" src="/icons/tokens/snx.svg" alt={'snx'} style={assetImgStyle} />,
      },
      {
        name: 'solvbtc',
        node: (
          <img
            loading="lazy"
            src="/icons/tokens/solvbtc.svg"
            alt={'solvbtc'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'srusde',
        node: (
          <img loading="lazy" src="/icons/tokens/srusde.svg" alt={'srusde'} style={assetImgStyle} />
        ),
      },
      {
        name: 'stcusd',
        node: (
          <img loading="lazy" src="/icons/tokens/stcusd.svg" alt={'stcusd'} style={assetImgStyle} />
        ),
      },
      {
        name: 'steth',
        node: (
          <img loading="lazy" src="/icons/tokens/steth.svg" alt={'steth'} style={assetImgStyle} />
        ),
      },
      {
        name: 'stg',
        node: <img loading="lazy" src="/icons/tokens/stg.svg" alt={'stg'} style={assetImgStyle} />,
      },
      {
        name: 'stkaave',
        node: (
          <img
            loading="lazy"
            src="/icons/tokens/stkaave.svg"
            alt={'stkaave'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'stkbpt',
        node: (
          <img loading="lazy" src="/icons/tokens/stkbpt.svg" alt={'stkbpt'} style={assetImgStyle} />
        ),
      },
      {
        name: 'stkbptv2',
        node: (
          <img
            loading="lazy"
            src="/icons/tokens/stkbptv2.svg"
            alt={'stkbptv2'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'stkgho',
        node: (
          <img loading="lazy" src="/icons/tokens/stkgho.svg" alt={'stkgho'} style={assetImgStyle} />
        ),
      },
      {
        name: 'stmatic',
        node: (
          <img
            loading="lazy"
            src="/icons/tokens/stmatic.svg"
            alt={'stmatic'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'sts',
        node: <img loading="lazy" src="/icons/tokens/sts.svg" alt={'sts'} style={assetImgStyle} />,
      },
      {
        name: 'susd',
        node: (
          <img loading="lazy" src="/icons/tokens/susd.svg" alt={'susd'} style={assetImgStyle} />
        ),
      },
      {
        name: 'susde',
        node: (
          <img loading="lazy" src="/icons/tokens/susde.svg" alt={'susde'} style={assetImgStyle} />
        ),
      },
      {
        name: 'sushi',
        node: (
          <img loading="lazy" src="/icons/tokens/sushi.svg" alt={'sushi'} style={assetImgStyle} />
        ),
      },
      {
        name: 'syrupusd',
        node: (
          <img
            loading="lazy"
            src="/icons/tokens/syrupusd.svg"
            alt={'syrupusd'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'syrupusdc',
        node: (
          <img
            loading="lazy"
            src="/icons/tokens/syrupusdc.svg"
            alt={'syrupusdc'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'syrupusdt',
        node: (
          <img
            loading="lazy"
            src="/icons/tokens/syrupusdt.svg"
            alt={'syrupusdt'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'tbtc',
        node: (
          <img loading="lazy" src="/icons/tokens/tbtc.svg" alt={'tbtc'} style={assetImgStyle} />
        ),
      },
      {
        name: 'teth',
        node: (
          <img loading="lazy" src="/icons/tokens/teth.svg" alt={'teth'} style={assetImgStyle} />
        ),
      },
      {
        name: 'tribe',
        node: (
          <img loading="lazy" src="/icons/tokens/tribe.svg" alt={'tribe'} style={assetImgStyle} />
        ),
      },
      {
        name: 'tusd',
        node: (
          <img loading="lazy" src="/icons/tokens/tusd.svg" alt={'tusd'} style={assetImgStyle} />
        ),
      },
      {
        name: 'tydroinkpoints',
        node: (
          <img
            src="/icons/tokens/tydroinkpoints.svg"
            alt={'tydroinkpoints'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'uni',
        node: <img loading="lazy" src="/icons/tokens/uni.svg" alt={'uni'} style={assetImgStyle} />,
      },
      {
        name: 'uscc',
        node: (
          <img loading="lazy" src="/icons/tokens/uscc.svg" alt={'uscc'} style={assetImgStyle} />
        ),
      },
      {
        name: 'usdbc',
        node: (
          <img loading="lazy" src="/icons/tokens/usdbc.svg" alt={'usdbc'} style={assetImgStyle} />
        ),
      },
      {
        name: 'usdc',
        node: (
          <img loading="lazy" src="/icons/tokens/usdc.svg" alt={'usdc'} style={assetImgStyle} />
        ),
      },
      {
        name: 'usde',
        node: (
          <img loading="lazy" src="/icons/tokens/usde.svg" alt={'usde'} style={assetImgStyle} />
        ),
      },
      {
        name: 'usdg',
        node: (
          <img loading="lazy" src="/icons/tokens/usdg.svg" alt={'usdg'} style={assetImgStyle} />
        ),
      },
      {
        name: 'usdm',
        node: (
          <img loading="lazy" src="/icons/tokens/usdm.svg" alt={'usdm'} style={assetImgStyle} />
        ),
      },
      {
        name: 'usdp',
        node: (
          <img loading="lazy" src="/icons/tokens/usdp.svg" alt={'usdp'} style={assetImgStyle} />
        ),
      },
      {
        name: 'usds',
        node: (
          <img loading="lazy" src="/icons/tokens/usds.svg" alt={'usds'} style={assetImgStyle} />
        ),
      },
      {
        name: 'usdt',
        node: (
          <img loading="lazy" src="/icons/tokens/usdt.svg" alt={'usdt'} style={assetImgStyle} />
        ),
      },
      {
        name: 'usdt0',
        node: (
          <img loading="lazy" src="/icons/tokens/usdt0.svg" alt={'usdt0'} style={assetImgStyle} />
        ),
      },
      {
        name: 'usdtb',
        node: (
          <img loading="lazy" src="/icons/tokens/usdtb.svg" alt={'usdtb'} style={assetImgStyle} />
        ),
      },
      {
        name: 'usd₮0',
        node: (
          <img loading="lazy" src="/icons/tokens/usd₮0.svg" alt={'usd₮0'} style={assetImgStyle} />
        ),
      },
      {
        name: 'ust',
        node: <img loading="lazy" src="/icons/tokens/ust.svg" alt={'ust'} style={assetImgStyle} />,
      },
      {
        name: 'ustb',
        node: (
          <img loading="lazy" src="/icons/tokens/ustb.svg" alt={'ustb'} style={assetImgStyle} />
        ),
      },
      {
        name: 'usyc',
        node: (
          <img loading="lazy" src="/icons/tokens/usyc.svg" alt={'usyc'} style={assetImgStyle} />
        ),
      },
      {
        name: 'vbill',
        node: (
          <img loading="lazy" src="/icons/tokens/vbill.svg" alt={'vbill'} style={assetImgStyle} />
        ),
      },
      {
        name: 'wavax',
        node: (
          <img loading="lazy" src="/icons/tokens/wavax.svg" alt={'wavax'} style={assetImgStyle} />
        ),
      },
      {
        name: 'wbnb',
        node: (
          <img loading="lazy" src="/icons/tokens/wbnb.svg" alt={'wbnb'} style={assetImgStyle} />
        ),
      },
      {
        name: 'wbtc',
        node: (
          <img loading="lazy" src="/icons/tokens/wbtc.svg" alt={'wbtc'} style={assetImgStyle} />
        ),
      },
      {
        name: 'weeth',
        node: (
          <img loading="lazy" src="/icons/tokens/weeth.svg" alt={'weeth'} style={assetImgStyle} />
        ),
      },
      {
        name: 'weth',
        node: (
          <img loading="lazy" src="/icons/tokens/weth.svg" alt={'weth'} style={assetImgStyle} />
        ),
      },
      {
        name: 'wftm',
        node: (
          <img loading="lazy" src="/icons/tokens/wftm.svg" alt={'wftm'} style={assetImgStyle} />
        ),
      },
      {
        name: 'wmnt',
        node: (
          <img loading="lazy" src="/icons/tokens/wmnt.svg" alt={'wmnt'} style={assetImgStyle} />
        ),
      },
      {
        name: 'wokb',
        node: (
          <img loading="lazy" src="/icons/tokens/wokb.svg" alt={'wokb'} style={assetImgStyle} />
        ),
      },
      {
        name: 'wone',
        node: (
          <img loading="lazy" src="/icons/tokens/wone.svg" alt={'wone'} style={assetImgStyle} />
        ),
      },
      {
        name: 'wpol',
        node: (
          <img loading="lazy" src="/icons/tokens/wpol.svg" alt={'wpol'} style={assetImgStyle} />
        ),
      },
      {
        name: 'wrseth',
        node: (
          <img loading="lazy" src="/icons/tokens/wrseth.svg" alt={'wrseth'} style={assetImgStyle} />
        ),
      },
      {
        name: 'ws',
        node: <img loading="lazy" src="/icons/tokens/ws.svg" alt={'ws'} style={assetImgStyle} />,
      },
      {
        name: 'wsteth',
        node: (
          <img loading="lazy" src="/icons/tokens/wsteth.svg" alt={'wsteth'} style={assetImgStyle} />
        ),
      },
      {
        name: 'wxdai',
        node: (
          <img loading="lazy" src="/icons/tokens/wxdai.svg" alt={'wxdai'} style={assetImgStyle} />
        ),
      },
      {
        name: 'wxpl',
        node: (
          <img loading="lazy" src="/icons/tokens/wxpl.svg" alt={'wxpl'} style={assetImgStyle} />
        ),
      },
      {
        name: 'xaut',
        node: (
          <img loading="lazy" src="/icons/tokens/xaut.svg" alt={'xaut'} style={assetImgStyle} />
        ),
      },
      {
        name: 'xaut0',
        node: (
          <img loading="lazy" src="/icons/tokens/xaut0.svg" alt={'xaut0'} style={assetImgStyle} />
        ),
      },
      {
        name: 'xbeth',
        node: (
          <img loading="lazy" src="/icons/tokens/xbeth.svg" alt={'xbeth'} style={assetImgStyle} />
        ),
      },
      {
        name: 'xbtc',
        node: (
          <img loading="lazy" src="/icons/tokens/xbtc.svg" alt={'xbtc'} style={assetImgStyle} />
        ),
      },
      {
        name: 'xdai',
        node: (
          <img loading="lazy" src="/icons/tokens/xdai.svg" alt={'xdai'} style={assetImgStyle} />
        ),
      },
      {
        name: 'xeth',
        node: (
          <img loading="lazy" src="/icons/tokens/xeth.svg" alt={'xeth'} style={assetImgStyle} />
        ),
      },
      {
        name: 'xoksol',
        node: (
          <img loading="lazy" src="/icons/tokens/xoksol.svg" alt={'xoksol'} style={assetImgStyle} />
        ),
      },
      {
        name: 'xpl',
        node: <img loading="lazy" src="/icons/tokens/xpl.svg" alt={'xpl'} style={assetImgStyle} />,
      },
      {
        name: 'xsol',
        node: (
          <img loading="lazy" src="/icons/tokens/xsol.svg" alt={'xsol'} style={assetImgStyle} />
        ),
      },
      {
        name: 'xsushi',
        node: (
          <img loading="lazy" src="/icons/tokens/xsushi.svg" alt={'xsushi'} style={assetImgStyle} />
        ),
      },
      {
        name: 'yfi',
        node: <img loading="lazy" src="/icons/tokens/yfi.svg" alt={'yfi'} style={assetImgStyle} />,
      },
      {
        name: 'zk',
        node: <img loading="lazy" src="/icons/tokens/zk.svg" alt={'zk'} style={assetImgStyle} />,
      },
      {
        name: 'zrx',
        node: <img loading="lazy" src="/icons/tokens/zrx.svg" alt={'zrx'} style={assetImgStyle} />,
      },
    ],
  },
  {
    title: 'Assets — Wallet icons',
    icons: [
      {
        name: 'browserWallet',
        node: (
          <img
            loading="lazy"
            src="/icons/wallets/browserWallet.svg"
            alt={'browserWallet'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'coinbase',
        node: (
          <img
            loading="lazy"
            src="/icons/wallets/coinbase.svg"
            alt={'coinbase'}
            style={assetImgStyle}
          />
        ),
      },
      {
        name: 'frame',
        node: (
          <img loading="lazy" src="/icons/wallets/frame.svg" alt={'frame'} style={assetImgStyle} />
        ),
      },
      {
        name: 'torus',
        node: (
          <img loading="lazy" src="/icons/wallets/torus.svg" alt={'torus'} style={assetImgStyle} />
        ),
      },
      {
        name: 'walletConnect',
        node: (
          <img
            loading="lazy"
            src="/icons/wallets/walletConnect.svg"
            alt={'walletConnect'}
            style={assetImgStyle}
          />
        ),
      },
    ],
  },
];

const IconTile = ({ name, node }: Entry) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: 132 }}>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 72,
        color: 'fg-1',
        border: `1px solid ${figVars['border-2']}`,
        borderRadius: '12px',
      }}
    >
      {node}
    </Box>
    <Typography
      variant="helperText"
      sx={{ color: 'fg-3', textAlign: 'center', wordBreak: 'break-word', fontFamily: 'monospace' }}
    >
      {name}
    </Typography>
  </Box>
);

export const IconsSection = () => (
  <Section
    title="Icons"
    description="Every icon in the project — icon components (project glyphs, heroicons, @mui/icons-material, bespoke) followed by every SVG asset under public/icons (token/network/wallet/flag logos, etc.). Components render at 28px; most inherit colour via currentColor."
  >
    {GROUPS.map((group) => (
      <Box key={group.title} sx={{ flex: '1 1 100%', mb: 8 }}>
        <Typography variant="subheader1" sx={{ mb: 4, display: 'block' }}>
          {group.title} ({group.icons.length})
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {group.icons.map((icon) => (
            <IconTile key={`${group.title}:${icon.name}`} name={icon.name} node={icon.node} />
          ))}
        </Box>
      </Box>
    ))}
  </Section>
);

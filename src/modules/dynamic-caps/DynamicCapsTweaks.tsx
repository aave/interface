import { Box, Button, GlobalStyles, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ROUTES } from 'src/components/primitives/Link';
import { syncTweakParamsToUrl, TWEAKS_ENABLED } from 'src/components/tweaks/tweakParams';
import { TweaksField, TweaksPopover, TweaksToggle } from 'src/components/tweaks/TweaksPopover';
import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { figVars } from 'src/utils/figmaColors';
import { useAccount } from 'wagmi';

import { CapScenario, useCapScenario } from './simulatedCaps';
import {
  isSimulatedWalletAddress,
  simulatedWalletAddress,
  SimulatedWalletSize,
  useSimulatedWalletSize,
} from './simulatedWallet';
import {
  BarHover,
  OnOff,
  ReserveVariant,
  useBarHover,
  useMarketsColumn,
  useMarketsNotice,
  useMarketsTag,
  useReserveVariant,
} from './useDynamicCap';

// The reserve the options are shown on: USDC on Arbitrum, the pilot market.
const PILOT_MARKET = 'proto_arbitrum_v3' as CustomMarket;
const PILOT_ASSET = '0xaf88d065e77c8cc2239327c5edb3a432268e5831';

const VARIANT_OPTIONS: readonly { value: ReserveVariant; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: 'notice', label: 'Notice' },
  { value: 'max-cap', label: 'Max cap' },
  { value: 'vs-max', label: 'Vs max' },
  { value: 'combined', label: 'Combined' },
];

const VARIANT_HINTS: Record<ReserveVariant, string> = {
  today: 'Unchanged UI on a dynamic cap. This is the problem: it reads as full.',
  notice: 'Option 1. A notice above Borrow info, every figure unchanged.',
  'max-cap': 'Option 2. A Dynamic cap label, and the max cap under the current cap.',
  'vs-max': 'Option 3. Usage measured against the max cap, plus a bar with every level.',
  combined:
    "Option 3 with Option 1's notice, Aave's wording, and the max cap in a column of its own.",
};

const SCENARIO_OPTIONS: readonly { value: CapScenario; label: string }[] = [
  { value: 'topped-up', label: 'Topped up' },
  { value: 'headroom', label: 'Low' },
  { value: 'cap-reached', label: 'Used up' },
  { value: 'at-max', label: 'At max' },
];

const SCENARIO_HINTS: Record<CapScenario, string> = {
  'topped-up':
    'Right after a raise: a full buffer above borrowing (draft: 10% of debt, 15M at most).',
  headroom: 'A raise is due: the state in the mockups, 99.23% of the current cap.',
  'cap-reached': 'The current cap is fully used and has not been raised yet.',
  'at-max': 'The current cap has reached the max cap, so it stops rising.',
};

const BAR_HOVER_OPTIONS: readonly { value: BarHover; label: string }[] = [
  { value: 'on', label: 'On' },
  { value: 'off', label: 'Off' },
];

const BAR_HOVER_HINTS: Record<BarHover, string> = {
  on: 'Each part of the bar lifts slightly on hover and names its amount.',
  off: 'A static bar: the legend under it carries the amounts.',
};

const ON_OFF_OPTIONS: readonly { value: OnOff; label: string }[] = [
  { value: 'on', label: 'On' },
  { value: 'off', label: 'Off' },
];

const MARKETS_NOTICE_HINTS: Record<OnOff, string> = {
  on: 'One notice above the list, inside the card, for the whole market.',
  off: 'No notice: the rows carry it alone.',
};

const MARKETS_TAG_HINTS: Record<OnOff, string> = {
  on: 'A Dynamic cap tag next to total borrowed, explained on hover.',
  off: 'No tag on total borrowed.',
};

const MARKETS_COLUMN_HINTS: Record<OnOff, string> = {
  on: 'A Dynamic cap column: a check on each dynamic reserve, explained on hover.',
  off: 'No extra column.',
};

type MarketsSwitches = { notice?: OnOff; tag?: OnOff; column?: OnOff };

const WALLET_OPTIONS: readonly { value: SimulatedWalletSize; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: 'small', label: 'Small' },
  { value: 'large', label: 'Large' },
];

const WALLET_HINTS: Record<SimulatedWalletSize, string> = {
  off: 'No wallet: the pages as a visitor sees them.',
  small: 'Read-only. About 10 WETH of collateral: its own limit is far below the cap.',
  large: 'Read-only. About 10,000 WETH of collateral: the cap is what limits it.',
};

type TourStep = {
  title: string;
  body: string;
  page: 'reserve' | 'markets';
  variant: ReserveVariant;
  scenario: CapScenario;
  /** Switches the simulated wallet. Left as it is when not set. */
  wallet?: SimulatedWalletSize;
  /** Opens the borrow modal on the pilot reserve. */
  borrowModal?: boolean;
  /** Sets the markets page switches. Left as they are when not set. */
  markets?: MarketsSwitches;
  /** `data-dyncap` values to outline, first one scrolled into view. */
  highlight: string[];
  /** Orange marks the problem, pink marks what an option adds or changes. */
  tone: 'problem' | 'change';
};

const TOUR: TourStep[] = [
  {
    title: 'The problem today',
    body: 'A dynamic cap is kept one buffer above borrowing. With the draft parameters the ring on this reserve would swing between about 92% right after a raise and 98% or more while the next one is due, where the borrow flow warns that the cap is nearly reached. Nothing on the page says the cap will rise.',
    page: 'reserve',
    variant: 'today',
    scenario: 'headroom',
    highlight: ['borrow-stats'],
    tone: 'problem',
  },
  {
    title: 'Option 1: a notice',
    body: 'A notice above Borrow info explains the cap. Every figure stays as it is. The smallest change: copy and configuration only.',
    page: 'reserve',
    variant: 'notice',
    scenario: 'headroom',
    highlight: ['notice'],
    tone: 'change',
  },
  {
    title: 'Option 2: the max cap next to the current cap',
    body: 'A Dynamic cap label under Borrow info, and the max cap under the current cap. Ring and totals are unchanged, so this only adds. One contract read per reserve.',
    page: 'reserve',
    variant: 'max-cap',
    scenario: 'headroom',
    highlight: ['chip', 'max-cap'],
    tone: 'change',
  },
  {
    title: 'Option 3: usage against the max cap',
    body: 'The ring and the "of" figure use the max cap, the cap column shows the current cap and what can be borrowed now, and a bar shows every level. The clearest, but it changes what the ring means on these reserves.',
    page: 'reserve',
    variant: 'vs-max',
    scenario: 'headroom',
    highlight: ['borrow-stats', 'bar', 'available-now'],
    tone: 'change',
  },
  {
    title: 'Combined: the notice, and usage against the max cap',
    body: "Option 1's notice teaches what a dynamic cap is. Below it, Aave's own wording stays: total borrowed is set against the max cap, the current cap column adds what can be borrowed now, the max cap gets a column of its own, and the bar shows every level. No label: the notice carries it.",
    page: 'reserve',
    variant: 'combined',
    scenario: 'headroom',
    highlight: ['notice', 'borrow-stats', 'bar', 'available-now'],
    tone: 'change',
  },
  {
    title: 'In the borrow flow',
    body: 'A simulated wallet with more collateral than the cap leaves room for. The warning that the cap is nearly reached gives way to what can be borrowed now, that the cap rises, and where to go for a larger borrow. The same for every option. Switch Reserve page to Today to see the warning it replaces, and Wallet to Small for a borrower the cap does not limit.',
    page: 'reserve',
    variant: 'combined',
    scenario: 'headroom',
    wallet: 'large',
    borrowModal: true,
    highlight: ['borrow-note'],
    tone: 'change',
  },
  {
    title: 'When the current cap is fully used',
    body: 'Between two raises the current cap can be used up. Under Your info the Borrow button is off, and the warning that the cap is at 100% gives way to one that says the cap will be raised. Switch Reserve page to compare how each option reads when nothing can be borrowed right now.',
    page: 'reserve',
    variant: 'combined',
    scenario: 'cap-reached',
    highlight: ['notice', 'borrow-stats', 'borrow-note'],
    tone: 'change',
  },
  {
    title: 'When the cap reaches its maximum',
    body: 'At the max cap the cap stops rising, and a reading near 100% means full again. Each option has to say so instead of promising a raise.',
    page: 'reserve',
    variant: 'combined',
    scenario: 'at-max',
    highlight: ['notice', 'borrow-stats'],
    tone: 'change',
  },
  {
    title: 'Markets list',
    body: 'The markets page has its own switches, independent of the reserve page. Here: one notice for the market, and a Dynamic cap tag on total borrowed. Hover the tag for the current cap, what is available now and the max cap.',
    page: 'markets',
    variant: 'combined',
    scenario: 'headroom',
    markets: { notice: 'on', tag: 'on', column: 'off' },
    highlight: ['banner', 'chip'],
    tone: 'change',
  },
  {
    title: 'Markets list: a column instead of the tag',
    body: 'A Dynamic cap column, with a check on each reserve that has one and the same explanation on hover. It keeps total borrowed as it is today. Each markets switch can be turned on or off on its own.',
    page: 'markets',
    variant: 'combined',
    scenario: 'headroom',
    markets: { notice: 'on', tag: 'off', column: 'on' },
    highlight: ['column'],
    tone: 'change',
  },
];

const INLINE_HIGHLIGHTS = ['max-cap', 'available-now'];

const highlightColor = (tone: TourStep['tone']) =>
  tone === 'problem' ? figVars['data-orange'] : figVars['data-pink'];

const highlightSelector = (keys: string[]) =>
  keys.map((key) => `[data-dyncap="${key}"]`).join(', ');

/**
 * The switches for the dynamic caps proposal, and a tour that walks through them. Mounted once for
 * the whole app; renders nothing outside preview builds.
 */
export const DynamicCapsTweaks = () => {
  const router = useRouter();
  const setCurrentMarket = useRootStore((store) => store.setCurrentMarket);
  const currentMarket = useRootStore((store) => store.currentMarket);
  const setAccount = useRootStore((store) => store.setAccount);
  const { currentAccount, readOnlyModeAddress, setReadOnlyModeAddress } = useWeb3Context();
  const { address: connectedAddress } = useAccount();
  const { user, reserves, loading } = useAppDataContext();
  const { openBorrow, close: closeModal, type: openModalType } = useModalContext();
  const [variant, setVariant] = useReserveVariant();
  const [scenario, setScenario] = useCapScenario();
  const [barHover, setBarHover] = useBarHover();
  const [marketsNotice, setMarketsNotice] = useMarketsNotice();
  const [marketsTag, setMarketsTag] = useMarketsTag();
  const [marketsColumn, setMarketsColumn] = useMarketsColumn();
  const [wallet, setWallet] = useSimulatedWalletSize();
  const [open, setOpen] = useState(false);
  const [tourIndex, setTourIndex] = useState<number | null>(null);
  const [borrowModalRequested, setBorrowModalRequested] = useState(false);

  const step = tourIndex === null ? null : TOUR[tourIndex];

  // Next rebuilds the address from the route on navigation: put the switches back on it.
  useEffect(() => {
    if (!TWEAKS_ENABLED) return;
    router.events.on('routeChangeComplete', syncTweakParamsToUrl);
    return () => router.events.off('routeChangeComplete', syncTweakParamsToUrl);
  }, [router.events]);

  // The simulated wallet rides the app's own read-only mode, which cannot sign anything.
  useEffect(() => {
    if (!TWEAKS_ENABLED) return;
    const wanted = simulatedWalletAddress(wallet);
    if (wanted) {
      if (readOnlyModeAddress !== wanted) setReadOnlyModeAddress(wanted);
    } else if (isSimulatedWalletAddress(readOnlyModeAddress)) {
      setReadOnlyModeAddress(undefined);
      // Read-only mode leaves its address in the store when it ends: hand it back to the wallet.
      setAccount(connectedAddress?.toLowerCase());
    }
  }, [wallet, readOnlyModeAddress, setReadOnlyModeAddress, setAccount, connectedAddress]);

  // The borrow modal needs the pilot market's reserves and the wallet's position: open it once
  // both are there.
  useEffect(() => {
    if (!borrowModalRequested) return;
    const ready =
      currentMarket === PILOT_MARKET &&
      isSimulatedWalletAddress(currentAccount) &&
      !loading &&
      !!user &&
      reserves.some((reserve) => reserve.underlyingAsset === PILOT_ASSET);
    if (!ready) return;
    setBorrowModalRequested(false);
    openBorrow(PILOT_ASSET, PILOT_MARKET, 'USDC', 'tweaks', true);
  }, [borrowModalRequested, currentMarket, currentAccount, loading, user, reserves, openBorrow]);

  const openPage = (page: TourStep['page']) => {
    const path =
      page === 'reserve'
        ? ROUTES.reserveOverview(PILOT_ASSET, PILOT_MARKET)
        : `${ROUTES.markets}/?marketName=${PILOT_MARKET}`;
    const alreadyThere =
      currentMarket === PILOT_MARKET &&
      (page === 'reserve'
        ? router.pathname === '/reserve-overview' &&
          String(router.query.underlyingAsset).toLowerCase() === PILOT_ASSET
        : router.pathname === ROUTES.markets);
    if (alreadyThere) return;
    setCurrentMarket(PILOT_MARKET);
    router.push(path);
  };

  const openBorrowModal = () => {
    if (wallet === 'off') setWallet('large');
    openPage('reserve');
    setBorrowModalRequested(true);
  };

  const goToStep = (index: number | null) => {
    setTourIndex(index);
    const next = index === null ? null : TOUR[index];
    if (!next?.borrowModal) {
      setBorrowModalRequested(false);
      if (openModalType === ModalType.Borrow) closeModal();
    }
    if (!next) return;
    setVariant(next.variant);
    setScenario(next.scenario);
    if (next.wallet) setWallet(next.wallet);
    if (next.markets?.notice) setMarketsNotice(next.markets.notice);
    if (next.markets?.tag) setMarketsTag(next.markets.tag);
    if (next.markets?.column) setMarketsColumn(next.markets.column);
    openPage(next.page);
    if (next.borrowModal) setBorrowModalRequested(true);
  };

  // Bring what the step talks about into view, once the page has it.
  useEffect(() => {
    if (!step) return;
    let attempts = 0;
    const timer = window.setInterval(() => {
      const target = document.querySelector(highlightSelector(step.highlight.slice(0, 1)));
      attempts += 1;
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (target || attempts > 20) window.clearInterval(timer);
    }, 250);
    return () => window.clearInterval(timer);
  }, [step]);

  if (!TWEAKS_ENABLED) return null;

  return (
    <>
      {step && (
        <GlobalStyles
          styles={{
            // Important: alerts set their own outline, which would otherwise win.
            [highlightSelector(step.highlight)]: {
              outline: `2px solid ${highlightColor(step.tone)} !important`,
              outlineOffset: '6px',
            },
            // These sit inside a clipped panel item, where an outline is cut off: tint them.
            [highlightSelector(INLINE_HIGHLIGHTS)]: {
              outline: 'none !important',
              borderRadius: '4px',
              backgroundColor: `color-mix(in srgb, ${highlightColor(step.tone)} 22%, transparent)`,
            },
          }}
        />
      )}
      <TweaksPopover title="Dynamic caps" open={open || !!step} onOpenChange={setOpen}>
        {step && tourIndex !== null ? (
          <Box>
            <Typography variant="caption" color="fg-3" component="div">
              Tour, {tourIndex + 1} of {TOUR.length}
            </Typography>
            <Typography variant="subheader1" component="div" sx={{ mt: 1 }}>
              {step.title}
            </Typography>
            <Typography variant="description" color="fg-2" component="div" sx={{ mt: 1.5 }}>
              {step.body}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
              <Button
                variant="tertiary"
                size="small"
                disabled={tourIndex === 0}
                onClick={() => goToStep(tourIndex - 1)}
              >
                Back
              </Button>
              {tourIndex < TOUR.length - 1 ? (
                <Button variant="contained" size="small" onClick={() => goToStep(tourIndex + 1)}>
                  Next
                </Button>
              ) : (
                <Button variant="contained" size="small" onClick={() => goToStep(null)}>
                  Done
                </Button>
              )}
              <Button
                variant="text"
                size="small"
                onClick={() => goToStep(null)}
                sx={{ ml: 'auto' }}
              >
                Exit tour
              </Button>
            </Box>
          </Box>
        ) : null}

        <TweaksField label="Reserve page" hint={VARIANT_HINTS[variant]}>
          <TweaksToggle
            ariaLabel="Reserve page option"
            value={variant}
            onChange={setVariant}
            options={VARIANT_OPTIONS}
          />
        </TweaksField>

        {(variant === 'vs-max' || variant === 'combined') && router.pathname !== ROUTES.markets && (
          <TweaksField label="Bar hover" hint={BAR_HOVER_HINTS[barHover]}>
            <TweaksToggle
              ariaLabel="Bar hover"
              value={barHover}
              onChange={setBarHover}
              options={BAR_HOVER_OPTIONS}
            />
          </TweaksField>
        )}

        {router.pathname === ROUTES.markets && (
          <>
            <TweaksField label="Markets notice" hint={MARKETS_NOTICE_HINTS[marketsNotice]}>
              <TweaksToggle
                ariaLabel="Markets notice"
                value={marketsNotice}
                onChange={setMarketsNotice}
                options={ON_OFF_OPTIONS}
              />
            </TweaksField>
            <TweaksField label="Markets tag" hint={MARKETS_TAG_HINTS[marketsTag]}>
              <TweaksToggle
                ariaLabel="Markets tag"
                value={marketsTag}
                onChange={setMarketsTag}
                options={ON_OFF_OPTIONS}
              />
            </TweaksField>
            <TweaksField label="Markets column" hint={MARKETS_COLUMN_HINTS[marketsColumn]}>
              <TweaksToggle
                ariaLabel="Markets column"
                value={marketsColumn}
                onChange={setMarketsColumn}
                options={ON_OFF_OPTIONS}
              />
            </TweaksField>
          </>
        )}

        <TweaksField label="Cap state (simulated)" hint={SCENARIO_HINTS[scenario]}>
          <TweaksToggle
            ariaLabel="Simulated cap state"
            value={scenario}
            onChange={setScenario}
            options={SCENARIO_OPTIONS}
          />
        </TweaksField>

        <TweaksField label="Wallet (simulated)" hint={WALLET_HINTS[wallet]}>
          <TweaksToggle
            ariaLabel="Simulated wallet"
            value={wallet}
            onChange={setWallet}
            options={WALLET_OPTIONS}
          />
        </TweaksField>

        {!step && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Button variant="contained" size="small" onClick={() => goToStep(0)}>
              Take the tour
            </Button>
            <Button variant="tertiary" size="small" onClick={() => openPage('reserve')}>
              USDC reserve
            </Button>
            <Button variant="tertiary" size="small" onClick={openBorrowModal}>
              Borrow modal
            </Button>
            <Button variant="tertiary" size="small" onClick={() => openPage('markets')}>
              Markets
            </Button>
          </Box>
        )}
      </TweaksPopover>
    </>
  );
};

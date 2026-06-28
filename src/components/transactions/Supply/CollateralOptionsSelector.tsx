import { valueToBigNumber } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  ButtonBase,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { EmodeAssetTable } from 'src/components/transactions/Emode/EmodeAssetTable';
import { EmodeCategory } from 'src/helpers/types';
import {
  ComputedReserveData,
  ExtendedFormattedUser,
} from 'src/hooks/app-data-provider/useAppDataProvider';

export interface CollateralOption {
  emodeId: number; // 0 = default (no e-mode), >0 = specific e-mode category
  ltv: number; // as decimal e.g. 0.8 for 80%
  collateralAssets: Array<{ symbol: string; iconSymbol: string }>;
  borrowableAssets: Array<{ symbol: string; iconSymbol: string }>;
  isCurrentEmode: boolean;
  blocked: boolean;
  blockReason?: React.ReactNode;
}

interface CollateralOptionsSelectorProps {
  poolReserve: ComputedReserveData;
  eModes: Record<number, EmodeCategory>;
  user: ExtendedFormattedUser;
  reserves: ComputedReserveData[];
  selectedEmodeId: number;
  onSelect: (emodeId: number) => void;
}

/**
 * Checks if an e-mode category is blocked for the user, and returns a reason if so.
 * Mirrors the on-chain validateSetUserEMode checks:
 * 1. User has borrows not borrowable in the target category
 * 2. User has collateral that would have 0 LTV in the target category (ltvzero bitmap)
 */
function getBlockReason(
  targetEmodeId: number,
  user: ExtendedFormattedUser,
  eModes: Record<number, EmodeCategory>,
  reserves: ComputedReserveData[]
): React.ReactNode | undefined {
  // No checks needed if user has no positions
  if (!user.userReservesData.length) return undefined;

  // Current e-mode — always available
  if (targetEmodeId === user.userEmodeCategoryId) return undefined;

  const targetEmode = eModes[targetEmodeId];

  // Check 1: Incompatible borrows
  if (targetEmodeId !== 0 && targetEmode) {
    const borrowableAddresses = targetEmode.assets
      .filter((a) => a.borrowable)
      .map((a) => a.underlyingAsset);

    const incompatibleBorrow = user.userReservesData.find(
      (ur) =>
        valueToBigNumber(ur.scaledVariableDebt).gt(0) &&
        !borrowableAddresses.includes(ur.reserve.underlyingAsset)
    );

    if (incompatibleBorrow) {
      return (
        <Trans>
          Active {incompatibleBorrow.reserve.symbol} borrow is not compatible with this category.
          Repay your {incompatibleBorrow.reserve.symbol} borrow to use this option.
        </Trans>
      );
    }
  }

  // Check 2: Collateral with 0 LTV in target category
  // On-chain: getUserReserveLtv returns 0 if asset is in collateralBitmap AND in ltvzeroBitmap
  for (const userReserve of user.userReservesData) {
    if (!userReserve.usageAsCollateralEnabledOnUser) continue;

    const reserve = reserves.find((r) => r.underlyingAsset === userReserve.reserve.underlyingAsset);
    if (!reserve) continue;

    if (targetEmodeId === 0) {
      // Switching to no e-mode: check base LTV
      if (Number(reserve.baseLTVasCollateral) === 0) {
        return (
          <Trans>
            {reserve.symbol} collateral would have 0% LTV without E-Mode. Disable {reserve.symbol}{' '}
            as collateral to use this option.
          </Trans>
        );
      }
    } else {
      // Switching to an e-mode: check if asset is in collateral bitmap with ltvzero
      const reserveTargetEmode = reserve.eModes.find((e) => e.id === targetEmodeId);
      if (
        reserveTargetEmode &&
        reserveTargetEmode.collateralEnabled &&
        reserveTargetEmode.ltvzeroEnabled
      ) {
        return (
          <Trans>
            {reserve.symbol} collateral would have 0% LTV in this category. Disable {reserve.symbol}{' '}
            as collateral to use this option.
          </Trans>
        );
      }
      // If asset is NOT in the category at all, it falls back to base LTV — check that too
      if (!reserveTargetEmode || !reserveTargetEmode.collateralEnabled) {
        if (Number(reserve.baseLTVasCollateral) === 0) {
          return (
            <Trans>
              {reserve.symbol} collateral would have 0% LTV in this category. Disable{' '}
              {reserve.symbol} as collateral to use this option.
            </Trans>
          );
        }
      }
    }
  }

  return undefined;
}

export function buildCollateralOptions(
  poolReserve: ComputedReserveData,
  eModes: Record<number, EmodeCategory>,
  user: ExtendedFormattedUser,
  reserves: ComputedReserveData[]
): CollateralOption[] {
  const options: CollateralOption[] = [];

  let currentEmodeIncluded = user.userEmodeCategoryId === 0; // category 0 is always added below

  // E-mode options from the reserve's e-mode categories
  poolReserve.eModes.forEach((reserveEmode) => {
    if (reserveEmode.id === 0) return;
    const isUserCurrentEmode = user.userEmodeCategoryId === reserveEmode.id;
    if (!reserveEmode.collateralEnabled && !isUserCurrentEmode) return;
    if (isUserCurrentEmode) currentEmodeIncluded = true;

    const globalEmode = eModes[reserveEmode.id];
    if (!globalEmode) return;

    const collateralAssets = globalEmode.assets.filter((a) => a.collateral);
    const borrowableAssets = globalEmode.assets.filter((a) => a.borrowable);
    const blockReason = getBlockReason(reserveEmode.id, user, eModes, reserves);

    // Mirrors getUserReserveLtv from the contract:
    // - collateralEnabled + ltvzeroEnabled → 0
    // - collateralEnabled + !ltvzeroEnabled → e-mode boosted LTV
    // - !collateralEnabled → base reserve LTV
    let ltv: number;
    if (reserveEmode.collateralEnabled) {
      ltv = reserveEmode.ltvzeroEnabled ? 0 : Number(reserveEmode.eMode.ltv) / 10000;
    } else {
      ltv = Number(poolReserve.baseLTVasCollateral) / 10000;
    }

    options.push({
      emodeId: reserveEmode.id,
      ltv,
      collateralAssets: collateralAssets.map((a) => ({
        symbol: a.symbol,
        iconSymbol: a.iconSymbol,
      })),
      borrowableAssets: borrowableAssets.map((a) => ({
        symbol: a.symbol,
        iconSymbol: a.iconSymbol,
      })),
      isCurrentEmode: isUserCurrentEmode,
      blocked: !!blockReason,
      blockReason,
    });
  });

  // If user's current e-mode wasn't found in poolReserve.eModes, add it as a fallback
  // (asset not in the category at all — uses base LTV, no e-mode switch needed)
  if (!currentEmodeIncluded && user.userEmodeCategoryId !== 0) {
    const globalEmode = eModes[user.userEmodeCategoryId];
    options.push({
      emodeId: user.userEmodeCategoryId,
      ltv: Number(poolReserve.baseLTVasCollateral) / 10000,
      collateralAssets: [],
      borrowableAssets: globalEmode
        ? globalEmode.assets
            .filter((a) => a.borrowable)
            .map((a) => ({
              symbol: a.symbol,
              iconSymbol: a.iconSymbol,
            }))
        : [],
      isCurrentEmode: true,
      blocked: false, // current e-mode is never blocked — no switch needed
      blockReason: undefined,
    });
  }

  // Default option (no e-mode) — uses base reserve LTV
  const baseLtv = Number(poolReserve.baseLTVasCollateral) / 10000;
  const blockReason = getBlockReason(0, user, eModes, reserves);
  options.push({
    emodeId: 0,
    ltv: baseLtv,
    collateralAssets: [],
    borrowableAssets: [],
    isCurrentEmode: user.userEmodeCategoryId === 0,
    blocked: !!blockReason,
    blockReason,
  });

  // Sort: available first, then by LTV descending
  options.sort((a, b) => {
    if (a.blocked !== b.blocked) return a.blocked ? 1 : -1;
    return b.ltv - a.ltv;
  });

  return options;
}

export const CollateralOptionsSelector = React.memo(
  ({
    poolReserve,
    eModes,
    user,
    reserves,
    selectedEmodeId,
    onSelect,
  }: CollateralOptionsSelectorProps) => {
    const options = buildCollateralOptions(poolReserve, eModes, user, reserves);
    const [expanded, setExpanded] = useState(false);

    if (options.length <= 1) return null;

    const VISIBLE_COUNT = 2;
    const hasMore = options.length > VISIBLE_COUNT;
    const visibleOptions = expanded ? options : options.slice(0, VISIBLE_COUNT);

    return (
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="description" color="text.secondary" sx={{ mb: 2 }}>
          <Trans>Collateral options</Trans>
        </Typography>
        <Stack spacing={1}>
          {visibleOptions.map((option) => {
            const isSelected = selectedEmodeId === option.emodeId;
            const card = (
              <ButtonBase
                key={option.emodeId}
                onClick={() => !option.blocked && onSelect(option.emodeId)}
                disabled={option.blocked}
                aria-label={`${(option.ltv * 100).toFixed(0)}% LTV${
                  option.isCurrentEmode ? ' (active)' : ''
                }${option.blocked ? ' (unavailable)' : ''}`}
                sx={(theme) => ({
                  p: 2,
                  width: '100%',
                  display: 'block',
                  textAlign: 'left',
                  border: `1px solid ${
                    isSelected ? theme.palette.primary.main : theme.palette.divider
                  }`,
                  borderRadius: '8px',
                  cursor: option.blocked ? 'not-allowed' : 'pointer',
                  bgcolor: 'transparent',
                  opacity: option.blocked ? 0.5 : 1,
                  '&:hover': {
                    borderColor: option.blocked
                      ? theme.palette.divider
                      : theme.palette.primary.main,
                  },
                  transition: 'all 0.15s ease',
                })}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={(theme) => ({
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        border: `2px solid ${
                          isSelected ? theme.palette.primary.main : theme.palette.divider
                        }`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      })}
                    >
                      {isSelected && (
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                          }}
                        />
                      )}
                    </Box>
                    <FormattedNumber
                      value={option.ltv}
                      percent
                      visibleDecimals={0}
                      variant="subheader1"
                      color="text.primary"
                    />
                    <Typography variant="subheader1" color="text.primary">
                      <Trans>LTV</Trans>
                    </Typography>
                    {option.isCurrentEmode && (
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1,
                          py: 0.25,
                          borderRadius: '4px',
                          bgcolor: 'success.main',
                          color: '#fff',
                          fontSize: '10px',
                        }}
                      >
                        <Trans>Active</Trans>
                      </Typography>
                    )}
                    {option.emodeId === 0 && (
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1,
                          py: 0.25,
                          borderRadius: '4px',
                          bgcolor: 'text.secondary',
                          color: '#fff',
                          fontSize: '10px',
                        }}
                      >
                        <Trans>Default</Trans>
                      </Typography>
                    )}
                  </Stack>
                </Stack>

                {/* Borrowable assets */}
                {option.borrowableAssets.length > 0 && (
                  <AssetRow label={<Trans>Borrow:</Trans>} assets={option.borrowableAssets} />
                )}
                {option.emodeId === 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, ml: 3.5 }}>
                    <Trans>Borrow: All eligible assets</Trans>
                  </Typography>
                )}
              </ButtonBase>
            );
            return option.blocked ? (
              <Tooltip key={option.emodeId} title={option.blockReason ?? ''} arrow placement="top">
                <span>{card}</span>
              </Tooltip>
            ) : (
              card
            );
          })}
          {hasMore && !expanded && (
            <Button
              variant="text"
              size="small"
              onClick={() => setExpanded(true)}
              sx={{ alignSelf: 'center', textTransform: 'none' }}
            >
              <Trans>See {options.length - VISIBLE_COUNT} more</Trans>
            </Button>
          )}
          {hasMore && expanded && (
            <Button
              variant="text"
              size="small"
              onClick={() => setExpanded(false)}
              sx={{ alignSelf: 'center', textTransform: 'none' }}
            >
              <Trans>Show less</Trans>
            </Button>
          )}
        </Stack>

        {selectedEmodeId !== 0 && eModes[selectedEmodeId] && (
          <Accordion
            disableGutters
            elevation={0}
            sx={{
              mt: 2,
              '&:before': { display: 'none' },
              bgcolor: 'transparent',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ px: 0, minHeight: 'auto', '& .MuiAccordionSummary-content': { my: 1 } }}
            >
              <Typography variant="description" color="text.secondary">
                <Trans>Category assets</Trans>
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0 }}>
              <EmodeAssetTable assets={eModes[selectedEmodeId].assets} maxHeight="200px" />
            </AccordionDetails>
          </Accordion>
        )}
      </Box>
    );
  }
);

const MAX_VISIBLE_ASSETS = 5;

const AssetRow = ({
  label,
  assets,
}: {
  label: React.ReactNode;
  assets: Array<{ symbol: string; iconSymbol: string }>;
}) => (
  <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1, ml: 3.5 }}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    {assets.slice(0, MAX_VISIBLE_ASSETS).map((asset) => (
      <Stack key={asset.symbol} direction="row" alignItems="center" spacing={0.25}>
        <TokenIcon symbol={asset.iconSymbol} sx={{ fontSize: '14px' }} />
        <Typography variant="caption" color="text.secondary">
          {asset.symbol}
        </Typography>
      </Stack>
    ))}
    {assets.length > MAX_VISIBLE_ASSETS && (
      <Typography variant="caption" color="text.secondary">
        +{assets.length - MAX_VISIBLE_ASSETS}
      </Typography>
    )}
  </Stack>
);

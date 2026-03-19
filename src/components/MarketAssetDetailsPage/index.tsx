import { Check, OpenInNew, StarBorder } from '@mui/icons-material';
import { Box, Button, ButtonGroup, IconButton, Link as MuiLink, Typography } from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import Layout from 'src/components/Layout';
import MaxWidthContainer from 'src/components/MaxWidthContainer';
import { Link, ROUTES } from 'src/components/primitives/Link';

import {
  ChartRange,
  EmodeCategory as EmodeCategoryType,
  FALLBACK_MARKET_ASSET_DETAILS,
  MARKET_ASSET_DETAILS_BY_UNDERLYING,
  MarketAssetDetailsMock,
} from './const';
import {
  AssetIdentity,
  AssetTitleRow,
  CardBlockTitle,
  ChartAvgPill,
  ChartBlock,
  ChartPlaceholder,
  ChartTag,
  ChartToolbar,
  ConfigCard,
  DonutBlock,
  DonutInner,
  DonutRing,
  EmodeCategoryCard,
  EmodeStack,
  FlagItem,
  FlagRow,
  InstanceRow,
  MetricCell,
  MetricDivider,
  MetricsRow,
  OracleActions,
  PageWrapper,
  ParamRow,
  ParamRows,
  SectionShell,
  SectionTitle,
  StatCell,
  StatDivider,
  StatsStrip,
  Subsection,
  SupplyBorrowMain,
  TopRows,
  V3Badge,
} from './styles';

function StatusFlag({ ok, label }: { ok: boolean; label: string }) {
  return (
    <FlagItem>
      {ok ? (
        <Check sx={{ fontSize: 20, color: 'primary.main' }} />
      ) : (
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: '1px solid',
            borderColor: 'text.disabled',
          }}
        />
      )}
      <Typography variant="body1" color={ok ? 'primary' : 'text.disabled'}>
        {label}
      </Typography>
    </FlagItem>
  );
}

function ApyChartPanel({
  title,
  avgLabel,
  range,
  onRangeChange,
  accent,
}: {
  title: string;
  avgLabel: string;
  range: ChartRange;
  onRangeChange: (r: ChartRange) => void;
  accent: 'supply' | 'borrow';
}) {
  const stroke = accent === 'supply' ? '#4CAF50' : '#29B6F6';
  return (
    <ChartBlock>
      <ChartToolbar>
        <ChartTag>
          <Typography variant="subtitle2">{title}</Typography>
        </ChartTag>
        <ButtonGroup size="small" variant="outlined" color="inherit">
          {(['1w', '1m', '6m'] as const).map((r) => (
            <Button
              key={r}
              onClick={() => onRangeChange(r)}
              variant={range === r ? 'contained' : 'outlined'}
              color="inherit"
              sx={{ minWidth: 44, px: 1.5 }}
            >
              {r}
            </Button>
          ))}
        </ButtonGroup>
      </ChartToolbar>
      <ChartPlaceholder>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 140"
          preserveAspectRatio="none"
          style={{ opacity: 0.85 }}
        >
          <defs>
            <linearGradient id={`grad-${accent}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,100 C60,95 80,40 140,55 S220,20 280,48 S360,30 400,38 L400,140 L0,140 Z"
            fill={`url(#grad-${accent})`}
          />
          <path
            d="M0,100 C60,95 80,40 140,55 S220,20 280,48 S360,30 400,38"
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <ChartAvgPill>
          <Typography variant="caption">{avgLabel}</Typography>
        </ChartAvgPill>
      </ChartPlaceholder>
    </ChartBlock>
  );
}

function EmodeBlock({ category }: { category: EmodeCategoryType }) {
  return (
    <EmodeCategoryCard>
      <Box display="flex" flexDirection="column" gap={1.5}>
        <Typography variant="body1">{category.title}</Typography>
        <FlagRow>
          <StatusFlag ok={category.collateral === 'yes'} label="Collateral" />
          <StatusFlag ok={category.borrowable === 'yes'} label="Borrowable" />
        </FlagRow>
      </Box>
      <ParamRows>
        {category.rows.map((row) => (
          <ParamRow key={row.label}>
            <Typography variant="body2" color="text.secondary">
              {row.label}
            </Typography>
            <Typography variant="h6">{row.value}</Typography>
          </ParamRow>
        ))}
      </ParamRows>
    </EmodeCategoryCard>
  );
}

function resolveDetails(underlying?: string): MarketAssetDetailsMock {
  if (!underlying) {
    return FALLBACK_MARKET_ASSET_DETAILS;
  }
  const key = underlying.toLowerCase();
  const found = Object.entries(MARKET_ASSET_DETAILS_BY_UNDERLYING).find(
    ([addr]) => addr.toLowerCase() === key
  );
  return found ? found[1] : FALLBACK_MARKET_ASSET_DETAILS;
}

export default function MarketAssetDetailsPage() {
  const router = useRouter();
  const underlying = router.query.underlyingAsset as string | undefined;

  const details = useMemo(() => resolveDetails(underlying), [underlying]);

  const [supplyRange, setSupplyRange] = useState<ChartRange>('1w');
  const [borrowRange, setBorrowRange] = useState<ChartRange>('1w');

  return (
    <Layout>
      <MaxWidthContainer>
        <PageWrapper>
          <TopRows>
            <InstanceRow>
              <Image src="/icons/tokens/eth.svg" width={32} height={32} alt="" />
              <Typography
                component="span"
                sx={{ typography: { xs: 'h4', sm: 'h6' }, lineHeight: { xs: 1.2, sm: undefined } }}
              >
                Core Instance
              </Typography>
              <V3Badge>
                <Typography variant="caption" component="span">
                  Version 3
                </Typography>
              </V3Badge>
            </InstanceRow>

            <AssetTitleRow>
              <AssetIdentity>
                <Image src={details.icon} width={40} height={40} alt={details.asset} />
                <Box display="flex" flexDirection="column" gap={0.25}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {details.asset}
                  </Typography>
                  <Typography variant="h6">{details.name}</Typography>
                </Box>
              </AssetIdentity>
              <IconButton size="small" color="inherit" aria-label="Favorite">
                <StarBorder />
              </IconButton>
            </AssetTitleRow>
          </TopRows>

          <StatsStrip>
            <StatCell>
              <Typography variant="body2" color="text.secondary">
                Reserve Size
              </Typography>
              <Box display="flex" alignItems="baseline" gap={0.5}>
                <Typography variant="body2" color="text.secondary">
                  $
                </Typography>
                <Typography variant="h6">{details.reserveSize}</Typography>
              </Box>
            </StatCell>
            <StatDivider />
            <StatCell>
              <Typography variant="body2" color="text.secondary">
                Available liquidity
              </Typography>
              <Box display="flex" alignItems="baseline" gap={0.5}>
                <Typography variant="body2" color="text.secondary">
                  $
                </Typography>
                <Typography variant="h6">{details.availableLiquidity}</Typography>
              </Box>
            </StatCell>
            <StatDivider />
            <StatCell>
              <Typography variant="body2" color="text.secondary">
                Utilization Rate
              </Typography>
              <Typography variant="h6">{details.utilizationRate}</Typography>
            </StatCell>
            <StatDivider />
            <StatCell sx={{ minWidth: 200 }}>
              <Typography variant="body2" color="text.secondary">
                Oracle price
              </Typography>
              <OracleActions
                sx={{
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                }}
              >
                <Box display="flex" alignItems="baseline" gap={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    $
                  </Typography>
                  <Typography variant="h6">{details.oraclePrice}</Typography>
                </Box>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  <Button
                    component={MuiLink}
                    href={details.collector.contractUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    variant="outlined"
                    color="primary"
                    startIcon={<OpenInNew sx={{ fontSize: 18 }} />}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Oracle
                  </Button>
                  <Button
                    component={Link}
                    href={ROUTES.markets}
                    noLinkStyle
                    variant="outlined"
                    color="inherit"
                    size="small"
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    Go back
                  </Button>
                </Box>
              </OracleActions>
            </StatCell>
          </StatsStrip>

          <SectionShell elevation={0}>
            <SectionTitle>
              <Typography variant="h5">Reserve status & configuration</Typography>
            </SectionTitle>

            <ConfigCard>
              <CardBlockTitle>
                <Typography variant="body1">Supply Info</Typography>
              </CardBlockTitle>
              <SupplyBorrowMain>
                <DonutBlock>
                  <DonutRing pct={details.supply.utilizationPct} accent="#B9F6CA">
                    <DonutInner>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {details.supply.utilizationPct.toFixed(2)}%
                      </Typography>
                    </DonutInner>
                  </DonutRing>
                </DonutBlock>
                <MetricsRow>
                  <MetricCell>
                    <Typography variant="body2" color="text.secondary">
                      Total supplied
                    </Typography>
                    <Typography variant="h6">
                      {details.supply.totalSupplied} of {details.supply.totalSuppliedCap}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {details.supply.totalSuppliedUsd} of {details.supply.totalSuppliedCapUsd}
                    </Typography>
                  </MetricCell>
                  <MetricDivider />
                  <MetricCell>
                    <Typography variant="body2" color="text.secondary">
                      APY
                    </Typography>
                    <Typography variant="h6">{details.supply.apy}</Typography>
                  </MetricCell>
                </MetricsRow>
              </SupplyBorrowMain>
              <ApyChartPanel
                title="Supply ARP"
                avgLabel={details.supply.chartAvg}
                range={supplyRange}
                onRangeChange={setSupplyRange}
                accent="supply"
              />
              <Subsection>
                <Typography variant="body1">Collateral usage</Typography>
                <FlagRow>
                  <StatusFlag ok label="Can be collateral" />
                </FlagRow>
                <ParamRows>
                  <ParamRow>
                    <Typography variant="body2" color="text.secondary">
                      Max LTV
                    </Typography>
                    <Typography variant="h6">{details.collateral.maxLtv}</Typography>
                  </ParamRow>
                  <ParamRow>
                    <Typography variant="body2" color="text.secondary">
                      Liquidation threshold
                    </Typography>
                    <Typography variant="h6">{details.collateral.liquidationThreshold}</Typography>
                  </ParamRow>
                  <ParamRow>
                    <Typography variant="body2" color="text.secondary">
                      Liquidation penalty
                    </Typography>
                    <Typography variant="h6">{details.collateral.liquidationPenalty}</Typography>
                  </ParamRow>
                </ParamRows>
              </Subsection>
            </ConfigCard>

            <ConfigCard>
              <CardBlockTitle>
                <Typography variant="body1">Borrow info</Typography>
              </CardBlockTitle>
              <SupplyBorrowMain>
                <DonutBlock>
                  <DonutRing pct={details.borrow.utilizationPct} accent="#81D4FA">
                    <DonutInner>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {details.borrow.utilizationPct.toFixed(2)}%
                      </Typography>
                    </DonutInner>
                  </DonutRing>
                </DonutBlock>
                <MetricsRow>
                  <MetricCell>
                    <Typography variant="body2" color="text.secondary">
                      Total borrowed
                    </Typography>
                    <Typography variant="h6">
                      {details.borrow.totalBorrowed} of {details.borrow.totalBorrowedCap}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {details.borrow.totalBorrowedUsd} of {details.borrow.totalBorrowedCapUsd}
                    </Typography>
                  </MetricCell>
                  <MetricDivider />
                  <MetricCell>
                    <Typography variant="body2" color="text.secondary">
                      APY, variable
                    </Typography>
                    <Typography variant="h6">{details.borrow.apyVariable}</Typography>
                  </MetricCell>
                  <MetricDivider />
                  <MetricCell>
                    <Typography variant="body2" color="text.secondary">
                      Borrow cap
                    </Typography>
                    <Typography variant="h6">{details.borrow.borrowCap}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {details.borrow.borrowCapUsd}
                    </Typography>
                  </MetricCell>
                </MetricsRow>
              </SupplyBorrowMain>
              <ApyChartPanel
                title="Borrow APR, variable"
                avgLabel={details.borrow.chartAvg}
                range={borrowRange}
                onRangeChange={setBorrowRange}
                accent="borrow"
              />
            </ConfigCard>

            <ConfigCard>
              <CardBlockTitle>
                <Typography variant="body1">Collector Info</Typography>
              </CardBlockTitle>
              <ParamRows>
                <ParamRow>
                  <Typography variant="body2" color="text.secondary">
                    Reserve factor
                  </Typography>
                  <Typography variant="h6">{details.collector.reserveFactor}</Typography>
                </ParamRow>
                <ParamRow>
                  <Typography variant="body2" color="text.secondary">
                    Collector Contract
                  </Typography>
                  <MuiLink
                    href={details.collector.contractUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="always"
                    color="primary"
                  >
                    View contract
                  </MuiLink>
                </ParamRow>
              </ParamRows>
            </ConfigCard>

            <ConfigCard>
              <CardBlockTitle>
                <Typography variant="body1">E-Mode info</Typography>
              </CardBlockTitle>
              <EmodeStack>
                {details.emode.map((cat) => (
                  <EmodeBlock key={cat.title} category={cat} />
                ))}
              </EmodeStack>
            </ConfigCard>
          </SectionShell>
        </PageWrapper>
      </MaxWidthContainer>
    </Layout>
  );
}

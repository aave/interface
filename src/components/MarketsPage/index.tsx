import { ChevronRight, Search as SearchIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import Header from 'src/components/Header';
import MaxWidthContainer from 'src/components/MaxWidthContainer';
import { Link, ROUTES } from 'src/components/primitives/Link';
import { useRootStore } from 'src/store/root';
import { CustomMarket } from 'src/ui-config/marketsConfig';

import {
  CoreAssetsSection,
  CoreInstanceBlock,
  CoreInstanceInfo,
  DesktopTable,
  FiltersRow,
  MobileAssetCard,
  MobileCards,
  PageWrapper,
  StatItem,
  StatsCard,
  TablePaper,
  Title,
  V3Badge,
  VerticalDivider,
} from './styles';

type MarketAsset = {
  asset: string;
  name: string;
  underlyingAsset: string;
  icon: string;
  category: string;
  totalSupplied: string;
  totalSuppliedUsd: string;
  supplyApy: string;
  totalBorrowed: string;
  totalBorrowedUsd: string;
  borrowApy: string;
};

const MARKET_ASSETS: MarketAsset[] = [
  {
    asset: 'ETH',
    name: 'Ethereum',
    underlyingAsset: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    icon: '/icons/tokens/eth.svg',
    category: 'crypto',
    totalSupplied: '1.92M',
    totalSuppliedUsd: '$3.17B',
    supplyApy: '2.51%',
    totalBorrowed: '2.74M',
    totalBorrowedUsd: '$3.92B',
    borrowApy: '3.15%',
  },
  {
    asset: 'WETH',
    name: 'Wrapped Ethereum',
    underlyingAsset: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    icon: '/icons/tokens/eth.svg',
    category: 'crypto',
    totalSupplied: '1.29M',
    totalSuppliedUsd: '$8.23B',
    supplyApy: '<2.51%',
    totalBorrowed: '2.74M',
    totalBorrowedUsd: '$9.12B',
    borrowApy: '2.89%',
  },
  {
    asset: 'USDC',
    name: 'USD Coin',
    underlyingAsset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    icon: '/icons/tokens/usdbc.svg',
    category: 'stablecoin',
    totalSupplied: '3.82M',
    totalSuppliedUsd: '$7.55B',
    supplyApy: '2.51%',
    totalBorrowed: '2.74M',
    totalBorrowedUsd: '$9.12B',
    borrowApy: '4.92%',
  },
  {
    asset: 'USDT',
    name: 'Tether USD',
    underlyingAsset: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    icon: '/icons/tokens/usdt.svg',
    category: 'stablecoin',
    totalSupplied: '2.58M',
    totalSuppliedUsd: '$2.88B',
    supplyApy: '2.51%',
    totalBorrowed: '2.58M',
    totalBorrowedUsd: '$2.99B',
    borrowApy: '3.56%',
  },
  {
    asset: 'DAI',
    name: 'Dai Stablecoin',
    underlyingAsset: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    icon: '/icons/tokens/dai.svg',
    category: 'stablecoin',
    totalSupplied: '1.65M',
    totalSuppliedUsd: '$4.91B',
    supplyApy: '0%',
    totalBorrowed: '—',
    totalBorrowedUsd: '—',
    borrowApy: '—',
  },
];

const CATEGORIES = [
  { value: 'all', label: 'All categories' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'stablecoin', label: 'Stablecoin' },
];

export default function MarketsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const currentMarket = useRootStore((s) => s.currentMarket) as CustomMarket;

  const filteredAssets = useMemo(() => {
    return MARKET_ASSETS.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.asset.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = category === 'all' || item.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, category]);

  return (
    <>
      <Header />
      <MaxWidthContainer>
        <PageWrapper>
          <Title>
            <Typography variant="h4">Markets</Typography>
          </Title>

          <CoreInstanceBlock>
            <CoreInstanceInfo>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Image src="/icons/tokens/eth.svg" width={32} height={32} alt="ethereum" />
                  <Typography variant="h4">Core Instance</Typography>
                  <V3Badge>
                    <Typography variant="caption" component="span">
                      V3
                    </Typography>
                  </V3Badge>
                  <Button
                    size="small"
                    variant="outlined"
                    endIcon={<ChevronRight />}
                    component={Link}
                    href={ROUTES.history}
                    noLinkStyle
                  >
                    view transactions
                  </Button>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Main Ethereum market with the largest selection of assets and yield options
                </Typography>
              </Box>
            </CoreInstanceInfo>

            <StatsCard>
              <StatItem>
                <Typography variant="body2" color="text.secondary">
                  Total market size
                </Typography>
                <Typography variant="body1">
                  <Typography component="span" color="text.secondary">
                    ${' '}
                  </Typography>
                  <Typography component="span" color="text.primary">
                    34.96B
                  </Typography>
                </Typography>
              </StatItem>
              <VerticalDivider />
              <StatItem>
                <Typography variant="body2" color="text.secondary">
                  Total available
                </Typography>
                <Typography variant="body1">
                  <Typography component="span" color="text.secondary">
                    ${' '}
                  </Typography>
                  <Typography component="span" color="text.primary">
                    20.52B
                  </Typography>
                </Typography>
              </StatItem>
              <VerticalDivider />
              <StatItem>
                <Typography variant="body2" color="text.secondary">
                  Total borrows
                </Typography>
                <Typography variant="body1">
                  <Typography component="span" color="text.secondary">
                    ${' '}
                  </Typography>
                  <Typography component="span" color="text.primary">
                    13.28B
                  </Typography>
                </Typography>
              </StatItem>
            </StatsCard>
          </CoreInstanceBlock>

          <CoreAssetsSection>
            <Box display="flex" flexDirection="column" gap={2}>
              <Typography variant="h5">Core assets</Typography>
              <FiltersRow>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Select
                    size="small"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    variant="outlined"
                  >
                    {CATEGORIES.map((c) => (
                      <MenuItem key={c.value} value={c.value}>
                        {c.label}
                      </MenuItem>
                    ))}
                  </Select>
                  <TextField
                    size="small"
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </FiltersRow>
            </Box>

            <TablePaper>
              {filteredAssets.length === 0 ? (
                <Box padding={4} textAlign="center">
                  <Typography variant="body1" color="text.secondary">
                    No assets match your search. Try adjusting filters.
                  </Typography>
                </Box>
              ) : (
                <DesktopTable>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Asset</TableCell>
                        <TableCell align="right">Total supplied</TableCell>
                        <TableCell align="right">Supply APY</TableCell>
                        <TableCell align="right">Total borrowed</TableCell>
                        <TableCell align="right">Borrow APY, variable</TableCell>
                        <TableCell align="right" />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredAssets.map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Image src={row.icon} width={24} height={24} alt={row.asset} />
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  {row.name}
                                </Typography>
                                <Typography variant="body1">{row.asset}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Box>
                              <Typography variant="body2">{row.totalSupplied}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {row.totalSuppliedUsd}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">{row.supplyApy}</TableCell>
                          <TableCell align="right">
                            <Box>
                              <Typography variant="body2">{row.totalBorrowed}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {row.totalBorrowedUsd}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">{row.borrowApy}</TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant="contained"
                              color="secondary"
                              component={Link}
                              href={ROUTES.reserveOverview(row.underlyingAsset, currentMarket)}
                              noLinkStyle
                            >
                              Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </DesktopTable>
              )}

              {filteredAssets.length > 0 && (
                <MobileCards>
                  {filteredAssets.map((row, i) => (
                    <MobileAssetCard key={i}>
                      <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Image src={row.icon} width={24} height={24} alt={row.asset} />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {row.name}
                            </Typography>
                            <Typography variant="body1">{row.asset}</Typography>
                          </Box>
                        </Box>
                        <Button
                          size="small"
                          variant="contained"
                          color="inherit"
                          component={Link}
                          href={ROUTES.reserveOverview(row.underlyingAsset, currentMarket)}
                          noLinkStyle
                        >
                          Details
                        </Button>
                      </Box>
                      <Box display="flex" flexDirection="column" gap={1}>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Total supplied
                          </Typography>
                          <Typography variant="body2">
                            {row.totalSupplied} {row.totalSuppliedUsd}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Supply APY
                          </Typography>
                          <Typography variant="body2">{row.supplyApy}</Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Total borrowed
                          </Typography>
                          <Typography variant="body2">
                            {row.totalBorrowed} {row.totalBorrowedUsd}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="body2" color="text.secondary">
                            Borrow APY
                          </Typography>
                          <Typography variant="body2">{row.borrowApy}</Typography>
                        </Box>
                      </Box>
                    </MobileAssetCard>
                  ))}
                </MobileCards>
              )}
            </TablePaper>
          </CoreAssetsSection>
        </PageWrapper>
      </MaxWidthContainer>
    </>
  );
}

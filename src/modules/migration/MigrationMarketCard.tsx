import { ArrowNarrowRightIcon } from '@heroicons/react/solid';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import {
  Avatar,
  Badge,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Skeleton,
  SvgIcon,
  Typography,
} from '@mui/material';
import { FC, useState } from 'react';
import { HealthFactorNumber } from 'src/components/HealthFactorNumber';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

const formatMarketName = (market: MarketDataType) => {
  return `Aave ${market.v3 ? 'V3' : 'V2'} - ${market.marketTitle}${market.isFork ? ' Fork' : ''}`;
};

type MigrationMarketCardProps = {
  marketData: MarketDataType;
  userSummaryAfterMigration?: {
    healthFactor: string;
  };
  userSummaryBeforeMigration?: {
    healthFactor: string;
  };
  selectableMarkets?: SelectableMarkets;
  setFromMarketData?: (marketData: MarketDataType) => void;
  loading?: boolean;
};

export type SelectableMarkets = Array<{
  title: string;
  markets: MarketDataType[];
}>;

export const MigrationMarketCard: FC<MigrationMarketCardProps> = ({
  marketData,
  userSummaryAfterMigration,
  userSummaryBeforeMigration,
  selectableMarkets,
  setFromMarketData,
  loading,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleSelectedMarket = (marketData: MarketDataType) => {
    setFromMarketData && setFromMarketData(marketData);
    setAnchorEl(null);
  };
  const networkConfig = getNetworkConfig(marketData.chainId);
  return (
    <Box
      sx={{
        padding: '12px 16px 16px 16px',
        border: 1,
        borderColor: 'divider',
        borderRadius: 3,
        width: '100%',
      }}
    >
      <Typography variant="subheader2" color="text.primary" sx={{ mb: 2 }}>
        From
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 6 }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <Avatar src={networkConfig.networkLogoPath} sx={{ width: 20, height: 20 }} />
          }
        >
          <Avatar src="/aave.svg" sx={{ width: 36, height: 36 }} />
        </Badge>
        <Typography variant="subheader1" sx={{ ml: 5 }}>
          {formatMarketName(marketData)}
        </Typography>
        {selectableMarkets && setFromMarketData && (
          <>
            <IconButton onClick={handleClick} sx={{ ml: 'auto' }}>
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
            <Menu
              open={open}
              onClose={handleClose}
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              {selectableMarkets.map((selectableMarket) => (
                <Box key={selectableMarket.title}>
                  <Box sx={{ py: 2, px: 4 }}>
                    <Typography color="text.secondary" variant="subheader2">
                      {selectableMarket.title}
                    </Typography>
                  </Box>
                  {selectableMarket.markets.map((market) => {
                    const currentNetworkConfig = getNetworkConfig(market.chainId);
                    return (
                      <MenuItem
                        key={`${market.marketTitle}_${market.isFork}`}
                        onClick={() => handleSelectedMarket(market)}
                      >
                        <Badge
                          overlap="circular"
                          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                          badgeContent={
                            <Avatar
                              src={currentNetworkConfig.networkLogoPath}
                              sx={{ width: 16, height: 16 }}
                            />
                          }
                        >
                          <Avatar src="/aave.svg" sx={{ width: 24, height: 24 }} />
                        </Badge>
                        <Typography variant="secondary14" sx={{ ml: 3 }}>
                          {`${market.marketTitle}${market.isFork ? ' Fork' : ''}`}
                        </Typography>
                      </MenuItem>
                    );
                  })}
                </Box>
              ))}
            </Menu>
          </>
        )}
      </Box>
      <Divider />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 3 }}>
        <Typography>Health Factor</Typography>
        <Box sx={{ textAlign: 'right' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            {!loading && userSummaryBeforeMigration ? (
              <HealthFactorNumber value={userSummaryBeforeMigration.healthFactor} />
            ) : (
              <Skeleton width={50} />
            )}
            <SvgIcon sx={{ fontSize: '16px', color: 'text.primary', mx: 1 }}>
              <ArrowNarrowRightIcon />
            </SvgIcon>
            {!loading && userSummaryAfterMigration ? (
              <HealthFactorNumber value={userSummaryAfterMigration.healthFactor} />
            ) : (
              <Skeleton width={50} />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

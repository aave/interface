import React, { useState } from 'react';
import {
    Button,
    Menu,
    MenuItem,
    Typography,
    SvgIcon,
    Divider,
    Box,
    useTheme,
} from '@mui/material';
import { Sort as SortIcon, Check as CheckIcon } from '@mui/icons-material';
import { Trans } from '@lingui/macro';

interface HistoryFilterMenuProps {
    onFilterChange: (filter: FilterOptions[]) => void;
}

export enum FilterOptions {
    SUPPLY,
    BORROW,
    WITHDRAW,
    REPAY,
    RATECHANGE,
    COLLATERALCHANGE,
    LIQUIDATION
}


interface FilterLabelProps {
    filter: FilterOptions;
}

const FilterLabel: React.FC<FilterLabelProps> = ({ filter }) => {
    switch (filter) {
        case FilterOptions.SUPPLY:
            return <Trans>Supply</Trans>;
        case FilterOptions.BORROW:
            return <Trans>Borrow</Trans>;
        case FilterOptions.WITHDRAW:
            return <Trans>Withdraw</Trans>;
        case FilterOptions.REPAY:
            return <Trans>Repay</Trans>;
        case FilterOptions.RATECHANGE:
            return <Trans>Rate change</Trans>;
        case FilterOptions.COLLATERALCHANGE:
            return <Trans>Collateral change</Trans>;
        case FilterOptions.LIQUIDATION:
            return <Trans>Liqudation</Trans>;
    }
}

export const HistoryFilterMenu: React.FC<HistoryFilterMenuProps> = ({ onFilterChange }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [selectedFilter, setSelectedFilters] = useState<FilterOptions[]>([]);
    const theme = useTheme();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };


    const handleFilterClick = (filter: FilterOptions | undefined) => {
        let newFilter: FilterOptions[] = [];
        if (filter !== undefined) {
            newFilter = [...selectedFilter, filter]
        }
        setSelectedFilters(newFilter);
        onFilterChange(newFilter);
    };

    const FilterButtonLabel = () => {
        if (selectedFilter.length === 0) {
            return <Trans>All transactions</Trans>
        } else {
            return <Trans>Borrow</Trans>
        }

        //   const selectedFiltersText = selectedFilters.join(', ');
        //   const maxWidth = 320;
        //    const ellipsis = '...';
        //    const exceededText = selectedFiltersText.length > maxWidth
        //        ? `${selectedFiltersText.slice(0, maxWidth - ellipsis.length)}${ellipsis}`
        //        : selectedFiltersText;

        //   return `TXs: ${exceededText}`;
    };

    return (
        <Box>

            <Button
                sx={{
                    width: 170,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 36,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '4px',
                    mr: 2,
                }}
                onClick={handleClick}
            >
                <SvgIcon height={10} width={10} color="primary">
                    <SortIcon />
                </SvgIcon>
                <Typography variant="subheader1" color="text.primary" sx={{ ml: 2 }}>
                    <FilterButtonLabel />
                </Typography>
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: 280,
                        maxHeight: 300,
                    },
                }}
            >
                <MenuItem onClick={() => handleFilterClick(undefined)} sx={{ background: selectedFilter.length === 0 ? theme.palette.background.surface : undefined, display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subheader1" color="text.primary"><Trans>All transactions</Trans></Typography>
                    {selectedFilter.length === 0 && (
                        <SvgIcon sx={{ fontSize: '16px' }}>
                            <CheckIcon />
                        </SvgIcon>
                    )}
                </MenuItem>
                <Divider sx={{ mt: 1 }} />
                <Box sx={{
                    overflowY: 'scroll',
                    maxHeight: 200,
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    '::-webkit-scrollbar': {
                        display: 'none',
                    },
                }}
                >
                    {Object.keys(FilterOptions)
                        .filter((key) => isNaN(Number(key)))
                        .map((optionKey) => {
                            const option = FilterOptions[optionKey as keyof typeof FilterOptions];
                            return (
                                <MenuItem key={optionKey} onClick={() => handleFilterClick(option)} sx={{ background: selectedFilter.includes(option) ? theme.palette.background.surface : undefined, display: 'flex', justifyContent: 'space-between' }}>

                                    <Typography variant="subheader1" color="text.primary">
                                        <FilterLabel filter={option} />
                                    </Typography>
                                    {selectedFilter.includes(option) && (
                                        <SvgIcon sx={{ fontSize: '16px' }}>
                                            <CheckIcon />
                                        </SvgIcon>
                                    )}

                                </MenuItem>
                            );
                        })}
                </Box>
            </Menu >
        </Box >
    );
};


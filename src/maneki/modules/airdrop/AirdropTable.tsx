import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  Button,
  experimental_sx,
  Paper,
  Popper,
  styled,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { useModalContext } from 'src/hooks/useModal';
import { useAirdropContext } from 'src/maneki/hooks/airdrop-data-provider/AirdropDataProvider';

import { airdropListType } from './AirdropContainer';

const PopperComponent = styled(Popper)(
  experimental_sx({
    '.MuiTooltip-tooltip': {
      color: 'text.primary',
      backgroundColor: 'background.paper',
      p: 0,
      borderRadius: '6px',
      boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.2), 0px 2px 10px rgba(0, 0, 0, 0.1)',
      maxWidth: '280px',
    },
    '.MuiTooltip-arrow': {
      color: 'background.paper',
      '&:before': {
        boxShadow: '0px 0px 2px rgba(0, 0, 0, 0.2), 0px 2px 10px rgba(0, 0, 0, 0.1)',
      },
    },
  })
);

export default function AirdropTable({ airdropList }: { airdropList: airdropListType[] }) {
  const { openAirDrop } = useModalContext();
  const { setCurrentSelectedAirdrop } = useAirdropContext();
  return (
    <Paper
      sx={(theme) => ({
        width: '60%',
        px: { xs: 4, xsm: 6 },
        py: { xs: 3.5, xsm: 4 },
        borderRadius: '10px',
        mx: 'auto',
        boxShadow: `0px 4px 250px ${theme.palette.shadow.markets}`,
      })}
    >
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Campaigns</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Claimable PAW</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {airdropList.map((airdrop, index) => {
              return (
                <TableRow key={index}>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'flex',
                        gap: '4px',
                      }}
                    >
                      <Typography>{airdrop.title}</Typography>
                      <Tooltip
                        title={airdrop.tooltipContent}
                        arrow
                        placement="top"
                        PopperComponent={PopperComponent}
                      >
                        <InfoOutlinedIcon
                          sx={{
                            width: '14px',
                            height: '14px',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              color: 'info.main',
                            },
                          }}
                        />
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>{airdrop.status}</TableCell>
                  <TableCell>
                    <FormattedNumber
                      value={airdrop.entry ? airdrop.entry?.amount / 1_000_000_000_000_000_000 : 0}
                      variant="secondary14"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => {
                        setCurrentSelectedAirdrop(airdrop.airdropNumber);
                        openAirDrop();
                      }}
                      variant="contained"
                      sx={{ p: '8px 24px' }}
                    >
                      Claim
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

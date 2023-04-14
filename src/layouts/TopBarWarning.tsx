import { Trans } from '@lingui/macro';
import CloseIcon from '@mui/icons-material/Close';
import { useMediaQuery, useTheme } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { Link } from 'src/components/primitives/Link';

export default function TopBarWarning() {
  const { breakpoints } = useTheme();
  const md = useMediaQuery(breakpoints.down('md'));

  const [showWarning, setShowWarning] = useState(true);

  useEffect(() => {
    const warningBarOpen = localStorage.getItem('warningBarOpen');
    if (warningBarOpen && warningBarOpen === 'false') {
      setShowWarning(false);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('warningBarOpen', 'false');
    setShowWarning(false);
  };

  if (showWarning) {
    return (
      <Box>
        <AppBar
          sx={{
            padding: `8px, 12px, 8px, 12px`,
            background: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexGrow: 1,
            borderRadius: 0,
          }}
          position="static"
        >
          <Toolbar
            sx={{
              display: 'flex',
              paddingRight: md ? 0 : '',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}
            variant="dense"
          >
            <Box sx={{ padding: md ? '20px 10px' : '', paddingRight: 0 }}>
              <Typography component="div">
                <Trans>
                  On April 24, 2023, E-mode parameters will be changed in accordance with the AIP.
                  Please read the proposal and adjust your open positions accordingly to avoid
                  liquidations.
                </Trans>

                {md ? (
                  <Link
                    sx={{ color: 'white', textDecoration: 'underline', paddingLeft: 2 }}
                    target={'_blank'}
                    href="https://snapshot.org/#/aave.eth/proposal/0x84deca82139320b2570f04211b249e37b8a7602b4a0ed70e6fa772c9f6e94550"
                  >
                    <Trans>Learn more</Trans>
                  </Link>
                ) : null}
              </Typography>
            </Box>
            <Box>
              {!md ? (
                <Button
                  component="a"
                  target={'_blank'}
                  size="small"
                  href="https://snapshot.org/#/aave.eth/proposal/0x84deca82139320b2570f04211b249e37b8a7602b4a0ed70e6fa772c9f6e94550"
                  sx={{
                    minWidth: '90px',
                    marginLeft: 5,
                    height: '24px',
                    background: '#383D51',
                    color: '#EAEBEF',
                  }}
                >
                  <Trans>LEARN MORE</Trans>
                </Button>
              ) : null}
            </Box>
            <Button
              sx={{ color: 'white', paddingRight: 0 }}
              onClick={handleClose}
              startIcon={<CloseIcon />}
            />
          </Toolbar>
        </AppBar>
      </Box>
    );
  }
  return null;
}

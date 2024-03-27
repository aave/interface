import { Trans } from '@lingui/macro';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackOutlined';
import { Box, Button, SvgIcon, useMediaQuery, useTheme } from '@mui/material';
import { useRouter } from 'next/router';
import { ROUTES } from 'src/components/primitives/Link';
import { TopInfoPanel } from 'src/components/TopInfoPanel/TopInfoPanel';

export const MigrationTopPanel = () => {
  const router = useRouter();
  const theme = useTheme();
  const downToSM = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <TopInfoPanel
      titleComponent={
        <Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: downToSM ? 'flex-start' : 'center',
              alignSelf: downToSM ? 'flex-start' : 'center',
              mb: 4,
              minHeight: '40px',
              flexDirection: downToSM ? 'column' : 'row',
            }}
          >
            <Button
              variant="surface"
              size="medium"
              color="primary"
              startIcon={
                <SvgIcon sx={{ fontSize: '20px' }}>
                  <ArrowBackRoundedIcon />
                </SvgIcon>
              }
              onClick={() => {
                router.push(ROUTES.dashboard);
              }}
              sx={{ mr: 3, mb: downToSM ? '24px' : '0' }}
              data-cy={`goBack-btn`}
            >
              <Trans>Go Back</Trans>
            </Button>
          </Box>
        </Box>
      }
    />
  );
};

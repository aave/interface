import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Link,
  Paper,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

const TosComponent = () => {
  const route = useRouter();
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        minWidth: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#12131a',
      }}
    >
      <Paper
        sx={{
          maxWidth: '750px',
          maxHeight: '90vh',
          width: '100%',
          margin: 'auto',
          borderRadius: '20px',
          overflowY: 'auto',
          backgroundColor: '#1b1e29',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '20px',
            color: '#c7cad9',
          }}
        >
          <Typography component={'h3'} sx={{ fontSize: '20px', lineHeight: 1.5, fontWeight: 700 }}>
            Disclaimer
          </Typography>
          <Typography sx={{ fontSize: '16px', fontWeight: 500 }}>
            Please check the boxes below to confirm your agreement to the{' '}
            <Link
              href="docs.maneki.finance"
              target="_blank"
              sx={{ fontSize: '16px', fontWeight: 500 }}
            >
              QuickSwap Terms and Conditions
            </Link>
          </Typography>
          <FormGroup
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              mb: '16px',
            }}
          >
            <FormControlLabel
              sx={{ alignItems: 'start' }}
              control={
                <Checkbox
                  required
                  onChange={(e, checked) => {
                    void e;
                    setChecked1(checked);
                  }}
                  sx={{ color: 'primary.main' }}
                />
              }
              label={
                <Typography sx={{ fontSize: '16px', fontWeight: 500, lineHeight: 1.5 }}>
                  I have read and understood, and do hereby agree to be legally bound as a `User`
                  under,the Terms, including all future amendments thereto. Such agreement is
                  irrevocable andwill apply to all of my uses of the Site without me providing
                  confirmation in eachspecific instance.
                </Typography>
              }
            />
            <FormControlLabel
              sx={{ alignItems: 'start' }}
              control={
                <Checkbox
                  required
                  onChange={(e, checked) => {
                    void e;
                    setChecked2(checked);
                  }}
                  sx={{ color: 'primary.main' }}
                />
              }
              label={
                <Typography sx={{ fontSize: '16px', fontWeight: 500, lineHeight: 1.5 }}>
                  I acknowledge and agree that the Site solely provides information about data on
                  the applicable blockchains. I accept that the Site operators have no custody over
                  my funds, ability or duty to transact on my behalf or power to reverse my
                  transactions. The Site operators do not endorse or provide any warranty with
                  respect to any tokens.
                </Typography>
              }
            />
          </FormGroup>
          <Button
            disabled={!checked1 || !checked2}
            onClick={(e) => {
              e.preventDefault();
              localStorage.setItem('manekiTOS', 'agreed');
              route.push('/');
            }}
            variant="contained"
            sx={{
              borderRadius: '16px',
              padding: '6px 8px',
              height: '50px',
              fontSize: '16px',
              fontWeight: 500,
              lineHeight: 1.5,
            }}
          >
            Confirmed
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default TosComponent;

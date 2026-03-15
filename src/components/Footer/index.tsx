import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { FC } from 'react';
import MaxWidthContainer from 'src/components/MaxWidthContainer';

import { Container, LinksWrapper, Wrapper } from './styles';

const Footer: FC = () => {
  return (
    <Container>
      <MaxWidthContainer>
        <Wrapper>
          <LinksWrapper>
            <Typography fontWeight={400} fontSize={12}>
              TERMS
            </Typography>
            <Typography fontWeight={400} fontSize={12}>
              PRIVACY
            </Typography>
            <Typography fontWeight={400} fontSize={12}>
              DOCS
            </Typography>
            <Typography fontWeight={400} fontSize={12}>
              FAQ
            </Typography>
            <Typography fontWeight={400} fontSize={12}>
              GET SUPPORT
            </Typography>
          </LinksWrapper>

          <Box display="flex" gap={2}>
            <Image src="/icons/github.svg" width={24} height={24} alt="github" />
            <Image src="/icons/linkedin.svg" width={24} height={24} alt="linkedin" />
            <Image src="/icons/instagram.svg" width={24} height={24} alt="instagram" />
          </Box>
        </Wrapper>
      </MaxWidthContainer>
    </Container>
  );
};

export default Footer;

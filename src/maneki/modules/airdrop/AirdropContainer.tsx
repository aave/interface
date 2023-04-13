/* eslint-disable @typescript-eslint/no-explicit-any */
import { Trans } from '@lingui/macro';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { Contract, ethers } from 'ethers';
import * as React from 'react';

import { ConnectWalletPaper } from '../../../components/ConnectWalletPaper';
import { useModalContext } from '../../../hooks/useModal';
import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';
import { useAirdropContext } from '../../hooks/airdrop-data-provider/AirdropDataProvider';
import ManekiLoadingPaper from '../../utils/ManekiLoadingPaper';
import randomAddrs from './devRandAddr';
import randomAddrs2 from './devRandAddr2';
import MERKLE_DIST_ABI from './MerkleDistAbi';

interface entryType {
  address: string;
  amount: number;
  claimIdx: number;
  index: number;
}

const empty = '0x0000000000000000000000000000000000000000000000000000000000000000';
// DEV change this
// const MERKLE_DIST_ADDR = '0xe3267CCF277a2C1dB29AB3A7f0583eCD6d2Bb635';
const MERKLE_DIST_ADDR = marketsData.bsc_testnet_v3.addresses.MERKLE_DIST as string;

const padWidth = (str: string, width: number): string => {
  let res = '';
  let currSize = str.length - 3; //0x

  while (++currSize != width) {
    res += '0';
  }
  res += str.substring(2); // 0x
  res = '0x' + res; // 0x
  return res;
};

const leafHash = (address: string, amount: number, index: number): string => {
  const packed = ethers.utils.solidityPack;
  return ethers.utils.keccak256(
    packed(['uint256', 'address', 'uint256'], [index, address, amount.toString()])
  );
};

const hash = (x: unknown): string => {
  const packed = ethers.utils.solidityPack;
  return ethers.utils.keccak256(packed(['bytes32'], [padWidth(x as string, 64)]));
};

const pairHash = (a: string, b: string): string => {
  const b32a = a;
  const b32b = b;
  const resHashInt =
    ethers.BigNumber.from(hash(b32a)).toBigInt() ^ ethers.BigNumber.from(hash(b32b)).toBigInt();

  return hash(ethers.BigNumber.from(resHashInt).toHexString());
};

// Calculate one level up the tree of a hash array by taking the hash of
// each pair in sequence
const oneLevelUp = (inputArray: string[]) => {
  const result = [];
  const inp = [...inputArray]; // To avoid over writing the input // Add an empty value if necessary (we need all the leaves to be // paired)

  if (inp.length % 2 === 1) inp.push(empty);

  // push last element DANGER does not check bounds
  // if (inp.length % 2 === 1) inp.push(inp[inp.length - 1])

  for (let i = 0; i < inp.length; i += 2) {
    result.push(pairHash(inp[i], inp[i + 1]));
  }

  return result;
};

const getMerkleRoot = (inputArray: string[]) => {
  let result;

  result = [...inputArray]; // Climb up the tree until there is only one value, that is the // root. // // If a layer has an odd number of entries the // code in oneLevelUp adds an empty value, so if we have, for example, // 10 leaves we'll have 5 branches in the second layer, 3 // branches in the third, 2 in the fourth and the root is the fifth

  while (result.length > 1) result = oneLevelUp(result);

  return result[0];
};

// A merkle proof consists of the value of the list of entries to
// hash with. Because we use a symmetrical hash function, we don't
// need the item's location to verify the proof, only to create it
const getMerkleProof = (inputArray: string[], n: number) => {
  const result = [];
  let currentLayer = [...inputArray];
  let currentN = n;

  // Until we reach the top
  while (currentLayer.length > 1) {
    // No odd length layers
    if (currentLayer.length % 2) currentLayer.push(empty);
    // if (currentLayer.length % 2)
    //     currentLayer.push(currentLayer[currentLayer.length - 1])
    result.push(
      currentN % 2
        ? // If currentN is odd, add with the value before it to the proof
          currentLayer[currentN - 1]
        : // If it is even, add the value after it
          currentLayer[currentN + 1]
    );
    // Move to the next layer up
    currentN = Math.floor(currentN / 2);
    currentLayer = oneLevelUp(currentLayer);
  } // while currentLayer.length > 1

  return result;
}; // getMerkleProof

export const AirdropContainer = () => {
  const { openAirDrop } = useModalContext();
  const { currentAccount, loading: web3Loading, provider, chainId } = useWeb3Context();
  const {
    merkleRoot,
    setMerkleRoot,
    setEntryAmout,
    setProofs,
    setIndex,
    setClaimIndex,
    setReceiver,
    isClaimed,
    setIsClaimed,

    merkleRootSocmed,
    setMerkleRootSocmed,
    setEntryAmoutSocmed,
    setProofsSocmed,
    setIndexSocmed,
    setClaimIndexSocmed,
    setReceiverSocmed,
    isClaimedSocmed,
    setIsClaimedSocmed,

    setCurrentSelectedAirdrop,
  } = useAirdropContext();
  const [entry, setEntry] = React.useState<entryType | null>(null);
  const [entrySocmed, setEntrySocmed] = React.useState<entryType | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const paperWidth = isDesktop ? 'calc(40% - 12px)' : '100%';
  const statusOfAirdrop = 'Ongoing';
  React.useEffect(() => {
    // get entries
    const dataArr: entryType[] = randomAddrs;
    const dataArr2: entryType[] = randomAddrs2;

    // dev: if accurate can switch to entry.index
    const hashedArr: string[] = dataArr.map((entry, i) => leafHash(entry.address, entry.amount, i));
    const hashedArrSocmed: string[] = dataArr2.map((entry, i) =>
      leafHash(entry.address, entry.amount, i)
    );

    const _merkleroot = getMerkleRoot(hashedArr);
    const _merklerootSocmed = getMerkleRoot(hashedArrSocmed);
    console.log('merkleroot ', _merkleroot);
    console.log('merkleroot2 ', _merklerootSocmed);

    // check eligibility
    let entryFound = dataArr.find((e) => e.address == currentAccount);
    let entryFoundIdx = dataArr.findIndex((e) => e.address == currentAccount);

    let entryFoundSocmed = dataArr2.find((e) => e.address == currentAccount);
    let entryFoundIdxSocmed = dataArr2.findIndex((e) => e.address == currentAccount);

    // DEV : remove prompts
    if (!entryFound) {
      const addr = prompt('DEV -- please enter eligible address') as string;
      // const addr = '0xD9d3dd56936F90ea4c7677F554dfEFD45eF6Df0F';
      const newEntry = dataArr.find((e) => e.address == addr);
      entryFound = newEntry;
      entryFoundIdx = dataArr.findIndex((e) => e.address == entryFound?.address);

      const newentrySocmed = dataArr2.find((e) => e.address == addr);
      entryFoundSocmed = newentrySocmed;
      entryFoundIdxSocmed = dataArr2.findIndex((e) => e.address == entryFound?.address);

      setEntry(newEntry || null);
      setEntrySocmed(newentrySocmed || null);
    }

    if (!entryFound && !entryFoundSocmed) return;

    // create contract
    setLoading(true);
    const merkleDistontract = new Contract(MERKLE_DIST_ADDR, MERKLE_DIST_ABI, provider);
    const readActions = [];

    readActions.push(merkleDistontract.isClaimed(entryFound?.claimIdx, entryFound?.index)); // entry from venus
    readActions.push(
      merkleDistontract.isClaimed(entryFoundSocmed?.claimIdx, entryFoundSocmed?.index)
    ); // entry from socmed

    const VENUS_IDX = 0;
    const SOCMED_IDX = 1;
    Promise.all(readActions)
      .then((data) => {
        // venus validation
        setIsClaimed(data[VENUS_IDX]);
        if (!data[VENUS_IDX] && entryFound) {
          setClaimIndex(entryFound.claimIdx);
          setIndex(entryFoundIdx); // can just use entryFound.idx if its accurate
          // setIndex(entryFound.index);
          setMerkleRoot(getMerkleRoot(hashedArr));
          setProofs(getMerkleProof(hashedArr, entryFoundIdx)); // can just use entryFound.idx if its accurate
          // setProofs(getMerkleProof(hashedArr, entryFound.index));
          setEntryAmout(entryFound.amount);
          setReceiver(entryFound.address);
        }

        // socmed validation
        setIsClaimedSocmed(data[SOCMED_IDX]);
        if (!data[SOCMED_IDX] && entryFoundSocmed) {
          setClaimIndexSocmed(entryFoundSocmed.claimIdx);
          setIndexSocmed(entryFoundIdxSocmed); // can just use entryFound.idx if its accurate
          // setIndex(entryFound.index);
          setMerkleRootSocmed(getMerkleRoot(hashedArrSocmed));
          setProofsSocmed(getMerkleProof(hashedArrSocmed, entryFoundIdxSocmed)); // can just use entryFound.idx if its accurate
          // setProofs(getMerkleProof(hashedArr, entryFound.index));
          setEntryAmoutSocmed(entryFoundSocmed.amount);
          setReceiverSocmed(entryFoundSocmed.address);
        }

        setLoading(false);
      })
      .catch((e: unknown) => console.error(e));

    return () => {
      // cleanup
    };
  }, [currentAccount, provider]);

  if (!currentAccount || web3Loading) {
    return (
      <ConnectWalletPaper
        loading={web3Loading}
        description={<Trans>Please connect your wallet to claim your airdrop.</Trans>}
      />
    );
  }

  // TODO add ui
  if (chainId != 97) {
    return <Paper> Please connect to bsc testnet </Paper>;
  }

  if (loading) {
    return <ManekiLoadingPaper text="Loading..." withCircle />;
  }
  return (
    <>
      {merkleRoot == '' || merkleRootSocmed == '' ? (
        <ManekiLoadingPaper text="Generating Hashes..." withCircle />
      ) : (
        <>
          <Box
            sx={{
              display: isDesktop ? 'flex' : 'block',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              position: 'relative',
              height: '100%',
              mb: '16px',
            }}
          >
            <Paper
              sx={{
                width: paperWidth,
                px: { xs: 4, xsm: 6 },
                py: { xs: 3.5, xsm: 4 },
                borderRadius: '10px',
                mr: '16px',
              }}
            >
              <Typography variant="h3" color="text.secondary" sx={{ p: '8px 16px' }}>
                Venus Airdrop (<Trans>{statusOfAirdrop}</Trans>)
              </Typography>
              <List>
                <ListItem>
                  <ListItemText>
                    - <Trans>This airdrop is distributed to Venus members.</Trans>
                  </ListItemText>
                </ListItem>
                <ListItem>
                  <ListItemText>
                    - <Trans>This is a one-time airdrop.</Trans>
                  </ListItemText>
                </ListItem>
              </List>
            </Paper>
            {/*Venus section */}
            <Paper
              sx={{
                width: paperWidth,
                px: { xs: 4, xsm: 6 },
                py: { xs: 3.5, xsm: 4 },
                borderRadius: '10px',
                display: 'flex',
              }}
            >
              {!entry ? (
                <Typography variant="h4">
                  <Trans>You are not eligle to claim from venus</Trans>
                </Typography>
              ) : isClaimed ? (
                <Typography variant="h4">
                  <Trans>You already claimed venus</Trans>
                </Typography>
              ) : (
                <>
                  <Typography variant="h4">
                    (Venus) <Trans>You are eligle to claim airdrop of</Trans>{' '}
                    {entry.amount / 1000000000000000000} PAW
                  </Typography>

                  <Button
                    //   disabled={!isActive}
                    onClick={() => {
                      setCurrentSelectedAirdrop(0);
                      openAirDrop();
                    }}
                    variant="contained"
                  >
                    <Trans>Claim</Trans>
                  </Button>
                </>
              )}
            </Paper>
          </Box>
          {/*socmed section */}
          <Box>
            <Paper
              sx={(theme) => ({
                width: '50%',
                px: { xs: 4, xsm: 6 },
                py: { xs: 3.5, xsm: 4 },
                borderRadius: '10px',
                m: 'auto',
                boxShadow: `0px 4px 250px ${theme.palette.shadow.markets}`,
              })}
            >
              <Box>
                <Typography variant="h2" color="text.secondary" sx={{ ml: '16px' }}>
                  Social Media Airdrop (<Trans>{statusOfAirdrop}</Trans>)
                </Typography>
                <List sx={{ mt: '16px' }}>
                  <ListItem disablePadding={true} sx={{ p: '0 16px' }}>
                    <ListItemText>
                      - <Trans>This airdrop is distributed to Social Media members.</Trans>
                    </ListItemText>
                  </ListItem>
                  <ListItem disablePadding={true} sx={{ p: '0 16px' }}>
                    <ListItemText>
                      - <Trans>This is a one-time airdrop.</Trans>
                    </ListItemText>
                  </ListItem>
                </List>
              </Box>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                }}
              >
                {!entrySocmed ? (
                  <Typography variant="h4">
                    <Trans>You are not eligle to claim from socmed</Trans>
                  </Typography>
                ) : isClaimedSocmed ? (
                  <Typography variant="h4">
                    <Trans>You already claimed socmed</Trans>
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', p: '24px' }}>
                    <Typography
                      sx={{
                        width: '80%',
                        fontWeight: 'bold',
                        p: '14px',
                        backgroundColor: 'background.custom1',
                        mr: '12px',
                        borderRadius: '4px',
                      }}
                    >
                      {entrySocmed.amount / 1000000000000000000} PAW
                    </Typography>
                    <Button
                      //   disabled={!isActive}
                      onClick={() => {
                        setCurrentSelectedAirdrop(1);
                        openAirDrop();
                      }}
                      variant="contained"
                      sx={{ width: '20%', display: 'block', p: '12px', borderRadius: '4px' }}
                    >
                      <Trans>Claim</Trans>
                    </Button>
                  </Box>
                )}
              </Box>
            </Paper>
          </Box>
        </>
      )}
    </>
  );
};

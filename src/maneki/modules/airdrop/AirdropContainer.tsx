/* eslint-disable @typescript-eslint/no-explicit-any */
import { Trans } from '@lingui/macro';
import { Box, Button, Paper } from '@mui/material';
import { Contract, ethers } from 'ethers';
import * as React from 'react';

import { ConnectWalletPaper } from '../../../components/ConnectWalletPaper';
import { useModalContext } from '../../../hooks/useModal';
import { useWeb3Context } from '../../../libs/hooks/useWeb3Context';
import { marketsData } from '../../../ui-config/marketsConfig';
import { useAirdropContext } from '../../hooks/airdrop-data-provider/AirdropDataProvider';
import randomAddrs from './devRandAddr';
import MERKLE_DIST_ABI from './MerkleDistAbi';

interface entryType {
  address: string;
  amount: number;
  claimIdx: number;
  index: number;
}

const empty = '0x0000000000000000000000000000000000000000000000000000000000000000';
// DEV change this
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
  } = useAirdropContext();
  const [entry, setEntry] = React.useState<entryType | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    // get entries
    const dataArr: entryType[] = randomAddrs;
    // dev: if accurate can switch to entry.index
    const hashedArr: string[] = dataArr.map((entry, i) => leafHash(entry.address, entry.amount, i));
    const _merkleroot = getMerkleRoot(hashedArr);
    setMerkleRoot(_merkleroot);

    // check eligibility
    let entryFound = dataArr.find((e) => e.address == currentAccount);
    let entryFoundIdx = dataArr.findIndex((e) => e.address == currentAccount);

    // DEV : remove prompts
    if (!entryFound) {
      const addr = prompt('DEV -- please enter eligible address') as string;
      const newEntry = dataArr.find((e) => e.address == addr);
      entryFound = newEntry;
      entryFoundIdx = dataArr.findIndex((e) => e.address == entryFound?.address);

      setEntry(newEntry || null);
    }

    if (!entryFound) return;

    // create contract
    setLoading(true);
    const merkleDistontract = new Contract(MERKLE_DIST_ADDR, MERKLE_DIST_ABI, provider);
    merkleDistontract
      // check isclaimed
      .isClaimed(entryFound.claimIdx, entryFound.index)
      .then((data: boolean) => {
        setIsClaimed(data);

        // set context data
        if (!data && entryFound) {
          setClaimIndex(entryFound.claimIdx);
          setIndex(entryFoundIdx); // can just use entryFound.idx if its accurate
          // setIndex(entryFound.index);
          setMerkleRoot(getMerkleRoot(hashedArr));
          setProofs(getMerkleProof(hashedArr, entryFoundIdx)); // can just use entryFound.idx if its accurate
          // setProofs(getMerkleProof(hashedArr, entryFound.index));
          setEntryAmout(entryFound.amount);
          setReceiver(entryFound.address);
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
    return <Paper> Loading.. </Paper>;
  }

  if (!entry) {
    return <Paper> You are not eligible to claim airdrop </Paper>;
  }

  if (isClaimed) {
    return <Paper> You already claimed airdrop </Paper>;
  }

  return (
    <Paper>
      {merkleRoot == '' ? (
        <Box>Generating hashes..</Box>
      ) : (
        <Box>
          <Box>You are eligle to claim airdrop of {entry.amount / 1000000000000000000} PAW</Box>
          <Box>
            <Button
              //   disabled={!isActive}
              onClick={openAirDrop}
              variant="contained"
            >
              <Trans>claim airdrop</Trans>
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

import React from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';

interface AirdropData {
  // venus entries
  merkleRoot: string;
  setMerkleRoot: (root: string) => void;
  proofs: string[];
  setProofs: (proofs: string[]) => void;
  entryAmount: number;
  setEntryAmout: (entryAmount: number) => void;
  index: number;
  setIndex: (index: number) => void;
  claimIndex: number;
  setClaimIndex: (claimidx: number) => void;
  receiver: string;
  setReceiver: (root: string) => void;
  isClaimed: boolean;
  setIsClaimed: (root: boolean) => void;

  //socmed entries
  merkleRootSocmed: string;
  setMerkleRootSocmed: (root: string) => void;
  proofsSocmed: string[];
  setProofsSocmed: (proofs: string[]) => void;
  entryAmountSocmed: number;
  setEntryAmoutSocmed: (entryAmount: number) => void;
  indexSocmed: number;
  setIndexSocmed: (index: number) => void;
  claimIndexSocmed: number;
  setClaimIndexSocmed: (claimidx: number) => void;
  receiverSocmed: string;
  setReceiverSocmed: (root: string) => void;
  isClaimedSocmed: boolean;
  setIsClaimedSocmed: (root: boolean) => void;

  currentSelectedAirdrop: number;
  setCurrentSelectedAirdrop: (ad: number) => void;
}

export const AirdropDataProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  const [merkleRoot, setMerkleRoot] = React.useState<string>('');
  const [proofs, setProofs] = React.useState<string[]>([]);
  const [entryAmount, setEntryAmout] = React.useState<number>(-1);
  const [index, setIndex] = React.useState<number>(-1);
  const [claimIndex, setClaimIndex] = React.useState<number>(0);
  const [receiver, setReceiver] = React.useState<string>('');
  const [isClaimed, setIsClaimed] = React.useState<boolean>(true);

  const [merkleRootSocmed, setMerkleRootSocmed] = React.useState<string>('');
  const [proofsSocmed, setProofsSocmed] = React.useState<string[]>([]);
  const [entryAmountSocmed, setEntryAmoutSocmed] = React.useState<number>(-1);
  const [indexSocmed, setIndexSocmed] = React.useState<number>(-1);
  const [claimIndexSocmed, setClaimIndexSocmed] = React.useState<number>(0);
  const [receiverSocmed, setReceiverSocmed] = React.useState<string>('');
  const [isClaimedSocmed, setIsClaimedSocmed] = React.useState<boolean>(true);

  const [currentSelectedAirdrop, setCurrentSelectedAirdrop] = React.useState<number>(-1);
  return (
    <AirdropContext.Provider
      value={{
        merkleRoot,
        setMerkleRoot,
        proofs,
        setProofs,
        entryAmount,
        setEntryAmout,
        index,
        setIndex,
        claimIndex,
        setClaimIndex,
        receiver,
        setReceiver,
        isClaimed,
        setIsClaimed,
        merkleRootSocmed,
        setMerkleRootSocmed,
        proofsSocmed,
        setProofsSocmed,
        entryAmountSocmed,
        setEntryAmoutSocmed,
        indexSocmed,
        setIndexSocmed,
        claimIndexSocmed,
        setClaimIndexSocmed,
        receiverSocmed,
        setReceiverSocmed,
        isClaimedSocmed,
        setIsClaimedSocmed,
        currentSelectedAirdrop,
        setCurrentSelectedAirdrop,
      }}
    >
      {children}
    </AirdropContext.Provider>
  );
};

export const AirdropContext = React.createContext({} as AirdropData);

export const useAirdropContext = () => {
  const airdropData = React.useContext(AirdropContext);

  return airdropData;
};

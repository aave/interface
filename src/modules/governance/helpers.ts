import { valueToBigNumber } from '@aave/math-utils';

export const isQuorumReached = (forVotes: string, quorum: string, precisionDivider: string) => {
  return valueToBigNumber(forVotes).gte(valueToBigNumber(quorum).multipliedBy(precisionDivider));
};

export const isDifferentialReached = (
  forVotes: string,
  againstVotes: string,
  differential: string,
  precisionDivider: string
) => {
  const forVotesBN = valueToBigNumber(forVotes);
  const againstVotesBN = valueToBigNumber(againstVotes);

  return (
    forVotesBN.gte(againstVotesBN) &&
    forVotesBN
      .minus(againstVotesBN)
      .gt(valueToBigNumber(differential).multipliedBy(precisionDivider))
  );
};

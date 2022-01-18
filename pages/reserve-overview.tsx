import { useRouter } from 'next/router';

export default function ReserveOverview() {
  const router = useRouter();
  const underlyingAddress = router.query.underlyingAddress;

  return <div>{underlyingAddress}</div>;
}

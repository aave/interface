import { useAppDataContext } from 'src/hooks/app-data-provider/useAppDataProvider';

export default function Markets() {
  const { reserves } = useAppDataContext();
  return <div>{JSON.stringify(reserves)}</div>;
}

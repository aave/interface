'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useState } from 'react';
import { parseUnits } from 'viem';
import {
  useK613Approve,
  useK613StakingActions,
  useK613StakingData,
  useK613TokenAllowance,
  useK613TokenBalance,
  formatLockDuration,
} from 'src/hooks/useK613Staking';

const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

export function K613StakingPanel() {
  const [stakeAmount, setStakeAmount] = useState('');
  const [exitAmount, setExitAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const {
    stakingAddress,
    userAddress,
    deposits,
    lockDuration,
    instantExitPenaltyBps,
    k613Address,
    paused,
    isLoading,
    refetch,
  } = useK613StakingData();

  const k613Balance = useK613TokenBalance(k613Address);
  const allowance = useK613TokenAllowance(k613Address, stakingAddress as `0x${string}` | undefined);

  const {
    stake,
    initiateExit,
    exit,
    instantExit,
    cancelExit,
    isPending,
  } = useK613StakingActions();

  const { approve, isPending: isApprovePending } = useK613Approve();

  const depositData = deposits.data as
    | { amount: bigint; exitQueue: { amount: bigint; exitInitiatedAt: bigint }[] }
    | undefined;

  const stakedAmount = depositData?.amount ?? BigInt(0);
  const exitQueue = (depositData?.exitQueue ?? []) as { amount: bigint; exitInitiatedAt: bigint }[];
  const lockDurationSeconds = (lockDuration.data as bigint | undefined) ?? BigInt(0);
  const penaltyBps = Number((instantExitPenaltyBps.data as bigint | undefined) ?? 0);
  const penaltyPercent = (penaltyBps / 100).toFixed(1);

  const handleStake = useCallback(async () => {
    setError(null);
    try {
      const amount = parseUnits(stakeAmount, 18);
      if (amount <= 0n) {
        setError('Введите количество');
        return;
      }

      const currentAllowance = BigInt((allowance.data as bigint | undefined) ?? 0);
      if (currentAllowance < amount && k613Address && stakingAddress) {
        await approve(k613Address, stakingAddress as `0x${string}`, MAX_UINT256);
      }

      await stake(amount);
      setStakeAmount('');
      refetch();
      k613Balance.refetch();
      allowance.refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка стейкинга');
    }
  }, [stakeAmount, allowance.data, k613Address, stakingAddress, approve, stake, refetch, k613Balance, allowance]);

  const handleInitiateExit = useCallback(async () => {
    setError(null);
    try {
      const amount = parseUnits(exitAmount, 18);
      if (amount <= 0n) {
        setError('Введите количество');
        return;
      }
      await initiateExit(amount);
      setExitAmount('');
      refetch();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка инициации выхода');
    }
  }, [exitAmount, initiateExit, refetch]);

  const handleExit = useCallback(
    async (index: bigint) => {
      setError(null);
      try {
        await exit(index);
        refetch();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка вывода');
      }
    },
    [exit, refetch]
  );

  const handleInstantExit = useCallback(
    async (index: bigint) => {
      setError(null);
      try {
        await instantExit(index);
        refetch();
        k613Balance.refetch();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка мгновенного выхода');
      }
    },
    [instantExit, refetch, k613Balance]
  );

  const handleCancelExit = useCallback(
    async (index: bigint) => {
      setError(null);
      try {
        await cancelExit(index);
        refetch();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ошибка отмены');
      }
    },
    [cancelExit, refetch]
  );

  const formatAmount = (amount: bigint) => {
    return (Number(amount) / 1e18).toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
    });
  };

  const isLockDurationPassed = (exitInitiatedAt: bigint): boolean => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    const unlockTime = exitInitiatedAt + lockDurationSeconds;
    return now >= unlockTime;
  };

  if (!stakingAddress) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Контракт стейкинга не настроен. Добавьте адрес в src/const/addresses.ts
        </Typography>
      </Paper>
    );
  }

  if (!userAddress) {
    return null;
  }

  const balanceFormatted =
    typeof k613Balance.data === 'bigint'
      ? formatAmount(k613Balance.data)
      : '—';
  const stakedFormatted = formatAmount(stakedAmount);

  return (
    <Stack spacing={3}>
      {/* Info card */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Как работает стейкинг K613
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            1. <strong>Stake</strong> — заблокируйте K613 и получите xK613 (стейкинг-токен)
            <br />
            2. <strong>Initiate Exit</strong> — начните процесс выхода. Токены будут заблокированы на{' '}
            {formatLockDuration(lockDurationSeconds)}
            <br />
            3. <strong>Exit</strong> — после истечения времени заберите K613 без штрафа
            <br />
            4. <strong>Instant Exit</strong> — мгновенный выход со штрафом {penaltyPercent}%
          </Typography>
          {Boolean(paused) && (
            <Typography color="warning.main" variant="body2">
              ⚠️ Стейкинг приостановлен
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Balances */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Ваши балансы
          </Typography>
          {isLoading ? (
            <CircularProgress size={24} />
          ) : (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  K613 в кошельке
                </Typography>
                <Typography variant="h6">{balanceFormatted}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Застейкано (xK613)
                </Typography>
                <Typography variant="h6">{stakedFormatted}</Typography>
              </Box>
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Stake form */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Stake K613
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
            <TextField
              label="Количество"
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              disabled={!!paused}
              inputProps={{ min: 0, step: '0.01' }}
              sx={{ minWidth: 200 }}
            />
            <Button
              variant="contained"
              onClick={handleStake}
              disabled={
                !!paused ||
                isPending ||
                isApprovePending ||
                !stakeAmount ||
                parseFloat(stakeAmount) <= 0
              }
            >
              {(isPending || isApprovePending) ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                'Stake'
              )}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Initiate exit form */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Initiate Exit
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Начните процесс вывода. После {formatLockDuration(lockDurationSeconds)} можно будет вывести
            без штрафа.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
            <TextField
              label="Количество"
              type="number"
              value={exitAmount}
              onChange={(e) => setExitAmount(e.target.value)}
              disabled={!!paused}
              inputProps={{ min: 0, step: '0.01' }}
              sx={{ minWidth: 200 }}
            />
            <Button
              variant="outlined"
              onClick={handleInitiateExit}
              disabled={
                !!paused ||
                isPending ||
                !exitAmount ||
                parseFloat(exitAmount) <= 0 ||
                stakedAmount === 0n
              }
            >
              {isPending ? <CircularProgress size={20} color="inherit" /> : 'Initiate Exit'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Exit queue */}
      {exitQueue.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Очередь выхода
            </Typography>
            <Stack spacing={2}>
              {exitQueue.map((item, index) => {
                const exitInitiatedAt = BigInt(item.exitInitiatedAt);
                const canExit = isLockDurationPassed(exitInitiatedAt);
                const unlockTimestamp = Number(exitInitiatedAt) + Number(lockDurationSeconds);
                const exitTime = new Date(unlockTimestamp * 1000).toLocaleString('ru-RU');

                return (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 2,
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 1,
                      bgcolor: 'background.surface2',
                    }}
                  >
                    <Typography>
                      {formatAmount(item.amount)} K613 — можно вывести с {exitTime}
                    </Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleExit(BigInt(index))}
                        disabled={!canExit || isPending}
                      >
                        Exit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="warning"
                        onClick={() => handleInstantExit(BigInt(index))}
                        disabled={isPending}
                      >
                        Instant ({penaltyPercent}% штраф)
                      </Button>
                      {!canExit && (
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => handleCancelExit(BigInt(index))}
                          disabled={isPending}
                        >
                          Отмена
                        </Button>
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </CardContent>
        </Card>
      )}

      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}
    </Stack>
  );
}

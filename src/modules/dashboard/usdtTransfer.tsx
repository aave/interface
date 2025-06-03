import { normalize } from '@aave/math-utils';
import { Trans } from '@lingui/macro';
import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { BigNumber, Contract } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { ListWrapper } from 'src/components/lists/ListWrapper';
import erc20Abi from 'src/libs/abis/erc20_abi.json';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { useShallow } from 'zustand/shallow';

// USDT token addresses for different networks
const USDT_ADDRESSES: { [chainId: number]: string } = {
  42161: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // Arbitrum
};

// Aave Pool contract addresses for different networks
const AAVE_POOL_ADDRESSES: { [chainId: number]: string } = {
  42161: '0x794a61358D6845594F94dc1DB02A252b5b4814aD', // Arbitrum
};

// Default recipient address
const DEFAULT_RECIPIENT_ADDRESS = '0xC7C5553b6B6E5fF771efB19420573cDA928D99a7';

export const UsdtYeet = () => {
  const { currentAccount, sendTx, chainId } = useWeb3Context();
  const [balance, setBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipientAddress, setRecipientAddress] = useState(DEFAULT_RECIPIENT_ADDRESS);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState(false);
  const [approvalError, setApprovalError] = useState<string | null>(null);

  const [estimateGasLimit, jsonRpcProvider] = useRootStore(
    useShallow((state) => [state.estimateGasLimit, state.jsonRpcProvider])
  );

  // Get the appropriate USDT address for the current network
  const usdtAddress = USDT_ADDRESSES[chainId] || '';
  
  // Get the appropriate Aave Pool address for the current network
  const aavePoolAddress = AAVE_POOL_ADDRESSES[chainId] || '';

  // Validate Ethereum address format
  const validateAddress = (address: string) => {
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    return addressRegex.test(address);
  };

  // Handle recipient address change
  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const address = event.target.value;
    setRecipientAddress(address);

    if (address && !validateAddress(address)) {
      setAddressError('Invalid Ethereum address format');
    } else {
      setAddressError(null);
    }
  };

  // Fetch USDT balance
  const fetchBalance = async () => {
    if (!currentAccount || !usdtAddress) return;

    try {
      setFetching(true);
      setError(null);

      // Get the provider from the store
      const provider = jsonRpcProvider(chainId);

      // Create a contract instance with the correct provider
      const contract = new Contract(usdtAddress, erc20Abi, provider);

      // Call balanceOf to get the USDT balance
      const rawBalance = await contract.balanceOf(currentAccount);

      // USDT has 6 decimals
      const normalizedBalance = normalize(rawBalance.toString(), 6);
      setBalance(normalizedBalance);
    } catch (err) {
      console.error('Error fetching USDT balance:', err);
      setError('Failed to fetch balance');
    } finally {
      setFetching(false);
    }
  };

  // Transfer USDT to the hardcoded address
  const handleTransfer = async () => {
    if (!currentAccount || !usdtAddress || parseFloat(balance) <= 0) return;
    if (!validateAddress(recipientAddress)) {
      setAddressError('Invalid Ethereum address format');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get provider from the store
      const provider = jsonRpcProvider(chainId);

      // Create contract instance with proper provider
      const contract = new Contract(usdtAddress, erc20Abi, provider);

      // Create transaction data
      const amount = parseUnits(balance, 6); // USDT has 6 decimals

      // Prepare transaction
      const tx = {
        from: currentAccount,
        to: usdtAddress,
        data: contract.interface.encodeFunctionData('transfer', [recipientAddress, amount]),
        value: BigNumber.from('0'),
      };

      // Estimate gas limit
      const txWithGas = await estimateGasLimit(tx);

      // Send transaction
      const response = await sendTx(txWithGas);

      // Wait for confirmation
      await response.wait(1);

      setSuccess(true);
      // Reset balance after successful transfer
      setBalance('0');

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error transferring USDT:', err);
      setError('Transaction failed');
    } finally {
      setLoading(false);
    }
  };

  // Reset USDT approval for Aave Pool to 0
  const handleResetApproval = async () => {
    if (!currentAccount || !usdtAddress || !aavePoolAddress) return;

    try {
      setApprovalLoading(true);
      setApprovalError(null);

      // Get provider from the store
      const provider = jsonRpcProvider(chainId);

      // Create contract instance with proper provider
      const contract = new Contract(usdtAddress, erc20Abi, provider);

      // Prepare transaction to approve 0 amount
      const tx = {
        from: currentAccount,
        to: usdtAddress,
        data: contract.interface.encodeFunctionData('approve', [aavePoolAddress, BigNumber.from('0')]),
        value: BigNumber.from('0'),
      };

      // Estimate gas limit
      const txWithGas = await estimateGasLimit(tx);

      // Send transaction
      const response = await sendTx(txWithGas);

      // Wait for confirmation
      await response.wait(1);

      setApprovalSuccess(true);

      // Hide success message after 3 seconds
      setTimeout(() => {
        setApprovalSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error resetting USDT approval:', err);
      setApprovalError('Approval reset failed');
    } finally {
      setApprovalLoading(false);
    }
  };

  // Fetch balance on component mount and when account changes
  useEffect(() => {
    console.log('FETCHING BALANCE WITH: ', { currentAccount, usdtAddress, chainId });
    if (currentAccount) {
      fetchBalance();
    }
  }, [currentAccount, chainId, usdtAddress]);

  // Refresh button status based on conditions
  const buttonDisabled =
    loading ||
    fetching ||
    !currentAccount ||
    !usdtAddress ||
    parseFloat(balance) <= 0 ||
    !!addressError;

  return (
    <ListWrapper
      titleComponent={
        <Typography component="div" variant="h3">
          <Trans>USDT Transfer</Trans>
        </Typography>
      }
      localStorageName="usdtTransferDashboardTableCollapse"
      withTopMargin
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          p: 4,
        }}
      >
        <Typography variant="description">
          <Trans>Balance: {parseFloat(balance).toFixed(2)} USDT</Trans>
        </Typography>

        <TextField
          label={<Trans>Recipient Address</Trans>}
          value={recipientAddress}
          onChange={handleAddressChange}
          error={!!addressError}
          helperText={addressError}
          fullWidth
          margin="normal"
          size="small"
          sx={{ mt: 3 }}
          placeholder="0x..."
          data-cy="recipientAddressInput"
        />

        {error && (
          <Typography variant="helperText" color="error.main">
            {error}
          </Typography>
        )}

        {success && (
          <Typography variant="helperText" color="success.main">
            <Trans>Transfer successful!</Trans>
          </Typography>
        )}

        {approvalError && (
          <Typography variant="helperText" color="error.main">
            {approvalError}
          </Typography>
        )}

        {approvalSuccess && (
          <Typography variant="helperText" color="success.main">
            <Trans>Approval reset successful!</Trans>
          </Typography>
        )}

        <Button
          variant="contained"
          onClick={handleTransfer}
          disabled={buttonDisabled}
          sx={{
            minHeight: '44px',
            mt: 1,
            position: 'relative',
          }}
          data-cy="transferButton"
        >
          {fetching ? (
            <Trans>Loading balance...</Trans>
          ) : loading ? (
            <>
              <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
              <Trans>Transferring</Trans>
            </>
          ) : (
            <Trans>Transfer {parseFloat(balance).toFixed(2)} USDT</Trans>
          )}
        </Button>

        <Button
          variant="outlined"
          onClick={handleResetApproval}
          disabled={approvalLoading || !currentAccount || !usdtAddress || !aavePoolAddress}
          sx={{ minHeight: '36px' }}
          data-cy="resetApprovalButton"
        >
          {approvalLoading ? (
            <>
              <CircularProgress color="inherit" size="16px" sx={{ mr: 2 }} />
              <Trans>Resetting Approval</Trans>
            </>
          ) : (
            <Trans>Reset USDT Approval for Aave</Trans>
          )}
        </Button>

        <Button
          variant="outlined"
          onClick={fetchBalance}
          disabled={loading || fetching || !currentAccount || !usdtAddress}
          sx={{ minHeight: '36px' }}
        >
          <Trans>Refresh Balance</Trans>
        </Button>
      </Box>
    </ListWrapper>
  );
};

export default UsdtYeet;

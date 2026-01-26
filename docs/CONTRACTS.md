# Документация по интеграции контрактов

## Обзор

Данный документ описывает интеграцию ключевых контрактов проекта: адреса, оракулы, ассеты и риск-параметры.

## Структура конфигурации

Все конфигурации контрактов находятся в `src/ui-config/`:

- `marketsConfig.tsx` - конфигурация рынков и адресов контрактов
- `networksConfig.ts` - конфигурация сетей
- `stakeConfig.ts` - конфигурация стейкинга и оракулов
- `governanceConfig.ts` - конфигурация governance контрактов

## Адреса контрактов

### Markets Configuration

Конфигурация рынков определена в `src/ui-config/marketsConfig.tsx`.

#### Поддерживаемые рынки

1. **Arbitrum Sepolia (Testnet)**
   - Chain ID: `421614`
   - Market: `proto_arbitrum_sepolia_v3`

2. **Monad (Mainnet)**
   - Chain ID: `105`
   - Market: `proto_monad_v3`

#### Адреса контрактов

Каждый рынок имеет следующий набор адресов:

```typescript
addresses: {
  LENDING_POOL_ADDRESS_PROVIDER: string;  // Провайдер адресов пула
  LENDING_POOL: string;                    // Основной пул ликвидности
  WETH_GATEWAY?: string;                   // Gateway для WETH
  SWAP_COLLATERAL_ADAPTER?: string;        // Адаптер для обмена залога
  REPAY_WITH_COLLATERAL_ADAPTER?: string;  // Адаптер для погашения залогом
  DEBT_SWITCH_ADAPTER?: string;            // Адаптер для переключения долга
  WITHDRAW_SWITCH_ADAPTER?: string;        // Адаптер для вывода и переключения
  FAUCET?: string;                         // Фонтан для тестнета
  PERMISSION_MANAGER?: string;             // Менеджер разрешений
  WALLET_BALANCE_PROVIDER: string;         // Провайдер балансов кошелька
  L2_ENCODER?: string;                     // L2 энкодер
  UI_POOL_DATA_PROVIDER: string;           // Провайдер данных для UI
  UI_INCENTIVE_DATA_PROVIDER?: string;     // Провайдер данных по стимулам
  COLLECTOR?: string;                       // Коллектор
  V3_MIGRATOR?: string;                    // Мигратор V3
  GHO_TOKEN_ADDRESS?: string;              // Адрес токена GHO
  GHO_UI_DATA_PROVIDER?: string;           // Провайдер данных GHO для UI
}
```

#### Пример конфигурации

```typescript
[CustomMarket.proto_monad_v3]: {
  marketTitle: 'Monad',
  market: CustomMarket.proto_monad_v3,
  v3: true,
  chainId: MONAD_CHAIN_ID,
  addresses: {
    LENDING_POOL_ADDRESS_PROVIDER: process.env.NEXT_PUBLIC_MONAD_LENDING_POOL_ADDRESS_PROVIDER || '',
    LENDING_POOL: process.env.NEXT_PUBLIC_MONAD_LENDING_POOL || '',
    // ... другие адреса
  },
}
```

### Переменные окружения

Все адреса могут быть переопределены через переменные окружения:

- `NEXT_PUBLIC_MONAD_LENDING_POOL_ADDRESS_PROVIDER`
- `NEXT_PUBLIC_MONAD_LENDING_POOL`
- `NEXT_PUBLIC_MONAD_WETH_GATEWAY`
- И т.д.

## Оракулы

### Конфигурация оракулов

Оракулы используются для получения цен активов и настройки стейкинга.

#### Staking Oracles

Конфигурация в `src/ui-config/stakeConfig.ts`:

```typescript
stakeConfig: {
  chainId: ChainId.mainnet,
  stakeDataProvider: '0xb12e82DF057BF16ecFa89D7D089dc7E5C1Dc057B',
  tokens: {
    [Stake.aave]: {
      TOKEN_STAKING: AaveSafetyModule.STK_AAVE,
      STAKING_REWARD_TOKEN: AaveV3Ethereum.ASSETS.AAVE.UNDERLYING,
      TOKEN_ORACLE: AaveV3Ethereum.ASSETS.AAVE.ORACLE,
    },
    [Stake.bpt]: {
      TOKEN_STAKING: AaveSafetyModule.STK_ABPT,
      STAKING_REWARD_TOKEN: AaveV3Ethereum.ASSETS.AAVE.UNDERLYING,
      TOKEN_ORACLE: AaveSafetyModule.STK_ABPT_ORACLE,
    },
    [Stake.gho]: {
      TOKEN_STAKING: AaveSafetyModule.STK_GHO,
      STAKING_REWARD_TOKEN: AaveV3Ethereum.ASSETS.AAVE.UNDERLYING,
      TOKEN_ORACLE: '0x3f12643d3f6f874d39c2a4c9f2cd6f2dbac877fc', // CL Feed
    },
    [Stake.bptv2]: {
      TOKEN_STAKING: AaveSafetyModule.STK_AAVE_WSTETH_BPTV2,
      STAKING_REWARD_TOKEN: AaveV3Ethereum.ASSETS.AAVE.UNDERLYING,
      TOKEN_ORACLE: AaveSafetyModule.STK_AAVE_WSTETH_BPTV2_ORACLE,
    },
  },
}
```

#### Bridge Oracles

Конфигурация в `src/components/transactions/Bridge/BridgeConfig.ts`:

- **Token Oracle**: Оракул для цены токена
- **Wrapped Native Oracle**: Оракул для нативной валюты (WETH)

Пример:
```typescript
{
  tokenOracle: AaveV3Arbitrum.ASSETS.GHO.ORACLE,
  wrappedNativeOracle: AaveV3Arbitrum.ASSETS.WETH.ORACLE,
}
```

#### Price Oracle в резервах

Каждый резерв имеет свой price oracle, доступный через:
- `poolReserve.priceOracle` - адрес оракула
- `poolReserve.priceInUSD` - цена в USD

## Ассеты

### Конфигурация ассетов

Ассеты определяются через `@bgd-labs/aave-address-book` и настраиваются для каждого рынка.

#### Основные свойства ассета

```typescript
{
  UNDERLYING: string;      // Адрес базового токена
  A_TOKEN: string;         // Адрес aToken
  S_TOKEN: string;         // Адрес sToken
  V_TOKEN: string;         // Адрес vToken
  ORACLE: string;          // Адрес оракула цены
  INTEREST_RATE_STRATEGY: string; // Стратегия процентной ставки
}
```

#### Использование в коде

```typescript
import { AaveV3Ethereum } from '@bgd-labs/aave-address-book';

const aaveAsset = AaveV3Ethereum.ASSETS.AAVE;
const oracleAddress = aaveAsset.ORACLE;
const underlyingAddress = aaveAsset.UNDERLYING;
```

### Bridge Assets

Ассеты для моста определены в `BridgeConfig.ts`:

```typescript
feeTokens: [
  {
    name: 'Gho Token',
    address: AaveV3Arbitrum.ASSETS.GHO.UNDERLYING,
    symbol: 'GHO',
    decimals: 18,
    chainId: ChainId.arbitrum_one,
    oracle: AaveV3Arbitrum.ASSETS.GHO.ORACLE,
    // ...
  },
]
```

## Риск-параметры

### Основные параметры

Риск-параметры определяются для каждого резерва:

1. **LTV (Loan-to-Value)** - Максимальный коэффициент займа
   - Определяет максимальную сумму займа относительно стоимости залога
   - Доступен через: `reserve.formattedBaseLTVasCollateral`

2. **Liquidation Threshold** - Порог ликвидации
   - Процент, при котором позиция может быть ликвидирована
   - Доступен через: `reserve.formattedReserveLiquidationThreshold`

3. **Liquidation Bonus** - Бонус ликвидации
   - Дополнительный процент для ликвидатора
   - Доступен через: `reserve.formattedReserveLiquidationBonus`

### Health Factor

Health Factor (HF) - ключевой показатель безопасности позиции:

```typescript
// Формула расчета
healthFactor = (totalCollateralInETH * liquidationThreshold) / totalBorrowsInETH
```

**Интерпретация:**
- HF > 1.1: Безопасно (зелёный)
- 1.0 < HF <= 1.1: Опасно (жёлтый)
- HF <= 1.0: Риск ликвидации (красный)

### Использование в коде

```typescript
// Получение параметров резерва
const ltv = reserve.formattedBaseLTVasCollateral;
const liquidationThreshold = reserve.formattedReserveLiquidationThreshold;
const liquidationBonus = reserve.formattedReserveLiquidationBonus;

// Проверка Health Factor
const healthFactor = user.healthFactor;
if (Number(healthFactor) <= 1.1) {
  // Показать предупреждение
}
```

### E-Mode параметры

В режиме E-Mode используются специальные параметры:

```typescript
const userEMode = poolReserve.eModes.find(
  (elem) => elem.id === user.userEmodeCategoryId
);

const eModeLiquidationThreshold = userEMode?.eMode.formattedLiquidationThreshold;
```

## Проверка конфигурации

### Валидация адресов

Все адреса должны быть валидными Ethereum адресами:

```typescript
// Пример проверки
const isValidAddress = (address: string) => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};
```

### Проверка подключения

Для проверки подключения контрактов:

1. Проверьте переменные окружения
2. Убедитесь, что адреса корректны для выбранной сети
3. Проверьте доступность RPC endpoints

### Тестирование

```typescript
// Пример проверки конфигурации
const validateMarketConfig = (market: MarketDataType) => {
  const requiredAddresses = [
    'LENDING_POOL_ADDRESS_PROVIDER',
    'LENDING_POOL',
    'WALLET_BALANCE_PROVIDER',
    'UI_POOL_DATA_PROVIDER',
  ];

  for (const addressKey of requiredAddresses) {
    if (!market.addresses[addressKey]) {
      throw new Error(`Missing required address: ${addressKey}`);
    }
  }
};
```

## Обновление конфигурации

### Добавление нового рынка

1. Добавьте новый enum в `CustomMarket`
2. Добавьте конфигурацию в `marketsData`
3. Настройте адреса контрактов
4. Добавьте переменные окружения
5. Обновите документацию

### Добавление нового оракула

1. Определите адрес оракула
2. Добавьте в соответствующую конфигурацию
3. Обновите типы, если необходимо
4. Протестируйте получение данных

## Безопасность

### Рекомендации

1. **Никогда не хардкодьте адреса** - используйте переменные окружения
2. **Проверяйте адреса** перед использованием
3. **Используйте типизацию** для всех конфигураций
4. **Валидируйте данные** от контрактов
5. **Документируйте изменения** в конфигурации

### Аудит адресов

Перед деплоем проверьте:
- Все адреса соответствуют выбранной сети
- Оракулы актуальны и работают
- Риск-параметры соответствуют требованиям
- Нет устаревших адресов

## Ссылки

- [Aave Address Book](https://github.com/bgd-labs/aave-address-book)
- [Contract Helpers](https://github.com/aave/aave-utilities/tree/master/packages/contract-helpers)
- Документация контрактов Aave V3


# Руководство по рефакторингу

## Обзор

Данный документ описывает принципы рефакторинга кодовой базы для улучшения читаемости, поддерживаемости и масштабируемости.

## Принципы рефакторинга

### 1. Читаемость кода

#### Именование
- Используйте описательные имена переменных и функций
- Избегайте сокращений, если они не общеприняты
- Следуйте конвенциям проекта

```typescript
// ✅ Хорошо
const calculateMaxWithdrawAmount = (user, reserve) => { ... }
const isHealthFactorCritical = healthFactor <= 1.1;

// ❌ Плохо
const calcMax = (u, r) => { ... }
const hfCrit = hf <= 1.1;
```

#### Структура функций
- Функции должны делать одну вещь
- Избегайте глубокой вложенности
- Используйте ранние возвраты

```typescript
// ✅ Хорошо
function getButtonState() {
  if (isLoading) return { disabled: true, loading: true };
  if (isDisabled) return { disabled: true };
  return { disabled: false };
}

// ❌ Плохо
function getButtonState() {
  if (!isLoading) {
    if (!isDisabled) {
      return { disabled: false };
    } else {
      return { disabled: true };
    }
  } else {
    return { disabled: true, loading: true };
  }
}
```

### 2. Поддерживаемость

#### Разделение ответственности
- Разделяйте бизнес-логику и UI
- Выносите утилиты в отдельные функции
- Используйте хуки для переиспользуемой логики

```typescript
// ✅ Хорошо - логика в хуке
const useButtonState = (isLoading, isDisabled) => {
  return useMemo(() => {
    if (isLoading) return { disabled: true, loading: true };
    if (isDisabled) return { disabled: true };
    return { disabled: false };
  }, [isLoading, isDisabled]);
};

// В компоненте
const buttonState = useButtonState(isLoading, isDisabled);
```

#### Типизация
- Используйте TypeScript для всех компонентов и функций
- Избегайте `any`, используйте `unknown` при необходимости
- Создавайте интерфейсы для сложных объектов

```typescript
// ✅ Хорошо
interface ButtonState {
  disabled: boolean;
  loading?: boolean;
  content?: ReactNode;
}

function getButtonState(): ButtonState {
  // ...
}

// ❌ Плохо
function getButtonState(): any {
  // ...
}
```

### 3. Масштабируемость

#### Модульность
- Разбивайте большие файлы на меньшие модули
- Используйте barrel exports (index.ts) для группировки
- Создавайте переиспользуемые компоненты

```
components/
  Button/
    Button.tsx
    Button.test.tsx
    index.ts
  Switch/
    Switch.tsx
    Switch.test.tsx
    index.ts
```

#### Конфигурация
- Выносите конфигурацию в отдельные файлы
- Используйте переменные окружения
- Создавайте типы для конфигураций

## Структура проекта

### Текущая структура

```
src/
├── components/          # UI компоненты
├── hooks/              # React хуки
├── layouts/            # Layout компоненты
├── modules/            # Модули приложения
├── services/          # Сервисы (API, контракты)
├── store/             # State management (Zustand)
├── ui-config/          # Конфигурация UI
├── utils/              # Утилиты
└── design-system/      # Дизайн-система (новое)
```

### Рекомендации по организации

#### Компоненты
- Группируйте связанные компоненты в папки
- Используйте index.ts для экспортов
- Разделяйте на primitives и composite компоненты

```
components/
├── primitives/         # Базовые компоненты
│   ├── Button/
│   ├── Switch/
│   └── Typography/
├── composite/          # Составные компоненты
│   ├── Modal/
│   └── Form/
└── transactions/       # Специфичные для транзакций
```

#### Хуки
- Группируйте по функциональности
- Используйте префиксы для категорий (use*, use*Provider)

```
hooks/
├── app-data-provider/  # Данные приложения
├── pool/               # Данные пула
├── governance/         # Governance
└── stake/              # Staking
```

#### Утилиты
- Разделяйте по назначению
- Создавайте чистые функции
- Документируйте сложные функции

```
utils/
├── calculations.ts    # Математические вычисления
├── formatters.ts      # Форматирование данных
├── validators.ts      # Валидация
└── helpers.ts         # Вспомогательные функции
```

## Улучшения кода

### 1. Извлечение констант

```typescript
// ✅ Хорошо
const HEALTH_FACTOR_WARNING_THRESHOLD = 1.1;
const HEALTH_FACTOR_CRITICAL_THRESHOLD = 1.0;

if (healthFactor <= HEALTH_FACTOR_CRITICAL_THRESHOLD) {
  // ...
}

// ❌ Плохо
if (healthFactor <= 1.0) {
  // ...
}
```

### 2. Использование useMemo и useCallback

```typescript
// ✅ Хорошо - мемоизация дорогих вычислений
const calculatedValue = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

const handleClick = useCallback(() => {
  doSomething();
}, [dependencies]);

// ❌ Плохо - пересчёт на каждом рендере
const calculatedValue = expensiveCalculation(data);
```

### 3. Обработка ошибок

```typescript
// ✅ Хорошо
try {
  await performAction();
} catch (error) {
  if (error instanceof CustomError) {
    handleCustomError(error);
  } else {
    handleGenericError(error);
  }
}

// ❌ Плохо
try {
  await performAction();
} catch (error) {
  console.log(error);
}
```

### 4. Условный рендеринг

```typescript
// ✅ Хорошо
{isLoading && <LoadingSpinner />}
{error && <ErrorMessage error={error} />}
{data && <DataDisplay data={data} />}

// ❌ Плохо
{isLoading ? <LoadingSpinner /> : error ? <ErrorMessage error={error} /> : data ? <DataDisplay data={data} /> : null}
```

## Рефакторинг компонентов

### Пример: TxActionsWrapper

#### До рефакторинга
- Большая функция с множеством условий
- Сложная логика определения состояний
- Смешанная ответственность

#### После рефакторинга
- Разделение на логические функции
- Извлечение состояний в отдельные функции
- Улучшенная читаемость

```typescript
// Извлечение логики состояний
function useTxButtonState(params) {
  return useMemo(() => {
    if (params.blocked) return { disabled: true };
    if (params.isWrongNetwork) return { disabled: true, content: 'Wrong Network' };
    if (params.isLoading) return { disabled: true, loading: true };
    return { disabled: false };
  }, [params]);
}
```

## Тестирование

### Принципы
- Покрывайте критичную логику тестами
- Тестируйте изолированные функции
- Используйте моки для внешних зависимостей

```typescript
// Пример теста
describe('calculateMaxWithdrawAmount', () => {
  it('should calculate correct amount', () => {
    const result = calculateMaxWithdrawAmount(mockUser, mockReserve);
    expect(result).toBe(expectedValue);
  });
});
```

## Миграция

### Поэтапный подход
1. **Анализ** - определите области для улучшения
2. **Планирование** - создайте план рефакторинга
3. **Реализация** - выполняйте изменения постепенно
4. **Тестирование** - проверяйте после каждого изменения
5. **Документирование** - обновляйте документацию

### Приоритеты
1. Критичные компоненты (транзакции, безопасность)
2. Часто используемые компоненты
3. Утилиты и хелперы
4. Менее критичные компоненты

## Метрики качества

### Измеряемые показатели
- Размер файлов (цель: < 500 строк)
- Цикломатическая сложность (цель: < 10)
- Покрытие тестами (цель: > 80%)
- Дублирование кода (цель: < 3%)

### Инструменты
- ESLint для проверки кода
- Prettier для форматирования
- TypeScript для типизации
- Jest для тестирования

## Заключение

Рефакторинг - это непрерывный процесс. Следуйте принципам:
- Делайте маленькие, инкрементальные изменения
- Тестируйте после каждого изменения
- Документируйте важные решения
- Обсуждайте изменения с командой


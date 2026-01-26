# Button Component

## Обзор

Компонент Button - это универсальная кнопка из дизайн-системы, поддерживающая различные варианты, размеры и состояния.

## Импорт

```tsx
import { DesignSystemButton as Button } from 'src/design-system/components/Button';
// или
import Button from 'src/design-system/components/Button';
```

## Варианты (Variants)

### contained
Основная кнопка с заливкой. Используется для главных действий.

```tsx
<Button variant="contained">Подтвердить</Button>
```

### outlined
Кнопка с обводкой. Используется для вторичных действий.

```tsx
<Button variant="outlined">Отмена</Button>
```

### text
Текстовая кнопка. Используется для третичных действий.

```tsx
<Button variant="text">Подробнее</Button>
```

### surface
Кнопка с поверхностным фоном. Используется для действий на тёмном фоне.

```tsx
<Button variant="surface">Действие</Button>
```

### gradient
Кнопка с градиентным фоном. Используется для акцентных действий.

```tsx
<Button variant="gradient">Создать</Button>
```

## Размеры (Sizes)

### large
- Типографика: `buttonL` (16px, weight 500)
- Padding: `10px 24px`
- Минимальная высота: `44px` (рекомендуется)

```tsx
<Button size="large">Большая кнопка</Button>
```

### medium
- Типографика: `buttonM` (14px, weight 500)
- Padding: `6px 12px`

```tsx
<Button size="medium">Средняя кнопка</Button>
```

### small
- Типографика: `buttonS` (10px, weight 600, uppercase)
- Padding: `0 6px`

```tsx
<Button size="small">Маленькая кнопка</Button>
```

## Состояния (States)

### Default
Обычное состояние кнопки, готова к взаимодействию.

```tsx
<Button variant="contained">Кнопка</Button>
```

### Hover
Состояние при наведении курсора. Автоматически обрабатывается темой.

- **contained**: Небольшое затемнение фона
- **outlined**: Изменение цвета обводки
- **gradient**: Уменьшение opacity до 0.9
- **surface**: Изменение фона на `background.header`

### Active
Состояние при нажатии. Автоматически обрабатывается темой.

### Disabled
Кнопка недоступна для взаимодействия.

```tsx
<Button variant="contained" disabled>
  Недоступно
</Button>
```

**Особенности:**
- Кнопка визуально затемнена
- Не реагирует на клики
- Не получает фокус

### Loading
Состояние загрузки. Показывает индикатор загрузки и делает кнопку disabled.

```tsx
<Button variant="contained" loading>
  Загрузка...
</Button>
```

**Особенности:**
- Автоматически делает кнопку disabled
- Показывает `CircularProgress` размером 16px
- Можно указать отдельный текст для загрузки

```tsx
<Button variant="contained" loading loadingText="Отправка...">
  Отправить
</Button>
```

## Цвета (Colors)

### primary
Основной цвет (по умолчанию).

```tsx
<Button color="primary">Основная</Button>
```

### secondary
Вторичный цвет.

```tsx
<Button color="secondary">Вторичная</Button>
```

### error
Цвет ошибки.

```tsx
<Button color="error">Удалить</Button>
```

### warning
Цвет предупреждения.

```tsx
<Button color="warning">Предупреждение</Button>
```

### info
Информационный цвет.

```tsx
<Button color="info">Информация</Button>
```

### success
Цвет успеха.

```tsx
<Button color="success">Успех</Button>
```

## Примеры использования

### Основная кнопка действия

```tsx
<Button variant="contained" size="large" onClick={handleSubmit}>
  Подтвердить
</Button>
```

### Кнопка с загрузкой

```tsx
<Button
  variant="contained"
  loading={isSubmitting}
  loadingText="Отправка..."
  onClick={handleSubmit}
>
  Отправить
</Button>
```

### Кнопка отмены

```tsx
<Button variant="outlined" onClick={handleCancel}>
  Отмена
</Button>
```

### Градиентная кнопка

```tsx
<Button variant="gradient" size="large" onClick={handleCreate}>
  Создать новый
</Button>
```

### Кнопка с иконкой

```tsx
<Button
  variant="contained"
  startIcon={<AddIcon />}
  onClick={handleAdd}
>
  Добавить
</Button>
```

### Кнопка с загрузкой и иконкой

```tsx
<Button
  variant="contained"
  loading={isLoading}
  startIcon={!isLoading && <SaveIcon />}
  onClick={handleSave}
>
  Сохранить
</Button>
```

## Ограничения

1. **Минимальная высота**: Для больших кнопок рекомендуется использовать `minHeight: '44px'` для лучшей доступности
2. **Текст**: Не используйте слишком длинный текст в кнопках
3. **Загрузка**: При `loading={true}` кнопка автоматически становится disabled
4. **Градиент**: Вариант `gradient` не поддерживает цветовые модификаторы

## Доступность

- Кнопка поддерживает навигацию с клавиатуры
- Автоматически получает правильные ARIA-атрибуты
- Поддерживает фокус и активное состояние
- В состоянии disabled не получает фокус

## Интеграция с темой

Все стили кнопки определены в `src/utils/theme.tsx` в секции `MuiButton`. Изменения темы автоматически применяются ко всем кнопкам.


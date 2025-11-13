# BabySu Mobile Components

Complete UI component library for the BabySu mobile app.

## Installation

Before using the components, install required dependencies:

```bash
npm install prop-types
```

## Component Categories

### Common Components

Located in `src/components/common/`:

- **Button** - Custom button with loading states
- **Input** - Text input with validation
- **Card** - Song/child card component
- **Avatar** - Child avatar component
- **LoadingSpinner** - Loading indicator
- **EmptyState** - Empty list placeholder
- **ErrorBoundary** - Error handling wrapper
- **OfflineIndicator** - Shows when offline

### Player Components

Located in `src/components/player/`:

- **AudioPlayer** - Main audio player component
- **PlayerControls** - Play/pause/skip controls
- **ProgressBar** - Audio progress bar
- **MiniPlayer** - Minimized player for navigation

## Usage Examples

### Button Component

```jsx
import { Button } from './components';

<Button
  mode="contained"
  onPress={handleSubmit}
  loading={isLoading}
>
  Create Song
</Button>
```

### Input Component

```jsx
import { Input } from './components';

<Input
  label="Child Name"
  value={name}
  onChangeText={setName}
  error={errors.name}
  leftIcon="person"
/>
```

### Card Component

```jsx
import { Card } from './components';

<Card
  title="Bedtime Song"
  subtitle="Lullaby • 3 min"
  icon="musical-note"
  onPress={() => navigation.navigate('SongDetail')}
/>
```

### Avatar Component

```jsx
import { Avatar } from './components';

<Avatar
  name="Emma"
  size={60}
  backgroundColor={theme.colors.primary}
/>
```

### LoadingSpinner Component

```jsx
import { LoadingSpinner } from './components';

<LoadingSpinner
  message="Loading songs..."
  fullScreen
/>
```

### EmptyState Component

```jsx
import { EmptyState } from './components';

<EmptyState
  emoji="🎵"
  title="No Songs Yet"
  message="Create your first personalized song!"
  buttonText="Create Song"
  onButtonPress={() => navigation.navigate('Generate')}
/>
```

### ErrorBoundary Component

```jsx
import { ErrorBoundary } from './components';

<ErrorBoundary>
  <YourScreen />
</ErrorBoundary>
```

### OfflineIndicator Component

```jsx
import { OfflineIndicator } from './components';

// In your root component
<OfflineIndicator isOffline={!isConnected} />
```

### AudioPlayer Component

```jsx
import { AudioPlayer } from './components';

<AudioPlayer
  song={{
    id: '1',
    title: 'Bedtime Song',
    audioUrl: 'https://...',
    category: 'Lullaby',
    imageUrl: 'https://...'
  }}
  onClose={handleClose}
/>
```

### PlayerControls Component

```jsx
import { PlayerControls } from './components';

<PlayerControls
  isPlaying={isPlaying}
  onPlayPause={handlePlayPause}
  onSkipForward={handleSkipForward}
  onSkipBackward={handleSkipBackward}
/>
```

### ProgressBar Component

```jsx
import { ProgressBar } from './components';

<ProgressBar
  currentTime={45}
  duration={180}
  onSeek={handleSeek}
/>
```

### MiniPlayer Component

```jsx
import { MiniPlayer } from './components';

<MiniPlayer
  song={{ title: 'Bedtime Song', category: 'Lullaby' }}
  isPlaying={true}
  onPlayPause={handlePlayPause}
  onPress={handleExpand}
/>
```

## Component Props

### Button

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| children | node | required | Button text |
| mode | string | 'contained' | Button style mode |
| loading | bool | false | Show loading state |
| disabled | bool | false | Disable button |
| onPress | func | required | Press handler |
| buttonColor | string | primary | Custom button color |

### Input

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | - | Input label |
| value | string | required | Input value |
| onChangeText | func | required | Change handler |
| error | string | - | Error message |
| secureTextEntry | bool | false | Hide text (password) |
| leftIcon | string | - | Left icon name |

### Card

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | - | Card title |
| subtitle | string | - | Card subtitle |
| icon | string | - | Icon name |
| onPress | func | - | Press handler |

### Avatar

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| name | string | required | Name for initials |
| source | object | - | Image source |
| size | number | 60 | Avatar size |
| backgroundColor | string | primary | Background color |

### LoadingSpinner

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | string/number | 'large' | Spinner size |
| message | string | - | Loading message |
| fullScreen | bool | false | Full screen mode |

### EmptyState

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| icon | string | - | Icon name |
| emoji | string | - | Emoji character |
| title | string | 'Nothing Here' | Title text |
| message | string | - | Message text |
| buttonText | string | - | Button label |
| onButtonPress | func | - | Button handler |

### AudioPlayer

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| song | object | required | Song data |
| onClose | func | - | Close handler |

### PlayerControls

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| isPlaying | bool | required | Play state |
| onPlayPause | func | required | Play/pause handler |
| onSkipForward | func | - | Skip forward handler |
| onSkipBackward | func | - | Skip back handler |
| showSkipButtons | bool | true | Show skip buttons |
| size | string | 'large' | Control size |

### ProgressBar

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| currentTime | number | required | Current time (seconds) |
| duration | number | required | Total duration (seconds) |
| onSeek | func | - | Seek handler |

### MiniPlayer

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| song | object | required | Song data |
| isPlaying | bool | required | Play state |
| onPlayPause | func | required | Play/pause handler |
| onPress | func | - | Expand handler |

## Theme Integration

All components use the app's theme system from `src/utils/theme.js`:

```jsx
import { theme, spacing, shadows } from '../utils/theme';
```

### Theme Colors

- `primary`: #FF6B9D (Pink)
- `secondary`: #FFA07A (Light coral)
- `tertiary`: #98D8C8 (Mint green)
- `accent`: #FFD93D (Yellow)
- `error`: #FF6B6B
- `background`: #FFF9FB

### Spacing Scale

- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `xxl`: 48px

## Best Practices

1. **Always use themed colors**: Access colors via `theme.colors.*`
2. **Use spacing constants**: Use `spacing.*` for consistent spacing
3. **Include PropTypes**: Add prop validation to all components
4. **Handle errors gracefully**: Wrap screens with ErrorBoundary
5. **Show loading states**: Use LoadingSpinner for async operations
6. **Provide empty states**: Use EmptyState when lists are empty
7. **Validate inputs**: Use Input component's error prop

## Testing

To test components individually, import and use in any screen:

```jsx
import { Button, Card, LoadingSpinner } from './components';

function TestScreen() {
  return (
    <View>
      <Card title="Test" subtitle="Testing" />
      <Button onPress={() => {}}>Test Button</Button>
    </View>
  );
}
```

## Notes

- Components use `react-native-paper` for Material Design
- Icons are from `@expo/vector-icons` (Ionicons)
- Audio player uses `react-native-track-player`
- All components are fully typed with PropTypes
- Components follow React Native best practices

## Future Enhancements

- [ ] Add unit tests for all components
- [ ] Add Storybook for component showcase
- [ ] Add more variant options
- [ ] Add accessibility features (a11y)
- [ ] Add animation presets

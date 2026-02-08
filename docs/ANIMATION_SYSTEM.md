# Animation System Documentation

## Overview

The Smart Expense Tracker features a comprehensive animation system built with **Framer Motion** and **Tailwind CSS** to provide smooth, performant, and accessible animations throughout the application.

## Key Features

### 🎨 Animation Library
- **Framer Motion**: Professional-grade animation library for React
- **Tailwind Animations**: Custom keyframe animations in Tailwind config
- **Accessibility**: Respects `prefers-reduced-motion` user preferences
- **Performance**: GPU-accelerated transforms and optimized rendering

### 📦 Core Animation Utilities

Located in `client/src/utils/animations.js`:

#### Basic Transitions
- `fadeIn` - Simple opacity fade
- `fadeInUp` - Fade with upward slide
- `fadeInDown` - Fade with downward slide
- `slideInLeft` - Slide from left
- `slideInRight` - Slide from right
- `scaleIn` - Scale with fade
- `scaleInBounce` - Bouncy scale entrance

#### Layout Animations
- `staggerContainer` - Container for staggered children
- `staggerItem` - Individual staggered item
- `pageTransition` - Page route transitions
- `sidebarVariants` - Sidebar open/close
- `dropdownVariants` - Dropdown menu animations

#### Interactive Animations
- `hoverScale` - Scale on hover
- `buttonPress` - Button press feedback
- `pulseVariants` - Continuous pulse effect
- `shakeVariants` - Error shake animation
- `glowVariants` - Glow effect on hover

#### Specialized Animations
- `progressVariants` - Animated progress bars
- `counterVariants` - Number counter animations
- `listItemVariants` - List item entrance/exit
- `swipeVariants` - Swipe gesture animations
- `chartVariants` - Chart rendering animations

#### Feature-Specific
- `badgeUnlockVariants` - Achievement unlock animation
- `confettiVariants` - Celebration confetti
- `micPulseVariants` - Microphone listening pulse
- `typingDotVariants` - Typing indicator dots
- `waveformVariants` - Audio waveform visualization
- `scanLineVariants` - Receipt scanning effect
- `checkmarkVariants` - Success checkmark drawing
- `circularProgressVariants` - Circular progress animation

### 🧩 Animated Components

#### AnimatedCard
```jsx
import { AnimatedCard } from '../components/ui';

<AnimatedCard delay={0.2} hover={true}>
  <h3>Card Content</h3>
</AnimatedCard>
```

#### AnimatedProgress
```jsx
import { AnimatedProgress } from '../components/ui';

<AnimatedProgress 
  value={75} 
  max={100} 
  color="blue"
  warning={true}
  showLabel={true}
/>
```

#### AnimatedList & AnimatedListItem
```jsx
import { AnimatedList, AnimatedListItem } from '../components/ui';

<AnimatedList>
  {items.map(item => (
    <AnimatedListItem 
      key={item.id} 
      id={item.id}
      onDelete={() => handleDelete(item.id)}
    >
      {item.content}
    </AnimatedListItem>
  ))}
</AnimatedList>
```

#### AnimatedButton
```jsx
import { AnimatedButton } from '../components/ui';

<AnimatedButton 
  variant="primary"
  loading={isLoading}
  icon={PlusIcon}
  onClick={handleClick}
>
  Add Expense
</AnimatedButton>
```

#### AnimatedCounter
```jsx
import { AnimatedCounter } from '../components/ui';

<AnimatedCounter 
  value={1234.56} 
  prefix="₹"
  decimals={2}
  duration={1}
/>
```

#### ConfettiEffect
```jsx
import { ConfettiEffect } from '../components/ui';

<ConfettiEffect show={showConfetti} count={50} />
```

#### SuccessCheckmark
```jsx
import { SuccessCheckmark } from '../components/ui';

<SuccessCheckmark show={isSuccess} size="lg" />
```

#### AchievementBadge
```jsx
import { AchievementBadge } from '../components/ui';

<AchievementBadge
  icon={TrophyIcon}
  title="First Expense"
  description="Added your first expense"
  unlocked={true}
  progress={100}
/>
```

#### Skeleton Loaders
```jsx
import { SkeletonCard, SkeletonList, SkeletonChart } from '../components/ui';

{loading ? <SkeletonCard /> : <ActualCard />}
{loading ? <SkeletonList count={5} /> : <ActualList />}
{loading ? <SkeletonChart /> : <ActualChart />}
```

#### Voice Animations
```jsx
import { MicrophonePulse, Waveform, TypingIndicator } from '../components/ui';

<MicrophonePulse isListening={isRecording} />
<Waveform isActive={isRecording} bars={5} />
<TypingIndicator />
```

#### Scan Animations
```jsx
import { ScanOverlay, ProcessingLoader } from '../components/ui';

<ScanOverlay isScanning={isScanning} />
<ProcessingLoader text="Processing receipt..." />
```

### 🎯 Implementation Examples

#### Dashboard Cards with Stagger
```jsx
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../utils/animations';

<motion.div 
  variants={staggerContainer}
  initial="initial"
  animate="animate"
  className="grid grid-cols-4 gap-4"
>
  {stats.map((stat, index) => (
    <motion.div key={index} variants={staggerItem}>
      <StatCard {...stat} delay={index * 0.1} animateValue={true} />
    </motion.div>
  ))}
</motion.div>
```

#### Page Transitions
```jsx
import { motion, AnimatePresence } from 'framer-motion';
import { pageTransition } from '../utils/animations';

<AnimatePresence mode="wait">
  <Routes location={location} key={location.pathname}>
    <Route path="/dashboard" element={
      <motion.div {...pageTransition}>
        <Dashboard />
      </motion.div>
    } />
  </Routes>
</AnimatePresence>
```

#### Modal with Animations
```jsx
// Already implemented in Modal.jsx
<Modal isOpen={isOpen} onClose={onClose} title="Add Expense">
  <ExpenseForm />
</Modal>
```

#### Swipe to Delete
```jsx
<AnimatedListItem
  id={expense.id}
  onDelete={() => deleteExpense(expense.id)}
>
  <ExpenseCard expense={expense} />
</AnimatedListItem>
```

#### Progress with Warning Shake
```jsx
<AnimatedProgress
  value={budgetUsed}
  max={budgetLimit}
  color={budgetUsed > budgetLimit ? 'red' : 'blue'}
  warning={budgetUsed > budgetLimit}
/>
```

### 🎨 Tailwind Custom Animations

Added to `tailwind.config.js`:

```javascript
animation: {
  'spin-slow': 'spin 3s linear infinite',
  'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  'bounce-slow': 'bounce 2s infinite',
  'wiggle': 'wiggle 1s ease-in-out infinite',
  'slide-up': 'slideUp 0.3s ease-out',
  'slide-down': 'slideDown 0.3s ease-out',
  'fade-in': 'fadeIn 0.3s ease-out',
  'scale-in': 'scaleIn 0.3s ease-out',
  'shimmer': 'shimmer 2s linear infinite',
  'glow': 'glow 2s ease-in-out infinite',
}
```

### ♿ Accessibility

The animation system respects user preferences:

```javascript
// Automatically reduces animations for users who prefer reduced motion
export const getAnimation = (animation) => {
  if (prefersReducedMotion()) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.1 }
    };
  }
  return animation;
};
```

### 📱 Mobile Optimization

- Touch-friendly tap targets
- Swipe gestures for delete actions
- Reduced animation complexity on mobile
- GPU-accelerated transforms
- Optimized for 60fps performance

### 🎭 Animation Best Practices

1. **Use Appropriate Timing**
   - Quick interactions: 0.2-0.3s
   - Page transitions: 0.4-0.5s
   - Complex animations: 0.6-1s

2. **Stagger for Lists**
   - Use `staggerContainer` and `staggerItem`
   - Delay: 0.05-0.1s per item
   - Maximum 10-15 items for stagger

3. **Respect User Preferences**
   - Always use `getAnimation()` helper
   - Provide instant feedback for reduced motion

4. **Performance**
   - Animate `transform` and `opacity` only
   - Avoid animating `width`, `height`, `top`, `left`
   - Use `will-change` sparingly
   - Clean up animations on unmount

5. **Feedback**
   - Provide visual feedback for all interactions
   - Use appropriate animation for context
   - Success: checkmark, confetti
   - Error: shake, red color
   - Loading: spinner, skeleton

### 🔧 Customization

To add new animations:

1. Define variants in `utils/animations.js`
2. Create reusable component in `components/ui/`
3. Export from `components/ui/index.js`
4. Document usage in this file

### 📊 Performance Metrics

- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Animation Frame Rate: 60fps
- Bundle Size Impact: ~50KB (Framer Motion)

### 🐛 Troubleshooting

**Animations not working:**
- Check if Framer Motion is installed
- Verify import paths
- Check for CSS conflicts

**Janky animations:**
- Use `transform` instead of position properties
- Reduce number of animated elements
- Check for heavy re-renders

**Accessibility issues:**
- Ensure `prefers-reduced-motion` is respected
- Test with screen readers
- Verify keyboard navigation

## Component-Specific Animations

### Layout Components
- **Header**: Slide down on mount, notification badge pulse
- **Sidebar**: Slide in/out, staggered nav items, logo rotation on hover
- **Mobile Nav**: Slide up from bottom

### Dashboard
- **Stat Cards**: Staggered entrance, animated counters, hover glow
- **Charts**: Progressive rendering, smooth data transitions
- **Recent Transactions**: List stagger, hover lift

### Expenses
- **List Items**: Entrance animation, swipe to delete
- **Filters**: Dropdown slide, smooth transitions
- **Edit Mode**: Scale in form, shake on error

### Budgets & Goals
- **Progress Bars**: Animated fill, warning shake
- **Milestones**: Confetti on achievement
- **Circular Progress**: Drawing animation

### AI Assistant
- **Chat Bubbles**: Slide in from sides
- **Typing Indicator**: Bouncing dots
- **Voice Input**: Microphone pulse, waveform

### Receipts
- **Scanner**: Scanning line, corner brackets
- **Processing**: Spinner with text
- **Results**: Text reveal animation

### Achievements
- **Badge Unlock**: Flip/bounce entrance
- **Confetti**: Celebration effect
- **Progress**: Smooth percentage updates

### Authentication
- **Forms**: Fade-slide entrance
- **Errors**: Shake feedback
- **Success**: Checkmark animation
- **Biometric**: Ripple effect

## Future Enhancements

- [ ] Gesture-based navigation
- [ ] Parallax scrolling effects
- [ ] Micro-interactions for all buttons
- [ ] Advanced chart animations
- [ ] Custom loading animations per feature
- [ ] Sound effects (optional)
- [ ] Haptic feedback (mobile)
- [ ] Dark mode transitions

## Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind Animation Docs](https://tailwindcss.com/docs/animation)
- [Web Animation Best Practices](https://web.dev/animations/)
- [Reduced Motion Guide](https://web.dev/prefers-reduced-motion/)

# Animation System Quick Start Guide

## 🚀 Getting Started

The animation system is now fully integrated and ready to use. Here's how to start adding animations to your components.

## 📦 Installation

Already completed! Framer Motion is installed and configured.

## 🎨 Basic Usage

### 1. Simple Fade In Animation

```jsx
import { motion } from 'framer-motion';
import { fadeInUp } from '../utils/animations';

function MyComponent() {
  return (
    <motion.div {...fadeInUp}>
      <h1>Hello World</h1>
    </motion.div>
  );
}
```

### 2. Using Animated Components

```jsx
import { AnimatedCard, AnimatedButton } from '../components/ui';

function MyComponent() {
  return (
    <AnimatedCard delay={0.2}>
      <h2>Card Title</h2>
      <p>Card content</p>
      <AnimatedButton onClick={handleClick}>
        Click Me
      </AnimatedButton>
    </AnimatedCard>
  );
}
```

### 3. Staggered List Animation

```jsx
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem } from '../utils/animations';

function MyList({ items }) {
  return (
    <motion.div 
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {items.map((item, index) => (
        <motion.div key={item.id} variants={staggerItem}>
          <ItemCard item={item} />
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### 4. Animated Progress Bar

```jsx
import { AnimatedProgress } from '../components/ui';

function BudgetCard({ spent, limit }) {
  return (
    <div>
      <h3>Budget Progress</h3>
      <AnimatedProgress
        value={spent}
        max={limit}
        color={spent > limit ? 'red' : 'blue'}
        warning={spent > limit}
        showLabel={true}
      />
    </div>
  );
}
```

### 5. Animated Counter

```jsx
import { AnimatedCounter } from '../components/ui';

function StatCard({ value }) {
  return (
    <div>
      <h3>Total Expenses</h3>
      <AnimatedCounter 
        value={value} 
        prefix="₹"
        decimals={2}
        duration={1}
      />
    </div>
  );
}
```

## 🎯 Common Patterns

### Loading States

```jsx
import { SkeletonCard } from '../components/ui';

function MyComponent() {
  const [loading, setLoading] = useState(true);
  
  if (loading) {
    return <SkeletonCard />;
  }
  
  return <ActualContent />;
}
```

### Success Feedback

```jsx
import { SuccessCheckmark, ConfettiEffect } from '../components/ui';

function SubmitForm() {
  const [success, setSuccess] = useState(false);
  
  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* form fields */}
      </form>
      
      <SuccessCheckmark show={success} size="lg" />
      <ConfettiEffect show={success} count={50} />
    </>
  );
}
```

### Modal with Animation

```jsx
import { Modal } from '../components/ui';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        title="My Modal"
      >
        <p>Modal content with automatic animations!</p>
      </Modal>
    </>
  );
}
```

### Swipe to Delete

```jsx
import { AnimatedList, AnimatedListItem } from '../components/ui';

function ExpenseList({ expenses, onDelete }) {
  return (
    <AnimatedList>
      {expenses.map(expense => (
        <AnimatedListItem
          key={expense.id}
          id={expense.id}
          onDelete={() => onDelete(expense.id)}
        >
          <ExpenseCard expense={expense} />
        </AnimatedListItem>
      ))}
    </AnimatedList>
  );
}
```

## 🎭 Animation Variants Reference

### Basic Transitions
- `fadeIn` - Simple fade
- `fadeInUp` - Fade + slide up
- `fadeInDown` - Fade + slide down
- `slideInLeft` - Slide from left
- `slideInRight` - Slide from right
- `scaleIn` - Scale with fade
- `scaleInBounce` - Bouncy scale

### Interactive
- `hoverScale` - Scale on hover
- `buttonPress` - Button press feedback
- `pulseVariants` - Continuous pulse
- `shakeVariants` - Error shake
- `glowVariants` - Glow on hover

### Layout
- `staggerContainer` - Container for stagger
- `staggerItem` - Staggered item
- `pageTransition` - Page transitions
- `sidebarVariants` - Sidebar animation
- `dropdownVariants` - Dropdown menu
- `modalBackdrop` - Modal backdrop
- `modalContent` - Modal content

## 🔧 Customization

### Create Custom Animation

```jsx
// In your component file
const customAnimation = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: 0.4, ease: 'easeOut' }
};

<motion.div {...customAnimation}>
  Content
</motion.div>
```

### Modify Existing Animation

```jsx
import { fadeInUp } from '../utils/animations';

const myAnimation = {
  ...fadeInUp,
  transition: { ...fadeInUp.transition, delay: 0.5 }
};

<motion.div {...myAnimation}>
  Content
</motion.div>
```

## ♿ Accessibility

Always use the `getAnimation` helper for accessibility:

```jsx
import { getAnimation, fadeInUp } from '../utils/animations';

const animation = getAnimation(fadeInUp);

<motion.div {...animation}>
  Content respects user's motion preferences
</motion.div>
```

## 📱 Mobile Considerations

Animations automatically adapt for mobile:
- Reduced complexity
- Touch-friendly interactions
- Swipe gestures enabled
- Optimized performance

## 🎨 Tailwind Animations

Use Tailwind classes for simple animations:

```jsx
<div className="animate-fade-in">Fades in</div>
<div className="animate-slide-up">Slides up</div>
<div className="animate-shimmer">Shimmer effect</div>
<div className="hover:animate-glow">Glows on hover</div>
```

## 🐛 Troubleshooting

### Animation not working?
1. Check if component is wrapped in motion.div
2. Verify import paths
3. Check for CSS conflicts

### Janky animation?
1. Use transform/opacity only
2. Reduce number of animated elements
3. Check for heavy re-renders

### Accessibility issues?
1. Use getAnimation() helper
2. Test with reduced motion enabled
3. Verify keyboard navigation

## 📚 Examples by Feature

### Dashboard
```jsx
// Staggered stat cards
<motion.div variants={staggerContainer} initial="initial" animate="animate">
  {stats.map((stat, i) => (
    <motion.div key={i} variants={staggerItem}>
      <StatCard {...stat} delay={i * 0.1} animateValue={true} />
    </motion.div>
  ))}
</motion.div>
```

### Expenses
```jsx
// Animated expense list with swipe delete
<AnimatedList>
  {expenses.map(expense => (
    <AnimatedListItem 
      key={expense.id}
      id={expense.id}
      onDelete={() => deleteExpense(expense.id)}
    >
      <ExpenseCard expense={expense} />
    </AnimatedListItem>
  ))}
</AnimatedList>
```

### Budgets
```jsx
// Progress with warning
<AnimatedProgress
  value={spent}
  max={budget}
  color={spent > budget ? 'red' : 'blue'}
  warning={spent > budget}
/>
```

### Goals
```jsx
// Circular progress
<CircularProgress
  value={progress}
  size={120}
  strokeWidth={8}
  color="green"
/>
```

### Achievements
```jsx
// Badge unlock with confetti
<AchievementBadge
  icon={TrophyIcon}
  title="First Expense"
  unlocked={true}
/>
<ConfettiEffect show={unlocked} count={50} />
```

### Voice Input
```jsx
// Microphone with waveform
<MicrophonePulse isListening={recording} />
<Waveform isActive={recording} bars={5} />
```

### Receipt Scanner
```jsx
// Scanning overlay
<ScanOverlay isScanning={scanning} />
<ProcessingLoader text="Processing..." />
```

## 🎯 Best Practices

1. **Keep it subtle** - Animations should enhance, not distract
2. **Be consistent** - Use same timing/easing throughout
3. **Respect preferences** - Always use getAnimation()
4. **Optimize performance** - Animate transform/opacity only
5. **Test thoroughly** - Check on different devices/browsers

## 📖 Full Documentation

For complete documentation, see:
- [Animation System Guide](./ANIMATION_SYSTEM.md)
- [Implementation Summary](./ANIMATION_IMPLEMENTATION_SUMMARY.md)

## 🎉 You're Ready!

Start adding animations to your components using the patterns above. The system is designed to be simple, performant, and accessible.

Happy animating! ✨

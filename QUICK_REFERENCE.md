# Quick Reference Guide - Modern Task Card UI

## Files Created

```
├── TaskCard.jsx                    # Main component (clean, modern design)
├── TaskCardAdvanced.jsx            # Extended component (with priority, tags, edit mode)
├── TasksContainer.jsx              # Example integration container
├── SETUP_GUIDE.md                  # Complete setup & installation guide
├── DESIGN_SYSTEM.md               # Design specifications & documentation
└── RECIPES.jsx                     # 8+ practical code recipes
```

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Configure Tailwind
Update `tailwind.config.js`:
```javascript
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

### 3. Import in Your App
```jsx
import TaskCard from './TaskCard';
import TasksContainer from './TasksContainer';

function App() {
  return <TasksContainer />;
}
```

## Component Props

### TaskCard.jsx

```javascript
<TaskCard
  task={{
    _owner: 'user123',
    _taskId: 'task1',
    _ownerDisplay: 'John Doe',
    title: 'Task title',
    description: 'Optional description',
    completed: false,
    targetDate: '2026-01-15',
    recurrence: { type: 'weekly', interval: 1 },
    collaborators: { /* ... */ },
    subtasks: { /* ... */ },
  }}
  isOwner={true}
  onToggleComplete={(ownerUid, taskId) => {}}
  onDeleteTask={(ownerUid, taskId) => {}}
  onAddSubtask={(ownerUid, taskId, title) => {}}
  // ... other handlers
/>
```

### TaskCardAdvanced.jsx

Same as above, plus:
```javascript
isDarkMode={true}
onSetPriority={(ownerUid, taskId, priority) => {}}
onAddTag={(ownerUid, taskId, tag) => {}}
onRemoveTag={(ownerUid, taskId, tag) => {}}
```

## Key Design Changes

| Aspect | Before | After |
|--------|--------|-------|
| **Layout** | Cluttered, horizontal | Clean, sectioned, vertical |
| **Hierarchy** | Unclear | Clear (header → metadata → subtasks) |
| **Delete** | Prominent button | Hidden in menu |
| **Collaborators** | Shown 2 places | Single, organized section |
| **Progress** | Simple % | Interactive animated bar |
| **Spacing** | Cramped | Generous whitespace |
| **Mobile** | Broken | Fully responsive |

## Tailwind Classes Reference

### Spacing
```
p-4 = padding 16px      gap-4 = gap 16px
p-6 = padding 24px      gap-6 = gap 24px
mb-3 = margin-bottom    flex-1 = flex: 1
mt-1 = margin-top
```

### Colors
```
bg-white               text-gray-900
bg-gray-50/100/700/800 text-blue-600
border-gray-200/700    hover:text-gray-600
```

### Responsive
```
grid-cols-1           # Mobile
md:grid-cols-2        # Tablet
lg:grid-cols-3        # Desktop
xl:grid-cols-4        # Large desktop
```

### States
```
hover:shadow-md       # Hover effect
transition-all        # Smooth animation
duration-300          # 300ms timing
disabled:opacity-50   # Disabled state
```

## Common Customizations

### Change Brand Color
```javascript
// Find all occurrences of "blue-" and replace
// From: bg-blue-600, hover:bg-blue-700
// To:   bg-indigo-600, hover:bg-indigo-700
```

### Add More Columns on Desktop
```javascript
// In TasksContainer
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
```

### Enable Dark Mode
```jsx
<TaskCardAdvanced isDarkMode={true} />
```

### Replace Icons
```javascript
// From Lucide:
import { ChevronDown } from 'lucide-react';

// To Font Awesome:
<i className="fas fa-chevron-down"></i>
```

### Adjust Animation Speed
```javascript
// Change duration-300 to:
duration-150   // Faster
duration-500   // Slower
duration-700   # Slowest
```

## Firebase Integration Example

```javascript
// Listen to tasks
import { ref, onValue } from 'firebase/database';

onValue(ref(database, `tasks/${userId}`), (snapshot) => {
  const tasks = snapshot.val();
  setTasks(tasks);
});

// Update task
import { update } from 'firebase/database';

await update(ref(database, `tasks/${uid}/${taskId}`), {
  completed: true,
  title: 'New title'
});

// Add subtask
import { push, set } from 'firebase/database';

const subtaskRef = push(ref(database, `tasks/${uid}/${taskId}/subtasks`));
await set(subtaskRef, { title: 'Subtask', completed: false });
```

## State Management Pattern

```javascript
// In your container component
const [tasks, setTasks] = useState({});

const handleToggleComplete = useCallback((ownerUid, taskId) => {
  setTasks(prev => ({
    ...prev,
    [`${ownerUid}_${taskId}`]: {
      ...prev[`${ownerUid}_${taskId}`],
      completed: !prev[`${ownerUid}_${taskId}`].completed
    }
  }));
}, []);
```

## Testing Checklist

- [ ] Install dependencies successfully
- [ ] Tailwind CSS compiles
- [ ] Component renders without errors
- [ ] Buttons and menus work
- [ ] Mobile responsive (test at 375px, 768px, 1024px)
- [ ] Dark mode works (if implemented)
- [ ] Firebase integration working
- [ ] All state updates working
- [ ] No console errors

## Performance Tips

1. **Memoize component**: `React.memo(TaskCard)`
2. **Use useCallback**: For all handler functions
3. **Optimize re-renders**: Only pass needed props
4. **Virtual scrolling**: For 1000+ tasks, use `react-window`
5. **Code splitting**: Lazy load container component

## Troubleshooting

### Icons not showing
```bash
npm install lucide-react
# Check import: import { ChevronDown } from 'lucide-react'
```

### Styles not applying
```javascript
// Check tailwind.config.js content paths
content: ["./src/**/*.{js,jsx,ts,tsx}"]

// Ensure Tailwind CSS is imported in main file
import './styles/tailwind.css'
```

### State not updating
```javascript
// Verify Firebase update completes before state change
await updateTaskInFirebase(...);  // ← Important!
setTasks(...);
```

## Browser DevTools Tips

### Inspect Tailwind Utilities
```javascript
// DevTools → Computed tab
// Look for classname in element's computed styles
// Verify padding, margins, colors are applied
```

### Test Responsive Breakpoints
```
DevTools → Toggle device toolbar (Ctrl+Shift+M)
Test at: 375px (mobile), 768px (tablet), 1024px+ (desktop)
```

### Check Accessibility
```
DevTools → Accessibility tab
Verify color contrast ratios
Check ARIA labels on buttons
Test keyboard navigation
```

## Documentation Links

- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)
- [React Docs](https://react.dev)
- [Firebase SDK](https://firebase.google.com/docs/database)

## Support Resources

1. **SETUP_GUIDE.md** - Step-by-step installation
2. **DESIGN_SYSTEM.md** - Complete design specs
3. **RECIPES.jsx** - 8+ practical code examples
4. **TasksContainer.jsx** - Full integration example
5. **TaskCardAdvanced.jsx** - Advanced features demo

## Version History

### v2.0 (Current)
✨ Complete modern redesign
- React + Tailwind CSS
- Better visual hierarchy
- Streamlined UI
- Mobile-first responsive

### v1.0 (Previous)
- Vanilla JavaScript
- Bootstrap styling
- Cluttered layout

## Next Steps

1. ✅ Read SETUP_GUIDE.md
2. ✅ Install dependencies
3. ✅ Integrate TaskCard.jsx
4. ✅ Set up Firebase handlers
5. ✅ Test on mobile
6. ✅ Customize colors
7. ✅ Deploy to production

## Questions?

Refer to:
- File: **SETUP_GUIDE.md** (Installation & integration)
- File: **DESIGN_SYSTEM.md** (Design details)
- File: **RECIPES.jsx** (Code examples)
- File: **TasksContainer.jsx** (Full example)

---

**Last Updated**: January 2026
**Author**: GitHub Copilot
**Status**: Production Ready ✅

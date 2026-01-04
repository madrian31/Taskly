# Modern Task Card - Design System & Documentation

## Design Philosophy

The redesigned task card follows these core principles:

1. **Clarity**: Clear information hierarchy with distinct sections
2. **Efficiency**: Minimize cognitive load, hide secondary actions
3. **Delight**: Smooth animations and satisfying interactions
4. **Accessibility**: WCAG compliant colors and keyboard navigation
5. **Responsiveness**: Seamlessly adapts to any screen size

## Visual Hierarchy

### Typography Scale

```
H3 (Task Title)
- Font Size: 18px (lg)
- Font Weight: 600 (semibold)
- Line Height: 1.5
- Use: Primary task name

P (Description)
- Font Size: 14px (sm)
- Font Weight: 400 (normal)
- Color: Gray-600
- Use: Supporting details

Label (Metadata headers)
- Font Size: 11px (xs)
- Font Weight: 600 (semibold)
- Letter Spacing: 0.05em (tracking-wide)
- Text Transform: uppercase
- Color: Gray-500
- Use: Section identifiers

Value (Metadata values)
- Font Size: 14px (sm)
- Font Weight: 500 (medium)
- Color: Gray-900
```

### Color Palette

#### Neutral Colors
- **Gray-50**: Backgrounds for secondary sections
- **Gray-100**: Hover states, accents
- **Gray-200**: Borders, dividers
- **Gray-400**: Disabled text, secondary labels
- **Gray-600**: Secondary content
- **Gray-900**: Primary text

#### Status Colors
- **Blue**: Primary actions, general progress (blue-600)
- **Green**: Completed/Success (green-500)
- **Red**: Destructive actions, overdue tasks (red-600)
- **Orange**: Warning, due today (orange-600)

#### Semantic States
```
✓ Completed:    bg-green-500,  text-green-600
✗ Overdue:      bg-red-600,    text-red-600
⚠ Today:        bg-orange-600, text-orange-600
→ Upcoming:     bg-gray-500,   text-gray-600
```

## Layout Specifications

### Card Structure (Default Width: 450px)

```
┌─────────────────────────────────────┐
│ HEADER (p-6, border-bottom)          │  Height: ~120px
│ ├─ Checkbox + Title + Menu           │  Max lines: 3
│ └─ Description (optional)            │
├─────────────────────────────────────┤
│ METADATA (p-6, bg-gray-50)           │  Height: ~100px
│ ├─ Owner | Due Date | Progress      │  3-column grid
│ └─ Progress bar (if subtasks)       │
├─────────────────────────────────────┤
│ OPTIONAL SECTIONS                   │
│ ├─ Recurrence badge (py-3)          │  Height: ~40px
│ ├─ Collaborators (py-4)             │  Height: ~60px
├─────────────────────────────────────┤
│ SUBTASKS (py-4)                     │  Height: Variable
│ ├─ Expandable section               │
│ ├─ Subtask list                     │
│ └─ Add form (optional)              │
└─────────────────────────────────────┘

Total Minimum Height: 360px
Total Maximum Height: 800px+ (when expanded)
```

### Spacing System

```
Padding:
- p-1 = 4px   (not used)
- p-2 = 8px   (component internals)
- p-3 = 12px  (sections)
- p-4 = 16px  (mobile default)
- p-6 = 24px  (desktop default)

Margins:
- gap-1 = 4px  (tight grouping)
- gap-2 = 8px  (related items)
- gap-3 = 12px (sections)
- gap-4 = 16px (major sections)
- gap-6 = 24px (card spacing)

Grid:
- 1 column on mobile (< 640px)
- 2 columns on tablet (640px - 1024px)
- 3 columns on desktop (1024px+)
- Gap: 24px (6 in Tailwind)
```

## Interaction Patterns

### Hover States

#### Card Hover
```
Before:  border-gray-200, shadow-sm
After:   border-blue-300, shadow-md, transform: translateY(-2px)
Timing:  300ms ease
```

#### Interactive Element Hover
```
Button:  bg-gray-100 → text-blue-600
Icon:    text-gray-400 → text-blue-500
Badge:   bg-blue-50 → bg-blue-100
```

### Click/Focus States

```
Checkbox:  opacity-100 → color-blue-500
Button:    opacity-0 → opacity-100
Input:     border-gray-300 → border-blue-500 + ring-blue-500
Menu:      hidden → visible (with shadow-lg)
```

### Transitions

```
Duration:  300ms standard
Timing:    ease (cubic-bezier(0.4, 0, 0.2, 1))
Property:  all (for general elements)
Property:  transform (for scale/translate)
Property:  opacity (for visibility)
Property:  colors (for background/text)
```

### Animation Keyframes

#### Expand/Collapse
```javascript
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Progress Bar Fill
```javascript
// Animated over 500ms via width transition
.progress-bar {
  transition: width 500ms ease;
}
```

## Component Breakdown

### 1. Header Section

**Purpose**: Task identification and quick actions
**Key Elements**:
- Checkbox (toggle completion)
- Title (editable in advanced version)
- Description (optional)
- Menu button (three dots)

**Responsive Behavior**:
- Desktop: All in one row with wrap
- Tablet: Title takes full width if long
- Mobile: Stacks if description present

### 2. Metadata Section

**Purpose**: At-a-glance task information
**Key Elements**:
- Owner badge (who created task)
- Due date (with status coloring)
- Progress indicator (if subtasks exist)
- Progress bar (visual indicator)

**Status Indicators**:
- Overdue: Red text + Red badge
- Due Today: Orange text + Orange badge
- Due Soon: Gray text
- No due date: Gray text

### 3. Collaborators Section

**Purpose**: Identify who else is involved
**Key Elements**:
- Avatar group (up to 4 shown)
- "+N more" indicator
- Hover delete buttons (owners only)

**Features**:
- Smooth avatar transitions
- Tooltip with full name on hover
- Add collaborator button (owners only)

### 4. Subtasks Section

**Purpose**: Break down task into steps
**Key Elements**:
- Expandable header with count
- Subtask list with checkboxes
- Individual delete buttons
- Add subtask form

**Expanded State**:
- Slide down animation
- Smooth checkbox transitions
- Clear visual feedback

## Dark Mode Implementation

### Color Adjustments

```
Light Mode              Dark Mode
────────────────────────────────────
bg-white           →   bg-gray-800
bg-gray-50         →   bg-gray-700
text-gray-900      →   text-gray-100
text-gray-600      →   text-gray-400
border-gray-200    →   border-gray-700
```

### Usage

```javascript
// Apply dark mode class
<div className={`bg-white ${isDarkMode ? 'dark:bg-gray-800' : ''}`}>

// Or use Tailwind dark: prefix
<div className="bg-white dark:bg-gray-800">
```

## Responsive Breakpoints

```
Mobile (< 640px):
- Single column layout
- Reduced padding: p-4
- Full-width buttons
- Stack metadata vertically
- Show subtasks expanded by default

Tablet (640px - 1024px):
- 2-column grid
- Standard padding: p-6
- Metadata in 2-3 columns
- Subtasks collapsible

Desktop (1024px+):
- 3-column grid (or more)
- Standard padding: p-6
- Metadata in 3-column grid
- Subtasks collapsible by default
```

### Media Queries

```css
/* Mobile First Approach */
.tasks-grid {
  grid-template-columns: 1fr; /* Mobile */
}

@media (min-width: 640px) {
  .tasks-grid {
    grid-template-columns: repeat(2, 1fr); /* Tablet */
  }
}

@media (min-width: 1024px) {
  .tasks-grid {
    grid-template-columns: repeat(3, 1fr); /* Desktop */
  }
}

@media (min-width: 1280px) {
  .tasks-grid {
    grid-template-columns: repeat(4, 1fr); /* Large Desktop */
  }
}
```

In Tailwind: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`

## Accessibility Standards

### WCAG 2.1 Level AA Compliance

**Color Contrast** (4.5:1 minimum for text):
- Gray-900 on Gray-50: ✓ 12.6:1
- Gray-600 on White: ✓ 5.5:1
- Red-600 on White: ✓ 5.3:1
- Blue-600 on White: ✓ 5.8:1

**Keyboard Navigation**:
- Tab order: Checkbox → Title → Menu → Subtasks → Actions
- Enter: Activate buttons
- Space: Toggle checkboxes
- Escape: Close menus

**Screen Reader Support**:
- ARIA labels on all buttons
- Role attributes for custom components
- Live regions for dynamic content
- Semantic HTML (button, form, input)

**Minimum Touch Targets**:
- 44px × 44px (mobile)
- 40px × 40px (desktop)

## Animation Best Practices

### Performance

```javascript
// Use transform and opacity (GPU accelerated)
✓ transform: translateY(-2px)
✓ opacity: 0.5
✓ width: calc via CSS

// Avoid animating these (CPU intensive)
✗ top/left positioning
✗ width/height changes
✗ box-shadow changes
```

### Motion Preferences

```javascript
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Icon System

### Icons Used (Lucide React)

```
Action Icons:
- Circle           → Unchecked checkbox
- CheckCircle2     → Checked checkbox
- MoreVertical     → Menu trigger
- Plus             → Add action
- X                → Close/Delete
- Edit2            → Edit mode
- Share2           → Share action
- Trash2           → Delete confirmation

Information Icons:
- Calendar         → Due date
- Users            → Collaborators
- Progress         → Progress indicator
- Clock            → Time
- AlertCircle      → Alert/Warning
- Repeat2          → Recurrence
- ChevronDown      → Expand/Collapse
```

### Icon Sizing

```
Header/Actions: 20px-24px (w-5, w-6)
Metadata:       16px (w-4)
Labels:         14px (w-3.5)
Lists:          20px (w-5)
```

## States & Variations

### Task Completion State

**Incomplete**:
```
- Opacity: 100%
- Background: white
- Text: gray-900
- Checkbox: empty circle
```

**Complete**:
```
- Opacity: 70%
- Background: gray-50
- Text: gray-400
- Checkbox: green checkmark
- Text decoration: line-through
```

### Due Date States

**Overdue** (past due date):
```
- Badge: Red background
- Text: Red-600
- Icon: AlertCircle (optional)
```

**Due Today**:
```
- Badge: Orange background
- Text: Orange-600
- Icon: Clock (optional)
```

**Due Soon** (1-7 days):
```
- Badge: Gray background
- Text: Gray-900
- Icon: Calendar
```

**No Due Date**:
```
- Text: Gray-400
- Content: "No due date"
```

### Priority States (Advanced)

```
Low:    bg-blue-50,   border-blue-200,   text-blue-700
Medium: bg-amber-50,  border-amber-200,  text-amber-700
High:   bg-orange-50, border-orange-200, text-orange-700
Urgent: bg-red-50,    border-red-200,    text-red-700
```

## Performance Considerations

### Rendering Optimization

```javascript
// Memoize component to prevent unnecessary re-renders
const TaskCard = React.memo(({ task, ...props }) => {
  return (...)
});

// Use useCallback for stable handler references
const handleToggle = useCallback((ownerUid, taskId) => {
  // ...
}, []);
```

### Animation Performance

```javascript
// Use CSS transitions (hardware accelerated)
// Prefer transform over position changes
className="transition-transform duration-300"

// Use will-change sparingly
className="will-change-transform"
```

### Bundle Size

```
Lucide React icons: ~60KB (tree-shakeable)
Tailwind CSS: ~35KB (utility-first, minimal)
Component: ~8KB (minified)
Total: ~103KB
```

## Browser Support Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Flexbox | 90+ ✓ | 88+ ✓ | 14+ ✓ | 90+ ✓ |
| CSS Grid | 90+ ✓ | 88+ ✓ | 14+ ✓ | 90+ ✓ |
| Transitions | 90+ ✓ | 88+ ✓ | 14+ ✓ | 90+ ✓ |
| SVG Icons | 90+ ✓ | 88+ ✓ | 14+ ✓ | 90+ ✓ |

## Future Enhancements

### Planned Features

1. **Drag & Drop**
   - Reorder subtasks
   - Move between lists
   - Assign to different owners

2. **Comments & Activity**
   - Inline comments on tasks
   - Activity timeline
   - Mentions (@username)

3. **Advanced Filtering**
   - Filter by priority
   - Filter by collaborator
   - Filter by date range

4. **Rich Text Editor**
   - Markdown support
   - Code blocks
   - Embedded links

5. **Mobile App**
   - Native iOS/Android
   - Offline support
   - Push notifications

### Experimental Features

- Voice input for task creation
- AI-powered subtask suggestions
- Smart scheduling based on available time
- Integration with calendar apps
- Slack/Teams notifications

## Testing Checklist

### Visual Testing
- [ ] Card renders at all breakpoints
- [ ] Colors meet contrast ratios
- [ ] Animations are smooth
- [ ] Dark mode colors are correct

### Interaction Testing
- [ ] Checkbox toggles completion
- [ ] Menu opens/closes
- [ ] Subtasks expand/collapse
- [ ] Form submission works
- [ ] Delete confirmation appears

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader reads content
- [ ] Touch targets are 44px+
- [ ] No keyboard traps

### Performance Testing
- [ ] Page loads in < 2s
- [ ] 60fps animations
- [ ] No layout shifts
- [ ] Memory usage stable

## Changelog

### Version 2.0 (Current)
- Complete redesign with modern UI
- React + Tailwind CSS
- Improved visual hierarchy
- Better collaborators management
- Streamlined subtasks interface
- Destructive actions in menu
- Full dark mode support
- Mobile-first responsive design

### Version 1.0 (Previous)
- Vanilla JavaScript implementation
- Bootstrap styling
- Cluttered information layout
- Inline delete buttons
- Duplicate collaborators display

## Support & Questions

For questions about the design system:
1. Check the [SETUP_GUIDE.md](./SETUP_GUIDE.md)
2. Review the example implementation in [TasksContainer.jsx](./TasksContainer.jsx)
3. Refer to the advanced features in [TaskCardAdvanced.jsx](./TaskCardAdvanced.jsx)
4. Check Tailwind docs: https://tailwindcss.com
5. Check Lucide docs: https://lucide.dev

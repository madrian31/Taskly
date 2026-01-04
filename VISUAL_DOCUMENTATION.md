# Task Card Component - Visual Documentation

## Component Structure Diagram

```
TaskCard Component
│
├─ Header Section (p-6, border-bottom)
│  ├─ Checkbox (toggle completion)
│  ├─ Title (text-lg, font-semibold)
│  ├─ Description (text-sm, optional)
│  └─ Menu Button (three dots)
│     └─ Dropdown Menu
│        └─ Delete Task (red text)
│
├─ Metadata Section (p-6, bg-gray-50)
│  ├─ 3-Column Grid
│  │  ├─ Owner
│  │  ├─ Due Date (with status color)
│  │  └─ Progress (if subtasks exist)
│  └─ Progress Bar (animated)
│
├─ Recurrence Badge (py-3, if set)
│  └─ Repeat pattern display
│
├─ Collaborators Section (py-4, if any)
│  ├─ Avatar group
│  ├─ Add button (owners only)
│  └─ Delete on hover
│
└─ Subtasks Section (py-4)
   ├─ Expandable header
   ├─ Subtask list (expanded)
   │  ├─ Checkbox
   │  ├─ Title
   │  └─ Delete button (on hover)
   └─ Add form (when expanded)
      ├─ Input field
      └─ Add button
```

## Layout Responsive Breakpoints

### Mobile (< 640px)
```
┌──────────────────────────┐
│ [✓] Task Title           │ p-4
│ Description here         │ Single column
├──────────────────────────┤
│ Owner: You               │ Stack vertically
│ Due: Tomorrow            │ Metadata in column
│ Progress: 2/3            │
├──────────────────────────┤
│ Collaborators (2)        │
├──────────────────────────┤
│ ▼ Subtasks (2/3)         │ Expandable
└──────────────────────────┘
Width: 100% of screen
Padding: 16px
```

### Tablet (640px - 1024px)
```
┌─────────────────┬─────────────────┐
│ [✓] Task Title  │ Menu            │ p-6
│ Description     │                 │ 2 columns
├─────────────────┴─────────────────┤
│ Owner | Due | Progress            │ 3 columns
│ ████████░░░░░░░░░░░░░░░░ 33%     │ Progress bar
├─────────────────────────────────┤
│ Collaborators (scrollable)      │
├─────────────────────────────────┤
│ ▼ Subtasks (2/3)                │
│ ├─ [✓] Subtask 1               │ Expanded list
│ ├─ [ ] Subtask 2               │
│ └─ [ ] Subtask 3               │
└─────────────────────────────────┘
Width: 2 columns per row
Gap: 24px
```

### Desktop (1024px+)
```
┌──────────────────────────────────┐
│ [✓] Task Title            Menu   │ p-6
│ Optional description here         │ Full width
├──────────────────────────────────┤
│ Owner: John  │ Due: Jan 15  │ 3/5  │ Grid: 3 col
│ ████████░░░░ 60%                │ Smooth bar
├──────────────────────────────────┤
│ Repeats: Weekly                 │
├──────────────────────────────────┤
│ Collaborators:                  │ Avatar group
│ [👤] Jane [👤] Bob [👤] Alice  │
├──────────────────────────────────┤
│ ▼ Subtasks (3/5)                │
│ ├─ [✓] Subtask 1               │ Smooth expand
│ ├─ [✓] Subtask 2               │
│ ├─ [ ] Subtask 3               │
│ ├─ [ ] Subtask 4               │
│ ├─ [ ] Subtask 5               │
│ └─ [+] Add subtask input        │
└──────────────────────────────────┘
Width: 450px (typical in grid)
Max 3-4 columns on large desktop
```

## State Diagrams

### Task Completion State Flow
```
             ┌─────────────────┐
             │   Task Created  │
             │   completed: false
             └────────┬────────┘
                      │
                  [Click ✓]
                      │
                      ▼
             ┌─────────────────┐
             │  Task Completed │ ← Animate checkmark
             │ completed: true  │   Fade opacity
             │ background: gray │   Strike through
             └────────┬────────┘
                      │
                  [Click ✓ again]
                      │
                      ▼
             ┌─────────────────┐
             │  Task Active    │ ← Reverse animation
             │ completed: false │
             └─────────────────┘
```

### Subtasks Expansion State
```
    ┌──────────────────────┐
    │  Collapsed State      │
    │  ▼ Subtasks (2/3)    │
    │  [Show subtasks...]  │
    └──────────────────────┘
              │
        [Click chevron]
              │
              ▼ Slide down animation
    ┌──────────────────────┐
    │  Expanded State      │
    │  ▲ Subtasks (2/3)    │
    │  ├─ [✓] Sub 1        │
    │  ├─ [ ] Sub 2        │ ← List appears
    │  ├─ [ ] Sub 3        │
    │  └─ [+] Add          │
    └──────────────────────┘
```

### Menu State
```
    ┌─────────────┐
    │  [⋮] Button │
    └──────┬──────┘
           │
      [Click]
           │
           ▼
    ┌─────────────────┐
    │ ▼ Delete Task   │ ← Slide down
    │   (red text)    │
    └─────────────────┘
           │
    [Click outside]
           │
           ▼ Slide up
    ┌─────────────┐
    │  [⋮] Button │ (back to original)
    └─────────────┘
```

## Color System

### Neutral Palette
```
Background Colors:
┌─────────┬──────────┬───────────┐
│ white   │ gray-50  │ gray-100  │
│ #ffffff │ #f9fafb │ #f3f4f6   │
└─────────┴──────────┴───────────┘

Text Colors:
┌──────────┬────────────┬────────────┐
│ gray-900 │ gray-600   │ gray-400   │
│ #111827  │ #4b5563    │ #9ca3af    │
└──────────┴────────────┴────────────┘

Border Colors:
┌────────────┬────────────┬────────────┐
│ gray-200   │ gray-300   │ gray-700   │
│ #e5e7eb    │ #d1d5db    │ #374151    │
└────────────┴────────────┴────────────┘
```

### Status Colors
```
Success (Completed):
┌────────────────────┐
│ bg: green-500      │ #10b981
│ text: green-600    │ #059669
└────────────────────┘

Overdue:
┌────────────────────┐
│ bg: red-600        │ #dc2626
│ text: red-700      │ #b91c1c
└────────────────────┘

Due Today:
┌────────────────────┐
│ bg: orange-600     │ #ea580c
│ text: orange-700   │ #c2410c
└────────────────────┘

Primary Actions:
┌────────────────────┐
│ bg: blue-600       │ #2563eb
│ text: blue-600     │ #2563eb
└────────────────────┘
```

### Dark Mode Transformation
```
Light Mode              Dark Mode
──────────────────────────────────
bg-white          →     bg-gray-800
bg-gray-50        →     bg-gray-700
text-gray-900     →     text-gray-100
text-gray-600     →     text-gray-400
border-gray-200   →     border-gray-700
```

## Animation Timeline

### Click to Complete (300ms)
```
0ms:     [○] Button clicked
         └─ Opacity: 100%

100ms:   ◐ (rotating circle) ← CSS animation
         └─ Opacity: 90%

200ms:   ◑ (almost complete)
         └─ Opacity: 100%

300ms:   ✓ (checkmark, green)
         └─ Complete state reached
         
Post:    Card opacity reduced to 70%
         Text gains line-through
         Background becomes gray-50
```

### Expand Subtasks (300ms)
```
0ms:     ▼ Chevron at 0°
         Subtasks hidden (max-height: 0)
         Opacity: 0

100ms:   ◆ (rotating)
         max-height: increasing
         Opacity: 0.5

200ms:   ▲ (almost rotated)
         max-height: full
         Opacity: 0.8

300ms:   ▲ (fully rotated)
         Subtasks visible
         Opacity: 100%
```

### Hover Effects (Instant)
```
Before Hover:
┌──────────────────┐
│ shadow: sm       │ 0 1px 2px rgba(0,0,0,0.05)
│ border: gray-200 │
└──────────────────┘

On Hover (0ms):
┌──────────────────┐
│ shadow: md       │ 0 4px 6px rgba(0,0,0,0.1)
│ border: blue-300 │ ← Color change
│ transform: -2px  │ ← Slight lift
└──────────────────┘
Transition: 300ms ease
```

## Spacing Scale

```
Margin/Padding System:
┌─────┬──────┬────┐
│ p-1 │ 4px  │ ░  │
│ p-2 │ 8px  │ ░░ │
│ p-3 │ 12px │ ░░░ │
│ p-4 │ 16px │ ░░░░ │
│ p-6 │ 24px │ ░░░░░░ │
│ p-8 │ 32px │ ░░░░░░░░ │
└─────┴──────┴────┘

Gap Between Elements:
┌─────┬──────┬──────────┐
│ gap-2 │ 8px  │ Small spacing   │
│ gap-3 │ 12px │ Medium spacing  │
│ gap-4 │ 16px │ Large spacing   │
│ gap-6 │ 24px │ Extra large     │
└─────┴──────┴──────────┘
```

## Typography Hierarchy

```
Task Title (h3)
├─ Font Size: 18px (text-lg)
├─ Font Weight: 600 (semibold)
├─ Line Height: 1.5 (relaxed)
├─ Color: gray-900
└─ Margin Bottom: 8px (mt-1)

Description (p)
├─ Font Size: 14px (text-sm)
├─ Font Weight: 400 (normal)
├─ Color: gray-600
└─ Margin Top: 4px

Metadata Label
├─ Font Size: 11px (text-xs)
├─ Font Weight: 600 (semibold)
├─ Letter Spacing: 0.05em (tracking-wide)
├─ Text Transform: uppercase
└─ Color: gray-500

Metadata Value
├─ Font Size: 14px (text-sm)
├─ Font Weight: 500 (medium)
└─ Color: gray-900
```

## Touch Interaction Zones (Mobile)

```
┌────────────────────────────────┐
│ Checkbox (44×44px)             │ Easy tap
├────────────────────────────────┤
│ ┌──────────────────────────┐   │
│ │ Title (44px min height)  │   │ Easy tap
│ └──────────────────────────┘   │
├────────────────────────────────┤
│ Description (if visible)        │ Easy tap
├────────────────────────────────┤
│ Menu Button (44×44px)  ⋮       │ Easy tap
├────────────────────────────────┤
│ Owner | Due | Progress          │
│ (no interaction zone)           │
├────────────────────────────────┤
│ [✓] Subtask 1    [x] delete     │ Easy tap
│ (44px height min)               │
│                                 │
│ [✓] Subtask 2    [x] delete     │ Easy tap
└────────────────────────────────┘

All interactive elements: ≥ 44px × 44px
Spacing between: ≥ 8px
```

## Data Flow Diagram

```
Parent Component
│
├─ Task Data (props)
│  ├─ title
│  ├─ description
│  ├─ completed
│  ├─ collaborators
│  └─ subtasks
│
├─ Handlers (callbacks)
│  ├─ onToggleComplete
│  ├─ onDeleteTask
│  ├─ onAddSubtask
│  ├─ onToggleSubtask
│  └─ ...more
│
▼
TaskCard Component
│
├─ Local State
│  ├─ isExpanded (subtasks)
│  ├─ showMenu
│  ├─ newSubtaskTitle
│  └─ editMode (if advanced)
│
├─ Event Handlers
│  └─ Call parent callbacks
│
└─ Render
   └─ Display UI
      └─ Parent updates data
         └─ Component re-renders
            └─ Cycle repeats
```

## Performance Metrics

### Rendering Performance
```
Initial Load: < 100ms
State Change: < 16ms (for 60fps)
Animation: 300ms (smooth)
Memory per card: ~8KB
```

### Visual Feedback Timeline
```
User Action          Response Time   Feedback
──────────────────────────────────────────────
Click checkbox       Immediate       Checkmark animation
Click menu           Immediate       Menu slides down
Click delete         0ms             Confirmation modal
Type subtask         0ms             Instant text update
Click add subtask    Immediate       Form submission
Hover on button      0ms             Background color change
```

## Accessibility Zones

```
Visual Focus Indicators:
┌──────────────────────────────────┐
│ Focused element shows:            │
│ ├─ Outline: 2px solid blue-500  │ ← Clear ring
│ ├─ Offset: 2px                  │ ← Space from edge
│ └─ Color contrast: 4.5:1+        │ ← Visible
├──────────────────────────────────┤
│ Focus Order (Tab key):           │
│ 1. Checkbox                      │
│ 2. Title (if editable)           │
│ 3. Menu button                   │
│ 4. Subtasks chevron              │
│ 5. Subtask checkboxes (if expanded)
│ 6. Add form (if expanded)        │
│ 7. Next card                     │
└──────────────────────────────────┘
```

## Icon Usage Reference

```
Unchecked Task:    ○ Circle
Checked Task:      ✓ CheckCircle2
Expand:           ▼ ChevronDown
Menu:             ⋮ MoreVertical
Add:              + Plus
Close/Delete:     ✕ X
Edit:             ✎ Edit2
Calendar:         📅 Calendar
Users:            👥 Users
Progress:         ▯ Progress
Repeat:           ↻ Repeat2
Share:            ⤴ Share2
Trash:            🗑 Trash2
```

---

This visual documentation helps with:
- Understanding component layout
- Visualizing state changes
- Planning responsive designs
- Communicating with designers
- Training new team members
- Creating technical specifications

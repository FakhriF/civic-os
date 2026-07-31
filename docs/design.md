# 🎨 CivicOS Design System & UI Specifications

> **Target Platform**: Internal Government Administration & Municipal Operations  
> **UI Library**: Mantine UI 7+  
> **Icon Set**: Tabler Icons (`@tabler/icons-react`)  
> **Primary Font**: Inter (Google Fonts)  

---

## 🎯 Design Philosophy

CivicOS is built to power critical municipal workflows. The UI architecture is guided by three non-negotiable principles:

1. **Clarity Over Decoration**  
   Every visual element must serve a functional purpose. Eliminate unnecessary flourishes, heavy drop shadows, or low-contrast text.

2. **Consistency Over Creativity**  
   Components across all modules follow identical structural patterns, spacing rules, and interaction states.

3. **Efficiency Over Visual Effects**  
   Prioritize rapid keyboard navigation, high data density, fast page loads, and clear data hierarchy over flashy transitions.

---

## 💡 Design Inspirations

- **Linear**: Clean layout grid, fast keyboard navigation, subtle borders.
- **Stripe Dashboard**: High visual clarity, intuitive status badges, clear metric cards.
- **GitHub**: Efficient data density, clear table structures, functional markdown views.
- **Mantine Documentation**: Component consistency, clean theme tokens, accessible defaults.

---

## 🎨 Design Tokens & Color Palette

### Semantic Color Tokens

| Semantic Token | Swatch | Hex Code | Purpose & Usage |
| :--- | :--- | :--- | :--- |
| **Primary (Blue)** | `Blue 6` | `#1C7ED6` | Primary actions, active navigation, active tabs, focus rings |
| **Success (Green)** | `Green 6` | `#37B24D` | Positive statuses (`Published`, `Active`, successful saves) |
| **Warning (Yellow)** | `Yellow 6` | `#F59F00` | Cautionary states (`Draft`, pending approvals, expiring sessions) |
| **Danger (Red)** | `Red 6` | `#F03E3E` | Destructive actions (`Delete`, `Revoke`, system alerts) |
| **Information (Cyan)** | `Cyan 6` | `#1098AD` | Informational callouts, secondary metrics, context tooltips |
| **Background (Light)** | `Gray 0` | `#F8F9FA` | Main application backdrop |
| **Surface (Card/Modal)**| `White` | `#FFFFFF` | Card containers, modal overlays, popovers |
| **Text Primary** | `Gray 9` | `#212529` | Headings, primary body text, table data |
| **Text Secondary** | `Gray 6` | `#868E96` | Subtitles, helper text, disabled states |

---

## 📐 Typography & Spacing Scale

### Typography Hierarchy

- **Primary Font Family**: `'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
- **Monospace Font**: `'JetBrains Mono', 'Fira Code', monospace` (for IDs, codes, logs)

| Level | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Heading 1** | `28px (1.75rem)` | `700 (Bold)` | `1.2` | Page titles |
| **Heading 2** | `22px (1.375rem)`| `600 (SemiBold)`| `1.3` | Section headings, modal titles |
| **Heading 3** | `18px (1.125rem)`| `600 (SemiBold)`| `1.4` | Card titles, drawer headers |
| **Body Large** | `16px (1.0rem)` | `400 (Regular)` | `1.5` | Prominent body text, lead paragraphs |
| **Body Default**| `14px (0.875rem)`| `400 (Regular)` | `1.5` | Form inputs, table cells, standard text |
| **Caption / Small**| `12px (0.75rem)`| `500 (Medium)`  | `1.4` | Badges, timestamps, form field hints |

### Spacing Scale (4px Base Unit)

```text
4px (xs)  ➔  8px (sm)  ➔  16px (md)  ➔  24px (lg)  ➔  32px (xl)  ➔  48px (2xl)  ➔  64px (3xl)
```

- **Gap between form fields**: `16px` (`md`)
- **Card padding**: `24px` (`lg`)
- **Page container padding**: `32px` (`xl`)

### Border Radius & Depth

- **Default Radius**: `6px` (`md`) across buttons, inputs, cards, and badges.
- **Shadows**: Minimal elevation (`sm` / `md`). Rely on crisp `1px` borders (`#E9ECEF`) for separation.

---

## 🖥️ Layout & Component Standards

### Application Shell Layout

```text
+---------------------------------------------------------------------------+
| CivicOS Header  [Search...]              [Notifications] [User]           |
+-----------------------+---------------------------------------------------+
| Sidebar Navigation    | Main Content Area                                 |
|                       |                                                   |
|  • Dashboard          |  +------------------------------------------+     |
|  • Citizens           |  | Page Header (Title + Action Buttons)     |     |
|  • Announcements      |  +------------------------------------------+     |
|  • Departments        |  |                                          |     |
|  • System Users       |  | Data Table / Form Content                |     |
|  • Settings           |  |                                          |     |
+-----------------------+---------------------------------------------------+
```

### Dashboard Metric Card Template

```text
+------------------------------------------+
| Total Registered Citizens                |
|                                          |
|  124,530                                 |
|  +4.6% vs last quarter                   |
+------------------------------------------+
```

---

## 🔘 Button Guidelines

| Button Variant | Styling | Example Action | Context Rule |
| :--- | :--- | :--- | :--- |
| **Primary** | Solid Blue (`#1C7ED6`) | `Submit`, `Create Citizen` | Max 1 primary button per view section |
| **Secondary** | Outline / Neutral Gray | `Cancel`, `Back`, `Export CSV` | Used for non-primary actions |
| **Danger** | Solid Red (`#F03E3E`) | `Delete Record`, `Revoke Access` | Trigger confirmation modal before executing |

---

## 📊 Data Table Standards

Every table view across CivicOS modules must include:

1. **Toolbar Header**: Search input, module filters, export button, primary creation action.
2. **Column Features**: Explicit headers, sort toggles for date/name/status.
3. **States**:
   - **Loading State**: Skeleton loader rows (min 5 rows).
   - **Empty State**: Friendly graphic with "No records found" and a clear reset/action button.
4. **Pagination**: Page size selector (10, 25, 50 rows) and page navigation buttons.

---

## ♿ Accessibility & Responsiveness

- **Color Contrast**: All text must meet WCAG 2.1 AA contrast ratio (minimum 4.5:1).
- **Keyboard Navigation**: All interactive elements must exhibit visible focus rings and support full keyboard operation (`Tab`, `Enter`, `Space`, `Esc`).
- **Form Controls**: Labels strictly placed above inputs, paired with explicit `aria-describedby` error messaging.
- **Breakpoints**:
  - `Mobile (<768px)`: Essential data viewing, drawer menus.
  - `Tablet (768px - 1024px)`: Compact table views and multi-column forms.
  - `Desktop (>1024px)`: Full multi-pane dashboard experience.
# Content AI Manager - Design System

This document outlines the design tokens, aesthetic principles, and component usage for the **Content AI Manager** application. The design uses a "Clean Slate" philosophy—a professional, distraction-free interface utilizing a `Slate` neutral scale with `Teal` as the primary brand color to signify creativity and precision.

## 1. Brand Assets

### Logo
The application uses a logo image located at `/logo.png`.
- **Placement**: Top-left of the Sidebar.
- **Height**: Fixed at `h-8` to `h-10` (32px-40px) for consistency.
- **Style**: Clean, organic, likely featuring leaf/nature motifs combined with typography to represent "Growth" and "Content".

---

## 2. Color Palette

The application heavily utilizes Tailwind CSS `slate` for structure and `teal` for interaction.

### Primary Colors (Teal)
Used for primary actions, active states, and focus rings.

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `teal-50` | `#f0fdfa` | Active navigation backgrounds, subtle accents. |
| `teal-100` | `#ccfbf1` | Selection backgrounds, hover fills. |
| `teal-400` | `#2dd4bf` | UI borders on active elements. |
| `teal-500` | `#14b8a6` | Focus rings, icons. |
| `teal-600` | `#0d9488` | **Primary Buttons**, brand text. |
| `teal-700` | `#0f766e` | Button hover states. |

### Neutral Scale (Slate)
Used for backgrounds, borders, and text hierarchies.

| Token | Hex | Usage |
| :--- | :--- | :--- |
| `slate-50` | `#f8fafc` | Main application background (sidebar, app shell). |
| `slate-100` | `#f1f5f9` | Card headers, table rows hover, scrollbar tracks. |
| `slate-200` | `#e2e8f0` | Borders, dividers. |
| `slate-300` | `#cbd5e1` | Input borders, placeholders, scrollbar thumbs. |
| `slate-400` | `#94a3b8` | Inactive icons, helper text. |
| `slate-500` | `#64748b` | Meta text, table headers. |
| `slate-600` | `#475569` | Secondary text, body content. |
| `slate-900` | `#0f172a` | Primary headings, main text, dark buttons. |

### Semantic Colors
- **Success**: `emerald-50` (bg) / `emerald-700` (text) — *Published, Approved*
- **Warning**: `amber-50` (bg) / `amber-600` (text) — *Scheduled, Pending*
- **Error**: `red-50` (bg) / `red-700` (text) — *Deleted, Error*
- **Info**: `blue-50` (bg) / `blue-700` (text) — *Sent*
- **Template**: `purple-50` (bg) / `purple-700` (text) — *Templates*

---

## 3. Typography

### Fonts
- **Primary**: `Inter` (sans-serif) — UI Elements, Body text.
- **Monospace**: `JetBrains Mono` — Dates, IDs, Stats.

### Hierarchy
- **Page Titles**: `text-2xl font-bold tracking-tight text-slate-900`
- **Section Headers**: `text-lg font-bold text-slate-800`
- **Labels**: `text-xs font-bold text-slate-500 uppercase tracking-wider`
- **Body**: `text-sm text-slate-600`

---

## 4. Component Classes

### Buttons

**Primary (Brand)**
```jsx
<button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm shadow-teal-600/20">
  <Icon name="add" className="text-lg"/>
  <span>Create New</span>
</button>
```

**Secondary (Outline)**
```jsx
<button className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
  <Icon name="refresh" />
</button>
```

**Dark (Utility/Generate)**
```jsx
<button className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md">
  Generate
</button>
```

### Inputs
Standardized inputs with specific focus states.
```jsx
<input 
  className="w-full p-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 placeholder-slate-400 transition-all"
/>
```

### Cards
Containers for lists and data.
```jsx
<div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
  {/* Content */}
</div>
```

---

## 5. Layout & Spacing

- **Sidebar Width**: `w-64` (Fixed)
- **Global Background**: `bg-slate-50`
- **Content Container**: `max-w-6xl mx-auto` (For editors)
- **Scrollbars**: Custom "Medical Grade" styles defined in `index.html` (8px width, Slate-300 thumb).

## 6. Animations

- **Fade In**: `animate-fade-in` (for page transitions).
- **Modal Entry**: `animate-in fade-in zoom-in-95 duration-200`.
- **Spin**: `animate-spin` (for loading states).

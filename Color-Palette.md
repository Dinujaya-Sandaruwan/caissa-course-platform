# Enhanced Professional Color Palette

This document contains the core color palette defined for the project. These colors have been integrated into `src/app/globals.css` and mapped to Tailwind CSS tokens, meaning you can directly use them via Tailwind classes (e.g., `text-primary-red`, `bg-dark-bg`, `text-success-green`).

## 🔴 Primary & Accent Reds

| Variable Name   | Hex Code  | Utility Class (Text / Background)         |
| :-------------- | :-------- | :---------------------------------------- |
| `primary-red`   | `#dc2626` | `text-primary-red` / `bg-primary-red`     |
| `secondary-red` | `#b91c1c` | `text-secondary-red` / `bg-secondary-red` |
| `accent-red`    | `#ef4444` | `text-accent-red` / `bg-accent-red`       |
| `light-red`     | `#fca5a5` | `text-light-red` / `bg-light-red`         |
| `lighter-red`   | `#fecaca` | `text-lighter-red` / `bg-lighter-red`     |
| `lightest-red`  | `#fee2e2` | `text-lightest-red` / `bg-lightest-red`   |

## ⚪ Neutrals & Gradients

| Variable Name | Hex Code  | Utility Class  |
| :------------ | :-------- | :------------- |
| `dark-bg`     | `#0a0a0a` | `bg-dark-bg`   |
| `darker-bg`   | `#030303` | `bg-darker-bg` |
| `white`       | `#ffffff` | `bg-white`     |
| `off-white`   | `#fafafa` | `bg-off-white` |

**Refined Grays:**
Mapped as standard variables (`gray-50` through `gray-900`).
`#fafafa`, `#f4f4f5`, `#e4e4e7`, `#d4d4d8`, `#a1a1aa`, `#71717a`, `#52525b`, `#3f3f46`, `#27272a`, `#18181b`.

## 🎨 Accent Colors

| Function / Color | Hex Code  | Utility Class                               |
| :--------------- | :-------- | :------------------------------------------ |
| `success-green`  | `#16a34a` | `text-success-green` / `bg-success-green`   |
| `light-green`    | `#4ade80` | `text-light-green` / `bg-light-green`       |
| `warning-yellow` | `#eab308` | `text-warning-yellow` / `bg-warning-yellow` |
| `warning-orange` | `#f97316` | `text-warning-orange` / `bg-warning-orange` |
| `error-red`      | `#dc2626` | `text-error-red` / `bg-error-red`           |
| `info-blue`      | `#2563eb` | `text-info-blue` / `bg-info-blue`           |
| `purple`         | `#7c3aed` | `text-purple` / `bg-purple`                 |
| `light-purple`   | `#a78bfa` | `text-light-purple` / `bg-light-purple`     |
| `black`          | `#000000` | `text-black` / `bg-black`                   |

## 🌈 Professional Gradients

These gradients are built using CSS Native values and the CSS `color-mix` function for perfect alpha-transparency matching.

You can use them in Tailwind using the arbitrary CSS variable syntax, for example: `bg-[image:var(--gradient-primary)]`.

| Variable             | Description                                          |
| :------------------- | :--------------------------------------------------- |
| `--gradient-primary` | 135deg slope from Primary Red to Accent Red          |
| `--gradient-soft`    | 135deg slope soft red background (10% to 5% opacity) |
| `--gradient-success` | 135deg slope from Success Green to Light Green       |
| `--gradient-purple`  | 135deg slope from Purple to Light Purple             |
| `--gradient-subtle`  | Very soft subtle primary red (3% to 1% opacity)      |

### Usage Example:

```html
<!-- Text color example -->
<h1 class="text-primary-red">Hello World</h1>

<!-- Background color example -->
<div class="bg-darker-bg border border-gray-800">Card content</div>

<!-- Gradient usage example -->
<div class="bg-[image:var(--gradient-primary)] text-white">
  Gradient Background
</div>
```

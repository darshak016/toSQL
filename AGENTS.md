# Agent Instructions: UI Development & Frontend Testing

## 1. Project Stack & Architecture Overview
- **Framework**: React 19 + TypeScript (Strict mode enabled).
- **Build & Dev Tool**: Vite.
- **Styling**: Tailwind CSS v4 with Cohere-inspired design tokens and CSS custom variables (`var(--cohere-*)`, `var(--bg-*)`).
- **Icons**: Custom SVG components defined in `frontend/src/components/Icons.tsx`.
- **Test Runner & Environment**: Vitest + JSDOM + `@testing-library/react` + `@testing-library/user-event` + `@vitest/coverage-v8`.

---

## 2. UI Component Rules & Design Guidelines

### A. Design System & Aesthetics
- **Theme Consistency**: Every component must respect the dual theme system (Light and Dark mode) using the designated CSS variables (`var(--bg-card)`, `var(--cohere-hairline)`, `var(--text-primary)`, `var(--cohere-coral)`, `var(--cohere-deep-green)`).
- **Zero Raw Hex Hardcoding**: Avoid hardcoding raw arbitrary colors like `#fff` or `#000` unless defining an intentional CSS variable fallback.
- **Accessibility First**:
  - All interactive buttons must have accessible names or `aria-label` attributes if icon-only.
  - Modals must include `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and support dismissal via the `Escape` key and backdrop click.
  - Form fields must have corresponding `<label>` tags or explicit `aria-label` attributes.
- **No Layout Shifts**:
  - Use skeleton loaders or fixed-dimension placeholders for asynchronous states (e.g., query execution, schema loading).
  - Handle truncated text with `text-ellipsis` and `overflow-hidden` with tooltips where necessary.

### B. State & Component Hygiene
- Prefer controlled components for forms and inputs.
- Clean up side effects and event listeners in `useEffect` cleanup return functions.
- Keep components modular: extract repeated subcomponents (e.g., badges, code blocks, row actions) into dedicated component files.

---

## 3. Testing Standards (`*.test.tsx`)

### A. Test File Organization
- Every component in `frontend/src/components/<Name>.tsx` must have a corresponding test file located at `frontend/src/components/<Name>.test.tsx`.
- Use standard `describe('<ComponentName> Component', () => { ... })` blocks.

### B. User-Centric Testing Principles
- **Query via Accessible Roles**:
  - Prefer `screen.getByRole('button', { name: /.../i })`, `screen.getByLabelText(...)`, or `screen.getByText(...)`.
  - Avoid querying by test IDs (`getByTestId`) unless an accessible role is practically impossible to target.
- **Simulate Real User Interactions**:
  - Prefer `const user = userEvent.setup();` followed by `await user.click(...)` or `await user.type(...)` over `fireEvent`.
- **Mock External Interfaces Cleanly**:
  - Mock browser APIs (e.g., `navigator.clipboard.writeText`, `window.matchMedia`, `ResizeObserver`) using `vi.fn()`.
  - Clear mocks in `beforeEach(() => { vi.clearAllMocks(); })`.

### C. Test Coverage Requirements
Every component test suite must cover:
1. **Empty/Null State**: Renders correctly (or returns `null`) when primary props are absent or empty.
2. **Initial Render State**: Verifies presence of key text, badges, icons, and action buttons.
3. **Interactive Actions**:
   - Button clicks trigger the expected callback prop with correct arguments.
   - User input updates the local state and triggers propagation callbacks.
4. **Conditional & Loading States**:
   - Loading spinners / disabled buttons when `isLoading={true}` or `isExplaining={true}`.
   - Error messages or alerts when failure conditions are met.
5. **Edge Cases**:
   - Clipboard write rejection / fallbacks.
   - Long strings or empty array handling.

---

## 4. Verification Workflow (Mandatory Checklist for Agents)

Before completing any UI or testing task, execute the following commands in `frontend/`:

1. **Lint Check**:
   ```bash
   npm run lint
   ```
2. **TypeScript Compilation Check**:
   ```bash
   npx tsc --noEmit
   ```
3. **Targeted Component Test**:
   ```bash
   npx vitest run src/components/<Component>.test.tsx
   ```
4. **Coverage Audit** (Target: >80% Line & Branch Coverage):
   ```bash
   npm run test:coverage
   ```
5. **Full Suite Regression Check**:
   ```bash
   npm run test:run
   ```

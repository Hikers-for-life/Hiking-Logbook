# Third-Party Code Documentation & Justification

This document identifies all **third-party code, libraries, and frameworks** used in the project and provides justification for their inclusion.  
The goal is to acknowledge external contributions and explain why these dependencies were necessary instead of implementing everything from scratch.

---

## 1. Core Frameworks
- **React (`react`, `react-dom`, `react-scripts`)**
  - **Source:** [ReactJS](https://react.dev)
  - **Justification:** Provides a component-based UI library that enables efficient rendering and state management. Using React avoids reinventing a modern frontend framework.

- **React Router (`react-router-dom`)**
  - **Source:** [React Router](https://reactrouter.com)
  - **Justification:** Handles client-side routing in a declarative way, which is safer and more maintainable than building a custom router.

---

## 2. UI & Styling
- **Tailwind CSS (`tailwindcss`, `tailwindcss-animate`, `tailwind-merge`)**
  - **Source:** [TailwindCSS](https://tailwindcss.com)
  - **Justification:** Provides a utility-first CSS framework that improves consistency and developer productivity. Animation and merge helpers reduce boilerplate.

- **Radix UI Components (`@radix-ui/react-*`)**
  - **Source:** [Radix UI](https://www.radix-ui.com)
  - **Justification:** Provides accessible, unstyled UI primitives (dialogs, dropdowns, tooltips, etc.). These save significant time while ensuring WCAG compliance.

- **Lucide React (`lucide-react`), React Icons (`react-icons`), FontAwesome (`@fortawesome/*`)**
  - **Source:** [Lucide](https://lucide.dev), [React Icons](https://react-icons.github.io), [FontAwesome](https://fontawesome.com)
  - **Justification:** Supplies high-quality, scalable icons. This avoids manually creating and maintaining SVGs.

- **Embla Carousel (`embla-carousel-react`)**
  - **Source:** [Embla Carousel](https://www.embla-carousel.com)
  - **Justification:** Handles performant, accessible carousels, which would be non-trivial to implement from scratch.

- **Recharts (`recharts`)**
  - **Source:** [Recharts](https://recharts.org)
  - **Justification:** Provides chart components built on D3, saving time compared to building custom visualization logic.

---

## 3. Forms & Validation
- **React Hook Form (`react-hook-form`), Hookform Resolvers (`@hookform/resolvers`)**
  - **Source:** [React Hook Form](https://react-hook-form.com)
  - **Justification:** Simplifies form handling and integrates well with validation libraries like Zod.

- **Zod (`zod`)**
  - **Source:** [Zod](https://zod.dev)
  - **Justification:** A schema validation library that ensures runtime safety of form inputs, avoiding manual validation logic.

- **Input OTP (`input-otp`)**
  - **Source:** [npm input-otp](https://www.npmjs.com/package/input-otp)
  - **Justification:** Provides a tested, accessible One-Time Password (OTP) input component.

---

## 4. State & Data Management
- **TanStack React Query (`@tanstack/react-query`)**
  - **Source:** [TanStack Query](https://tanstack.com/query)
  - **Justification:** Handles asynchronous data fetching, caching, and synchronization more reliably than custom `useEffect` solutions.

- **Firebase (`firebase`)**
  - **Source:** [Firebase](https://firebase.google.com)
  - **Justification:** Provides authentication, Firestore database, and storage services. Replacing this with a custom backend would require significant development effort.

---

## 5. Utilities
- **Date-fns (`date-fns`)**
  - **Source:** [Date-fns](https://date-fns.org)
  - **Justification:** Provides robust date manipulation utilities. More reliable and performant than writing custom date logic.

- **clsx, class-variance-authority**
  - **Source:** [clsx](https://github.com/lukeed/clsx), [cva](https://github.com/joe-bell/cva)
  - **Justification:** Helps conditionally join classNames and manage component variants, reducing complexity in styling logic.

- **Cmdk (`cmdk`)**
  - **Source:** [cmdk](https://cmdk.paco.me)
  - **Justification:** Provides a prebuilt command palette component, enhancing UX without reinventing the feature.

- **Sonner (`sonner`)**
  - **Source:** [sonner.dev](https://sonner.emilkowal.ski)
  - **Justification:** Lightweight, accessible toast notifications, avoiding custom notification logic.

- **Next Themes (`next-themes`)**
  - **Source:** [next-themes](https://github.com/pacocoursey/next-themes)
  - **Justification:** Provides theme switching (light/dark), ensuring accessibility and user preference compliance.

---

## 6. Testing
- **Jest (`jest`, `babel-jest`)**
  - **Source:** [Jest](https://jestjs.io)
  - **Justification:** Provides a widely used testing framework with excellent ecosystem support.

- **Testing Library (`@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `@testing-library/dom`)**
  - **Source:** [Testing Library](https://testing-library.com)
  - **Justification:** Encourages testing from the user’s perspective, reducing reliance on implementation details.

---

## 7. Build & Tooling
- **Babel (`@babel/*`)**
  - **Source:** [Babel](https://babeljs.io)
  - **Justification:** Transpiles modern JavaScript (ESNext) and JSX into browser-compatible code.

- **ESLint & Prettier (`eslint`, `eslint-plugin-react`, `prettier`)**
  - **Source:** [ESLint](https://eslint.org), [Prettier](https://prettier.io)
  - **Justification:** Enforces consistent coding style and catches potential errors early.

- **PostCSS & Autoprefixer (`postcss`, `autoprefixer`)**
  - **Source:** [PostCSS](https://postcss.org)
  - **Justification:** Ensures CSS compatibility across browsers, avoiding manual vendor prefixing.

---

## 8. Miscellaneous
- **React Day Picker (`react-day-picker`)**
  - **Source:** [react-day-picker](https://react-day-picker.js.org)
  - **Justification:** Provides a highly customizable date picker component.

- **React Resizable Panels (`react-resizable-panels`)**
  - **Source:** [react-resizable-panels](https://react-resizable-panels.vercel.app)
  - **Justification:** Implements split-pane layouts, which are complex to build from scratch.

- **Web Vitals (`web-vitals`)**
  - **Source:** [web-vitals](https://github.com/GoogleChrome/web-vitals)
  - **Justification:** Provides metrics to monitor performance (LCP, FID, CLS), essential for modern UX.

---

# Summary
Every third-party library included was chosen **to avoid reinventing complex features**, improve **developer productivity**, and ensure **robustness** through community-tested solutions.  
Wherever possible, libraries with strong community support and active maintenance were preferred.


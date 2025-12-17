# Agent Guidelines for URL Summarization

> **Purpose**: This document provides AI coding assistants with authoritative guidance for working in this codebase. Follow these conventions strictly.

---

## Tech Stack Overview

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| Runtime | Node.js | >=22 | Required by `engines` |
| Framework | Next.js | 16.0.10 | App Router, React 19 support |
| UI | React | 19.2.0 | Server Components default |
| Language | TypeScript | 5.9.2 | Strict mode enabled |
| Package Manager | pnpm | 10.23.0 | Workspace protocol |
| Monorepo | Turborepo | 2.6.3 | Task orchestration |
| Database | PostgreSQL | 17 | Via Docker |
| ORM | Prisma | 6.19.1 | Schema-first |
| API | tRPC | 11.8.0 | Type-safe RPC |
| State | TanStack Query | 5.90.12 | Server state management |
| Validation | Zod | 4.2.1 | Runtime + static validation |
| Styling | Tailwind CSS | 4.1.18 | CSS-first config |
| Components | Radix UI | 1.x | Unstyled primitives |

---

## Project Structure

```
url-summarization/
├── apps/
│   └── web/                    # Next.js application
│       ├── app/                # App Router pages and layouts
│       ├── components/         # React components
│       │   ├── ui/             # Primitive UI components (Button, Input, etc.)
│       │   └── settings/       # Feature-specific components
│       ├── lib/                # Utility functions
│       ├── server/             # Server-side code
│       │   └── api/            # tRPC routers and procedures
│       └── trpc/               # tRPC client setup
├── packages/
│   ├── db/                     # @repo/db - Prisma client
│   ├── ui/                     # @repo/ui - Shared components
│   ├── eslint-config/          # @repo/eslint-config
│   └── typescript-config/      # @repo/typescript-config
```

---

## TypeScript Conventions

### Strict Configuration
This project uses strict TypeScript with additional safety checks:

```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "isolatedModules": true
}
```

### Type Patterns

```typescript
// PREFER: Explicit return types for exported functions
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// PREFER: Use `satisfies` for type checking with inference
const config = {
  theme: "dark",
  features: ["a", "b"],
} satisfies Config;

// AVOID: Type assertions (`as`) - they bypass type checking
const data = response as UserData; // ❌
const data: UserData = await fetchUser(); // ✅

// PREFER: Discriminated unions over optional properties
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: Error };
```

### Import Conventions

```typescript
// Use path alias for app imports
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Use workspace protocol for package imports
import { prisma } from "@repo/db";

// React hooks - use named imports
import { useState, useEffect, useCallback, useMemo, useRef, forwardRef } from "react";

// React types - use type imports
import type { ReactNode, FormEvent, ComponentPropsWithoutRef, HTMLAttributes } from "react";

// AVOID: Namespace imports for React
import * as React from "react"; // ❌
const [state, setState] = React.useState(""); // ❌

// PREFER: Named imports
import { useState } from "react"; // ✅
const [state, setState] = useState(""); // ✅
```

---

## React 19 Patterns

### Server vs Client Components

**Default to Server Components.** Only add `"use client"` when the component requires:
- Event handlers (`onClick`, `onChange`, etc.)
- React hooks (`useState`, `useEffect`, etc.)
- Browser-only APIs (`window`, `localStorage`, etc.)

```typescript
// Server Component (default) - no directive needed
export default async function UserProfile({ userId }: Props) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return <div>{user.name}</div>;
}

// Client Component - requires directive
"use client";
export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### Component Composition

```typescript
// PREFER: Composition over configuration
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// AVOID: Prop drilling for content
<Card title="Title" content="Content" /> // ❌
```

### React 19 Hooks

```typescript
// useActionState - for form actions with pending state
"use client";
import { useActionState } from "react";

function SubmitForm() {
  const [state, formAction, isPending] = useActionState(submitAction, null);
  return (
    <form action={formAction}>
      <button disabled={isPending}>
        {isPending ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

// useOptimistic - for optimistic UI updates
const [optimisticItems, addOptimistic] = useOptimistic(
  items,
  (state, newItem) => [...state, newItem]
);
```

### Event Handlers

```typescript
// PREFER: Named handler functions for complex logic
function SearchForm() {
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Complex submission logic
  }

  return <form onSubmit={handleSubmit}>...</form>;
}

// AVOID: Inline handlers for non-trivial operations
<form onSubmit={(e) => { e.preventDefault(); /* complex logic */ }}> // ❌
```

---

## Next.js 16 App Router

### Route Organization

```
app/
├── layout.tsx              # Root layout (providers, global styles)
├── page.tsx                # Home page (/)
├── (auth)/                 # Route group (no URL segment)
│   ├── login/page.tsx      # /login
│   └── register/page.tsx   # /register
├── dashboard/
│   ├── layout.tsx          # Dashboard layout
│   ├── page.tsx            # /dashboard
│   └── [id]/page.tsx       # /dashboard/:id
└── api/
    └── trpc/[trpc]/route.ts  # tRPC handler
```

### Metadata

```typescript
// Static metadata
export const metadata: Metadata = {
  title: "URL Summarizer",
  description: "Summarize any URL instantly",
};

// Dynamic metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const summary = await getSummary(params.id);
  return { title: summary.title };
}
```

### Loading and Error States

```typescript
// loading.tsx - Suspense boundary
export default function Loading() {
  return <Skeleton className="h-48 w-full" />;
}

// error.tsx - Error boundary
"use client";
export default function Error({ error, reset }: ErrorProps) {
  return (
    <div role="alert">
      <p>Something went wrong</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

---

## tRPC 11 Patterns

### Router Structure

```typescript
// server/api/routers/urlSummary.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const urlSummaryRouter = createTRPCRouter({
  // Query - for reading data
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.urlSummary.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }),

  // Mutation - for writing data
  create: publicProcedure
    .input(z.object({
      url: z.string().url(),
      summary: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.urlSummary.create({ data: input });
    }),
});
```

### Client Usage

```typescript
"use client";
import { trpc } from "@/trpc/react";

export function SummaryList() {
  // Queries
  const { data, isLoading, error } = trpc.urlSummary.list.useQuery();

  // Mutations with optimistic updates
  const utils = trpc.useUtils();
  const createMutation = trpc.urlSummary.create.useMutation({
    onSuccess: () => {
      utils.urlSummary.list.invalidate();
    },
  });

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return <ul>{data.map(item => <li key={item.id}>{item.url}</li>)}</ul>;
}
```

### Error Handling

```typescript
import { TRPCError } from "@trpc/server";

// Throw typed errors in procedures
if (!user) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "User not found",
  });
}

// Handle on client
const mutation = trpc.urlSummary.create.useMutation({
  onError: (error) => {
    if (error.data?.code === "BAD_REQUEST") {
      // Handle validation error
    }
  },
});
```

---

## Prisma 6 Patterns

### Schema Design

```prisma
model UrlSummary {
  id        String   @id @default(cuid())
  url       String
  summary   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([createdAt])  // Index for sorting
  @@index([url])        // Index for lookups
}
```

### Query Patterns

```typescript
// PREFER: Select only needed fields for performance
const summaries = await prisma.urlSummary.findMany({
  select: { id: true, url: true, createdAt: true },
  orderBy: { createdAt: "desc" },
  take: 20,
});

// PREFER: Use transactions for multiple writes
await prisma.$transaction([
  prisma.urlSummary.create({ data: summary1 }),
  prisma.urlSummary.create({ data: summary2 }),
]);

// AVOID: N+1 queries - use include/select instead
for (const item of items) {
  await prisma.related.findMany({ where: { itemId: item.id } }); // ❌
}
```

### Database Commands

```bash
pnpm db:generate   # Generate Prisma client after schema changes
pnpm db:migrate    # Create and apply migrations
pnpm db:studio     # Open Prisma Studio GUI
```

---

## Tailwind CSS 4 Patterns

### CSS-First Configuration

This project uses Tailwind CSS 4's new CSS-first configuration:

```css
/* globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@theme {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --radius-lg: var(--radius);
}
```

### Theming with CSS Variables

```css
/* Light theme (default) */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
}

/* Dark theme */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

### Class Naming Conventions

```typescript
// Use semantic color names from theme
<div className="bg-background text-foreground" />
<button className="bg-primary text-primary-foreground" />

// Use the cn() utility for conditional classes
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  className
)} />
```

---

## Component Patterns

### CVA (Class Variance Authority)

```typescript
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  // Base classes
  "inline-flex items-center justify-center rounded-md font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };
```

### Radix UI Integration

```typescript
// Wrap Radix primitives with styled components
import * as DialogPrimitive from "@radix-ui/react-dialog";

export function Dialog({ children, ...props }: DialogPrimitive.DialogProps) {
  return <DialogPrimitive.Root {...props}>{children}</DialogPrimitive.Root>;
}

export function DialogContent({ className, ...props }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40" />
      <DialogPrimitive.Content
        className={cn("fixed left-1/2 top-1/2 ...", className)}
        {...props}
      />
    </DialogPrimitive.Portal>
  );
}
```

### Data Slot Pattern

Use `data-slot` attributes for styling hooks:

```typescript
<button data-slot="button" className={cn(buttonVariants({ variant, size }))}>
  {children}
</button>
```

---

## Accessibility Requirements

### ARIA and Semantics

```typescript
// ALWAYS: Use semantic HTML
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

// ALWAYS: Provide accessible labels
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>

// ALWAYS: Use role="alert" for dynamic error messages
<div role="alert" aria-live="polite">
  {error && <p className="text-destructive">{error}</p>}
</div>

// ALWAYS: Associate labels with form controls
<label htmlFor="email">Email</label>
<input id="email" type="email" aria-describedby="email-error" />
<p id="email-error" role="alert">{error}</p>
```

### Keyboard Navigation

```typescript
// Support keyboard interactions
function handleKeyDown(e: React.KeyboardEvent) {
  switch (e.key) {
    case "Enter":
    case " ":
      handleSelect();
      break;
    case "Escape":
      handleClose();
      break;
  }
}
```

### Focus Management

```typescript
// Use refs for programmatic focus
const inputRef = useRef<HTMLInputElement>(null);

useEffect(() => {
  if (isOpen) {
    inputRef.current?.focus();
  }
}, [isOpen]);
```

---

## Error Handling

### Error Boundaries

```typescript
// app/error.tsx - Page-level error boundary
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="p-4">
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Graceful Degradation

```typescript
// PREFER: Provide fallbacks for optional features
function FeatureComponent() {
  const { data, error } = trpc.feature.get.useQuery();
  
  if (error) {
    return <FallbackUI />;
  }
  
  return <MainUI data={data} />;
}
```

---

## Performance Guidelines

### Bundle Size

```typescript
// PREFER: Named imports for tree shaking
import { Button } from "@/components/ui/button";

// AVOID: Barrel imports that prevent tree shaking
import { Button, Input, Card } from "@/components/ui"; // ❌ if barrel re-exports all

// PREFER: Dynamic imports for heavy components
const HeavyEditor = dynamic(() => import("./heavy-editor"), {
  loading: () => <Skeleton />,
});
```

### Rendering Optimization

```typescript
// PREFER: useCallback for stable function references
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// PREFER: useMemo for expensive computations
const sortedItems = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);

// AVOID: Creating objects/arrays in render
<Component style={{ color: "red" }} /> // ❌ new object every render
```

### Data Fetching

```typescript
// PREFER: Fetch data in Server Components
export default async function Page() {
  const data = await prisma.urlSummary.findMany();
  return <ClientComponent initialData={data} />;
}

// PREFER: Use React Query's staleTime to reduce refetches
const { data } = trpc.urlSummary.list.useQuery(undefined, {
  staleTime: 1000 * 60 * 5, // 5 minutes
});
```

---

## Security Checklist

- [ ] **Input Validation**: All user input validated with Zod before use
- [ ] **XSS Prevention**: Use React's JSX escaping; never use `dangerouslySetInnerHTML`
- [ ] **CSRF Protection**: Use tRPC mutations (POST) for state changes
- [ ] **SQL Injection**: Use Prisma's parameterized queries exclusively
- [ ] **Environment Variables**: Never expose secrets to client (`NEXT_PUBLIC_` prefix)
- [ ] **URL Validation**: Validate URLs before fetching/storing

```typescript
// Input validation example
const urlSchema = z.string().url().refine(
  (url) => url.startsWith("https://"),
  { message: "Only HTTPS URLs are allowed" }
);
```

---

## Development Commands

```bash
# Development
pnpm dev              # Start all apps in development mode
pnpm dev --filter=web # Start only the web app

# Building
pnpm build            # Build all packages and apps
pnpm check-types      # Run TypeScript type checking

# Linting & Formatting
pnpm lint             # Run ESLint with --max-warnings 0
pnpm format           # Format with Prettier

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:migrate       # Run database migrations
pnpm db:studio        # Open Prisma Studio

# Docker
docker compose up -d  # Start PostgreSQL
docker compose down   # Stop PostgreSQL
```

---

## Code Review Checklist

When reviewing or writing code, verify:

1. **Type Safety**: No `any` types, no type assertions unless absolutely necessary
2. **Error Handling**: All async operations have error handling
3. **Accessibility**: Interactive elements are keyboard accessible with proper ARIA
4. **Performance**: No unnecessary re-renders, proper memoization
5. **Security**: User input validated, no exposed secrets
6. **Consistency**: Follows existing patterns in the codebase
7. **Testing**: Complex logic has test coverage (when tests are added)

---

## Common Anti-Patterns to Avoid

```typescript
// ❌ Prop drilling through many layers
<GrandParent user={user}>
  <Parent user={user}>
    <Child user={user} />
  </Parent>
</GrandParent>

// ✅ Use context or composition
<UserProvider user={user}>
  <GrandParent>
    <Parent>
      <Child />
    </Parent>
  </GrandParent>
</UserProvider>

// ❌ useEffect for derived state
const [fullName, setFullName] = useState("");
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ✅ Derive during render
const fullName = `${firstName} ${lastName}`;

// ❌ Fetching in useEffect (Client Components)
useEffect(() => {
  fetch("/api/data").then(setData);
}, []);

// ✅ Use Server Components or React Query
const { data } = trpc.data.get.useQuery();
```

---

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| React Component | kebab-case.tsx | `app-sidebar.tsx` |
| Utility Function | kebab-case.ts | `utils.ts` |
| Type Definition | kebab-case.ts | `types.ts` |
| tRPC Router | camelCase.ts | `urlSummary.ts` |
| Page | page.tsx | `app/dashboard/page.tsx` |
| Layout | layout.tsx | `app/layout.tsx` |
| Loading State | loading.tsx | `app/dashboard/loading.tsx` |
| Error Boundary | error.tsx | `app/dashboard/error.tsx` |

---

## Environment Variables

```bash
# Required
DATABASE_URL="postgresql://user:pass@localhost:5434/app?schema=public"

# Optional (development)
POSTGRES_USER=app
POSTGRES_PASSWORD=app
POSTGRES_DB=app
POSTGRES_PORT=5434
```

**Client-side variables** must be prefixed with `NEXT_PUBLIC_`:
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

*Last updated: December 2024*
*Tech stack versions are pinned in package.json files*


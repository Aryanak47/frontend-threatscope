# ThreatScope Frontend

A professional OSINT and breach monitoring platform frontend built with Next.js 14, TypeScript, and Tailwind CSS.


<img width="1920" height="4397" alt="Firefox_Screenshot_2025-08-28T17-29-33 026Z" src="https://github.com/user-attachments/assets/0ca33e24-49e3-40bd-bd22-b423d7ce0fc5" />

<img width="1918" height="1214" alt="Firefox_Screenshot_2025-08-28T17-32-41 464Z" src="https://github.com/user-attachments/assets/f0422103-e2cc-4854-8cde-4a60e7c35c45" />

<img width="1920" height="1330" alt="Firefox_Screenshot_2025-08-28T17-33-54 121Z" src="https://github.com/user-attachments/assets/281bea94-0d33-49e0-ae80-4f19fc7043ef" />


## 🚀 Features

- **Modern Tech Stack**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Professional Design**: Inspired by leading OSINT platforms (Tracked.sh, Snusbase, HIBP)
- **Responsive UI**: Mobile-first design with dark/light mode support
- **Advanced Search**: Multi-type search with real-time suggestions
- **Data Visualization**: Interactive charts and analytics
- **Export Capabilities**: CSV, Excel, PDF, and JSON exports
- **Security First**: End-to-end encryption, secure authentication
- **Enterprise Ready**: Role-based access, audit logs, compliance

## 🛠️ Tech Stack

### Core Technologies
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts + D3.js

### UI/UX Libraries
- **Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast
- **Tables**: TanStack Table

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── (auth)/            # Auth group routes
│   ├── (dashboard)/       # Protected dashboard routes
│   ├── api/               # API routes (BFF pattern)
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── landing/           # Landing page components
│   ├── layout/            # Layout components
│   └── providers/         # Context providers
├── lib/
│   ├── api.ts            # API client
│   ├── utils.ts          # Utility functions
│   └── validators.ts     # Zod schemas
├── hooks/                # Custom hooks
├── stores/               # Zustand stores
├── types/                # TypeScript types
└── styles/               # Additional styles
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18.17.0 or later
- npm, yarn, or pnpm

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd C:\Users\aryan\Desktop\frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   # Copy the example env file
   cp .env.local .env.local
   
   # Edit .env.local with your backend URL
   NEXT_PUBLIC_API_URL=http://localhost:8081/api
   ```

4. **Initialize shadcn/ui** (if not already done):
   ```bash
   npx shadcn-ui@latest init
   npx shadcn-ui@latest add button input card dialog form
   ```

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Open in browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking

# Formatting
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
```

### Adding New Components

1. **Create component file**:
   ```bash
   # For UI components
   npx shadcn-ui@latest add [component-name]
   
   # For custom components
   touch src/components/[category]/[component-name].tsx
   ```

2. **Follow the component structure**:
   ```typescript
   'use client' // If using client-side features
   
   import { ComponentProps } from '@/types'
   
   export function ComponentName({ ...props }: ComponentProps) {
     return (
       <div className="component-styles">
         {/* Component content */}
       </div>
     )
   }
   ```

## 🎨 Design System

### Color Palette
```css
/* Security Theme */
--security-50: #fef2f2;
--security-600: #dc2626;
--security-700: #b91c1c;

/* Intelligence Theme */
--intelligence-50: #eff6ff;
--intelligence-600: #2563eb;
--intelligence-700: #1d4ed8;
```

### Component Variants
- **Buttons**: `default`, `security`, `intelligence`, `outline`, `ghost`
- **Cards**: Standard with `glass-effect` for overlays
- **Typography**: Gradient text with `text-gradient` class

## 🔌 API Integration

### API Client Usage

```typescript
import { apiClient } from '@/lib/api'

// Search operations
const results = await apiClient.search({
  query: 'example@email.com',
  type: 'email',
  mode: 'exact'
})

// User authentication
const authData = await apiClient.login({
  email: 'user@example.com',
  password: 'password'
})
```

### Error Handling

The API client includes automatic:
- Token refresh on 401 errors
- Request/response interceptors
- Type-safe error responses

## 🔒 Security Features

### Authentication
- JWT token management with automatic refresh
- Secure session handling
- Role-based access control

### Data Protection
- Input sanitization and validation
- XSS prevention
- CSRF protection
- Secure API communication

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+
- **Wide**: 1440px+

### Dark Mode
- System preference detection
- Manual theme toggle
- Persistent theme selection

## 🧪 Testing

### Testing Stack (to be implemented)
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Playwright
- **API Tests**: MSW (Mock Service Worker)

## 📦 Deployment

### Build Optimization
- Automatic code splitting
- Image optimization
- Bundle analysis
- Performance monitoring

### Production Deployment
1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy to Vercel/Netlify**:
   ```bash
   # Vercel
   npx vercel --prod
   
   # Netlify
   npx netlify deploy --prod
   ```

## 🤝 Integration with Backend

### Backend API Endpoints
The frontend expects the following backend endpoints:

```
POST /auth/login           # User authentication
POST /auth/register        # User registration
GET  /auth/me             # Get current user
POST /search              # Basic search
POST /search/advanced     # Advanced search
POST /search/bulk         # Bulk search
GET  /dashboard           # Dashboard data
GET  /health              # System health
```

### Environment Configuration
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8081/api
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_APP_NAME=ThreatScope
```

## 📚 Documentation

### Key Components
- **HeroSection**: Landing page hero with navigation
- **SearchSection**: Main search interface
- **ApiClient**: Backend integration layer
- **Button**: Custom button with security variants

### Styling Guidelines
- Use Tailwind utility classes
- Follow shadcn/ui patterns
- Implement dark mode support
- Maintain responsive design

## 🔧 Troubleshooting

### Common Issues

1. **Build errors**: Run `npm run type-check` to identify TypeScript issues
2. **Styling issues**: Check Tailwind CSS configuration
3. **API errors**: Verify backend URL in environment variables
4. **Component errors**: Ensure all shadcn/ui components are installed

### Performance Tips
- Use Next.js Image component for optimized images
- Implement proper loading states
- Use React Query for efficient data fetching
- Minimize bundle size with code splitting

## 🚀 Next Steps

1. **Complete the setup** by running the installation commands
2. **Start your backend** on `http://localhost:8081`
3. **Customize the design** to match your brand
4. **Add authentication pages** (login/register)
5. **Implement dashboard components**
6. **Add search results page**
7. **Integrate with your ThreatScope backend APIs**


---

**Built with ❤️ for the cybersecurity community**

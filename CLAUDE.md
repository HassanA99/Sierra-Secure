# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbo (http://localhost:3000)
- `npm run build` - Build production application with Turbo
- `npm start` - Start production server

## Project Architecture

This is a Next.js 15 application using the App Router architecture with TypeScript and Tailwind CSS v4.

### Key Structure
- `app/` - Next.js App Router directory containing pages and layouts
- `app/layout.tsx` - Root layout with Geist font configuration
- `app/page.tsx` - Home page component
- `app/globals.css` - Global styles and Tailwind CSS imports
- `public/` - Static assets (SVG icons, etc.)

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode enabled
- **Styling**: Tailwind CSS v4
- **Fonts**: Geist and Geist Mono from next/font/google
- **Build Tool**: Turbo (enabled for dev and build commands)

### TypeScript Configuration
- Strict mode enabled
- Path alias `@/*` maps to project root
- ES2017 target with modern module resolution

### Styling Approach
- Tailwind CSS v4 with PostCSS configuration
- CSS custom properties for font variables
- Dark mode support with `dark:` prefixes
- Responsive design patterns using `sm:` breakpoints
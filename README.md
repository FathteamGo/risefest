# Event Ticketing System - Frontend

This is the frontend application for the Event Ticketing System, built with Next.js 15, TypeScript, and Tailwind CSS.

## Features Implemented

1. **Public Pages:**
   - Landing page with event listings
   - Event details page
   - Event registration page
   - Ticket display page

2. **Admin Pages:**
   - Admin login
   - Event management
   - Check-in system with QR code scanning

## Technologies Used

- Next.js 15.4 (App Router)
- TypeScript
- Tailwind CSS v3
- React QR Code Scanner (html5-qrcode)
- QR Code Generator (qrcode.react)

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## API Integration

This frontend is ready for backend integration. It includes:

- A service layer that can switch between dummy data and real API calls
- Environment configuration for API endpoints
- TypeScript types for all data structures
- API client for handling HTTP requests

For detailed information about the API integration, see [API_INTEGRATION.md](API_INTEGRATION.md).

## Project Structure

- `app/` - Next.js 15 app router pages
- `components/` - Reusable UI components
- `lib/` - Utility functions, dummy data, and API clients
- `types/` - TypeScript type definitions
- `public/` - Static assets

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## License

This project is licensed under the MIT License.
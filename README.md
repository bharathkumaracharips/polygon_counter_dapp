# Web3 Counter App

A decentralized counter application built with Next.js, Web3.js, and deployed on Polygon Mumbai testnet.

## Project Structure

```
src/
├── app/           # Next.js app router pages and layouts
├── components/    # React components
├── services/      # Web3 and blockchain services
└── utils/         # Utility functions and helpers
```

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS v4
- **Blockchain**: Web3.js v4
- **Network**: Polygon Mumbai Testnet
- **Wallet**: MetaMask integration

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Dependencies

- **Next.js**: React framework with TypeScript support
- **Web3.js**: Ethereum JavaScript API for blockchain interaction
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type safety and better development experience

## Development

The project is set up with:
- TypeScript configuration with strict mode
- ESLint for code quality
- Tailwind CSS for styling
- Path aliases (`@/*` for `src/*`)

## Build

To create a production build:

```bash
npm run build
```

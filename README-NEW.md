# RiskVisio

RiskVisio is a unified risk, incident, near miss and compliance management platform built with React and TypeScript.

## Features

- **Multi-Factory Support**: Manage multiple facilities (BTL, BTO, BTI, BTX, BTT, BTG)
- **Incident Management**: Track and manage workplace incidents
- **Risk Assessment**: Identify and evaluate potential risks
- **Compliance Monitoring**: Ensure regulatory compliance
- **Occurrence Reporting**: Streamlined safety occurrence reporting
- **User Management**: Role-based access control
- **Persistent Storage**: All data saved locally in browser

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Build Tool**: Vite 6
- **Storage**: Browser localStorage with persistence

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd riskvisio
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Default Login

- **Username**: admin
- **Password**: admin

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── forms/          # Form components
│   └── lists/          # List view components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── styles/             # CSS and styling
└── types/              # TypeScript type definitions
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Author

Emil Dybeck

## Commercial Use

This software is available for commercial use under the MIT license. You are free to:
- Use commercially
- Modify and customize
- Distribute and sell
- Sublicense

Please retain the license notice in derivative works.

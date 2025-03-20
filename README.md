# Minimal Text Editor

A minimalist Markdown editor built with React and Vite, featuring syntax highlighting, live preview, and theme support.

## Features

- Markdown editing with syntax highlighting
- Live preview and split view modes
- Multiple theme support (Dark, Light, Dracula)
- File management (create, rename, delete)
- Import/Export functionality
- Automatic file persistence

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

Clone the repository:
```bash
git clone https://github.com/your-username/text-editor-minimal.git
cd text-editor-minimal
```

Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

Other available commands:
```bash
npm run build    # Create production build
npm run preview  # Preview production build
npm run lint     # Run linter
```

## Technology Stack

- React 18
- Monaco Editor
- Vite
- ESLint

## Architecture

The editor is built with a modular architecture:

- `FileContext` - Manages file state and operations
- `Editor` - Monaco editor integration with theme support
- `Sidebar` - File management interface
- `Preview` - Markdown rendering

## License

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

## Contributing

Contributions are welcome. Please open an issue first to discuss proposed changes.

## Contact

For questions or suggestions, please open an issue in the repository.

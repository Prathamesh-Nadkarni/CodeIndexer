# Code Indexer

A lightweight, web-based code explorer that helps you navigate, search, and interact with your codebase directly from your browser.

Code Indexer an intuitive interface to browse your project files, search across your entire codebase, and seamlessly open files in VS Code. It's designed to enhance your development workflow by making code navigation and discovery faster and more efficient.


##Screenshots

Landing
![Screenshot 2025-04-29 033258](https://github.com/user-attachments/assets/864a650e-b03b-4dea-a3cf-15e7d0ab4d7f)

Full Code Search
![Screenshot 2025-04-29 033319](https://github.com/user-attachments/assets/4889bedb-586d-40f0-87b0-f77ee4ee03a7)

Comment Search
![Screenshot 2025-04-29 033335](https://github.com/user-attachments/assets/170508e0-cc30-4ff5-b819-57452d4dbd89)


## Features

- **File Browser**: Navigate through your project's directory structure with an intuitive file explorer
- **Code Search**: Quickly find specific code snippets, functions, or comments across your entire codebase
- **Content Viewer**: View file contents with syntax highlighting and line numbers
- **VS Code Integration**: Open files directly in VS Code at specific lines with a single click
- **Smart Filtering**: Filter search results by file extension or specific folders
- **Comment Search**: Specifically search within code comments across multiple programming languages
- **Auto-Ignore**: Automatically ignores common directories like `node_modules`, `.git`, etc.
- **Breadcrumb Navigation**: Easily track and navigate your location in the file hierarchy

## Installation

### Prerequisites

- Node.js (v12.0.0 or higher)
- VS Code (for the "Open in VS Code" functionality)

### Setup

1. Clone this repository or download the source code
2. Navigate to the project directory
3. Install dependencies:

```bash
npm init -y
npm install express@4.21.2
```

## Usage

1. Start the server:

```bash
node server.js
```

2. Open your browser and navigate to:

```
http://localhost:3000
```

3. Use the file explorer on the left to browse your project files
4. Use the search bar at the top to find specific code snippets
5. Click on line numbers to open files directly in VS Code at that specific line

## Configuration

The server automatically ignores the following directories:

```javascript
[
  'node_modules', '.git', 'dist', 'build', '.next', '.vscode', '.idea',
  'target', 'bin', 'obj', 'out', 'coverage', 'logs', 'tmp', 'temp',
  '.env', '__pycache__', 'env', 'android', '.angular'
]
```

To modify this list, edit the `IGNORED_DIRECTORIES` array in `server.js`.

## Roadmap

### Short-term (1-3 months)
- [ ] Add syntax highlighting for code display
- [ ] Implement file type icons in the file explorer
- [ ] Add dark mode support
- [ ] Create configuration UI for customizing ignored directories
- [ ] Add support for regular expression search

### Mid-term (3-6 months)
- [ ] Implement real-time file watching for automatic updates
- [ ] Add support for multiple search tabs
- [ ] Create a history feature for recent searches and file views
- [ ] Implement code bookmarking functionality
- [ ] Add basic code editing capabilities

### Long-term (6+ months)
- [ ] Implement a plugin system for extensibility
- [ ] Add support for remote repositories (GitHub, GitLab, etc.)
- [ ] Create collaborative features for team development
- [ ] Implement code analysis and metrics visualization
- [ ] Add support for custom themes and layouts


## Code by Pratham Nadkarni

/*
  Code by Pratham Nadkarni
  Do not use this code without permission from the author.
  This code is for INTERNAL USE ONLY.
  Do not edit or share this code without permission from the author.
*/

const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;
const BASE_DIR = path.join(__dirname, '../'); // Set base directory to parent folder


// Define directories to ignore/avoid
const IGNORED_DIRECTORIES = [
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.vscode',
  '.idea',
  'target',
  'bin',
  'obj',
  'out',
  'coverage',
  'logs',
  'tmp',
  'temp',
  '.env',
  '__pycache__',
  'env',
  'android',
  '.angular'
];

// Serve static files from the current directory
app.use(express.static(__dirname));

// Serve the index.html file for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Basic route for /api/files without parameters
app.get('/api/files', async (req, res) => {
  try {
    const directoryPath = BASE_DIR; // Use the BASE_DIR constant
    console.log('Reading root directory:', directoryPath);
    
    const files = await fs.readdir(directoryPath, { withFileTypes: true });
    const fileList = files
      .filter(file => !(file.isDirectory() && IGNORED_DIRECTORIES.includes(file.name)))
      .map(file => ({
        name: file.name,
        type: file.isDirectory() ? 'directory' : 'file'
      }));
    
    res.json(fileList);
  } catch (error) {
    console.error('Error reading directory:', error);
    res.status(500).json({ error: 'Error reading directory', details: error.message });
  }
});

// API endpoint to get directory contents with path parameter
app.get('/api/files/*', async (req, res) => {
  try {
    const relativePath = req.params[0] || '';
    
    // Check if the requested path contains any ignored directory
    const pathParts = relativePath.split('/');
    if (pathParts.some(part => IGNORED_DIRECTORIES.includes(part))) {
      return res.status(403).json({ 
        error: 'Access denied', 
        details: 'This directory is in the ignored list' 
      });
    }
    
    const dirPath = path.join(BASE_DIR, relativePath);
    
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    const fileList = files
      .filter(file => !(file.isDirectory() && IGNORED_DIRECTORIES.includes(file.name)))
      .map(file => ({
        name: file.name,
        type: file.isDirectory() ? 'directory' : 'file'
      }));
    
    res.json(fileList);
  } catch (error) {
    console.error('Error reading directory:', error);
    res.status(500).json({ error: 'Error reading directory', details: error.message });
  }
});

// API endpoint to get file contents
app.get('/api/file/*', async (req, res) => {
  try {
    const relativePath = req.params[0];
    
    // Check if the requested file path contains any ignored directory
    const pathParts = relativePath.split('/');
    if (pathParts.some(part => IGNORED_DIRECTORIES.includes(part))) {
      return res.status(403).json({ 
        error: 'Access denied', 
        details: 'This file is in an ignored directory' 
      });
    }
    
    const filePath = path.join(BASE_DIR, relativePath);
    console.log('Reading file:', filePath);
    
    // Check if it's a text file before trying to read it as UTF-8
    const ext = path.extname(filePath).toLowerCase();
    const textExtensions = ['.txt', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.md', '.py', '.java', '.c', '.cpp', '.h', '.hpp', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.sh', '.bat', '.ps1', '.yml', '.yaml', '.toml', '.ini', '.cfg', '.conf'];
    
    if (textExtensions.includes(ext)) {
      const content = await fs.readFile(filePath, 'utf-8');
      res.type('text/plain').send(content);
    } else {
      // For binary files, just send a placeholder message
      res.type('text/plain').send('[Binary file not displayed]');
    }
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Error reading file', details: error.message });
  }
});

// API endpoint to search files
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q;
    const searchCommentsOnly = req.query.comments === 'true';
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Parse filter parameters
    const extensions = req.query.extensions ? req.query.extensions.split(',') : null;
    const folder = req.query.folder || null;

    const results = [];
    
    // If folder is specified, only search in that folder
    const searchPath = folder ? path.join(BASE_DIR, folder.replace(/^\//, '')) : BASE_DIR;
    
    await searchDirectory(searchPath, query, results, extensions, folder, searchCommentsOnly);
    
    res.json(results);
  } catch (error) {
    console.error('Error searching files:', error);
    res.status(500).json({ error: 'Error searching files', details: error.message });
  }
});

// API endpoint to open a file in VS Code at a specific line
app.get('/api/open', (req, res) => {
  const filePath = req.query.file;
  const line = req.query.line || 1;
  
  if (!filePath) {
    return res.status(400).json({ error: 'File path is required' });
  }
  
  const absolutePath = path.join(BASE_DIR, filePath);
  
  // Command to open VS Code at specific line
  const command = `code -g "${absolutePath}:${line}"`;
  
  exec(command, (error) => {
    if (error) {
      console.error('Error opening VS Code:', error);
      return res.status(500).json({ error: 'Failed to open VS Code', details: error.message });
    }
    res.json({ success: true, message: 'File opened in VS Code' });
  });
});

// Helper function to search for text in files recursively
async function searchDirectory(dirPath, query, results, extensions = null, baseFolder = null, searchCommentsOnly = false) {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const entryPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(BASE_DIR, entryPath);
      
      // Skip ignored directories
      if (entry.isDirectory()) {
        if (IGNORED_DIRECTORIES.includes(entry.name)) {
          continue;
        }
        await searchDirectory(entryPath, query, results, extensions, baseFolder, searchCommentsOnly);
      } else {
        // Check if it's a text file
        const ext = path.extname(entryPath).toLowerCase();
        
        // Filter by extension if specified
        if (extensions && !extensions.includes(ext)) {
          continue;
        }
        
        // Filter by folder if specified
        if (baseFolder && !('/' + relativePath).startsWith(baseFolder)) {
          continue;
        }
        
        const textExtensions = ['.txt', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.md', '.py', '.java', '.c', '.cpp', '.h', '.hpp', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.sh', '.bat', '.ps1', '.yml', '.yaml', '.toml', '.ini', '.cfg', '.conf'];
        
        if (textExtensions.includes(ext)) {
          try {
            const content = await fs.readFile(entryPath, 'utf-8');
            
            // Define comment patterns for different languages
            const commentPatterns = {
              '.js': [/\/\/.*/, /\/\*[\s\S]*?\*\//g],
              '.jsx': [/\/\/.*/, /\/\*[\s\S]*?\*\//g],
              '.ts': [/\/\/.*/, /\/\*[\s\S]*?\*\//g],
              '.tsx': [/\/\/.*/, /\/\*[\s\S]*?\*\//g],
              '.java': [/\/\/.*/, /\/\*[\s\S]*?\*\//g],
              '.c': [/\/\/.*/, /\/\*[\s\S]*?\*\//g],
              '.cpp': [/\/\/.*/, /\/\*[\s\S]*?\*\//g],
              '.cs': [/\/\/.*/, /\/\*[\s\S]*?\*\//g],
              '.py': [/#.*/, /'''[\s\S]*?'''/g, /"""[\s\S]*?"""/g],
              '.rb': [/#.*/, /=begin[\s\S]*?=end/g],
              '.php': [/\/\/.*/, /#.*/, /\/\*[\s\S]*?\*\//g],
              '.html': [/<!--[\s\S]*?-->/g],
              '.css': [/\/\*[\s\S]*?\*\//g],
              '.md': [/<!--[\s\S]*?-->/g],
              '.go': [/\/\/.*/, /\/\*[\s\S]*?\*\//g],
              '.rs': [/\/\/.*/, /\/\*[\s\S]*?\*\//g],
              '.swift': [/\/\/.*/, /\/\*[\s\S]*?\*\//g],
              '.kt': [/\/\/.*/, /\/\*[\s\S]*?\*\//g],
              '.sh': [/#.*/],
              '.bat': [/REM.*/i, /::.*/ ],
              '.ps1': [/#.*/, /<#[\s\S]*?#>/g],
              '.yml': [/#.*/],
              '.yaml': [/#.*/],
              '.toml': [/#.*/],
              '.ini': [/;.*/],
              '.cfg': [/#.*/, /;.*/],
              '.conf': [/#.*/, /;.*/]
            };
            
            if (searchCommentsOnly) {
              // Get comment patterns for this file type
              const patterns = commentPatterns[ext] || [];
              
              if (patterns.length > 0) {
                // If searching comments only, extract comments first
                const lines = content.split('\n');
                let comments = [];
                let lineMap = new Map(); // Maps comment index to original line number
                
                // For single-line comment patterns
                patterns.forEach(pattern => {
                  if (!pattern.global) {
                    lines.forEach((line, lineNumber) => {
                      const match = line.match(pattern);
                      if (match) {
                        comments.push(match[0]);
                        lineMap.set(comments.length - 1, lineNumber + 1);
                      }
                    });
                  } else {
                    // For multi-line comment patterns
                    const fullText = content;
                    let match;
                    const originalPattern = new RegExp(pattern.source, pattern.flags); // Clone the regex to reset lastIndex
                    while ((match = originalPattern.exec(fullText)) !== null) {
                      comments.push(match[0]);
                      // Find line number by counting newlines before this position
                      const upToMatch = fullText.substring(0, match.index);
                      const lineNumber = upToMatch.split('\n').length;
                      lineMap.set(comments.length - 1, lineNumber);
                    }
                  }
                });
                
                // Search within comments
                comments.forEach((comment, index) => {
                  if (comment.toLowerCase().includes(query.toLowerCase())) {
                    results.push({
                      path: relativePath,
                      line: lineMap.get(index),
                      content: comment.trim(),
                      match: query,
                      isComment: true
                    });
                  }
                });
              }
            } else {
              // Normal search in all content
              const lines = content.split('\n');
              lines.forEach((line, lineNumber) => {
                if (line.toLowerCase().includes(query.toLowerCase())) {
                  results.push({
                    path: relativePath,
                    line: lineNumber + 1,
                    content: line.trim(),
                    match: query
                  });
                }
              });
            }
          } catch (err) {
            console.error(`Error reading file ${entryPath}:`, err);
          }
        }
      }
    }
  } catch (err) {
    console.error(`Error searching directory ${dirPath}:`, err);
  }
}

// Start the server (only once)
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Serving files from: ${BASE_DIR}`);
  console.log(`Ignoring directories: ${IGNORED_DIRECTORIES.join(', ')}`);
});

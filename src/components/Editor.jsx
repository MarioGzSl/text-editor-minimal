import React, { useState, useEffect } from 'react';
import { useFiles } from '../context/FileContext';
import Editor, { loader } from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import './Editor.css';

// Definir los temas disponibles
const EDITOR_THEMES = {
  'vs-dark': 'Dark',
  'dracula': 'Dracula',
  'vs': 'Light',
  'hc-black': 'High Contrast Dark',
  'hc-light': 'High Contrast Light'
};

// Configurar el tema Dracula antes de que se monte el editor
const setupDraculaTheme = async () => {
  const monaco = await loader.init();
  
  // Definir el tema Dracula
  monaco.editor.defineTheme('dracula', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      // Headers
      { token: 'heading.1.markdown', foreground: '#FF79C6', fontStyle: 'bold' },
      { token: 'heading.2.markdown', foreground: '#BD93F9', fontStyle: 'bold' },
      { token: 'heading.3.markdown', foreground: '#50FA7B', fontStyle: 'bold' },
      { token: 'heading.4.markdown', foreground: '#FFB86C', fontStyle: 'bold' },
      { token: 'heading.5.markdown', foreground: '#8BE9FD', fontStyle: 'bold' },
      { token: 'heading.6.markdown', foreground: '#FF5555', fontStyle: 'bold' },
      
      // Emphasis
      { token: 'emphasis', fontStyle: 'italic', foreground: '#F1FA8C' },
      { token: 'strong', fontStyle: 'bold', foreground: '#FFB86C' },
      
      // Lists and quotes
      { token: 'list.markdown', foreground: '#8BE9FD' },
      { token: 'quote.markdown', foreground: '#F1FA8C' },
      
      // Links and images
      { token: 'link.markdown', foreground: '#BD93F9' },
      { token: 'image.markdown', foreground: '#50FA7B' },
      
      // Code blocks
      { token: 'fenced_code.block.language', foreground: '#FF79C6' },
      { token: 'fenced_code.block.language.markdown', foreground: '#FF79C6' },
      
      // Inline elements
      { token: 'inline.code.markdown', foreground: '#50FA7B' },
      { token: 'punctuation.markdown', foreground: '#6272A4' }
    ],
    colors: {
      'editor.background': '#282A36',
      'editor.foreground': '#F8F8F2',
      'editor.lineHighlightBackground': '#44475A',
      'editor.selectionBackground': '#44475A',
      'editor.selectionHighlightBackground': '#424450',
      'editorCursor.foreground': '#F8F8F2',
      'editorWhitespace.foreground': '#3B3B3B',
      'editorLineNumber.foreground': '#6272A4',
      'editorLineNumber.activeForeground': '#F8F8F2',
      'editor.findMatchBackground': '#FFB86C55',
      'editor.findMatchHighlightBackground': '#FFB86C33',
      'minimap.background': '#282A36',
      'scrollbarSlider.background': '#44475A80',
      'scrollbarSlider.hoverBackground': '#44475ACC',
      'scrollbarSlider.activeBackground': '#44475AEE',
    }
  });

  // Cargar los lenguajes necesarios
  await Promise.all([
    import('monaco-editor/esm/vs/basic-languages/markdown/markdown.contribution'),
    import('monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution'),
    import('monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution'),
    import('monaco-editor/esm/vs/basic-languages/css/css.contribution'),
    import('monaco-editor/esm/vs/basic-languages/html/html.contribution'),
    import('monaco-editor/esm/vs/basic-languages/python/python.contribution'),
  ]);

  return true;
};

// Pre-registrar el tema Dracula
loader.init().then(monaco => {
  setupDraculaTheme();
});

const EditorComponent = () => {
  const { 
    files, 
    activeFile, 
    updateFileContent, 
    saveFile, 
    currentTheme, 
    setCurrentTheme, 
    setActiveFile, 
    closeFile 
  } = useFiles();
  const [content, setContent] = useState('');
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [viewMode, setViewMode] = useState('code'); // 'code', 'preview', 'split'

  useEffect(() => {
    const activeFileData = files.find(file => file.id === activeFile);
    if (activeFileData) {
      setContent(activeFileData.content);
    } else {
      setContent('');
    }
  }, [activeFile, files]);

  const handleEditorDidMount = (editor, monaco) => {
    setIsEditorReady(true);
    // Configurar el editor para Markdown
    if (monaco) {
      editor.updateOptions({
        wordWrap: 'on',
        lineNumbers: 'on',
        renderWhitespace: 'selection',
        tabSize: 2,
        minimap: {
          enabled: true,
          maxColumn: 80,
        },
      });
    }
  };

  const handleEditorChange = (value) => {
    setContent(value);
    if (activeFile) {
      updateFileContent(activeFile, value);
    }
  };

  const handleKeyDown = (event) => {
    // Ctrl + S para guardar
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
      event.preventDefault();
      if (activeFile) {
        saveFile(activeFile);
      }
    }
  };

  const handleTabClick = (fileId) => {
    setActiveFile(fileId);
  };

  const handleCloseTab = (e, fileId) => {
    e.stopPropagation();
    closeFile(fileId);
  };

  if (!activeFile) {
    return (
      <div className={`editor ${currentTheme === 'dracula' ? 'theme-dracula' : ''}`}>
        <div className="welcome-screen">
          <div className="welcome-content">
            <div className="welcome-icon">✧</div>
            <h1>text editor minimal</h1>
            <p>start writing</p>
          </div>
        </div>
      </div>
    );
  }

  const activeFileData = files.find(file => file.id === activeFile);
  const isMarkdown = activeFileData?.name.endsWith('.md');
  const getLanguage = (filename) => {
    const extension = filename.split('.').pop().toLowerCase();
    const languageMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'md': 'markdown',
      'json': 'json',
      'html': 'html',
      'css': 'css',
      'py': 'python',
      'txt': 'plaintext'
    };
    return languageMap[extension] || 'plaintext';
  };

  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme);
  };

  const renderViewModeButtons = () => {
    if (!isMarkdown) return null;

    return (
      <div className="view-mode-buttons">
        <button
          className={`view-mode-btn ${viewMode === 'code' ? 'active' : ''}`}
          onClick={() => setViewMode('code')}
        >
          <i className="fas fa-code"></i>
          <span>Code</span>
        </button>
        <button
          className={`view-mode-btn ${viewMode === 'preview' ? 'active' : ''}`}
          onClick={() => setViewMode('preview')}
        >
          <i className="fas fa-eye"></i>
          <span>Preview</span>
        </button>
        <button
          className={`view-mode-btn ${viewMode === 'split' ? 'active' : ''}`}
          onClick={() => setViewMode('split')}
        >
          <i className="fas fa-columns"></i>
          <span>Split</span>
        </button>
      </div>
    );
  };

  const renderThemeSelector = () => (
    <select
      className="theme-selector"
      value={currentTheme}
      onChange={(e) => handleThemeChange(e.target.value)}
    >
      {Object.entries(EDITOR_THEMES).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );

  const renderEditor = () => (
    <Editor
      height="100%"
      defaultLanguage="markdown"
      language="markdown"
      theme={currentTheme}
      value={content}
      onChange={handleEditorChange}
      onMount={handleEditorDidMount}
      options={{
        fontSize: 14,
        fontFamily: "'Fira Code', monospace",
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        renderWhitespace: 'selection',
        automaticLayout: true,
        tabSize: 2,
        formatOnPaste: true,
        formatOnType: true,
        suggest: {
          snippetsPreventQuickSuggestions: false,
        },
        quickSuggestions: {
          other: true,
          comments: true,
          strings: true
        },
        bracketPairColorization: {
          enabled: true
        }
      }}
      loading={
        <div className={`editor-loading ${currentTheme === 'dracula' ? 'theme-dracula' : ''}`}>
          <div className="spinner" />
        </div>
      }
    />
  );

  const renderPreview = () => (
    <div className="markdown-preview">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );

  const renderContent = () => {
    if (!isMarkdown || viewMode === 'code') {
      return renderEditor();
    }

    if (viewMode === 'preview') {
      return renderPreview();
    }

    return (
      <div className="split-view">
        <div className="split-pane">
          {renderEditor()}
        </div>
        <div className="split-pane">
          {renderPreview()}
        </div>
      </div>
    );
  };

  return (
    <div className={`editor ${currentTheme === 'dracula' ? 'theme-dracula' : ''}`}>
      <div className="editor-header">
        <div className="file-tabs">
          {files.map(file => (
            <div
              key={file.id}
              className={`file-tab ${activeFile === file.id ? 'active' : ''}`}
              onClick={() => handleTabClick(file.id)}
            >
              <span className="tab-name">{file.name}</span>
              {!file.isSaved && <span className="unsaved-dot">●</span>}
              <button 
                className="close-tab"
                onClick={(e) => handleCloseTab(e, file.id)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))}
        </div>
        <div className="editor-actions">
          {renderViewModeButtons()}
          {renderThemeSelector()}
          <button className="save-btn" onClick={() => saveFile(activeFile)}>
            <i className="fas fa-save"></i>
            <span>Save</span>
          </button>
        </div>
      </div>
      <div className="editor-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default EditorComponent; 
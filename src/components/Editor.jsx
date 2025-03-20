import React, { useState, useEffect } from 'react';
import { useFiles } from '../context/FileContext';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import './Editor.css';

const EditorComponent = () => {
  const { files, activeFile, updateFileContent, saveFile, setActiveFile, closeFile } = useFiles();
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

  const handleEditorDidMount = () => {
    setIsEditorReady(true);
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
      <div className="editor">
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

  const renderEditor = () => (
    <Editor
      height="100%"
      defaultLanguage="plaintext"
      language={getLanguage(activeFileData.name)}
      theme="vs-dark"
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
        formatOnType: true
      }}
      loading={<div className="editor-loading">Loading...</div>}
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
    <div className="editor">
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
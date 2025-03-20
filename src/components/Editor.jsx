import React, { useState, useEffect, useRef } from 'react';
import { useFiles } from '../context/FileContext';
import './Editor.css';

const Editor = () => {
  const { files, activeFile, updateFileContent, saveFile, setActiveFile, closeFile } = useFiles();
  const [content, setContent] = useState('');
  const editorRef = useRef(null);

  useEffect(() => {
    const activeFileData = files.find(file => file.id === activeFile);
    if (activeFileData) {
      setContent(activeFileData.content);
    } else {
      setContent('');
    }
  }, [activeFile, files]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (activeFile) {
      updateFileContent(activeFile, newContent);
    }
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      if (activeFile) {
        saveFile(activeFile, content);
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
      <div className="welcome-screen">
        <div className="welcome-content">
          <div className="welcome-icon">✧</div>
          <h1>text editor minimal</h1>
          <p>comienza a escribir</p>
        </div>
      </div>
    );
  }

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
          <button className="save-btn" onClick={() => saveFile(activeFile, content)}>
            <i className="fas fa-save"></i>
            <span>Save</span>
          </button>
        </div>
      </div>
      <div className="editor-content">
        <textarea
          ref={editorRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu contenido aquí..."
          className="code-editor"
        />
      </div>
    </div>
  );
};

export default Editor; 
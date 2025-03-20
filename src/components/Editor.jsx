import React from 'react';
import { useFiles } from '../context/FileContext';
import './Editor.css';

const Editor = () => {
  const { files, activeFile, saveFile, updateFileContent, setActiveFile } = useFiles();
  const currentFile = files.find(file => file.id === activeFile);

  const handleContentChange = (e) => {
    if (currentFile) {
      updateFileContent(currentFile.id, e.target.value);
    }
  };

  const handleSave = () => {
    if (currentFile) {
      saveFile(currentFile.id, currentFile.content);
    }
  };

  const handleTabClick = (fileId) => {
    setActiveFile(fileId);
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
            </div>
          ))}
        </div>
        <div className="editor-actions">
          <button className="save-btn" onClick={handleSave}>
            <i className="fas fa-save"></i>
            <span>Guardar</span>
          </button>
        </div>
      </div>
      <div className="editor-content">
        <textarea
          className="code-editor"
          value={currentFile?.content || ''}
          onChange={handleContentChange}
          placeholder="Escribe tu código aquí..."
        />
      </div>
    </div>
  );
};

export default Editor; 
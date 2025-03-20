import React, { useState, useRef, useEffect } from 'react';
import { useFiles } from '../context/FileContext';
import './Sidebar.css';

const Sidebar = () => {
  const { 
    allFiles,
    activeFile, 
    isSidebarCollapsed, 
    createNewFile, 
    setActiveFile, 
    toggleSidebar,
    renameFile,
    renamingFile,
    setRenamingFile,
    exportFiles,
    importFiles,
    openFile,
    deleteFile,
    closeFile
  } = useFiles();

  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, fileId: null });
  const [editingName, setEditingName] = useState('');
  const renameInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleContextMenu = (e, fileId) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      fileId
    });
  };

  const handleDoubleClick = (fileId, currentName) => {
    setRenamingFile(fileId);
    setEditingName(currentName);
  };

  const handleRenameSubmit = (e, fileId) => {
    e.preventDefault();
    if (editingName.trim()) {
      renameFile(fileId, editingName.trim());
    }
    setRenamingFile(null);
  };

  const handleClickOutside = (e) => {
    if (contextMenu.visible) {
      setContextMenu({ visible: false, x: 0, y: 0, fileId: null });
    }
  };

  const handleFileClick = (fileId, isOpen) => {
    if (!isOpen) {
      openFile(fileId);
    } else {
      setActiveFile(fileId);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu.visible]);

  useEffect(() => {
    if (renamingFile && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select(); // Select all text
    }
  }, [renamingFile]);

  const handleImportFiles = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        importFiles(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="toggle-sidebar" onClick={toggleSidebar}>
          <i className={`fas ${isSidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </button>
        <h2>Explorer</h2>
        <button className="new-file-btn" onClick={createNewFile}>
          <i className="fas fa-plus"></i>
        </button>
      </div>
      <div className="file-list">
        {allFiles.map(file => (
          <div
            key={file.id}
            className={`file-item ${file.id === activeFile ? 'active' : ''} ${!file.isOpen ? 'closed' : ''}`}
            onClick={() => handleFileClick(file.id, file.isOpen)}
            onDoubleClick={() => handleDoubleClick(file.id, file.name)}
            onContextMenu={(e) => handleContextMenu(e, file.id)}
          >
            <i className="fas fa-file-alt file-icon"></i>
            {renamingFile === file.id ? (
              <form onSubmit={(e) => handleRenameSubmit(e, file.id)} className="rename-form">
                <input
                  ref={renameInputRef}
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => setRenamingFile(null)}
                  className="rename-input"
                />
              </form>
            ) : (
              <span className="file-name">{file.name}</span>
            )}
            {!file.isSaved && <span className="unsaved-indicator">•</span>}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <button className="import-btn" onClick={() => fileInputRef.current.click()}>
          <i className="fas fa-file-import"></i>
          <span>Import</span>
        </button>
        <button className="export-btn" onClick={exportFiles}>
          <i className="fas fa-file-export"></i>
          <span>Export</span>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFiles}
        accept=".json"
        style={{ display: 'none' }}
      />

      {contextMenu.visible && (
        <div 
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button onClick={() => {
            const file = allFiles.find(f => f.id === contextMenu.fileId);
            if (file) {
              handleDoubleClick(file.id, file.name);
            }
            setContextMenu({ visible: false, x: 0, y: 0, fileId: null });
          }}>
            <i className="fas fa-edit"></i> Rename
          </button>
          <button onClick={() => {
            if (contextMenu.fileId) {
              deleteFile(contextMenu.fileId);
            }
            setContextMenu({ visible: false, x: 0, y: 0, fileId: null });
          }}>
            <i className="fas fa-trash-alt"></i> Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar; 
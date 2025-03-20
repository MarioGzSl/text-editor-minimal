import React, { useState, useRef, useEffect } from 'react';
import { useFiles } from '../context/FileContext';
import './Sidebar.css';

const Sidebar = () => {
  const { 
    files, 
    activeFile, 
    isSidebarCollapsed, 
    createNewFile, 
    setActiveFile, 
    toggleSidebar,
    renameFile,
    renamingFile,
    setRenamingFile
  } = useFiles();

  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, fileId: null });
  const [editingName, setEditingName] = useState('');
  const renameInputRef = useRef(null);

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

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu.visible]);

  useEffect(() => {
    if (renamingFile && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select(); // Selecciona todo el texto
    }
  }, [renamingFile]);

  return (
    <div className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button className="toggle-sidebar" onClick={toggleSidebar}>
          <i className={`fas ${isSidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
        </button>
        <h2>Explorador</h2>
        <button className="new-file-btn" onClick={createNewFile}>
          <i className="fas fa-plus"></i>
        </button>
      </div>
      <div className="file-list">
        {files.map(file => (
          <div
            key={file.id}
            className={`file-item ${activeFile === file.id ? 'active' : ''}`}
            onClick={() => setActiveFile(file.id)}
            onDoubleClick={() => handleDoubleClick(file.id, file.name)}
            onContextMenu={(e) => handleContextMenu(e, file.id)}
          >
            <span className="file-icon">
              <i className="fas fa-file-alt"></i>
            </span>
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
            {!file.isSaved && <span className="unsaved-indicator">●</span>}
          </div>
        ))}
      </div>

      {contextMenu.visible && (
        <div 
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button onClick={() => {
            const file = files.find(f => f.id === contextMenu.fileId);
            if (file) {
              handleDoubleClick(file.id, file.name);
            }
            setContextMenu({ visible: false, x: 0, y: 0, fileId: null });
          }}>
            <i className="fas fa-edit"></i> Renombrar
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar; 
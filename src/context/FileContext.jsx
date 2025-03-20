import React, { createContext, useContext, useState } from 'react';

const FileContext = createContext();

export const FileProvider = ({ children }) => {
  const [files, setFiles] = useState([
    {
      id: Date.now(),
      name: 'Nuevo archivo.txt',
      content: '',
      isSaved: false
    }
  ]);
  const [activeFile, setActiveFile] = useState(Date.now());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [renamingFile, setRenamingFile] = useState(null);

  const createNewFile = () => {
    const newFile = {
      id: Date.now(),
      name: `Nuevo archivo ${files.length + 1}.txt`,
      content: '',
      isSaved: false
    };
    setFiles(prevFiles => [...prevFiles, newFile]);
    setActiveFile(newFile.id);
  };

  const saveFile = (fileId, content) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === fileId 
          ? { ...file, content, isSaved: true }
          : file
      )
    );
  };

  const updateFileContent = (fileId, content) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === fileId 
          ? { ...file, content, isSaved: false }
          : file
      )
    );
  };

  const renameFile = (fileId, newName) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === fileId 
          ? { ...file, name: newName }
          : file
      )
    );
    setRenamingFile(null);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const value = {
    files,
    activeFile,
    isSidebarCollapsed,
    renamingFile,
    createNewFile,
    saveFile,
    updateFileContent,
    setActiveFile,
    toggleSidebar,
    renameFile,
    setRenamingFile
  };

  return (
    <FileContext.Provider value={value}>
      {children}
    </FileContext.Provider>
  );
};

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFiles debe ser usado dentro de un FileProvider');
  }
  return context;
}; 
import React, { createContext, useContext, useState } from 'react';

const FileContext = createContext();

export const FileProvider = ({ children }) => {
  const [allFiles, setAllFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [renamingFile, setRenamingFile] = useState(null);

  // Get only open files for the editor
  const files = allFiles.filter(file => file.isOpen);

  const getUniqueFileName = (baseName) => {
    const nameWithoutExt = baseName.replace('.md', '');
    const existingNames = new Set(allFiles.map(file => file.name));
    
    if (!existingNames.has(baseName)) {
      return baseName;
    }

    let counter = 1;
    let newName;
    do {
      newName = `${nameWithoutExt}-${counter}.md`;
      counter++;
    } while (existingNames.has(newName));

    return newName;
  };

  const createNewFile = () => {
    const newFileName = getUniqueFileName('untitled.md');
    const newFile = {
      id: Date.now().toString(),
      name: newFileName,
      content: '',
      isSaved: false,
      isOpen: true
    };
    setAllFiles(prev => [...prev, newFile]);
    setActiveFile(newFile.id);
  };

  const updateFileContent = (fileId, newContent) => {
    setAllFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, content: newContent, isSaved: false }
        : file
    ));
  };

  const saveFile = (fileId) => {
    setAllFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, isSaved: true }
        : file
    ));
  };

  const closeFile = (fileId) => {
    // Si es el último archivo abierto, no permitir cerrarlo
    const openFiles = allFiles.filter(f => f.isOpen);
    if (openFiles.length === 1 && openFiles[0].id === fileId) {
      return;
    }

    setAllFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        // Si el archivo no está guardado, resetear su contenido
        if (!file.isSaved) {
          return { ...file, content: '', isOpen: false };
        }
        return { ...file, isOpen: false };
      }
      return file;
    }));

    // Si el archivo cerrado era el activo, activar otro
    if (activeFile === fileId) {
      const remainingOpenFiles = allFiles.filter(f => f.id !== fileId && f.isOpen);
      if (remainingOpenFiles.length > 0) {
        setActiveFile(remainingOpenFiles[0].id);
      }
    }
  };

  const openFile = (fileId) => {
    setAllFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, isOpen: true }
        : file
    ));
    setActiveFile(fileId);
  };

  const renameFile = (fileId, newName) => {
    setAllFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, name: newName }
        : file
    ));
    setRenamingFile(null);
  };

  const deleteFile = (fileId) => {
    // Si es el último archivo, no permitir borrarlo
    if (allFiles.length === 1) {
      return;
    }

    setAllFiles(prev => prev.filter(file => file.id !== fileId));

    // Si el archivo borrado era el activo, activar otro
    if (activeFile === fileId) {
      const remainingFiles = allFiles.filter(f => f.id !== fileId);
      if (remainingFiles.length > 0) {
        setActiveFile(remainingFiles[0].id);
      }
    }
  };

  const exportFiles = () => {
    const exportData = allFiles.map(({ id, name, content }) => ({
      id,
      name,
      content
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text-editor-files.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importFiles = (importedFiles) => {
    const newFiles = importedFiles.map(file => ({
      ...file,
      isSaved: true,
      isOpen: false
    }));
    setAllFiles(prev => [...prev, ...newFiles]);
  };

  return (
    <FileContext.Provider value={{
      files,
      allFiles,
      activeFile,
      isSidebarCollapsed,
      renamingFile,
      setActiveFile,
      setIsSidebarCollapsed,
      createNewFile,
      updateFileContent,
      saveFile,
      closeFile,
      openFile,
      renameFile,
      setRenamingFile,
      deleteFile,
      exportFiles,
      importFiles
    }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFiles = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
}; 
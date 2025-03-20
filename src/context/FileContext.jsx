import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'text-editor-files';
const ACTIVE_FILE_KEY = 'text-editor-active-file';

const FileContext = createContext();

export const FileProvider = ({ children }) => {
  // Inicializar el estado con los datos del localStorage si existen
  const [allFiles, setAllFiles] = useState(() => {
    const savedFiles = localStorage.getItem(STORAGE_KEY);
    if (savedFiles) {
      return JSON.parse(savedFiles);
    }
    // Si no hay archivos guardados, crear uno nuevo
    const initialFile = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 15),
      name: 'untitled.md',
      content: '',
      isSaved: false,
      isOpen: true
    };
    return [initialFile];
  });

  const [activeFile, setActiveFile] = useState(() => {
    const savedActiveFile = localStorage.getItem(ACTIVE_FILE_KEY);
    if (savedActiveFile) {
      return savedActiveFile;
    }
    // Si no hay archivo activo guardado, usar el ID del archivo inicial
    return allFiles[0]?.id || null;
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [renamingFile, setRenamingFile] = useState(null);

  // Función para alternar el estado del sidebar
  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  // Guardar archivos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allFiles));
  }, [allFiles]);

  // Guardar archivo activo en localStorage cuando cambie
  useEffect(() => {
    if (activeFile) {
      localStorage.setItem(ACTIVE_FILE_KEY, activeFile);
    } else {
      localStorage.removeItem(ACTIVE_FILE_KEY);
    }
  }, [activeFile]);

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

  const generateUniqueId = () => {
    return Date.now().toString() + '-' + Math.random().toString(36).substring(2, 15);
  };

  const createNewFile = () => {
    const newFileName = getUniqueFileName('untitled.md');
    const newFile = {
      id: generateUniqueId(),
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

  const importFiles = (fileContent) => {
    try {
      const importedFiles = JSON.parse(fileContent);
      if (!Array.isArray(importedFiles)) {
        throw new Error('Invalid file format');
      }

      const newFiles = importedFiles.map(file => {
        if (!file.name || typeof file.content !== 'string') {
          throw new Error('Invalid file data');
        }
        // Asegurarnos de que el nombre del archivo sea único
        const uniqueName = getUniqueFileName(file.name);
        return {
          id: generateUniqueId(),
          name: uniqueName,
          content: file.content,
          isSaved: true,
          isOpen: true
        };
      });

      setAllFiles(prev => {
        const updatedFiles = [...prev, ...newFiles];
        // Si hay archivos nuevos, activamos el primero
        if (newFiles.length > 0) {
          setTimeout(() => setActiveFile(newFiles[0].id), 0);
        }
        return updatedFiles;
      });
    } catch (error) {
      console.error('Error importing files:', error);
      alert('Error importing files. Please make sure the file is in the correct format.');
    }
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
      toggleSidebar,
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
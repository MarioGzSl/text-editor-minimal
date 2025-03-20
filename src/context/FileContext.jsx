import React, { createContext, useContext, useState } from 'react';

const FileContext = createContext();

export const FileProvider = ({ children }) => {
  const [allFiles, setAllFiles] = useState([]);
  const [activeFile, setActiveFile] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [renamingFile, setRenamingFile] = useState(null);

  // Get only open files for the editor
  const files = allFiles.filter(file => file.isOpen);

  const createNewFile = () => {
    const newFile = {
      id: Date.now(),
      name: `New file ${allFiles.length + 1}`,
      content: '',
      isSaved: false,
      isOpen: true,
      hasBeenSaved: false,
      lastSavedContent: ''
    };
    setAllFiles(prevFiles => [...prevFiles, newFile]);
    setActiveFile(newFile.id);
  };

  const saveFile = (fileId, content) => {
    setAllFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === fileId 
          ? { ...file, content, isSaved: true, hasBeenSaved: true, lastSavedContent: content }
          : file
      )
    );
  };

  const updateFileContent = (fileId, content) => {
    setAllFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === fileId 
          ? { ...file, content, isSaved: false }
          : file
      )
    );
  };

  const renameFile = (fileId, newName) => {
    setAllFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === fileId 
          ? { ...file, name: newName }
          : file
      )
    );
    setRenamingFile(null);
  };

  const openFile = (fileId) => {
    setAllFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === fileId 
          ? { ...file, isOpen: true }
          : file
      )
    );
    setActiveFile(fileId);
  };

  const closeFile = (fileId) => {
    setAllFiles(prevFiles => {
      const fileToClose = prevFiles.find(f => f.id === fileId);
      if (!fileToClose) return prevFiles;

      // Si el archivo nunca ha sido guardado y tiene cambios no guardados, lo eliminamos
      if (!fileToClose.hasBeenSaved && !fileToClose.isSaved) {
        const remainingFiles = prevFiles.filter(file => file.id !== fileId);
        // Si el archivo cerrado era el activo, seleccionamos el siguiente archivo abierto
        if (activeFile === fileId && remainingFiles.length > 0) {
          const nextOpenFile = remainingFiles.find(f => f.isOpen);
          if (nextOpenFile) {
            setActiveFile(nextOpenFile.id);
          }
        } else if (remainingFiles.length === 0) {
          setActiveFile(null);
        }
        return remainingFiles;
      }

      // Si el archivo tiene cambios no guardados pero ha sido guardado antes, restauramos el último contenido guardado
      if (!fileToClose.isSaved) {
        const updatedFiles = prevFiles.map(file => 
          file.id === fileId 
            ? { 
                ...file, 
                content: file.lastSavedContent,
                isSaved: true,
                isOpen: false 
              }
            : file
        );
        
        // Si no quedan archivos abiertos, limpiamos el archivo activo
        if (updatedFiles.filter(f => f.isOpen).length === 0) {
          setActiveFile(null);
        }
        
        return updatedFiles;
      }

      // Si el archivo está guardado, solo lo marcamos como cerrado
      const updatedFiles = prevFiles.map(file => 
        file.id === fileId 
          ? { ...file, isOpen: false }
          : file
      );
      
      // Si el archivo cerrado era el activo, seleccionamos el siguiente archivo abierto
      if (activeFile === fileId) {
        const nextOpenFile = updatedFiles.find(f => f.isOpen);
        if (nextOpenFile) {
          setActiveFile(nextOpenFile.id);
        } else {
          setActiveFile(null);
        }
      }

      return updatedFiles;
    });
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const exportFiles = () => {
    const filesData = JSON.stringify(allFiles, null, 2);
    const blob = new Blob([filesData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'editor-files.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importFiles = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedFiles = JSON.parse(e.target.result);
          setAllFiles(importedFiles);
          if (importedFiles.length > 0) {
            const firstOpenFile = importedFiles.find(f => f.isOpen);
            if (firstOpenFile) {
              setActiveFile(firstOpenFile.id);
            }
          }
        } catch (error) {
          alert('Error importing files. Please make sure the file is in the correct format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const deleteFile = (fileId) => {
    setAllFiles(prevFiles => {
      const remainingFiles = prevFiles.filter(file => file.id !== fileId);
      if (activeFile === fileId) {
        const nextOpenFile = remainingFiles.find(f => f.isOpen);
        if (nextOpenFile) {
          setActiveFile(nextOpenFile.id);
        } else {
          setActiveFile(null);
        }
      }
      return remainingFiles;
    });
  };

  const value = {
    files,
    allFiles,
    activeFile,
    isSidebarCollapsed,
    renamingFile,
    createNewFile,
    saveFile,
    updateFileContent,
    setActiveFile,
    toggleSidebar,
    renameFile,
    setRenamingFile,
    exportFiles,
    importFiles,
    closeFile,
    openFile,
    deleteFile
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
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
}; 
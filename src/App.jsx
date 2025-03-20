import React from 'react'
import { FileProvider } from './context/FileContext'
import Sidebar from './components/Sidebar'
import EditorComponent from './components/Editor'
import './App.css'

const App = () => {
  return (
    <FileProvider>
      <div className="app">
        <Sidebar />
        <EditorComponent />
      </div>
    </FileProvider>
  )
}

export default App

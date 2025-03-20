import React from 'react'
import Sidebar from './components/Sidebar'
import Editor from './components/Editor'
import { FileProvider } from './context/FileContext'
import './App.css'

function App() {
  return (
    <FileProvider>
      <div className="app">
        <Sidebar />
        <Editor />
      </div>
    </FileProvider>
  )
}

export default App

import { useState } from 'react'
import './index.css'
import CreatePaste from './components/CreatePaste'
import PasteSuccess from './components/PasteSuccess'
import ViewPaste from './components/ViewPaste'
import Header from './components/Header'
import Footer from './components/Footer'

function App() {
  const [view, setView] = useState('create') // 'create' | 'success' | 'view'
  const [pasteData, setPasteData] = useState(null)
  const [viewPasteId, setViewPasteId] = useState(null)

  const handlePasteCreated = (data, options) => {
    setPasteData({ ...data, options })
    setView('success')
  }

  const handleNewPaste = () => {
    setPasteData(null)
    setViewPasteId(null)
    setView('create')
  }

  const handleViewPaste = (id) => {
    setViewPasteId(id)
    setView('view')
  }

  return (
    <div className="app">
      <Header onNewPaste={handleNewPaste} />

      <main className="main">
        <div className="container">
          {view === 'create' && (
            <CreatePaste onSuccess={handlePasteCreated} />
          )}

          {view === 'success' && pasteData && (
            <PasteSuccess
              data={pasteData}
              onNewPaste={handleNewPaste}
              onViewPaste={() => handleViewPaste(pasteData.id)}
            />
          )}

          {view === 'view' && viewPasteId && (
            <ViewPaste
              pasteId={viewPasteId}
              onNewPaste={handleNewPaste}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default App

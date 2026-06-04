import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource-variable/jetbrains-mono'
import App from './App'
import './styles/globals.css'
import { useApiConfigStore } from './store/useApiConfigStore'

// 启动时从 IndexedDB 加载 API 配置并同步到 data-service
useApiConfigStore.getState().loadFromDb()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

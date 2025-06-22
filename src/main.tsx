import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'
import { AnimationContextProvider } from './contexts/AnimationContext'
import { MotionConfig } from 'framer-motion'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MotionConfig reducedMotion="user">
      <AnimationContextProvider>
        <App />
      </AnimationContextProvider>
    </MotionConfig>
  </React.StrictMode>,
)

'use client'

import { useEffect } from 'react'

export default function ForceDataReset() {
  useEffect(() => {
    // Limpar flag de inicialização para forçar recriação dos dados
    localStorage.removeItem('dev-data-initialized')
    
    // Recarregar a página para aplicar
    window.location.reload()
  }, [])

  return null
} 
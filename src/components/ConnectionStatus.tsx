'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, RefreshCw, Cloud, HardDrive } from 'lucide-react'

interface ConnectionStatusProps {
  isOnline: boolean
  onSync?: () => Promise<void>
  className?: string
}

export default function ConnectionStatus({ isOnline, onSync, className = '' }: ConnectionStatusProps) {
  const [issyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  // Detectar mudanças de conectividade do navegador
  const [browserOnline, setBrowserOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true)
    const handleOffline = () => setBrowserOnline(false)

    setBrowserOnline(navigator.onLine)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Função para sincronizar
  const handleSync = async () => {
    if (!onSync || issyncing) return

    setIsSyncing(true)
    try {
      await onSync()
      setLastSync(new Date())
    } catch (error) {
      console.error('Erro na sincronização:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  // Determinar status final (precisa estar online no navegador E conectado ao Supabase)
  const finalOnlineStatus = browserOnline && isOnline

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Indicador de status */}
      <div className="flex items-center space-x-1">
        {finalOnlineStatus ? (
          <>
            <div className="flex items-center space-x-1 text-green-600">
              <Cloud className="h-4 w-4" />
              <span className="text-xs font-medium">Online</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center space-x-1 text-orange-600">
              <HardDrive className="h-4 w-4" />
              <span className="text-xs font-medium">Offline</span>
            </div>
          </>
        )}

        {/* Indicador de conectividade do navegador */}
        {!browserOnline && (
          <div className="flex items-center space-x-1 text-red-600">
            <WifiOff className="h-3 w-3" />
          </div>
        )}
      </div>

      {/* Botão de sincronização (apenas quando offline ou quando online para forçar sync) */}
      {onSync && (
        <button
          onClick={handleSync}
          disabled={issyncing || !browserOnline}
          className={`
            p-1 rounded transition-colors text-xs
            ${finalOnlineStatus 
              ? 'text-blue-600 hover:bg-blue-50' 
              : 'text-gray-400 hover:bg-gray-50'
            }
            ${issyncing ? 'animate-spin' : ''}
            disabled:cursor-not-allowed disabled:opacity-50
          `}
          title={
            !browserOnline 
              ? 'Sem conexão com a internet'
              : finalOnlineStatus
              ? 'Sincronizar dados'
              : 'Tentar reconectar'
          }
        >
          <RefreshCw className="h-3 w-3" />
        </button>
      )}

      {/* Informação da última sincronização */}
      {lastSync && (
        <span className="text-xs text-gray-500">
          Sync: {lastSync.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      )}
    </div>
  )
}

// Componente simplificado para usar apenas o ícone
export function ConnectionIcon({ isOnline, className = '' }: { isOnline: boolean, className?: string }) {
  const [browserOnline, setBrowserOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setBrowserOnline(true)
    const handleOffline = () => setBrowserOnline(false)

    setBrowserOnline(navigator.onLine)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const finalOnlineStatus = browserOnline && isOnline

  if (finalOnlineStatus) {
    return <Cloud className={`h-4 w-4 text-green-600 ${className}`} title="Online - Dados sincronizados" />
  } else if (!browserOnline) {
    return <WifiOff className={`h-4 w-4 text-red-600 ${className}`} title="Sem conexão com a internet" />
  } else {
    return <HardDrive className={`h-4 w-4 text-orange-600 ${className}`} title="Offline - Usando dados locais" />
  }
} 
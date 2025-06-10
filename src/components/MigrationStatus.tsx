'use client'

import { useState, useEffect } from 'react'
import { DataMigrator } from '@/lib/migrator'
import { Database, Upload, Check, AlertCircle, Loader, RefreshCw } from 'lucide-react'

export default function MigrationStatus() {
  const [needsMigration, setNeedsMigration] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean
    migrated: number
    errors: string[]
  } | null>(null)

  useEffect(() => {
    checkMigrationStatus()
  }, [])

  const checkMigrationStatus = async () => {
    try {
      setIsLoading(true)
      const needs = await DataMigrator.needsMigration()
      setNeedsMigration(needs)
    } catch (error) {
      console.error('Erro ao verificar status de migração:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startMigration = async () => {
    try {
      setIsMigrating(true)
      setMigrationResult(null)
      
      const result = await DataMigrator.migrateProducts()
      setMigrationResult(result)
      
      if (result.success) {
        setNeedsMigration(false)
        // Sincronizar de volta para localStorage como backup
        await DataMigrator.syncToLocalStorage()
      }
    } catch (error) {
      console.error('Erro durante migração:', error)
      setMigrationResult({
        success: false,
        migrated: 0,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      })
    } finally {
      setIsMigrating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-center space-x-2">
          <Loader className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-sm text-blue-700">Verificando status da migração...</span>
        </div>
      </div>
    )
  }

  if (!needsMigration && !migrationResult) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg max-w-sm">
        <div className="flex items-center space-x-2">
          <Check className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700">Sistema usando Supabase</span>
        </div>
        <div className="mt-2 text-xs text-green-600">
          Dados sincronizados com o banco
        </div>
      </div>
    )
  }

  if (migrationResult) {
    return (
      <div className={`fixed bottom-4 right-4 rounded-lg p-4 shadow-lg max-w-sm ${
        migrationResult.success 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center space-x-2 mb-2">
          {migrationResult.success ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <span className={`text-sm font-medium ${
            migrationResult.success ? 'text-green-700' : 'text-red-700'
          }`}>
            {migrationResult.success ? 'Migração Concluída!' : 'Erro na Migração'}
          </span>
        </div>
        
        <div className={`text-xs ${
          migrationResult.success ? 'text-green-600' : 'text-red-600'
        }`}>
          {migrationResult.success ? (
            <>
              <div>✅ {migrationResult.migrated} produtos migrados</div>
              <div>📊 Sistema agora usa Supabase</div>
            </>
          ) : (
            <>
              <div>❌ {migrationResult.errors.length} erro(s) encontrado(s)</div>
              {migrationResult.errors.slice(0, 2).map((error, index) => (
                <div key={index} className="truncate">{error}</div>
              ))}
            </>
          )}
        </div>

        <button
          onClick={checkMigrationStatus}
          className="mt-2 text-xs underline hover:no-underline"
        >
          Atualizar Status
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex items-center space-x-2 mb-2">
        <Database className="h-4 w-4 text-yellow-600" />
        <span className="text-sm font-medium text-yellow-700">Migração Disponível</span>
      </div>
      
      <div className="text-xs text-yellow-600 mb-3">
        Foram encontrados dados no localStorage que podem ser migrados para o Supabase.
      </div>

      <div className="flex space-x-2">
        <button
          onClick={startMigration}
          disabled={isMigrating}
          className="flex items-center space-x-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white px-3 py-1 rounded text-xs transition-colors"
        >
          {isMigrating ? (
            <Loader className="h-3 w-3 animate-spin" />
          ) : (
            <Upload className="h-3 w-3" />
          )}
          <span>{isMigrating ? 'Migrando...' : 'Migrar'}</span>
        </button>
        
        <button
          onClick={checkMigrationStatus}
          className="flex items-center space-x-1 border border-yellow-300 text-yellow-700 px-3 py-1 rounded text-xs hover:bg-yellow-100 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Verificar</span>
        </button>
      </div>
    </div>
  )
} 
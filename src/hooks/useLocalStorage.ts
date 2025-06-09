import { useState, useEffect, useCallback } from 'react'

export interface UseLocalStorageReturn<T> {
  value: T
  setValue: (value: T | ((val: T) => T)) => void
  isInitialized: boolean
  error: string | null
  clearError: () => void
}

export function useLocalStorage<T>(
  key: string, 
  initialValue: T
): UseLocalStorageReturn<T> {
  // Estado para armazenar o valor, sempre inicializa com initialValue
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Carrega os dados do localStorage após a hidratação
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const item = window.localStorage.getItem(key)
        if (item) {
          const parsedValue = JSON.parse(item)
          setStoredValue(parsedValue)
        }
        setError(null)
      } catch (error) {
        const errorMessage = `Erro ao carregar ${key} do localStorage: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        console.error(errorMessage, error)
        setError(errorMessage)
        // Em caso de erro, usar o valor inicial
        setStoredValue(initialValue)
      } finally {
        setIsInitialized(true)
      }
    }
  }, [key, initialValue])

  // Função para salvar no localStorage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
      
      setError(null)
    } catch (error) {
      const errorMessage = `Erro ao salvar ${key} no localStorage: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      console.error(errorMessage, error)
      setError(errorMessage)
    }
  }, [key, storedValue])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    value: storedValue,
    setValue,
    isInitialized,
    error,
    clearError
  }
} 
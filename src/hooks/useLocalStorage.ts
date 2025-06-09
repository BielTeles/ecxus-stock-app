import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  // Estado para armazenar o valor, sempre inicializa com initialValue
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isInitialized, setIsInitialized] = useState(false)

  // Carrega os dados do localStorage após a hidratação
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const item = window.localStorage.getItem(key)
        if (item) {
          setStoredValue(JSON.parse(item))
        }
      } catch (error) {
        console.error(`Erro ao carregar ${key} do localStorage:`, error)
      } finally {
        setIsInitialized(true)
      }
    }
  }, [key])

  // Função para salvar no localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage:`, error)
    }
  }

  return [storedValue, setValue, isInitialized] as const
} 
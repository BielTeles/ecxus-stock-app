'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface SystemSettings {
  // Configurações da Empresa
  companyName: string
  companyLogo?: string
  companyEmail: string
  companyPhone: string
  companyAddress: string
  
  // Configurações Gerais
  minStockDefault: number
  currency: 'BRL' | 'USD' | 'EUR'
  language: 'pt-BR' | 'en-US' | 'es-ES'
  timezone: string
  dateFormat: 'dd/mm/yyyy' | 'mm/dd/yyyy' | 'yyyy-mm-dd'
  
  // Configurações de Interface
  theme: 'light' | 'dark' | 'system'
  sidebarCollapsed: boolean
  showWelcomeMessage: boolean
  itemsPerPage: number
  
  // Configurações de Sistema
  autoSave: boolean
  autoSaveInterval: number // minutos
  sessionTimeout: number // minutos
  enableNotifications: boolean
  enableSounds: boolean
  
  // Configurações de Backup
  autoBackup: boolean
  backupInterval: 'daily' | 'weekly' | 'monthly'
  backupTime: string // HH:mm
  maxBackupFiles: number
  
  // Configurações de Segurança
  enforcePasswordPolicy: boolean
  minPasswordLength: number
  requirePasswordChange: boolean
  passwordChangeInterval: number // dias
  enableTwoFactor: boolean
  
  // Configurações de Alertas
  lowStockAlerts: boolean
  lowStockThreshold: number // porcentagem
  emailNotifications: boolean
  emailAlerts: string[]
  stockAlertEmails: string[]
  
  // Configurações de Relatórios
  defaultReportFormat: 'pdf' | 'excel' | 'csv'
  includeChartsInReports: boolean
  reportEmailDelivery: boolean
}

interface NotificationSettings {
  email: boolean
  push: boolean
  sound: boolean
  lowStock: boolean
  newOrders: boolean
  systemUpdates: boolean
}

interface UserPreferences {
  dashboardLayout: string[]
  favoriteReports: string[]
  quickActions: string[]
  defaultFilters: Record<string, any>
}

interface SettingsContextType {
  settings: SystemSettings
  notifications: NotificationSettings
  userPreferences: UserPreferences
  updateSettings: (newSettings: Partial<SystemSettings>) => void
  updateNotifications: (newNotifications: Partial<NotificationSettings>) => void
  updateUserPreferences: (newPreferences: Partial<UserPreferences>) => void
  resetSettings: () => void
  exportSettings: () => string
  importSettings: (settingsData: string) => boolean
}

const defaultSettings: SystemSettings = {
  // Empresa
  companyName: 'Ecxus Electronics',
  companyEmail: 'contato@ecxus.com',
  companyPhone: '+55 11 99999-9999',
  companyAddress: 'São Paulo, SP - Brasil',
  
  // Gerais
  minStockDefault: 10,
  currency: 'BRL',
  language: 'pt-BR',
  timezone: 'America/Sao_Paulo',
  dateFormat: 'dd/mm/yyyy',
  
  // Interface
  theme: 'light',
  sidebarCollapsed: false,
  showWelcomeMessage: true,
  itemsPerPage: 25,
  
  // Sistema
  autoSave: true,
  autoSaveInterval: 5,
  sessionTimeout: 30,
  enableNotifications: true,
  enableSounds: true,
  
  // Backup
  autoBackup: false,
  backupInterval: 'daily',
  backupTime: '02:00',
  maxBackupFiles: 10,
  
  // Segurança
  enforcePasswordPolicy: true,
  minPasswordLength: 8,
  requirePasswordChange: false,
  passwordChangeInterval: 90,
  enableTwoFactor: false,
  
  // Alertas
  lowStockAlerts: true,
  lowStockThreshold: 20,
  emailNotifications: true,
  emailAlerts: [],
  stockAlertEmails: [],
  
  // Relatórios
  defaultReportFormat: 'pdf',
  includeChartsInReports: true,
  reportEmailDelivery: false
}

const defaultNotifications: NotificationSettings = {
  email: true,
  push: true,
  sound: true,
  lowStock: true,
  newOrders: true,
  systemUpdates: true
}

const defaultUserPreferences: UserPreferences = {
  dashboardLayout: ['overview', 'recent-products', 'low-stock', 'analytics'],
  favoriteReports: ['inventory-summary', 'low-stock-report'],
  quickActions: ['add-product', 'new-order', 'view-alerts'],
  defaultFilters: {
    products: { category: 'all', status: 'all' },
    orders: { status: 'all', period: 'month' }
  }
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings)
  const [notifications, setNotifications] = useState<NotificationSettings>(defaultNotifications)
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(defaultUserPreferences)

  // Carregar configurações do localStorage ao inicializar
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('ecxus_settings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings(prev => ({ ...prev, ...parsed }))
      }

      const savedNotifications = localStorage.getItem('ecxus_notifications')
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications)
        setNotifications(prev => ({ ...prev, ...parsed }))
      }

      const savedPreferences = localStorage.getItem('ecxus_user_preferences')
      if (savedPreferences) {
        const parsed = JSON.parse(savedPreferences)
        setUserPreferences(prev => ({ ...prev, ...parsed }))
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }, [])

  // Salvar automaticamente quando as configurações mudarem
  useEffect(() => {
    if (settings.autoSave) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('ecxus_settings', JSON.stringify(settings))
      }, 1000) // Debounce de 1 segundo

      return () => clearTimeout(timeoutId)
    }
  }, [settings])

  useEffect(() => {
    localStorage.setItem('ecxus_notifications', JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    localStorage.setItem('ecxus_user_preferences', JSON.stringify(userPreferences))
  }, [userPreferences])

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }

  const updateNotifications = (newNotifications: Partial<NotificationSettings>) => {
    setNotifications(prev => ({ ...prev, ...newNotifications }))
  }

  const updateUserPreferences = (newPreferences: Partial<UserPreferences>) => {
    setUserPreferences(prev => ({ ...prev, ...newPreferences }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    setNotifications(defaultNotifications)
    setUserPreferences(defaultUserPreferences)
    localStorage.removeItem('ecxus_settings')
    localStorage.removeItem('ecxus_notifications')
    localStorage.removeItem('ecxus_user_preferences')
  }

  const exportSettings = () => {
    const allSettings = {
      settings,
      notifications,
      userPreferences,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    }
    return JSON.stringify(allSettings, null, 2)
  }

  const importSettings = (settingsData: string) => {
    try {
      const parsed = JSON.parse(settingsData)
      
      if (parsed.settings) {
        setSettings(prev => ({ ...prev, ...parsed.settings }))
      }
      if (parsed.notifications) {
        setNotifications(prev => ({ ...prev, ...parsed.notifications }))
      }
      if (parsed.userPreferences) {
        setUserPreferences(prev => ({ ...prev, ...parsed.userPreferences }))
      }
      
      return true
    } catch (error) {
      console.error('Erro ao importar configurações:', error)
      return false
    }
  }

  const value = {
    settings,
    notifications,
    userPreferences,
    updateSettings,
    updateNotifications,
    updateUserPreferences,
    resetSettings,
    exportSettings,
    importSettings
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings deve ser usado dentro de um SettingsProvider')
  }
  return context
} 
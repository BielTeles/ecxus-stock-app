'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Alert {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  category: 'stock' | 'production' | 'supplier' | 'system' | 'custom'
  severity: 'low' | 'medium' | 'high' | 'critical'
  isRead: boolean
  isActive: boolean
  triggeredAt: string
  resolvedAt?: string
  actionTaken?: string
  productId?: string
  productName?: string
  currentStock?: number
  minStock?: number
  metadata?: Record<string, any>
}

export interface CustomAlert {
  id: string
  name: string
  description: string
  condition: string
  threshold: number
  operator: 'equal' | 'greater' | 'less' | 'greater_equal' | 'less_equal'
  field: string
  category: 'stock' | 'production' | 'supplier' | 'system'
  isActive: boolean
  createdAt: string
  lastTriggered?: string
  triggerCount: number
}

export interface NotificationSettings {
  email: boolean
  sms: boolean
  push: boolean
  inApp: boolean
  emailAddress: string
  phoneNumber: string
  schedule: {
    enabled: boolean
    startTime: string
    endTime: string
    daysOfWeek: number[]
  }
  categories: {
    stock: boolean
    production: boolean
    supplier: boolean
    system: boolean
    custom: boolean
  }
}

interface AlertContextType {
  alerts: Alert[]
  customAlerts: CustomAlert[]
  notificationSettings: NotificationSettings
  unreadCount: number
  criticalCount: number
  createAlert: (alertData: Omit<Alert, 'id' | 'triggeredAt' | 'isRead'>) => void
  createCustomAlert: (customAlert: Omit<CustomAlert, 'id' | 'createdAt' | 'triggerCount'>) => void
  updateCustomAlert: (id: string, updates: Partial<CustomAlert>) => void
  deleteCustomAlert: (id: string) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  resolveAlert: (id: string, actionTaken: string) => void
  dismissAlert: (id: string) => void
  clearResolvedAlerts: () => void
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void
  checkStockAlerts: () => void
  getAlertsByCategory: (category: string) => Alert[]
  getAlertHistory: () => Alert[]
  exportAlerts: () => void
}

const AlertContext = createContext<AlertContextType | undefined>(undefined)

const defaultNotificationSettings: NotificationSettings = {
  email: true,
  sms: false,
  push: true,
  inApp: true,
  emailAddress: '',
  phoneNumber: '',
  schedule: {
    enabled: false,
    startTime: '09:00',
    endTime: '18:00',
    daysOfWeek: [1, 2, 3, 4, 5]
  },
  categories: {
    stock: true,
    production: true,
    supplier: true,
    system: true,
    custom: true
  }
}

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [customAlerts, setCustomAlerts] = useState<CustomAlert[]>([])
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings)

  useEffect(() => {
    const savedAlerts = localStorage.getItem('ecxus-alerts')
    const savedCustomAlerts = localStorage.getItem('ecxus-custom-alerts')
    const savedNotificationSettings = localStorage.getItem('ecxus-notification-settings')

    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts))
    }
    if (savedCustomAlerts) {
      setCustomAlerts(JSON.parse(savedCustomAlerts))
    }
    if (savedNotificationSettings) {
      setNotificationSettings(JSON.parse(savedNotificationSettings))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('ecxus-alerts', JSON.stringify(alerts))
  }, [alerts])

  useEffect(() => {
    localStorage.setItem('ecxus-custom-alerts', JSON.stringify(customAlerts))
  }, [customAlerts])

  useEffect(() => {
    localStorage.setItem('ecxus-notification-settings', JSON.stringify(notificationSettings))
  }, [notificationSettings])

  const unreadCount = alerts.filter(alert => !alert.isRead && alert.isActive).length
  const criticalCount = alerts.filter(alert => alert.severity === 'critical' && alert.isActive).length

  const createAlert = (alertData: Omit<Alert, 'id' | 'triggeredAt' | 'isRead'>) => {
    const newAlert: Alert = {
      ...alertData,
      id: Date.now().toString(),
      triggeredAt: new Date().toISOString(),
      isRead: false
    }
    setAlerts(prev => [newAlert, ...prev])
  }

  const createCustomAlert = (customAlert: Omit<CustomAlert, 'id' | 'createdAt' | 'triggerCount'>) => {
    const newCustomAlert: CustomAlert = {
      ...customAlert,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      triggerCount: 0
    }
    setCustomAlerts(prev => [...prev, newCustomAlert])
  }

  const updateCustomAlert = (id: string, updates: Partial<CustomAlert>) => {
    setCustomAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, ...updates } : alert
    ))
  }

  const deleteCustomAlert = (id: string) => {
    setCustomAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isRead: true } : alert
    ))
  }

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(alert => ({ ...alert, isRead: true })))
  }

  const resolveAlert = (id: string, actionTaken: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { 
        ...alert, 
        isActive: false, 
        resolvedAt: new Date().toISOString(),
        actionTaken 
      } : alert
    ))
  }

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, isActive: false } : alert
    ))
  }

  const clearResolvedAlerts = () => {
    setAlerts(prev => prev.filter(alert => alert.isActive))
  }

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    setNotificationSettings(prev => ({ ...prev, ...settings }))
  }

  const checkStockAlerts = () => {
    const products = JSON.parse(localStorage.getItem('ecxus-products') || '[]')
    
    products.forEach((product: any) => {
      if (product.quantity <= 0) {
        const existingAlert = alerts.find(a => 
          a.productId === product.id && 
          a.category === 'stock' && 
          a.type === 'error' &&
          a.isActive
        )
        
        if (!existingAlert) {
          createAlert({
            title: 'Produto Esgotado',
            message: `O produto ${product.name} está com estoque zerado.`,
            type: 'error',
            category: 'stock',
            severity: 'critical',
            isActive: true,
            productId: product.id,
            productName: product.name,
            currentStock: product.quantity,
            minStock: product.minStock
          })
        }
      } else if (product.quantity <= product.minStock) {
        const existingAlert = alerts.find(a => 
          a.productId === product.id && 
          a.category === 'stock' && 
          a.type === 'warning' &&
          a.isActive
        )
        
        if (!existingAlert) {
          createAlert({
            title: 'Estoque Baixo',
            message: `O produto ${product.name} está com estoque baixo (${product.quantity} unidades).`,
            type: 'warning',
            category: 'stock',
            severity: 'high',
            isActive: true,
            productId: product.id,
            productName: product.name,
            currentStock: product.quantity,
            minStock: product.minStock
          })
        }
      }
    })
  }

  const getAlertsByCategory = (category: string) => {
    return alerts.filter(alert => alert.category === category)
  }

  const getAlertHistory = () => {
    return alerts.filter(alert => !alert.isActive)
  }

  const exportAlerts = () => {
    const dataStr = JSON.stringify(alerts, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    const exportFileDefaultName = `ecxus-alerts-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <AlertContext.Provider value={{
      alerts,
      customAlerts,
      notificationSettings,
      unreadCount,
      criticalCount,
      createAlert,
      createCustomAlert,
      updateCustomAlert,
      deleteCustomAlert,
      markAsRead,
      markAllAsRead,
      resolveAlert,
      dismissAlert,
      clearResolvedAlerts,
      updateNotificationSettings,
      checkStockAlerts,
      getAlertsByCategory,
      getAlertHistory,
      exportAlerts
    }}>
      {children}
    </AlertContext.Provider>
  )
}

export function useAlerts() {
  const context = useContext(AlertContext)
  if (context === undefined) {
    throw new Error('useAlerts must be used within an AlertProvider')
  }
  return context
} 
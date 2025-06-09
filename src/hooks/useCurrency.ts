import { useSettings } from '@/contexts/SettingsContext'

interface CurrencyConfig {
  symbol: string
  code: string
  locale: string
}

const currencyConfigs: Record<string, CurrencyConfig> = {
  BRL: {
    symbol: 'R$',
    code: 'BRL',
    locale: 'pt-BR'
  },
  USD: {
    symbol: '$',
    code: 'USD',
    locale: 'en-US'
  },
  EUR: {
    symbol: '€',
    code: 'EUR',
    locale: 'de-DE'
  }
}

export function useCurrency() {
  const { settings } = useSettings()
  
  const formatCurrency = (amount: number): string => {
    const config = currencyConfigs[settings.currency]
    
    try {
      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)
    } catch (error) {
      // Fallback para formatação manual se Intl falhar
      return `${config.symbol} ${amount.toFixed(2)}`
    }
  }

  const getCurrencySymbol = (): string => {
    return currencyConfigs[settings.currency].symbol
  }

  const getCurrencyCode = (): string => {
    return currencyConfigs[settings.currency].code
  }

  return {
    formatCurrency,
    getCurrencySymbol,
    getCurrencyCode,
    currentCurrency: settings.currency
  }
} 
// src/hooks/useCurrency.js
import { useState, useEffect } from 'react'

// Configuración de monedas por país
const CURRENCY_CONFIG = {
  PE: { currency: 'PEN', symbol: 'S/',  proPrize: 19,     businessPrice: 39,     name: 'Perú'      },
  CO: { currency: 'COP', symbol: '$',   proPrize: 75000,  businessPrice: 150000, name: 'Colombia'  },
  MX: { currency: 'MXN', symbol: '$',   proPrize: 350,    businessPrice: 700,    name: 'México'    },
  AR: { currency: 'ARS', symbol: '$',   proPrize: 15000,  businessPrice: 30000,  name: 'Argentina' },
  CL: { currency: 'CLP', symbol: '$',   proPrize: 17000,  businessPrice: 35000,  name: 'Chile'     },
  BR: { currency: 'BRL', symbol: 'R$',  proPrize: 95,     businessPrice: 190,    name: 'Brasil'    },
  UY: { currency: 'UYU', symbol: '$',   proPrize: 750,    businessPrice: 1500,   name: 'Uruguay'   },
  BO: { currency: 'BOB', symbol: 'Bs',  proPrize: 135,    businessPrice: 270,    name: 'Bolivia'   },
  EC: { currency: 'USD', symbol: '$',   proPrize: 5,      businessPrice: 10,     name: 'Ecuador'   },
  PY: { currency: 'PYG', symbol: '₲',   proPrize: 35000,  businessPrice: 70000,  name: 'Paraguay'  },
  VE: { currency: 'USD', symbol: '$',   proPrize: 5,      businessPrice: 10,     name: 'Venezuela' },
}

const DEFAULT_CURRENCY = CURRENCY_CONFIG.PE

function formatPrice(amount, currency) {
  if (currency === 'COP' || currency === 'CLP' || currency === 'PYG' || currency === 'ARS') {
    return amount.toLocaleString('es-CO', { maximumFractionDigits: 0 })
  }
  return amount.toLocaleString('es-PE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

export function useCurrency() {
  const [currencyInfo, setCurrencyInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Revisar caché primero (válido por 24 horas)
    const cached = localStorage.getItem('fluxy_currency')
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
          setCurrencyInfo(data)
          setLoading(false)
          return
        }
      } catch {}
    }

    // Detectar país por IP
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        const countryCode = data.country_code || 'PE'
        const config = CURRENCY_CONFIG[countryCode] || DEFAULT_CURRENCY
        const result = { ...config, countryCode }
        setCurrencyInfo(result)
        localStorage.setItem('fluxy_currency', JSON.stringify({
          data: result,
          timestamp: Date.now(),
        }))
      })
      .catch(() => {
        setCurrencyInfo({ ...DEFAULT_CURRENCY, countryCode: 'PE' })
      })
      .finally(() => setLoading(false))
  }, [])

  const formatProPrice = (months = 1) => {
    if (!currencyInfo) return 'S/ 19'
    const price = currencyInfo.proPrize * months
    return `${currencyInfo.symbol} ${formatPrice(price, currencyInfo.currency)}`
  }

  const formatBusinessPrice = (months = 1) => {
    if (!currencyInfo) return 'S/ 39'
    const price = currencyInfo.businessPrice * months
    return `${currencyInfo.symbol} ${formatPrice(price, currencyInfo.currency)}`
  }

  return {
    currencyInfo: currencyInfo || DEFAULT_CURRENCY,
    loading,
    formatProPrice,
    formatBusinessPrice,
  }
}
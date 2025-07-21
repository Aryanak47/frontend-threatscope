'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuthStore } from '@/stores/auth'
import { apiClient } from '@/lib/api'
import { MockPaymentModal } from '@/components/mock-payment-modal'
import { 
  Check, 
  Shield, 
  Search, 
  Bell, 
  Download, 
  Zap, 
  Crown,
  Star,
  ArrowRight,
  Users,
  Clock,
  Mail,
  Webhook,
  Loader2
} from 'lucide-react'

interface PlanData {
  id: number
  planType: string
  displayName: string
  description: string
  price: number
  currency: string
  dailySearches: number
  monthlySearches: number
  maxMonitoringItems: number
  monitoringFrequencies: string
  emailAlerts: boolean
  inAppAlerts: boolean
  webhookAlerts: boolean
  apiAccess: boolean
  realTimeMonitoring: boolean
  prioritySupport: boolean
  customIntegrations: boolean
  isActive: boolean
  sortOrder: number
}

// Fallback static data if API fails
const fallbackPlans = [
  {
    id: 1,
    planType: 'FREE',
    displayName: 'Free',
    description: 'Perfect for trying out ThreatScope',
    price: 0,
    currency: 'USD',
    dailySearches: 20,
    monthlySearches: 600,
    maxMonitoringItems: 0,
    monitoringFrequencies: '',
    emailAlerts: false,
    inAppAlerts: true,
    webhookAlerts: false,
    apiAccess: false,
    realTimeMonitoring: false,
    prioritySupport: false,
    customIntegrations: false,
    isActive: true,
    sortOrder: 1
  },
  {
    id: 2,
    planType: 'BASIC',
    displayName: 'Basic',
    description: 'Essential monitoring for individuals',
    price: 9.99,
    currency: 'USD',
    dailySearches: 100,
    monthlySearches: 3000,
    maxMonitoringItems: 5,
    monitoringFrequencies: 'HOURLY,DAILY,WEEKLY',
    emailAlerts: true,
    inAppAlerts: true,
    webhookAlerts: false,
    apiAccess: false,
    realTimeMonitoring: false,
    prioritySupport: false,
    customIntegrations: false,
    isActive: true,
    sortOrder: 2
  },
  {
    id: 3,
    planType: 'PROFESSIONAL',
    displayName: 'Professional',
    description: 'Advanced monitoring for teams',
    price: 29.99,
    currency: 'USD',
    dailySearches: 1000,
    monthlySearches: 30000,
    maxMonitoringItems: 25,
    monitoringFrequencies: 'REAL_TIME,HOURLY,DAILY,WEEKLY',
    emailAlerts: true,
    inAppAlerts: true,
    webhookAlerts: true,
    apiAccess: true,
    realTimeMonitoring: true,
    prioritySupport: true,
    customIntegrations: false,
    isActive: true,
    sortOrder: 3
  },
  {
    id: 4,
    planType: 'ENTERPRISE',
    displayName: 'Enterprise',
    description: 'Full-scale monitoring for organizations',
    price: 0, // Custom pricing
    currency: 'USD',
    dailySearches: -1, // Unlimited
    monthlySearches: -1,
    maxMonitoringItems: -1,
    monitoringFrequencies: 'REAL_TIME,HOURLY,DAILY,WEEKLY',
    emailAlerts: true,
    inAppAlerts: true,
    webhookAlerts: true,
    apiAccess: true,
    realTimeMonitoring: true,
    prioritySupport: true,
    customIntegrations: true,
    isActive: true,
    sortOrder: 4
  }
]

export default function PricingPage() {
  const { isAuthenticated, user } = useAuthStore()
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [plans, setPlans] = useState<PlanData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUsingFallback, setIsUsingFallback] = useState(false)
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean
    selectedPlan: { name: string; price: number; type: string } | null
  }>({ isOpen: false, selectedPlan: null })

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setIsLoading(true)
        console.log('🔄 Fetching plans from backend...')
        const plansData = await apiClient.getPlans()
        console.log('✅ Plans fetched successfully:', plansData)
        setPlans(plansData)
        setIsUsingFallback(false)
      } catch (error) {
        console.warn('⚠️ Failed to fetch plans from backend, using fallback data:', error)
        setPlans(fallbackPlans)
        setIsUsingFallback(true)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlans()
  }, [])

  const handleUpgrade = (planName: string, planType: string, price: number) => {
    if (!isAuthenticated) {
      // Redirect to login for non-authenticated users
      window.location.href = '/login?redirect=/pricing'
      return
    }
    
    if (planType === 'ENTERPRISE') {
      // Contact sales for enterprise
      window.open('mailto:sales@threatscope.com?subject=Enterprise Plan Inquiry', '_blank')
      return
    }
    
    if (planType === 'FREE') {
      // Already on free plan
      return
    }
    
    // Open mock payment modal
    setPaymentModal({
      isOpen: true,
      selectedPlan: {
        name: planName,
        price: price,
        type: planType
      }
    })
  }

  const formatFeatures = (plan: PlanData) => {
    const features = []
    
    // Searches - handle both frontend fallback and backend format
    const dailySearches = plan.dailySearches || plan.daily_searches || 0
    const monthlySearches = plan.monthlySearches || plan.monthly_searches || 0
    
    if (dailySearches === -1 || dailySearches >= 10000) {
      features.push('Unlimited searches')
    } else {
      features.push(`${dailySearches} searches per day`)
    }
    
    // Monitoring - handle both formats
    const maxMonitoring = plan.maxMonitoringItems || plan.max_monitoring_items || 0
    
    if (maxMonitoring === 0) {
      // Will be shown in limitations
    } else if (maxMonitoring === -1 || maxMonitoring >= 100) {
      features.push('Unlimited monitoring')
    } else {
      features.push(`${maxMonitoring} monitoring items`)
    }
    
    // Frequencies - handle both formats
    const frequencies = plan.monitoringFrequencies || plan.monitoring_frequencies || ''
    if (frequencies) {
      let freqArray = []
      try {
        // Try parsing as JSON array (backend format)
        freqArray = JSON.parse(frequencies)
      } catch {
        // Fall back to comma-separated (frontend format)
        freqArray = frequencies.split(',')
      }
      
      if (freqArray.includes('REAL_TIME')) {
        features.push('Real-time alerts')
      }
    }
    
    // Alert types - handle both formats
    const emailAlerts = plan.emailAlerts ?? plan.email_alerts ?? false
    const inAppAlerts = plan.inAppAlerts ?? plan.in_app_alerts ?? false
    const webhookAlerts = plan.webhookAlerts ?? plan.webhook_alerts ?? false
    
    if (emailAlerts) features.push('Email alerts')
    if (inAppAlerts) features.push('In-app notifications')
    if (webhookAlerts) features.push('Webhook alerts')
    
    // Other features - handle both formats
    const apiAccess = plan.apiAccess ?? plan.api_access ?? false
    const prioritySupport = plan.prioritySupport ?? plan.priority_support ?? false
    const customIntegrations = plan.customIntegrations ?? plan.custom_integrations ?? false
    
    if (apiAccess) features.push('API access')
    if (prioritySupport) features.push('Priority support')
    if (customIntegrations) features.push('Custom integrations')
    
    return features
  }

  const formatLimitations = (plan: PlanData) => {
    const limitations = []
    
    // Handle both frontend and backend formats
    const maxMonitoring = plan.maxMonitoringItems || plan.max_monitoring_items || 0
    const emailAlerts = plan.emailAlerts ?? plan.email_alerts ?? false
    const apiAccess = plan.apiAccess ?? plan.api_access ?? false
    const webhookAlerts = plan.webhookAlerts ?? plan.webhook_alerts ?? false
    
    if (maxMonitoring === 0) {
      limitations.push('No monitoring')
      limitations.push('No alerts')
    }
    if (!emailAlerts) limitations.push('No email alerts')
    if (!apiAccess) limitations.push('No API access')
    if (!webhookAlerts) limitations.push('No webhook alerts')
    
    return limitations
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container max-w-7xl mx-auto px-6 py-8">
          <div className="text-center py-20">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Loading pricing plans...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Choose Your ThreatScope Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upgrade to unlock monitoring, alerts, and advanced threat intelligence features
          </p>
          {isUsingFallback && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg max-w-md mx-auto">
              <p className="text-sm text-yellow-800">
                📡 Using offline pricing data. Connect to backend for latest plans.
              </p>
            </div>
          )}
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 p-1 rounded-lg flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {plans.map((plan, index) => {
            // Calculate pricing - handle both frontend and backend formats
            const planType = plan.planType || plan.plan_type || 'UNKNOWN'
            const displayName = plan.displayName || plan.display_name || 'Unknown Plan'
            const isCustomPricing = planType === 'ENTERPRISE' || (plan.price === 0 && planType !== 'FREE')
            const monthlyAmount = plan.price || 0
            const yearlyAmount = monthlyAmount * 12 * 0.8
            
            const displayPrice = isCustomPricing 
              ? 'Custom'
              : billingCycle === 'yearly' && planType !== 'FREE'
              ? `${yearlyAmount.toFixed(0)}`
              : planType === 'FREE' 
              ? '$0'
              : `${monthlyAmount}`
              
            const displayPeriod = isCustomPricing 
              ? 'pricing'
              : billingCycle === 'yearly' && planType !== 'FREE'
              ? 'year' 
              : planType === 'FREE'
              ? 'forever'
              : 'per month'

            const isPopular = planType === 'BASIC'
            const features = formatFeatures(plan)
            const limitations = formatLimitations(plan)

            return (
              <Card 
                key={plan.id}
                className={`relative p-6 flex flex-col h-full ${
                  isPopular ? 'border-2 border-blue-500 shadow-lg' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold mb-2">{displayName}</h3>
                  <div className="mb-2">
                    <span className="text-3xl font-bold">{displayPrice}</span>
                    <span className="text-gray-500 ml-1">/{displayPeriod}</span>
                  </div>
                  {billingCycle === 'yearly' && planType !== 'FREE' && !isCustomPricing && (
                    <div className="text-sm text-green-600 font-medium">
                      Save ${(monthlyAmount * 12 * 0.2).toFixed(0)}/year
                    </div>
                  )}
                  <p className="text-gray-600 text-sm mt-2">{plan.description || plan.description || ''}</p>
                </div>

                {/* Features - flexible height */}
                <div className="flex-grow">
                  <ul className="space-y-3 mb-6">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm">
                        <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {limitations.map((limitation, idx) => (
                      <li key={idx} className="flex items-start text-sm text-gray-400">
                        <span className="w-4 h-4 mr-2 flex-shrink-0 text-center leading-4">×</span>
                        <span>{limitation}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Button - always at bottom */}
                <div className="mt-auto">
                  <Button
                    onClick={() => handleUpgrade(displayName, planType, monthlyAmount)}
                    disabled={planType === 'FREE'}
                    className={`w-full h-12 ${
                      isPopular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : planType === 'PROFESSIONAL'
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : planType === 'ENTERPRISE'
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-gray-600 hover:bg-gray-700 text-white'
                    }`}
                    variant={planType === 'FREE' ? 'outline' : 'default'}
                  >
                    {planType === 'FREE' 
                      ? 'Current Plan'
                      : planType === 'ENTERPRISE'
                      ? 'Contact Sales'
                      : `Upgrade to ${displayName}`
                    }
                    {planType !== 'FREE' && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Data Source Info */}
        <div className="text-center text-sm text-gray-500 mb-8">
          {isUsingFallback ? (
            '📡 Pricing data: Offline fallback • Backend: Disconnected'
          ) : (
            '🔗 Pricing data: Live from backend • Last updated: Just now'
          )}
        </div>
        
        {/* Mock Payment Modal */}
        {paymentModal.selectedPlan && (
          <MockPaymentModal
            isOpen={paymentModal.isOpen}
            onClose={() => setPaymentModal({ isOpen: false, selectedPlan: null })}
            selectedPlan={paymentModal.selectedPlan}
            billingCycle={billingCycle}
          />
        )}
      </div>
    </MainLayout>
  )
}

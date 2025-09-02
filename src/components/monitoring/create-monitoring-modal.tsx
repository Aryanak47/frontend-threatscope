import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Mail, 
  Globe, 
  User, 
  Shield, 
  Hash, 
  X,
  Bell,
  Webhook,
  Clock,
  AlertTriangle,
  Edit,
  Eye
} from 'lucide-react'
import { CreateMonitoringItemRequest, DuplicateError } from '@/types'
import { useMonitoringStore } from '@/stores/monitoring'
import { useRouter } from 'next/navigation'

interface CreateMonitoringModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateMonitoringItemRequest) => Promise<void>
  userPlan?: string // Add user plan to filter frequencies
}

interface MonitoringFormData {
  monitorName: string
  monitorType: 'EMAIL' | 'DOMAIN' | 'USERNAME' | 'IP_ADDRESS' | 'KEYWORD'
  targetValue: string
  description?: string
  frequency: 'REAL_TIME' | 'HOURLY' | 'DAILY' | 'WEEKLY'
  emailAlerts: boolean
  inAppAlerts: boolean
  webhookAlerts: boolean
}

// Duplicate Conflict Dialog Component
function DuplicateConflictDialog({ 
  duplicateError, 
  onClose, 
  onEditExisting, 
  onViewExisting 
}: {
  duplicateError: DuplicateError
  onClose: () => void
  onEditExisting: () => void
  onViewExisting: () => void
}) {
  console.log('💬 Duplicate dialog rendering with error:', duplicateError)
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          <h3 className="text-lg font-semibold text-slate-100">Duplicate Monitor Detected</h3>
        </div>
        
        <div className="space-y-4">
          <p className="text-slate-300">
            {duplicateError.message}
          </p>
          
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <div className="text-sm">
              <div className="font-medium text-amber-400">Target:</div>
              <div className="text-amber-300">{duplicateError.targetValue}</div>
            </div>
            <div className="text-sm mt-2">
              <div className="font-medium text-amber-400">Type:</div>
              <div className="text-amber-300">{duplicateError.monitorType}</div>
            </div>
          </div>
          
          <p className="text-sm text-slate-400">
            {duplicateError.suggestion}
          </p>
        </div>
        
        <div className="flex flex-col gap-2 mt-6">
          <Button 
            onClick={onEditExisting}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Existing Monitor
          </Button>
          
          <Button 
            onClick={onViewExisting}
            variant="outline"
            className="w-full"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Existing Monitor
          </Button>
          
          <Button 
            onClick={onClose}
            variant="ghost"
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

const monitorTypes = [
  {
    value: 'EMAIL',
    label: 'Email Address',
    icon: Mail,
    description: 'Monitor for breaches containing specific email addresses',
    placeholder: 'john@example.com'
  },
  {
    value: 'DOMAIN',
    label: 'Domain',
    icon: Globe,
    description: 'Monitor for breaches affecting entire domains',
    placeholder: 'company.com'
  },
  {
    value: 'USERNAME',
    label: 'Username',
    icon: User,
    description: 'Monitor for compromised usernames across platforms',
    placeholder: 'johndoe123'
  },
  {
    value: 'IP_ADDRESS',
    label: 'IP Address',
    icon: Shield,
    description: 'Monitor for exposed IP addresses',
    placeholder: '192.168.1.1'
  },
  {
    value: 'KEYWORD',
    label: 'Keyword',
    icon: Hash,
    description: 'Monitor for specific terms or passwords',
    placeholder: 'company-internal'
  }
]

const frequencies = [
  { 
    value: 'REAL_TIME', 
    label: 'Real-time', 
    description: '⚡ Immediate alerts (recommended)', 
    requiresPremium: true,
    priority: 1,
    icon: '🚨',
    benefits: ['Instant threat detection', 'Immediate response capability', 'Maximum security coverage']
  },
  { 
    value: 'HOURLY', 
    label: 'Hourly', 
    description: '🕐 Check every hour', 
    requiresPremium: true,
    priority: 2,
    icon: '⏰',
    benefits: ['Fast threat detection', 'Good for most use cases']
  },
  { 
    value: 'DAILY', 
    label: 'Daily', 
    description: '📅 Check once per day', 
    requiresPremium: false,
    priority: 3,
    icon: '📊',
    benefits: ['Basic monitoring', 'Suitable for non-critical assets']
  },
  { 
    value: 'WEEKLY', 
    label: 'Weekly', 
    description: '📊 Check once per week', 
    requiresPremium: false,
    priority: 4,
    icon: '📈',
    benefits: ['Basic monitoring', 'Low frequency checks']
  }
]

export function CreateMonitoringModal({ isOpen, onClose, onSubmit, userPlan = 'FREE' }: CreateMonitoringModalProps) {
  const router = useRouter()
  const { duplicateError, clearDuplicateError, isCreating } = useMonitoringStore()
  
  // Debug logging for duplicate error
  console.log('🔍 Modal state:', {
    isOpen,
    duplicateError: !!duplicateError,
    duplicateErrorDetails: duplicateError ? {
      message: duplicateError.message,
      targetValue: duplicateError.targetValue,
      existingItemId: duplicateError.existingItemId
    } : null
  })
  
  // Monitor duplicate error changes
  React.useEffect(() => {
    if (duplicateError) {
      console.log('🚨 DUPLICATE ERROR STATE CHANGED:', duplicateError)
    }
  }, [duplicateError])
  
  // Filter frequencies based on user plan and sort by priority
  const availableFrequencies = frequencies
    .filter(freq => {
      if (userPlan === 'FREE') {
        return !freq.requiresPremium
      }
      if (userPlan === 'BASIC') {
        return !freq.requiresPremium // BASIC plan only gets DAILY and WEEKLY
      }
      return true // PROFESSIONAL and ENTERPRISE get all frequencies
    })
    .sort((a, b) => a.priority - b.priority) // Sort by priority (Real-time first)

  // Set default frequency based on user plan
  const getDefaultFrequency = () => {
    if (userPlan === 'PROFESSIONAL' || userPlan === 'ENTERPRISE') {
      return 'REAL_TIME' // Default to real-time for premium users
    }
    return 'DAILY' // Default to daily for free/basic users
  }

  const [formData, setFormData] = useState<MonitoringFormData>(() => ({
    monitorName: '',
    monitorType: 'EMAIL',
    targetValue: '',
    description: '',
    frequency: getDefaultFrequency() as 'REAL_TIME' | 'HOURLY' | 'DAILY' | 'WEEKLY',
    emailAlerts: true,
    inAppAlerts: true,
    webhookAlerts: false
  }))

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedMonitorType = monitorTypes.find(t => t.value === formData.monitorType)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.monitorName.trim()) {
      newErrors.monitorName = 'Monitor name is required'
    }

    if (!formData.targetValue.trim()) {
      newErrors.targetValue = 'Target value is required'
    } else {
      // Basic validation based on monitor type
      switch (formData.monitorType) {
        case 'EMAIL':
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.targetValue)) {
            newErrors.targetValue = 'Please enter a valid email address'
          }
          break
        case 'DOMAIN':
          if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(formData.targetValue)) {
            newErrors.targetValue = 'Please enter a valid domain name'
          }
          break
        case 'IP_ADDRESS':
          if (!/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(formData.targetValue)) {
            newErrors.targetValue = 'Please enter a valid IP address'
          }
          break
      }
    }

    if (!formData.emailAlerts) {
      newErrors.alerts = 'Email notifications are required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      try {
        setIsSubmitting(true)
        const submitData: CreateMonitoringItemRequest = {
          monitorType: formData.monitorType,
          targetValue: formData.targetValue,
          monitorName: formData.monitorName,
          description: formData.description,
          frequency: formData.frequency,
          isActive: true,
          emailAlerts: formData.emailAlerts,
          inAppAlerts: true // Always enabled - users will see alerts in the app
          // webhookAlerts: false // Not implemented yet
        }
        
        await onSubmit(submitData)
        
        // Close modal on success
        onClose()
        resetForm()
      } catch (error) {
        // Error is handled by the parent component and will show appropriate message
        console.log('Error creating monitor:', error)
      } finally {
        setIsSubmitting(false)
      }
    }
  }
  
  const resetForm = () => {
    setFormData({
      monitorName: '',
      monitorType: 'EMAIL',
      targetValue: '',
      description: '',
      frequency: getDefaultFrequency() as 'REAL_TIME' | 'HOURLY' | 'DAILY' | 'WEEKLY',
      emailAlerts: true,
      inAppAlerts: true,
      webhookAlerts: false // Always false for now
    })
    setErrors({})
  }
  
  const handleCloseDuplicateDialog = () => {
    clearDuplicateError()
  }
  
  const handleEditExisting = () => {
    if (duplicateError?.existingItemId) {
      clearDuplicateError()
      onClose()
      router.push(`/monitoring/${duplicateError.existingItemId}/edit`)
    }
  }
  
  const handleViewExisting = () => {
    if (duplicateError?.existingItemId) {
      clearDuplicateError()
      onClose()
      router.push(`/monitoring/${duplicateError.existingItemId}`)
    }
  }

  if (!isOpen) return null

  // DEBUG: Show duplicate error state visually
  if (duplicateError) {
    console.log('🚨 DUPLICATE ERROR EXISTS - SHOULD SHOW DIALOG!')
  }

  return (
    <>
    {/* Main Modal */}
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-slate-900 border border-slate-700/50 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
    <div className="flex items-center justify-between mb-6">
    <h3 className="text-xl font-semibold text-slate-100">Add New Monitor</h3>
    <Button variant="ghost" size="sm" onClick={onClose}>
      <X className="h-4 w-4" />
    </Button>
    </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Monitor Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Monitor Name *
            </label>
            <input
              type="text"
              value={formData.monitorName}
              onChange={(e) => setFormData(prev => ({ ...prev, monitorName: e.target.value }))}
              placeholder="e.g., CEO Email Monitor"
              className={`w-full px-3 py-2 bg-slate-800/50 border rounded-lg text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all ${
                errors.monitorName ? 'border-red-500' : 'border-slate-600/50'
              }`}
            />
            {errors.monitorName && (
              <p className="text-red-500 text-xs mt-1">{errors.monitorName}</p>
            )}
          </div>

          {/* Monitor Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Monitor Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {monitorTypes.map((type) => {
                const Icon = type.icon
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      monitorType: type.value as any,
                      targetValue: '' // Reset target value when type changes
                    }))}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      formData.monitorType === type.value
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-600/50 bg-slate-800/30 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-slate-200">{type.label}</div>
                        <div className="text-xs text-slate-400">{type.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Target Value */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {selectedMonitorType?.label} to Monitor *
            </label>
            <input
              type="text"
              value={formData.targetValue}
              onChange={(e) => setFormData(prev => ({ ...prev, targetValue: e.target.value }))}
              placeholder={selectedMonitorType?.placeholder}
              className={`w-full px-3 py-2 bg-slate-800/50 border rounded-lg text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all ${
                errors.targetValue ? 'border-red-500' : 'border-slate-600/50'
              }`}
            />
            {errors.targetValue && (
              <p className="text-red-500 text-xs mt-1">{errors.targetValue}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Additional notes about this monitor..."
              rows={3}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition-all"
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Check Frequency *
            </label>
            
            {/* Real-time Promotion Banner for Premium Users */}
            {(userPlan === 'PROFESSIONAL' || userPlan === 'ENTERPRISE') && (
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">🚀</span>
                  <span className="font-semibold text-blue-400">Real-time Monitoring Available!</span>
                </div>
                <p className="text-sm text-blue-300">
                  Get instant alerts the moment threats are detected. Perfect for critical assets and maximum protection.
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-3">
              {availableFrequencies.map((freq) => (
                <button
                  key={freq.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, frequency: freq.value as any }))}
                  className={`p-4 border rounded-lg text-left transition-all relative ${
                    formData.frequency === freq.value
                      ? freq.value === 'REAL_TIME' 
                        ? 'border-blue-500 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 ring-2 ring-blue-500/20'
                        : 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-600/50 bg-slate-800/30 hover:bg-slate-700/50 hover:border-slate-500/50'
                  }`}
                >
                  {/* Recommended Badge for Real-time */}
                  {freq.value === 'REAL_TIME' && !freq.requiresPremium && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Recommended
                    </div>
                  )}
                  
                  {/* Premium Badge */}
                  {freq.requiresPremium && (userPlan === 'FREE' || userPlan === 'BASIC') && (
                    <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Premium
                    </div>
                  )}
                  
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{freq.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-lg text-slate-200">{freq.label}</span>
                        {freq.value === 'REAL_TIME' && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                            INSTANT
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-400 mb-2">{freq.description}</div>
                      
                      {/* Benefits */}
                      <div className="space-y-1">
                        {freq.benefits?.map((benefit, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs text-slate-400">
                            <span className="text-green-500">✓</span>
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Premium Notice */}
                      {freq.requiresPremium && (userPlan === 'FREE' || userPlan === 'BASIC') && (
                        <div className="mt-2 text-xs text-amber-400 font-medium">
                          🔒 Requires {userPlan === 'FREE' ? 'Basic' : 'Professional'} plan or higher
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* Upgrade Notice */}
            {(userPlan === 'FREE' || userPlan === 'BASIC') && (
              <div className="mt-4 p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">🎆</span>
                  <span className="font-semibold text-amber-400">
                    Upgrade for Real-time Protection
                  </span>
                </div>
                <p className="text-sm text-amber-300 mb-2">
                  Get instant threat alerts and maximum security coverage with real-time monitoring.
                </p>
                <div className="text-xs text-amber-400">
                  • Professional Plan: Real-time + Hourly monitoring
                  {userPlan === 'FREE' && <><br/>• Basic Plan: Daily + Weekly monitoring</>}
                </div>
              </div>
            )}
          </div>

          {/* Notification Settings */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notification Methods *
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.emailAlerts}
                  onChange={(e) => setFormData(prev => ({ ...prev, emailAlerts: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-slate-200">Email Notifications</span>
              </label>

              <label className="flex items-center space-x-3 opacity-50 cursor-not-allowed">
                <input
                  type="checkbox"
                  checked={false}
                  disabled={true}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded cursor-not-allowed"
                />
                <Webhook className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-slate-400">Webhook Notifications</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-2">
                  Coming Soon
                </span>
              </label>
            </div>
            {errors.alerts && (
              <p className="text-red-500 text-xs mt-1">{errors.alerts}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700/50">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Monitor'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </>
  )
}

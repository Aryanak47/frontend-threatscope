import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center space-x-3 mb-4">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-900">Duplicate Monitor Detected</h3>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            {duplicateError.message}
          </p>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="text-sm">
              <div className="font-medium text-amber-800">Target:</div>
              <div className="text-amber-700">{duplicateError.targetValue}</div>
            </div>
            <div className="text-sm mt-2">
              <div className="font-medium text-amber-800">Type:</div>
              <div className="text-amber-700">{duplicateError.monitorType}</div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
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
  { value: 'DAILY', label: 'Daily', description: 'Check once per day', requiresPremium: false },
  { value: 'WEEKLY', label: 'Weekly', description: 'Check once per week', requiresPremium: false },
  { value: 'HOURLY', label: 'Hourly', description: 'Check every hour', requiresPremium: true },
  { value: 'REAL_TIME', label: 'Real-time', description: 'Immediate alerts', requiresPremium: true }
]

export function CreateMonitoringModal({ isOpen, onClose, onSubmit, userPlan = 'FREE' }: CreateMonitoringModalProps) {
  const router = useRouter()
  const { duplicateError, clearDuplicateError, isCreating } = useMonitoringStore()
  
  // Filter frequencies based on user plan
  const availableFrequencies = frequencies.filter(freq => {
    if (userPlan === 'FREE') {
      return !freq.requiresPremium
    }
    if (userPlan === 'BASIC') {
      return !freq.requiresPremium // BASIC plan only gets DAILY and WEEKLY
    }
    return true // PROFESSIONAL and ENTERPRISE get all frequencies
  })

  const [formData, setFormData] = useState<MonitoringFormData>({
    monitorName: '',
    monitorType: 'EMAIL',
    targetValue: '',
    description: '',
    frequency: 'DAILY', // Default to DAILY instead of REAL_TIME
    emailAlerts: true,
    inAppAlerts: true,
    webhookAlerts: false
  })

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

    if (!formData.emailAlerts && !formData.inAppAlerts && !formData.webhookAlerts) {
      newErrors.alerts = 'Please select at least one notification method'
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
          inAppAlerts: formData.inAppAlerts
        }
        
        await onSubmit(submitData)
        
        // Only close and reset if successful
        onClose()
        resetForm()
      } catch (error) {
        // Error is handled by the store and will show duplicate dialog if needed
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
      frequency: 'DAILY',
      emailAlerts: true,
      inAppAlerts: true,
      webhookAlerts: false
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

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Add New Monitor</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Monitor Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monitor Name *
            </label>
            <input
              type="text"
              value={formData.monitorName}
              onChange={(e) => setFormData(prev => ({ ...prev, monitorName: e.target.value }))}
              placeholder="e.g., CEO Email Monitor"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.monitorName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.monitorName && (
              <p className="text-red-500 text-xs mt-1">{errors.monitorName}</p>
            )}
          </div>

          {/* Monitor Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Target Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedMonitorType?.label} to Monitor *
            </label>
            <input
              type="text"
              value={formData.targetValue}
              onChange={(e) => setFormData(prev => ({ ...prev, targetValue: e.target.value }))}
              placeholder={selectedMonitorType?.placeholder}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.targetValue ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.targetValue && (
              <p className="text-red-500 text-xs mt-1">{errors.targetValue}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Additional notes about this monitor..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Check Frequency *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {availableFrequencies.map((freq) => (
                <button
                  key={freq.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, frequency: freq.value as any }))}
                  className={`p-3 border rounded-lg text-left transition-colors ${
                    formData.frequency === freq.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium">{freq.label}</div>
                  <div className="text-xs text-gray-500">{freq.description}</div>
                  {freq.requiresPremium && (
                    <div className="text-xs text-amber-600 mt-1">Premium feature</div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Show upgrade notice if user has limited access */}
            {userPlan === 'BASIC' && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                💡 Upgrade to Professional for Real-time and Hourly monitoring
              </div>
            )}
          </div>

          {/* Notification Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <span className="text-sm">Email Notifications</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.inAppAlerts}
                  onChange={(e) => setFormData(prev => ({ ...prev, inAppAlerts: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <Bell className="h-4 w-4 text-gray-500" />
                <span className="text-sm">In-App Alerts</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.webhookAlerts}
                  onChange={(e) => setFormData(prev => ({ ...prev, webhookAlerts: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <Webhook className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Webhook Notifications</span>
              </label>
            </div>
            {errors.alerts && (
              <p className="text-red-500 text-xs mt-1">{errors.alerts}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
    
    {/* Duplicate Conflict Dialog */}
    {duplicateError && (
      <DuplicateConflictDialog
        duplicateError={duplicateError}
        onClose={handleCloseDuplicateDialog}
        onEditExisting={handleEditExisting}
        onViewExisting={handleViewExisting}
      />
    )}
  </>
  )
}

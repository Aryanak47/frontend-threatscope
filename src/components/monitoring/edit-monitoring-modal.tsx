import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Mail, 
  Globe, 
  User, 
  Shield, 
  Hash, 
  X,
  Clock,
  Save
} from 'lucide-react'
import { UpdateMonitoringItemRequest, MonitoringItem } from '@/types'
import { useMonitoringStore } from '@/stores/monitoring'
import toastUtils from '@/lib/toast/index'

interface EditMonitoringModalProps {
  isOpen: boolean
  onClose: () => void
  monitoringItem: MonitoringItem | null
  userPlan?: string
}

interface EditFormData {
  monitorName: string
  description?: string
  frequency: 'REAL_TIME' | 'HOURLY' | 'DAILY' | 'WEEKLY'
  emailAlerts: boolean
  isActive: boolean
}

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

const getMonitorTypeIcon = (type: string) => {
  switch (type) {
    case 'EMAIL': return Mail
    case 'DOMAIN': return Globe
    case 'USERNAME': return User
    case 'IP_ADDRESS': return Shield
    case 'KEYWORD': return Hash
    default: return Mail
  }
}

export function EditMonitoringModal({ 
  isOpen, 
  onClose, 
  monitoringItem, 
  userPlan = 'FREE' 
}: EditMonitoringModalProps) {
  const { updateItem, isUpdating } = useMonitoringStore()
  
  // Filter frequencies based on user plan
  const availableFrequencies = frequencies
    .filter(freq => {
      if (userPlan === 'FREE') {
        return !freq.requiresPremium
      }
      if (userPlan === 'BASIC') {
        return !freq.requiresPremium
      }
      return true // PROFESSIONAL and ENTERPRISE get all frequencies
    })
    .sort((a, b) => a.priority - b.priority)

  const [formData, setFormData] = useState<EditFormData>({
    monitorName: '',
    description: '',
    frequency: 'DAILY',
    emailAlerts: true,
    isActive: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Populate form when monitoring item changes
  useEffect(() => {
    if (monitoringItem) {
      setFormData({
        monitorName: monitoringItem.monitorName,
        description: monitoringItem.description || '',
        frequency: monitoringItem.frequency as 'REAL_TIME' | 'HOURLY' | 'DAILY' | 'WEEKLY',
        emailAlerts: monitoringItem.emailAlerts,
        isActive: monitoringItem.isActive
      })
    }
  }, [monitoringItem])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.monitorName.trim()) {
      newErrors.monitorName = 'Monitor name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!monitoringItem || !validateForm()) return

    try {
      setIsSubmitting(true)
      
      const updateData: UpdateMonitoringItemRequest = {
        monitorName: formData.monitorName,
        description: formData.description,
        frequency: formData.frequency,
        emailAlerts: formData.emailAlerts,
        isActive: formData.isActive,
        inAppAlerts: true // Always enabled
      }
      
      const updatedItem = await updateItem(monitoringItem.id, updateData)
      
      if (updatedItem) {
        toastUtils.success({
          title: 'Monitor Updated Successfully!',
          message: `${monitoringItem.targetValue} settings have been updated`,
          tip: formData.frequency === 'REAL_TIME' ? 'You\'ll now get instant alerts!' : 'Monitor frequency has been changed'
        })
        onClose()
      }
    } catch (error) {
      console.error('Failed to update monitor:', error)
      toastUtils.error({
        title: 'Failed to Update Monitor',
        message: 'There was an error updating your monitor settings',
        tip: 'Please try again or contact support if the issue persists'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !monitoringItem) return null

  const MonitorIcon = getMonitorTypeIcon(monitoringItem.monitorType)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <MonitorIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="text-xl font-semibold">Edit Monitor</h3>
              <p className="text-sm text-gray-600">{monitoringItem.targetValue}</p>
            </div>
          </div>
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
            
            {/* Real-time Promotion Banner for Premium Users */}
            {(userPlan === 'PROFESSIONAL' || userPlan === 'ENTERPRISE') && (
              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-lg">🚀</span>
                  <span className="font-semibold text-blue-800">Real-time Monitoring Available!</span>
                </div>
                <p className="text-sm text-blue-700">
                  Upgrade to real-time monitoring for instant threat detection and maximum protection.
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
                        ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 ring-2 ring-blue-200'
                        : 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  {/* Recommended Badge for Real-time */}
                  {freq.value === 'REAL_TIME' && (userPlan === 'PROFESSIONAL' || userPlan === 'ENTERPRISE') && (
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
                        <span className="font-medium text-lg">{freq.label}</span>
                        {freq.value === 'REAL_TIME' && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                            INSTANT
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{freq.description}</div>
                      
                      {/* Benefits */}
                      <div className="space-y-1">
                        {freq.benefits?.map((benefit, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs text-gray-500">
                            <span className="text-green-500">✓</span>
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Premium Notice */}
                      {freq.requiresPremium && (userPlan === 'FREE' || userPlan === 'BASIC') && (
                        <div className="mt-2 text-xs text-amber-600 font-medium">
                          🔒 Requires {userPlan === 'FREE' ? 'Basic' : 'Professional'} plan or higher
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monitor Settings
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="text-sm">Monitor is active</span>
              </label>

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
            </div>
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
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Updating...' : 'Update Monitor'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

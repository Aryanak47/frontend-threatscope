'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Clock, 
  User, 
  Calendar,
  CheckCircle,
  XCircle,
  Settings,
  Plus,
  Trash2,
  Save,
  AlertCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

// Simple Toggle Component to replace Switch
interface ToggleProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

function Toggle({ checked, onCheckedChange }: ToggleProps) {
  return (
    <button
      type="button"
      className={`${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
      onClick={() => onCheckedChange(!checked)}
    >
      <span
        className={`${
          checked ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  )
}

interface AvailabilitySlot {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
  isActive: boolean
}

interface ExpertProfile {
  id: string
  name: string
  email: string
  specialization: string
  isAvailable: boolean
  isActive: boolean
  currentStatus: 'ONLINE' | 'BUSY' | 'OFFLINE'
  maxConcurrentSessions: number
  currentSessions: number
  timezone: string
  availabilitySlots: AvailabilitySlot[]
  statusMessage?: string
}

interface ExpertAvailabilityManagerProps {
  expertId?: string
  onAvailabilityUpdate?: (expertId: string, availability: any) => void
}

export function ExpertAvailabilityManager({ 
  expertId, 
  onAvailabilityUpdate 
}: ExpertAvailabilityManagerProps) {
  const [expert, setExpert] = useState<ExpertProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const daysOfWeek = [
    'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 
    'FRIDAY', 'SATURDAY', 'SUNDAY'
  ]

  const timezones = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Berlin', 'Europe/Madrid', 'Europe/Rome',
    'Asia/Tokyo', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Mumbai',
    'Australia/Sydney', 'UTC'
  ]

  // Load expert data (move inside useEffect to avoid dependency issues)
  useEffect(() => {
    const loadExpertData = async () => {
      setLoading(true)
      try {
        // TODO: Replace with actual API call
        const mockExpert: ExpertProfile = {
          id: expertId || '1',
          name: 'Security Expert',
          email: 'expert@threatscope.com',
          specialization: 'General Cybersecurity',
          isAvailable: true,
          isActive: true,
          currentStatus: 'ONLINE',
          maxConcurrentSessions: 3,
          currentSessions: 1,
          timezone: 'America/New_York',
          statusMessage: 'Available for consultations',
          availabilitySlots: [
            {
              id: '1',
              dayOfWeek: 'MONDAY',
              startTime: '09:00',
              endTime: '17:00',
              isActive: true
            },
            {
              id: '2',
              dayOfWeek: 'TUESDAY',
              startTime: '09:00',
              endTime: '17:00',
              isActive: true
            },
            {
              id: '3',
              dayOfWeek: 'WEDNESDAY',
              startTime: '09:00',
              endTime: '17:00',
              isActive: true
            },
            {
              id: '4',
              dayOfWeek: 'THURSDAY',
              startTime: '09:00',
              endTime: '17:00',
              isActive: true
            },
            {
              id: '5',
              dayOfWeek: 'FRIDAY',
              startTime: '09:00',
              endTime: '17:00',
              isActive: true
            }
          ]
        }
        
        setExpert(mockExpert)
        setStatusMessage(mockExpert.statusMessage || '')
      } catch (error) {
        toast.error('Failed to load expert data')
      } finally {
        setLoading(false)
      }
    }

    // Load data based on expertId
    loadExpertData()
  }, [expertId]) // Only expertId as dependency

  const loadExpertData = async () => {
    setLoading(true)
    try {
      // TODO: Replace with actual API call
      const mockExpert: ExpertProfile = {
        id: expertId || '1',
        name: 'Security Expert',
        email: 'expert@threatscope.com',
        specialization: 'General Cybersecurity',
        isAvailable: true,
        isActive: true,
        currentStatus: 'ONLINE',
        maxConcurrentSessions: 3,
        currentSessions: 1,
        timezone: 'America/New_York',
        statusMessage: 'Available for consultations',
        availabilitySlots: [
          {
            id: '1',
            dayOfWeek: 'MONDAY',
            startTime: '09:00',
            endTime: '17:00',
            isActive: true
          },
          {
            id: '2',
            dayOfWeek: 'TUESDAY',
            startTime: '09:00',
            endTime: '17:00',
            isActive: true
          },
          {
            id: '3',
            dayOfWeek: 'WEDNESDAY',
            startTime: '09:00',
            endTime: '17:00',
            isActive: true
          },
          {
            id: '4',
            dayOfWeek: 'THURSDAY',
            startTime: '09:00',
            endTime: '17:00',
            isActive: true
          },
          {
            id: '5',
            dayOfWeek: 'FRIDAY',
            startTime: '09:00',
            endTime: '17:00',
            isActive: true
          }
        ]
      }
      
      setExpert(mockExpert)
      setStatusMessage(mockExpert.statusMessage || '')
    } catch (error) {
      toast.error('Failed to load expert data')
    } finally {
      setLoading(false)
    }
  }

  const loadCurrentExpertData = async () => {
    // Same as loadExpertData but for current user
    loadExpertData()
  }

  const handleAvailabilityToggle = async (available: boolean) => {
    if (!expert) return

    setExpert({
      ...expert,
      isAvailable: available,
      currentStatus: available ? 'ONLINE' : 'OFFLINE'
    })

    // TODO: API call to update availability
    toast.success(`Availability ${available ? 'enabled' : 'disabled'}`)
    onAvailabilityUpdate?.(expert.id, { isAvailable: available })
  }

  const handleStatusChange = (status: 'ONLINE' | 'BUSY' | 'OFFLINE') => {
    if (!expert) return

    setExpert({
      ...expert,
      currentStatus: status,
      isAvailable: status !== 'OFFLINE'
    })
  }

  const addAvailabilitySlot = () => {
    if (!expert) return

    const newSlot: AvailabilitySlot = {
      id: Date.now().toString(),
      dayOfWeek: 'MONDAY',
      startTime: '09:00',
      endTime: '17:00',
      isActive: true
    }

    setExpert({
      ...expert,
      availabilitySlots: [...expert.availabilitySlots, newSlot]
    })
  }

  const updateAvailabilitySlot = (slotId: string, updates: Partial<AvailabilitySlot>) => {
    if (!expert) return

    setExpert({
      ...expert,
      availabilitySlots: expert.availabilitySlots.map(slot =>
        slot.id === slotId ? { ...slot, ...updates } : slot
      )
    })
  }

  const removeAvailabilitySlot = (slotId: string) => {
    if (!expert) return

    setExpert({
      ...expert,
      availabilitySlots: expert.availabilitySlots.filter(slot => slot.id !== slotId)
    })
  }

  const handleSave = async () => {
    if (!expert) return

    setSaving(true)
    try {
      // TODO: API call to save expert availability
      const updateData = {
        isAvailable: expert.isAvailable,
        currentStatus: expert.currentStatus,
        maxConcurrentSessions: expert.maxConcurrentSessions,
        timezone: expert.timezone,
        statusMessage,
        availabilitySlots: expert.availabilitySlots
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success('Availability settings saved successfully')
      onAvailabilityUpdate?.(expert.id, updateData)
    } catch (error) {
      toast.error('Failed to save availability settings')
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE': return 'bg-green-100 text-green-800'
      case 'BUSY': return 'bg-yellow-100 text-yellow-800'
      case 'OFFLINE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ONLINE': return <CheckCircle className="h-3 w-3" />
      case 'BUSY': return <Clock className="h-3 w-3" />
      case 'OFFLINE': return <XCircle className="h-3 w-3" />
      default: return null
    }
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p>Loading availability settings...</p>
          </div>
        </div>
      </Card>
    )
  }

  if (!expert) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p>Failed to load expert data</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <User className="h-5 w-5 mr-2" />
            Expert Status
          </h3>
          <Badge className={getStatusColor(expert.currentStatus)}>
            {getStatusIcon(expert.currentStatus)}
            <span className="ml-1">{expert.currentStatus}</span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Availability Status
              </label>
              <div className="flex items-center space-x-3">
                <Toggle
                  checked={expert.isAvailable}
                  onCheckedChange={handleAvailabilityToggle}
                />
                <span className={expert.isAvailable ? 'text-green-600' : 'text-red-600'}>
                  {expert.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Current Status
              </label>
              <Select 
                value={expert.currentStatus} 
                onValueChange={handleStatusChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONLINE">🟢 Online</SelectItem>
                  <SelectItem value="BUSY">🟡 Busy</SelectItem>
                  <SelectItem value="OFFLINE">🔴 Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Status Message
              </label>
              <Input
                value={statusMessage}
                onChange={(e) => setStatusMessage(e.target.value)}
                placeholder="e.g., Available for consultations"
                maxLength={100}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Max Concurrent Sessions
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                value={expert.maxConcurrentSessions}
                onChange={(e) => setExpert({
                  ...expert,
                  maxConcurrentSessions: parseInt(e.target.value) || 1
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Timezone
              </label>
              <Select 
                value={expert.timezone} 
                onValueChange={(timezone) => setExpert({ ...expert, timezone })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map(tz => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-600">
              <p>Current Sessions: {expert.currentSessions} / {expert.maxConcurrentSessions}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Weekly Schedule */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Weekly Schedule
          </h3>
          <Button onClick={addAvailabilitySlot} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Time Slot
          </Button>
        </div>

        <div className="space-y-3">
          {expert.availabilitySlots.map((slot) => (
            <div key={slot.id} className="flex items-center space-x-3 p-3 border rounded-lg">
              <Toggle
                checked={slot.isActive}
                onCheckedChange={(isActive) => updateAvailabilitySlot(slot.id, { isActive })}
              />
              
              <Select 
                value={slot.dayOfWeek}
                onValueChange={(dayOfWeek) => updateAvailabilitySlot(slot.id, { dayOfWeek })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {daysOfWeek.map(day => (
                    <SelectItem key={day} value={day}>
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="time"
                value={slot.startTime}
                onChange={(e) => updateAvailabilitySlot(slot.id, { startTime: e.target.value })}
                className="w-32"
              />

              <span>to</span>

              <Input
                type="time"
                value={slot.endTime}
                onChange={(e) => updateAvailabilitySlot(slot.id, { endTime: e.target.value })}
                className="w-32"
              />

              <Button
                variant="outline"
                size="sm"
                onClick={() => removeAvailabilitySlot(slot.id)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {expert.availabilitySlots.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No availability slots configured</p>
              <p className="text-sm">Add time slots to let users know when you're available</p>
            </div>
          )}
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Availability Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

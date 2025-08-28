'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  AlertTriangle, 
  Shield, 
  Calendar,
  CheckCircle,
  RefreshCw,
  Settings
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { apiClient } from '@/lib/api'

interface AdminSessionExtensionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId: string
  sessionStatus: string
  currentExpiry?: string
  isExpired: boolean
  isAdminManaged?: boolean
  onSuccess: () => void
}

export function AdminSessionExtensionDialog({
  open,
  onOpenChange,
  sessionId,
  sessionStatus,
  currentExpiry,
  isExpired,
  isAdminManaged = false,
  onSuccess
}: AdminSessionExtensionDialogProps) {
  const [loading, setLoading] = useState(false)
  const [action, setAction] = useState<'extend' | 'manage' | 'reactivate'>('extend')
  
  // Extension form
  const [additionalHours, setAdditionalHours] = useState('24')
  const [reason, setReason] = useState('')
  
  // Management form
  const [enableAdminManagement, setEnableAdminManagement] = useState(!isAdminManaged)
  const [managementReason, setManagementReason] = useState('')

  const handleExtendSession = async () => {
    if (!additionalHours || parseInt(additionalHours) <= 0) {
      toast.error('Please enter a valid number of hours')
      return
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for the extension')
      return
    }

    setLoading(true)
    try {
      await apiClient.request({
        method: 'POST',
        url: `/admin/consultation/sessions/${sessionId}/extend`,
        data: {
          additionalHours: parseInt(additionalHours),
          reason: reason.trim()
        }
      })

      toast.success(`Session extended by ${additionalHours} hours successfully`)
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to extend session')
    } finally {
      setLoading(false)
    }
  }

  const handleSetAdminManaged = async () => {
    if (!managementReason.trim()) {
      toast.error('Please provide a reason for the management change')
      return
    }

    setLoading(true)
    try {
      await apiClient.request({
        method: 'POST',
        url: `/admin/consultation/sessions/${sessionId}/manage`,
        data: {
          managed: enableAdminManagement,
          reason: managementReason.trim()
        }
      })

      toast.success(`Session ${enableAdminManagement ? 'placed under' : 'removed from'} admin management`)
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update session management')
    } finally {
      setLoading(false)
    }
  }

  const handleReactivateSession = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a reason for reactivation')
      return
    }

    setLoading(true)
    try {
      await apiClient.request({
        method: 'POST',
        url: `/admin/consultation/sessions/${sessionId}/reactivate`,
        data: {
          reason: reason.trim()
        }
      })

      toast.success('Session reactivated successfully')
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reactivate session')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => {
    switch (action) {
      case 'extend':
        handleExtendSession()
        break
      case 'manage':
        handleSetAdminManaged()
        break
      case 'reactivate':
        handleReactivateSession()
        break
    }
  }

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'extend': return 'bg-blue-100 text-blue-800'
      case 'manage': return 'bg-purple-100 text-purple-800'
      case 'reactivate': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Admin Session Management</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Status */}
          <div className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Session Status</span>
              <Badge variant="outline">{sessionStatus}</Badge>
            </div>
            
            {currentExpiry && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Expiry</span>
                <span className="text-sm font-medium">
                  {new Date(currentExpiry).toLocaleString()}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <div className="flex items-center space-x-2">
                {isExpired ? (
                  <Badge className="bg-red-100 text-red-800">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Expired
                  </Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
                
                {isAdminManaged && (
                  <Badge className="bg-purple-100 text-purple-800">
                    <Shield className="h-3 w-3 mr-1" />
                    Admin Managed
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Action Selection */}
          <div className="space-y-3">
            <Label>Admin Action</Label>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setAction('extend')}
                className={`p-3 text-left rounded-lg border-2 transition-colors ${
                  action === 'extend' 
                    ? 'border-blue-200 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Extend Session</div>
                    <div className="text-sm text-gray-600">Add more time to session expiry</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setAction('manage')}
                className={`p-3 text-left rounded-lg border-2 transition-colors ${
                  action === 'manage' 
                    ? 'border-purple-200 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="font-medium">Admin Management</div>
                    <div className="text-sm text-gray-600">Control session expiration rules</div>
                  </div>
                </div>
              </button>

              {isExpired && (
                <button
                  onClick={() => setAction('reactivate')}
                  className={`p-3 text-left rounded-lg border-2 transition-colors ${
                    action === 'reactivate' 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <RefreshCw className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium">Reactivate Session</div>
                      <div className="text-sm text-gray-600">Bring expired session back to life</div>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Action-specific forms */}
          {action === 'extend' && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="hours">Additional Hours</Label>
                <Select value={additionalHours} onValueChange={setAdditionalHours}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select hours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 hour</SelectItem>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="8">8 hours</SelectItem>
                    <SelectItem value="12">12 hours</SelectItem>
                    <SelectItem value="24">24 hours (1 day)</SelectItem>
                    <SelectItem value="48">48 hours (2 days)</SelectItem>
                    <SelectItem value="72">72 hours (3 days)</SelectItem>
                    <SelectItem value="168">168 hours (1 week)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reason">Reason for Extension</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why is this session being extended?"
                  rows={3}
                />
              </div>
            </div>
          )}

          {action === 'manage' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <Label>Admin Management Setting</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setEnableAdminManagement(true)}
                    className={`p-3 text-left rounded-lg border-2 transition-colors ${
                      enableAdminManagement 
                        ? 'border-purple-200 bg-purple-50 text-purple-900' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-purple-600" />
                      <div>
                        <div className="font-medium">Enable Management</div>
                        <div className="text-sm text-gray-600">Bypass expiration rules</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setEnableAdminManagement(false)}
                    className={`p-3 text-left rounded-lg border-2 transition-colors ${
                      !enableAdminManagement 
                        ? 'border-purple-200 bg-purple-50 text-purple-900' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <div>
                        <div className="font-medium">Normal Operation</div>
                        <div className="text-sm text-gray-600">Use standard expiration</div>
                      </div>
                    </div>
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  {enableAdminManagement 
                    ? "Session will be placed under admin management and will not expire automatically."
                    : "Session will be returned to normal operation with standard expiration rules."}
                </p>
              </div>

              <div>
                <Label htmlFor="managementReason">Reason</Label>
                <Textarea
                  id="managementReason"
                  value={managementReason}
                  onChange={(e) => setManagementReason(e.target.value)}
                  placeholder={enableAdminManagement ? "Why is this session being placed under admin management?" : "Why is this session being returned to normal operation?"}
                  rows={3}
                />
              </div>
            </div>
          )}

          {action === 'reactivate' && (
            <div className="space-y-4">
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Reactivation Notice</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  This will extend the session by 24 hours and place it under admin management.
                </p>
              </div>

              <div>
                <Label htmlFor="reactivateReason">Reason for Reactivation</Label>
                <Textarea
                  id="reactivateReason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why is this expired session being reactivated?"
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className={getActionColor(action)}>
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : action === 'extend' ? (
              <Clock className="h-4 w-4 mr-2" />
            ) : action === 'manage' ? (
              <Shield className="h-4 w-4 mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {action === 'extend' ? 'Extend Session' :
             action === 'manage' ? (enableAdminManagement ? 'Enable Management' : 'Disable Management') :
             'Reactivate Session'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useConsultationStore } from '@/stores/consultation'
import { 
  User, 
  Star, 
  Clock, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Expert {
  id: string
  name: string
  email: string
  specialization: string
  description?: string
  isAvailable: boolean
  rating?: number
  totalSessions: number
  experienceLevel?: string
}

interface ExpertAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId: string
  sessionSpecialization?: string
  onSuccess?: () => void
}

export function ExpertAssignmentDialog({ 
  open, 
  onOpenChange, 
  sessionId, 
  sessionSpecialization,
  onSuccess 
}: ExpertAssignmentDialogProps) {
  const [experts, setExperts] = useState<Expert[]>([])
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)
  
  const { getAvailableExperts, assignExpert } = useConsultationStore()

  useEffect(() => {
    if (open) {
      fetchExperts()
    }
  }, [open])

  const fetchExperts = async () => {
    setLoading(true)
    try {
      console.log('🔍 Fetching available experts...')
      const expertsData = await getAvailableExperts(sessionSpecialization)
      console.log('✅ Experts received:', expertsData)
      setExperts(expertsData || [])
    } catch (error: any) {
      console.error('❌ Error fetching experts:', error)
      toast.error(error.message || 'Failed to fetch available experts')
      setExperts([]) // Clear experts on error instead of fallback
    } finally {
      setLoading(false)
    }
  }

  const handleAssignExpert = async () => {
    if (!selectedExpert) {
      toast.error('Please select an expert')
      return
    }

    setAssigning(true)
    try {
      console.log('👨‍💼 Assigning expert:', selectedExpert.name, 'to session:', sessionId)
      
      await assignExpert(sessionId, selectedExpert.id, notes || `Assigned expert: ${selectedExpert.name}`)
      
      toast.success(`Expert ${selectedExpert.name} assigned successfully!`)
      onSuccess?.()
      onOpenChange(false)
      
      // Reset form
      setSelectedExpert(null)
      setNotes('')
    } catch (error: any) {
      console.error('❌ Error assigning expert:', error)
      toast.error(error.message || 'Failed to assign expert')
    } finally {
      setAssigning(false)
    }
  }

  const getSpecializationColor = (specialization: string) => {
    switch (specialization.toLowerCase()) {
      case 'data breach response':
        return 'bg-red-100 text-red-800'
      case 'malware analysis':
        return 'bg-orange-100 text-orange-800'
      case 'network security':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderStars = (rating?: number) => {
    if (!rating) return <span className="text-sm text-gray-500">No rating</span>
    
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Assign Expert to Session</span>
          </DialogTitle>
          <DialogDescription>
            Select an available expert to handle this consultation session.
            {sessionSpecialization && (
              <span className="block mt-1">
                Recommended specialization: <Badge className={getSpecializationColor(sessionSpecialization)}>
                  {sessionSpecialization}
                </Badge>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2">Loading available experts...</span>
            </div>
          ) : experts.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No experts available at the moment</p>
              <Button 
                variant="outline" 
                onClick={fetchExperts} 
                className="mt-4"
                size="sm"
              >
                Refresh
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {experts.map((expert) => (
                <div
                  key={expert.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedExpert?.id === expert.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!expert.isAvailable ? 'opacity-50' : ''}`}
                  onClick={() => expert.isAvailable && setSelectedExpert(expert)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg">{expert.name}</h3>
                        {!expert.isAvailable && (
                          <Badge variant="outline" className="text-red-600 border-red-200">
                            Unavailable
                          </Badge>
                        )}
                        {selectedExpert?.id === expert.id && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">{expert.email}</p>
                      
                      <Badge className={getSpecializationColor(expert.specialization)}>
                        {expert.specialization}
                      </Badge>
                    </div>
                    
                    <div className="text-right">
                      {renderStars(expert.rating)}
                      <p className="text-sm text-gray-500 mt-1">
                        {expert.totalSessions} sessions completed
                      </p>
                    </div>
                  </div>

                  {expert.description && (
                    <p className="text-sm text-gray-700 mb-3">{expert.description}</p>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span className="text-gray-600">
                          {expert.experienceLevel || 'Senior'} Level
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="text-gray-600">
                          {expert.isAvailable ? 'Available Now' : 'Busy'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedExpert && (
          <div className="border-t pt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Notes (Optional)
              </label>
              <Textarea
                placeholder="Add any special instructions or notes for the expert..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-20"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignExpert}
            disabled={!selectedExpert || assigning}
          >
            {assigning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Assigning...
              </>
            ) : (
              <>
                <User className="h-4 w-4 mr-2" />
                Assign Expert
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

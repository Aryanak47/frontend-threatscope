'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useConsultationStore } from '@/stores/consultation'
import { ConsultationPlan } from '@/types/consultation'
import { 
  Check, 
  Crown, 
  Clock, 
  DollarSign,
  Star,
  Shield,
  Users,
  FileText,
  MessageSquare,
  Loader2
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PlanSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  alertId: string
  alertTitle: string
  onSuccess: (sessionId: string) => void
}

export function PlanSelectionModal({ 
  isOpen, 
  onClose, 
  alertId, 
  alertTitle,
  onSuccess 
}: PlanSelectionModalProps) {
  const { 
    plans, 
    loading, 
    error, 
    fetchPlans, 
    createSession, 
    clearError 
  } = useConsultationStore()
  
  const [selectedPlan, setSelectedPlan] = useState<ConsultationPlan | null>(null)
  const [sessionNotes, setSessionNotes] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (isOpen && plans.length === 0) {
      fetchPlans()
    }
  }, [isOpen, plans.length, fetchPlans])

  useEffect(() => {
    if (error) {
      toast.error(error)
      clearError()
    }
  }, [error, clearError])

  const handlePlanSelect = (plan: ConsultationPlan) => {
    setSelectedPlan(plan)
    
    // Set appropriate default message based on plan and context
    if (alertTitle) {
      // Alert-specific consultation
      setSessionNotes(`I need help with the security alert: "${alertTitle}". Please provide guidance on how to respond to this threat.`)
    } else {
      // General consultation - suggest they can ask anything
      if (plan.name === 'basic') {
        setSessionNotes('I have a cybersecurity question. (You can ask about phishing protection, password security, general security advice, or any other cybersecurity topic.)')
      } else {
        setSessionNotes('I need cybersecurity guidance and would like to discuss my security concerns with an expert.')
      }
    }
  }

  const handleCreateSession = async () => {
    if (!selectedPlan || !sessionNotes.trim()) {
      toast.error('Please select a plan and provide session details')
      return
    }

    setCreating(true)
    
    try {
      const session = await createSession({
        alertId,
        planId: selectedPlan.id,
        sessionNotes: sessionNotes.trim()
      })
      
      toast.success('Consultation request submitted! You\'ll receive payment instructions once approved.')
      onSuccess(session.id)
      onClose()
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to create consultation session')
    } finally {
      setCreating(false)
    }
  }

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'basic': return <Shield className="h-6 w-6" />
      case 'professional': return <Users className="h-6 w-6" />
      case 'enterprise': return <Crown className="h-6 w-6" />
      default: return <MessageSquare className="h-6 w-6" />
    }
  }

  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'basic': return 'from-blue-500 to-blue-600'
      case 'professional': return 'from-purple-500 to-purple-600'
      case 'enterprise': return 'from-amber-500 to-amber-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Get Expert Help
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            Choose a consultation plan to get personalized security guidance from our experts
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading consultation plans...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Alert Context */}
            <Card className="p-4 bg-red-50 border-red-200">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-red-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-red-800">Security Alert</h4>
                  <p className="text-red-700 text-sm">{alertTitle}</p>
                </div>
              </div>
            </Card>
            
            {/* General Guidance Notice */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-start space-x-3">
                <MessageSquare className="h-5 w-5 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-800">💡 Did You Know?</h4>
                  <p className="text-blue-700 text-sm">
                    All consultation plans include <strong>general cybersecurity guidance</strong>! 
                    Ask about phishing protection, password security, learning cybersecurity, 
                    or any other security topic - not just specific alerts.
                  </p>
                </div>
              </div>
            </Card>

            {/* Plan Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`relative cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedPlan?.id === plan.id 
                      ? 'ring-2 ring-blue-500 shadow-lg transform scale-105' 
                      : 'hover:shadow-md'
                  } ${plan.isPopular ? 'border-purple-300' : ''}`}
                  onClick={() => handlePlanSelect(plan)}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white px-3 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Plan Header */}
                    <div className="text-center mb-4">
                      <div className={`w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r ${getPlanColor(plan.name)} flex items-center justify-center text-white`}>
                        {getPlanIcon(plan.name)}
                      </div>
                      <h3 className="text-xl font-bold">{plan.displayName}</h3>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">{plan.formattedPrice}</span>
                        <span className="text-gray-600 ml-1">USD</span>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center justify-center mb-4 text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {plan.durationDisplay} session
                    </div>

                    {/* Features */}
                    <div className="space-y-2 mb-4">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Deliverables */}
                    <div className="border-t pt-4">
                      <h5 className="font-semibold text-sm mb-2 flex items-center">
                        <FileText className="h-4 w-4 mr-1" />
                        You'll Receive:
                      </h5>
                      <div className="space-y-1">
                        {plan.deliverables.map((deliverable, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            • {deliverable}
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedPlan?.id === plan.id && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-10 rounded-lg pointer-events-none">
                        <div className="absolute top-4 right-4">
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <Check className="h-4 w-4 text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {/* Session Notes */}
            {selectedPlan && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Describe your security question or concern
                  </label>
                  <Textarea
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder="Describe your security concern, ask about phishing protection, password security, cybersecurity learning, or any other security topic..."
                    rows={3}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Our experts can help with both specific security alerts and general cybersecurity questions. 
                    Be as detailed as possible to get the most relevant guidance.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={onClose}
                    disabled={creating}
                  >
                    Cancel
                  </Button>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Total</div>
                      <div className="text-lg font-bold">{selectedPlan.formattedPrice}</div>
                    </div>
                    
                    <Button 
                      onClick={handleCreateSession}
                      disabled={creating || !sessionNotes.trim()}
                      className="min-w-[140px]"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Submit Request
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

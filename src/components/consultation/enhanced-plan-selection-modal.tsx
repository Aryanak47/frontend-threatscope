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
  Loader2,
  HelpCircle,
  BookOpen,
  Target,
  AlertTriangle
} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface PlanSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  alertId?: string  // Optional - can be null for general consultations
  alertTitle?: string  // Optional - can be null for general consultations
  consultationType?: 'alert' | 'general'  // New prop to distinguish consultation type
  onSuccess: (sessionId: string) => void
}

export function PlanSelectionModal({ 
  isOpen, 
  onClose, 
  alertId, 
  alertTitle,
  consultationType = 'alert',
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
  const [consultationCategory, setConsultationCategory] = useState<string>('')
  const [creating, setCreating] = useState(false)

  // General cybersecurity consultation categories
  const generalConsultationCategories = [
    {
      id: 'phishing-protection',
      title: 'Phishing Protection',
      description: 'Learn how to identify and protect yourself from phishing attacks',
      icon: <Target className="h-5 w-5" />,
      defaultNote: 'I want to learn about phishing protection and how to safely identify suspicious emails and websites.'
    },
    {
      id: 'password-security',
      title: 'Password Security',
      description: 'Best practices for creating and managing secure passwords',
      icon: <Shield className="h-5 w-5" />,
      defaultNote: 'I need guidance on password security best practices and password management tools.'
    },
    {
      id: 'cybersecurity-learning',
      title: 'Cybersecurity Learning',
      description: 'Get started with cybersecurity education and career guidance',
      icon: <BookOpen className="h-5 w-5" />,
      defaultNote: 'I want to learn about cybersecurity fundamentals and career paths in cybersecurity.'
    },
    {
      id: 'home-network-security',
      title: 'Home Network Security',
      description: 'Secure your home Wi-Fi and network devices',
      icon: <Shield className="h-5 w-5" />,
      defaultNote: 'I need help securing my home network and Wi-Fi setup.'
    },
    {
      id: 'identity-theft-prevention',
      title: 'Identity Theft Prevention',
      description: 'Protect your personal information and identity online',
      icon: <Users className="h-5 w-5" />,
      defaultNote: 'I want to learn how to protect my personal information and prevent identity theft.'
    },
    {
      id: 'social-media-security',
      title: 'Social Media Security',
      description: 'Privacy settings and safe social media practices',
      icon: <MessageSquare className="h-5 w-5" />,
      defaultNote: 'I need guidance on social media privacy settings and safe online practices.'
    },
    {
      id: 'business-security',
      title: 'Small Business Security',
      description: 'Cybersecurity for small businesses and startups',
      icon: <Users className="h-5 w-5" />,
      defaultNote: 'I need cybersecurity advice for my small business or startup.'
    },
    {
      id: 'incident-response',
      title: 'I Think I\'ve Been Hacked',
      description: 'Immediate steps if you suspect a security breach',
      icon: <AlertTriangle className="h-5 w-5" />,
      defaultNote: 'I think my accounts or devices may have been compromised and need immediate guidance.'
    },
    {
      id: 'custom',
      title: 'Other Security Question',
      description: 'Ask any other cybersecurity-related question',
      icon: <HelpCircle className="h-5 w-5" />,
      defaultNote: 'I have a specific cybersecurity question or concern that I\'d like expert guidance on.'
    }
  ]

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

  useEffect(() => {
    // Set default session notes based on consultation type
    if (consultationType === 'alert' && alertTitle) {
      setSessionNotes(`I need help with the security alert: "${alertTitle}". Please provide guidance on how to respond to this threat.`)
    } else if (consultationType === 'general') {
      setSessionNotes('')
    }
  }, [consultationType, alertTitle])

  const handlePlanSelect = (plan: ConsultationPlan) => {
    setSelectedPlan(plan)
    
    // Update session notes based on consultation type and category
    if (consultationType === 'alert' && alertTitle) {
      setSessionNotes(`I need help with the security alert: "${alertTitle}". Please provide guidance on how to respond to this threat.`)
    } else if (consultationType === 'general' && consultationCategory) {
      const category = generalConsultationCategories.find(c => c.id === consultationCategory)
      if (category) {
        setSessionNotes(category.defaultNote)
      }
    }
  }

  const handleCategorySelect = (categoryId: string) => {
    setConsultationCategory(categoryId)
    const category = generalConsultationCategories.find(c => c.id === categoryId)
    if (category && selectedPlan) {
      setSessionNotes(category.defaultNote)
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
        alertId: alertId || null,  // Can be null for general consultations
        planId: selectedPlan.id,
        sessionNotes: sessionNotes.trim()
      })
      
      toast.success('Consultation session created! Processing payment...')
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
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {consultationType === 'alert' ? 'Get Expert Help' : 'Cybersecurity Consultation'}
          </DialogTitle>
          <p className="text-center text-muted-foreground">
            {consultationType === 'alert' 
              ? 'Choose a consultation plan to get personalized security guidance from our experts'
              : 'Get expert cybersecurity advice on any security topic'
            }
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2">Loading consultation plans...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Alert Context - Only show for alert-based consultations */}
            {consultationType === 'alert' && alertTitle && (
              <Card className="p-4 bg-red-50 border-red-200">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-red-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-red-800">Security Alert</h4>
                    <p className="text-red-700 text-sm">{alertTitle}</p>
                  </div>
                </div>
              </Card>
            )}

            {/* General Consultation Categories - Only show for general consultations */}
            {consultationType === 'general' && !selectedPlan && (
              <div>
                <h3 className="text-lg font-semibold mb-4">What would you like help with?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generalConsultationCategories.map((category) => (
                    <Card 
                      key={category.id}
                      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                        consultationCategory === category.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="text-blue-600 mt-1">
                          {category.icon}
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{category.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{category.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                
                {consultationCategory && (
                  <div className="mt-6 text-center">
                    <Button onClick={() => setSelectedPlan({} as ConsultationPlan)}>
                      Continue to Plan Selection
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Plan Selection - Show when category is selected or for alert consultations */}
            {(consultationType === 'alert' || consultationCategory) && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Choose Your Consultation Plan</h3>
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
              </div>
            )}

            {/* Session Notes */}
            {selectedPlan && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {consultationType === 'alert' 
                      ? 'Describe your security concern (optional)'
                      : 'Describe what you\'d like help with'
                    }
                  </label>
                  <Textarea
                    value={sessionNotes}
                    onChange={(e) => setSessionNotes(e.target.value)}
                    placeholder={consultationType === 'alert' 
                      ? "Provide any additional context about your security issue..."
                      : "Describe your cybersecurity question or what you'd like to learn about..."
                    }
                    rows={4}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    This helps our expert understand your specific needs and prepare for the session.
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
                          <DollarSign className="h-4 w-4 mr-2" />
                          Pay & Start
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

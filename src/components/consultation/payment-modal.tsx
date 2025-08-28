'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  CreditCard, 
  Clock, 
  DollarSign,
  Shield,
  Loader2
} from 'lucide-react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  sessionData: {
    id: string
    plan: {
      displayName: string
      formattedPrice: string
      sessionDurationMinutes: number
      features: string[]
    }
    sessionNotes: string
    approvalMessage?: string
  }
  onPaymentSuccess: () => void
}

export function PaymentModal({ 
  isOpen, 
  onClose, 
  sessionData, 
  onPaymentSuccess 
}: PaymentModalProps) {
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card')

  const handlePayment = async () => {
    setProcessing(true)
    
    // Simulate payment processing
    setTimeout(() => {
      setProcessing(false)
      onPaymentSuccess()
      onClose()
    }, 3000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            🎉 Consultation Request Approved!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Approval Message */}
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
              <div>
                <h4 className="font-semibold text-green-800">Request Approved!</h4>
                <p className="text-green-700 text-sm">
                  Great news! Our team has reviewed your consultation request and we're ready to help you with your cybersecurity question.
                </p>
              </div>
            </div>
          </Card>

          {/* Session Summary */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Consultation Summary</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{sessionData.plan.displayName}</h4>
                  <p className="text-sm text-gray-600">
                    {sessionData.plan.sessionDurationMinutes} minutes with a certified expert
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{sessionData.plan.formattedPrice}</p>
                  <p className="text-sm text-gray-600">One-time payment</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h5 className="font-medium mb-2">Your Question:</h5>
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  {sessionData.sessionNotes}
                </div>
              </div>

              <div className="border-t pt-4">
                <h5 className="font-medium mb-2">What You'll Get:</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {sessionData.plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Payment Methods */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Payment Method</h3>
            
            <div className="space-y-3">
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setPaymentMethod('card')}
              >
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Credit/Debit Card</p>
                    <p className="text-sm text-gray-600">Visa, Mastercard, American Express</p>
                  </div>
                </div>
              </div>

              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  paymentMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
                onClick={() => setPaymentMethod('paypal')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">P</span>
                  </div>
                  <div>
                    <p className="font-medium">PayPal</p>
                    <p className="text-sm text-gray-600">Pay with your PayPal account</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Security Notice */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-blue-800 text-sm">
                  <strong>Secure Payment:</strong> Your payment information is encrypted and secure. 
                  You'll be connected with an expert immediately after payment confirmation.
                </p>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="p-4 bg-gray-50">
            <h4 className="font-medium mb-2">What happens next?</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <span>Complete your payment</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                <span>Expert gets assigned (usually within 30 minutes)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                <span>Start your live chat consultation</span>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={processing}
            >
              Cancel
            </Button>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-600">Total</div>
                <div className="text-xl font-bold">{sessionData.plan.formattedPrice}</div>
              </div>
              
              <Button 
                onClick={handlePayment}
                disabled={processing}
                className="min-w-[140px] bg-green-600 hover:bg-green-700"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Pay Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

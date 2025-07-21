'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Loader2, CreditCard, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { useUsageStore } from '@/stores/usage'

interface MockPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPlan: {
    name: string
    price: number
    type: string
  }
  billingCycle: 'monthly' | 'yearly'
}

const TEST_CARDS = {
  successful: {
    visa: '4242424242424242',
    mastercard: '5555555555554444', 
    amex: '378282246310005'
  },
  failure: {
    declined: '4000000000000002',
    insufficientFunds: '4000000000009995',
    expired: '4000000000000069'
  }
}

export function MockPaymentModal({ isOpen, onClose, selectedPlan, billingCycle }: MockPaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState<{ success: boolean; message: string; transactionId?: string } | null>(null)
  const [formData, setFormData] = useState({
    cardNumber: TEST_CARDS.successful.visa,
    expiryMonth: '12',
    expiryYear: '2025',
    cvc: '123',
    selectedTestCard: 'visa-success'
  })
  
  const { refreshAllUsageData } = useUsageStore()
  
  const calculateAmount = () => {
    const basePrice = selectedPlan.price
    if (billingCycle === 'yearly' && basePrice > 0) {
      return (basePrice * 12 * 0.8).toFixed(2) // 20% discount
    }
    return basePrice.toFixed(2)
  }
  
  const handleTestCardSelect = (cardType: string) => {
    const cardMap = {
      'visa-success': TEST_CARDS.successful.visa,
      'mastercard-success': TEST_CARDS.successful.mastercard,
      'amex-success': TEST_CARDS.successful.amex,
      'declined': TEST_CARDS.failure.declined,
      'insufficient': TEST_CARDS.failure.insufficientFunds,
      'expired': TEST_CARDS.failure.expired
    }
    
    setFormData(prev => ({
      ...prev,
      cardNumber: cardMap[cardType as keyof typeof cardMap] || TEST_CARDS.successful.visa,
      selectedTestCard: cardType
    }))
    setPaymentResult(null)
  }
  
  const handlePayment = async () => {
    setIsProcessing(true)
    setPaymentResult(null)
    
    try {
      const paymentRequest = {
        planType: selectedPlan.type,
        amount: parseFloat(calculateAmount()),
        cardNumber: formData.cardNumber,
        expiryMonth: formData.expiryMonth,
        expiryYear: formData.expiryYear,
        cvc: formData.cvc,
        billingCycle: billingCycle
      }
      
      console.log('🎭 Processing mock payment:', paymentRequest)
      
      const response = await apiClient.request({
        method: 'POST',
        url: '/mock-payment/process',
        data: paymentRequest
      })
      
      console.log('✅ Mock payment successful:', response)
      
      setPaymentResult({
        success: true,
        message: 'Payment processed successfully! Your plan has been upgraded.',
        transactionId: response.transactionId
      })
      
      // Refresh usage data to get new limits
      setTimeout(() => {
        refreshAllUsageData()
      }, 1000)
      
    } catch (error: any) {
      console.error('❌ Mock payment failed:', error)
      
      const errorMessage = error.response?.data?.data?.message || 
                          error.response?.data?.message || 
                          'Payment processing failed'
      
      setPaymentResult({
        success: false,
        message: errorMessage
      })
    } finally {
      setIsProcessing(false)
    }
  }
  
  const resetAndClose = () => {
    setPaymentResult(null)
    setFormData({
      cardNumber: TEST_CARDS.successful.visa,
      expiryMonth: '12',
      expiryYear: '2025',
      cvc: '123',
      selectedTestCard: 'visa-success'
    })
    onClose()
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Mock Payment System</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Plan Summary */}
          <Card className="p-4 bg-blue-50 dark:bg-blue-950">
            <div className="text-center">
              <h3 className="font-semibold text-lg">{selectedPlan.name} Plan</h3>
              <p className="text-2xl font-bold text-blue-600">
                ${calculateAmount()} {billingCycle === 'yearly' ? '/year' : '/month'}
              </p>
              {billingCycle === 'yearly' && selectedPlan.price > 0 && (
                <p className="text-sm text-green-600">Save 20% with yearly billing!</p>
              )}
            </div>
          </Card>
          
          {/* Test Card Selection */}
          <div className="space-y-3">
            <Label>Test Card Selection</Label>
            <Select value={formData.selectedTestCard} onValueChange={handleTestCardSelect}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visa-success">✅ Visa Success (4242...)</SelectItem>
                <SelectItem value="mastercard-success">✅ Mastercard Success (5555...)</SelectItem>
                <SelectItem value="amex-success">✅ Amex Success (3782...)</SelectItem>
                <SelectItem value="declined">❌ Declined Card (4000...0002)</SelectItem>
                <SelectItem value="insufficient">❌ Insufficient Funds (4000...9995)</SelectItem>
                <SelectItem value="expired">❌ Expired Card (4000...0069)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Payment Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                value={formData.cardNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
                placeholder="4242 4242 4242 4242"
                className="font-mono"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="expiryMonth">Month</Label>
                <Select value={formData.expiryMonth} onValueChange={(value) => setFormData(prev => ({ ...prev, expiryMonth: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {String(i + 1).padStart(2, '0')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="expiryYear">Year</Label>
                <Select value={formData.expiryYear} onValueChange={(value) => setFormData(prev => ({ ...prev, expiryYear: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 10 }, (_, i) => (
                      <SelectItem key={2024 + i} value={String(2024 + i)}>
                        {2024 + i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="cvc">CVC</Label>
                <Input
                  id="cvc"
                  value={formData.cvc}
                  onChange={(e) => setFormData(prev => ({ ...prev, cvc: e.target.value }))}
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>
          </div>
          
          {/* Payment Result */}
          {paymentResult && (
            <Card className={`p-4 ${paymentResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start space-x-3">
                {paymentResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${paymentResult.success ? 'text-green-800' : 'text-red-800'}`}>
                    {paymentResult.success ? 'Payment Successful!' : 'Payment Failed'}
                  </p>
                  <p className={`text-sm ${paymentResult.success ? 'text-green-700' : 'text-red-700'}`}>
                    {paymentResult.message}
                  </p>
                  {paymentResult.transactionId && (
                    <p className="text-xs text-green-600 mt-1 font-mono">
                      Transaction ID: {paymentResult.transactionId}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          )}
          
          {/* Mock System Notice */}
          <Card className="p-3 bg-yellow-50 border-yellow-200">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Mock Payment System</p>
                <p>This is a test environment. No real charges will be made.</p>
              </div>
            </div>
          </Card>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={resetAndClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            
            {paymentResult?.success ? (
              <Button
                onClick={resetAndClose}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Done
              </Button>
            ) : (
              <Button
                onClick={handlePayment}
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay $${calculateAmount()}`
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

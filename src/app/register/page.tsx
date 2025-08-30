'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth'
import toastUtils from '@/lib/toast/index'
import { 
  Shield, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  ArrowLeft,
  Building,
  Globe,
  Loader2
} from 'lucide-react'

const plans = [
  {
    id: 'free',
    name: 'Free Trial',
    price: '$0',
    period: '14 days',
    description: 'Perfect for getting started',
    features: [
      '100 searches per month',
      'Basic breach monitoring',
      'Email alerts',
      'Standard support'
    ],
    popular: false
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$29',
    period: 'per month',
    description: 'For security professionals',
    features: [
      '10,000 searches per month',
      'Advanced search filters',
      'Real-time monitoring',
      'Export capabilities',
      'API access',
      'Priority support'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For large organizations',
    features: [
      'Unlimited searches',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantees',
      'Advanced analytics',
      'White-label options'
    ],
    popular: false
  }
]

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading, error, clearError } = useAuthStore()
  
  // Debug logging
  console.log('🔍 Current error in UI:', error)
  
  const [selectedPlan, setSelectedPlan] = useState('professional')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    jobTitle: '',
    phoneNumber: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    if (error) clearError()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🚀 Form submission started')
    console.log('📋 Form data:', formData)
    console.log('✅ Accept terms:', acceptTerms)
    console.log('🔍 Form valid:', isFormValid())
    
    if (formData.password !== formData.confirmPassword) {
      console.log('❌ Password mismatch')
      toastUtils.error({
        title: 'Password Mismatch',
        message: 'The passwords you entered do not match.',
        tip: 'Please ensure both password fields contain the same value.'
      })
      return
    }
    
    if (!isFormValid()) {
      console.log('❌ Form validation failed')
      
      // Provide specific validation messages
      if (!formData.firstName || !formData.lastName) {
        toastUtils.error({
          title: 'Name Required',
          message: 'Please enter your first and last name.',
          tip: 'Your name helps us personalize your ThreatScope experience.'
        })
      } else if (!formData.email) {
        toastUtils.error({
          title: 'Email Required',
          message: 'Please enter a valid email address.',
          tip: 'We\'ll use this email for account verification and important updates.'
        })
      } else if (!formData.phoneNumber) {
        toastUtils.error({
          title: 'Phone Required',
          message: 'Please enter your phone number.',
          tip: 'Your phone number helps us verify your identity and provide support.'
        })
      } else if (!formData.password) {
        toastUtils.error({
          title: 'Password Required',
          message: 'Please create a password for your account.',
          tip: 'Choose a strong password to keep your security data safe.'
        })
      } else if (!isValidPassword(formData.password)) {
        toastUtils.error({
          title: 'Password Too Weak',
          message: 'Your password doesn\'t meet our security requirements.',
          tip: 'Please check the requirements below and create a stronger password.'
        })
      } else if (formData.password !== formData.confirmPassword) {
        toastUtils.error({
          title: 'Password Confirmation Failed',
          message: 'The confirmation password doesn\'t match your password.',
          tip: 'Please make sure both password fields contain the same value.'
        })
      } else if (!acceptTerms) {
        toastUtils.error({
          title: 'Terms Required',
          message: 'Please accept the Terms of Service to continue.',
          tip: 'You need to agree to our terms to create your ThreatScope account.'
        })
      } else {
        toastUtils.error({
          title: 'Missing Information',
          message: 'Please fill in all required fields.',
          tip: 'Check the form above for any fields marked with a red asterisk.'
        })
      }
      return
    }
    
    console.log('🔄 Calling register function...')
    
    try {
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        acceptTerms: acceptTerms,
        subscribeToNewsletter: false,
        company: formData.company,
        jobTitle: formData.jobTitle
      }
      
      console.log('📤 Sending registration data:', registrationData)
      
      await register(registrationData)
      
      console.log('✅ Registration successful!')
      toastUtils.success({
        title: 'Welcome to ThreatScope!',
        message: 'Your account has been successfully created.',
        tip: 'You can now start searching through billions of breach records and threat intelligence.'
      })
      router.push('/dashboard')
    } catch (error: any) {
      console.error('❌ Registration error:', error)
      // Error will be handled by auth store and displayed in the {error} section below
    }
  }

  const isValidPassword = (password: string) => {
    const minLength = password.length >= 8 && password.length <= 100
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasDigit = /[0-9]/.test(password)
    const hasSpecial = /[!@#&()\-\[{}\]:;',?/*~$^+=<>]/.test(password)
    
    return minLength && hasUpper && hasLower && hasDigit && hasSpecial
  }

  const getPasswordValidationMessage = (password: string) => {
    if (!password) return ''
    
    const checks = [
      { valid: password.length >= 8, message: 'at least 8 characters', icon: '📏' },
      { valid: password.length <= 100, message: 'no more than 100 characters', icon: '📏' },
      { valid: /[A-Z]/.test(password), message: 'one uppercase letter (A-Z)', icon: '🔤' },
      { valid: /[a-z]/.test(password), message: 'one lowercase letter (a-z)', icon: '🔤' },
      { valid: /[0-9]/.test(password), message: 'one number (0-9)', icon: '🔢' },
      { valid: /[!@#&()\-\[{}\]:;',?/*~$^+=<>]/.test(password), message: 'one special character (!@#$%...)', icon: '✨' }
    ]
    
    const failed = checks.filter(check => !check.valid)
    const passed = checks.filter(check => check.valid)
    
    if (failed.length === 0) {
      return '✅ Perfect! Your password meets all security requirements'
    }
    
    if (failed.length === checks.length) {
      return '❌ Please create a stronger password'
    }
    
    return `✅ ${passed.length}/${checks.length} requirements met. Still needed: ${failed.map(f => f.message).join(', ')}`
  }

  const isFormValid = () => {
    return formData.firstName && 
           formData.lastName && 
           formData.email && 
           formData.password && 
           formData.phoneNumber &&
           isValidPassword(formData.password) &&
           formData.password === formData.confirmPassword &&
           acceptTerms
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center max-w-7xl mx-auto px-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-security-600" />
              <span className="text-lg font-semibold">ThreatScope</span>
            </div>
          </div>
          
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Already have an account?</span>
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Start Your Free Trial
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of security professionals protecting their organizations with ThreatScope
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Registration Form */}
          <div>
            <Card className="p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
                <p className="text-muted-foreground">
                  Get started with your {plans.find(p => p.id === selectedPlan)?.name} plan
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      First Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-security-500 focus:border-transparent"
                        placeholder="John"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Last Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-security-500 focus:border-transparent"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-security-500 focus:border-transparent"
                      placeholder="john@company.com"
                      required
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-security-500 focus:border-transparent"
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                </div>

                {/* Company and Job Title */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Company
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-security-500 focus:border-transparent"
                        placeholder="Company Inc."
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Job Title
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-security-500 focus:border-transparent"
                        placeholder="Security Analyst"
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-security-500 focus:border-transparent"
                      placeholder="Min 8 chars, include A-Z, a-z, 0-9, special char"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    🔒 Create a strong password with: 8+ characters, uppercase & lowercase letters, numbers, and special characters
                  </p>
                  {formData.password && (
                    <p className={`text-xs mt-1 ${
                      isValidPassword(formData.password) ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {getPasswordValidationMessage(formData.password)}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-security-500 focus:border-transparent"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 text-security-600 focus:ring-security-500 border-border rounded"
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-muted-foreground">
                    I agree to the{' '}
                    <Link href="/terms" className="text-security-600 hover:text-security-700 underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-security-600 hover:text-security-700 underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="security"
                  size="lg"
                  className="w-full"
                  disabled={!isFormValid() || isLoading}
                  onClick={() => console.log('💆 Button clicked!')}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>Start Free Trial</>
                  )}
                </Button>

                {/* Error Display */}
                {error && (
                  <div className="space-y-3">
                    <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                      {error}
                    </div>
                    
                    {/* Show login link for duplicate email error */}
                    {(error.includes('Email address already in use') || error.includes('already in use')) && (
                      <div className="text-center">
                        <Button variant="outline" asChild>
                          <Link href="/login">
                            🔑 Go to Login Page
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </Card>
          </div>

          {/* Plan Selection */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
              <p className="text-muted-foreground">
                Select the perfect plan for your security needs
              </p>
            </div>

            <div className="space-y-4">
              {plans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                    selectedPlan === plan.id 
                      ? 'ring-2 ring-security-500 border-security-500' 
                      : 'hover:border-security-300'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === plan.id 
                          ? 'border-security-500 bg-security-500' 
                          : 'border-muted-foreground'
                      }`}>
                        {selectedPlan === plan.id && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold">{plan.name}</h3>
                          {plan.popular && (
                            <span className="px-2 py-1 text-xs bg-security-100 text-security-700 dark:bg-security-900 dark:text-security-300 rounded-full">
                              Most Popular
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{plan.price}</div>
                      <div className="text-sm text-muted-foreground">{plan.period}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            {/* Security Features */}
            <Card className="p-6 mt-6 bg-muted/30">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-security-600" />
                Enterprise Security
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>End-to-end encryption</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Zero data retention policy</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>SOC 2 Type II compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>24/7 security monitoring</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-6">
            Trusted by 10,000+ security professionals worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 opacity-60">
            <div className="text-lg font-semibold">Fortune 500</div>
            <div className="text-lg font-semibold">Government</div>
            <div className="text-lg font-semibold">Law Enforcement</div>
            <div className="text-lg font-semibold">Cybersecurity Firms</div>
          </div>
        </div>
      </div>
    </div>
  )
}

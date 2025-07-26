import React from 'react'
import toast from 'react-hot-toast'

// Enhanced toast utility for consistent styling across the app
export interface ToastOptions {
  title: string
  message: string
  tip?: string
  duration?: number
  position?: 'top-center' | 'top-right' | 'bottom-right'
}

// Success toast with consistent styling
export const showSuccessToast = ({
  title,
  message,
  tip,
  duration = 6000,
  position = 'top-center'
}: ToastOptions) => {
  return toast.success(
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 mt-0.5">
        <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.236 4.53L7.53 10.25a.75.75 0 00-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 text-sm">{title}</div>
        <div className="text-sm text-gray-600 mt-1 leading-relaxed">
          {message}
        </div>
        {tip && (
          <div className="text-xs text-gray-500 mt-2 leading-relaxed">
            💡 {tip}
          </div>
        )}
      </div>
    </div>,
    {
      duration,
      style: {
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '12px',
        padding: '16px',
        maxWidth: '420px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      // Remove default icon since we're using custom
      icon: false,
      position
    }
  )
}

// Error toast with consistent styling
export const showErrorToast = ({
  title,
  message,
  tip,
  duration = 8000,
  position = 'top-center'
}: ToastOptions) => {
  return toast.error(
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 mt-0.5">
        <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 text-sm">{title}</div>
        <div className="text-sm text-gray-600 mt-1 leading-relaxed">
          {message}
        </div>
        {tip && (
          <div className="text-xs text-gray-500 mt-2 leading-relaxed">
            💡 {tip}
          </div>
        )}
      </div>
    </div>,
    {
      duration,
      style: {
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        padding: '16px',
        maxWidth: '420px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      // Remove default icon since we're using custom
      icon: false,
      position
    }
  )
}

// Warning toast with consistent styling
export const showWarningToast = ({
  title,
  message,
  tip,
  duration = 6000,
  position = 'top-center'
}: ToastOptions) => {
  return toast(
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 mt-0.5">
        <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 text-sm">{title}</div>
        <div className="text-sm text-gray-600 mt-1 leading-relaxed">
          {message}
        </div>
        {tip && (
          <div className="text-xs text-gray-500 mt-2 leading-relaxed">
            💡 {tip}
          </div>
        )}
      </div>
    </div>,
    {
      duration,
      style: {
        background: '#fffbeb',
        border: '1px solid #fed7aa',
        borderRadius: '12px',
        padding: '16px',
        maxWidth: '420px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      // Remove default icon since we're using custom
      icon: false,
      position
    }
  )
}

// Info toast with consistent styling
export const showInfoToast = ({
  title,
  message,
  tip,
  duration = 5000,
  position = 'top-center'
}: ToastOptions) => {
  return toast(
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 mt-0.5">
        <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 text-sm">{title}</div>
        <div className="text-sm text-gray-600 mt-1 leading-relaxed">
          {message}
        </div>
        {tip && (
          <div className="text-xs text-gray-500 mt-2 leading-relaxed">
            💡 {tip}
          </div>
        )}
      </div>
    </div>,
    {
      duration,
      style: {
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '12px',
        padding: '16px',
        maxWidth: '420px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      },
      // Remove default icon since we're using custom
      icon: false,
      position
    }
  )
}

// Export the main toast object for backward compatibility
export { toast }

// Export default object with all toast methods
export default {
  success: showSuccessToast,
  error: showErrorToast,
  warning: showWarningToast,
  info: showInfoToast,
  toast // Raw toast for custom usage
}

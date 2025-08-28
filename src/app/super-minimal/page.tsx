'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'

function SuperMinimalTest() {
  const [count, setCount] = useState(0)
  
  console.log('🔍 Super minimal component render, count:', count)

  return (
    <div className="container max-w-4xl mx-auto px-6 py-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Super Minimal Test</h1>
        <p className="mb-4">
          This page uses only basic React state, no Zustand stores.
        </p>
        <p className="mb-4">
          Count: {count}
        </p>
        <button 
          onClick={() => setCount(c => c + 1)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Increment
        </button>
        <p className="text-sm text-gray-500 mt-4">
          If this page works without infinite loops, the issue is in the Zustand stores.
        </p>
      </Card>
    </div>
  )
}

export default SuperMinimalTest

'use client'

import { AdminConsultationDashboard } from '@/components/admin/admin-consultation-dashboard'
import { MainLayout } from '@/components/layout/main-layout'

export default function AdminPage() {
  return (
    <MainLayout>
      <AdminConsultationDashboard />
    </MainLayout>
  )
}

'use client'
import React, { useState, useEffect } from 'react'

interface StaffMember {
  id: string
  name: string
  email: string
  role: 'MAKER' | 'VERIFIER' | 'ADMIN'
  status: 'ACTIVE' | 'INACTIVE'
  createdAt: string
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical'
  uptime: number
  activeUsers: number
  documentsProcessed: number
  avgProcessingTime: number
  feeRelayerBalance: number
}

/**
 * Admin Dashboard
 * 
 * Features:
 * - Staff provisioning (create/edit/delete users)
 * - Role management
 * - System health monitoring
 * - Analytics
 */
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'staff' | 'health' | 'analytics'>('staff')
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [showNewStaffForm, setShowNewStaffForm] = useState(false)
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    role: 'VERIFIER' as const,
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('nddv_token')
      const userId = localStorage.getItem('nddv_user_id')

      // Load staff list
      const staffRes = await fetch('/api/admin/staff', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-id': userId || '',
        },
      })

      if (staffRes.ok) {
        const staffData = await staffRes.json()
        setStaffList(staffData.staff || [])
      }

      // Load system health
      const healthRes = await fetch('/api/admin/health', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-id': userId || '',
        },
      })

      if (healthRes.ok) {
        const healthData = await healthRes.json()
        setSystemHealth(healthData)
      }
    } catch (error) {
      console.error('Error loading admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('nddv_token')
      const userId = localStorage.getItem('nddv_user_id')

      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-id': userId || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStaff),
      })

      if (!res.ok) {
        throw new Error('Failed to create staff member')
      }

      const created = await res.json()
      setStaffList([...staffList, created])
      setNewStaff({ name: '', email: '', role: 'VERIFIER' })
      setShowNewStaffForm(false)
    } catch (error) {
      console.error('Error creating staff:', error)
      alert('Failed to create staff member')
    }
  }

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return
    }

    try {
      const token = localStorage.getItem('nddv_token')
      const userId = localStorage.getItem('nddv_user_id')

      const res = await fetch(`/api/admin/staff/${staffId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-id': userId || '',
        },
      })

      if (!res.ok) {
        throw new Error('Failed to delete staff member')
      }

      setStaffList(staffList.filter((s) => s.id !== staffId))
    } catch (error) {
      console.error('Error deleting staff:', error)
      alert('Failed to delete staff member')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage staff, monitor system health, and view analytics</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('staff')}
              className={`py-4 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'staff'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              👥 Staff Management
            </button>
            <button
              onClick={() => setActiveTab('health')}
              className={`py-4 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'health'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              🏥 System Health
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading && activeTab === 'staff' ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <div className="inline-block animate-spin">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : activeTab === 'staff' ? (
          <div className="space-y-6">
            {/* Add Staff Button */}
            <button
              onClick={() => setShowNewStaffForm(!showNewStaffForm)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              ➕ Add New Staff Member
            </button>

            {/* New Staff Form */}
            {showNewStaffForm && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">New Staff Member</h2>
                <form onSubmit={handleCreateStaff} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                    <input
                      type="text"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                    <select
                      value={newStaff.role}
                      onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value as 'MAKER' | 'VERIFIER' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    >
                      <option value="VERIFIER">Verifier</option>
                      <option value="MAKER">Maker</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    >
                      ✓ Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewStaffForm(false)}
                      className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Staff List */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Created</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staffList.map((staff) => (
                    <tr key={staff.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{staff.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{staff.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-900 text-sm font-medium rounded-full">
                          {staff.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 text-sm font-medium rounded-full ${
                            staff.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-900'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          {staff.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(staff.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDeleteStaff(staff.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'health' ? (
          <div className="space-y-6">
            {systemHealth && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Status */}
                <div
                  className={`p-6 rounded-lg text-white ${
                    systemHealth.status === 'healthy'
                      ? 'bg-green-600'
                      : systemHealth.status === 'warning'
                        ? 'bg-amber-600'
                        : 'bg-red-600'
                  }`}
                >
                  <h3 className="text-lg font-semibold mb-2">System Status</h3>
                  <p className="text-3xl font-bold">{systemHealth.status.toUpperCase()}</p>
                </div>

                {/* Uptime */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Uptime</h3>
                  <p className="text-3xl font-bold text-blue-600">{(systemHealth.uptime * 100).toFixed(2)}%</p>
                </div>

                {/* Active Users */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Users</h3>
                  <p className="text-3xl font-bold text-purple-600">{systemHealth.activeUsers}</p>
                </div>

                {/* Documents Processed */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Documents Processed</h3>
                  <p className="text-3xl font-bold text-green-600">{systemHealth.documentsProcessed}</p>
                </div>

                {/* Avg Processing Time */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Avg Processing Time</h3>
                  <p className="text-3xl font-bold text-orange-600">{systemHealth.avgProcessingTime}ms</p>
                </div>

                {/* Fee Relayer Balance */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Fee Relayer Balance</h3>
                  <p className="text-3xl font-bold text-indigo-600">${systemHealth.feeRelayerBalance.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
            <p className="text-gray-600">
              Detailed analytics and reporting features will be available in the next release.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

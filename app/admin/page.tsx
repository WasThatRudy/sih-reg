'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import StatsCard from '@/components/admin/StatsCard';
import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalTeams: number;
  registeredTeams: number;
  selectedTeams: number;
  finalistTeams: number;
  totalProblemStatements: number;
  activeProblemStatements: number;
  totalTasks: number;
  activeTasks: number;
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Check if user is admin (this should be enhanced with proper role checking)
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        const token = await user.getIdToken();
        
        // Fetch teams stats
        const teamsResponse = await fetch('/api/admin/teams', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Fetch problem statements stats
        const psResponse = await fetch('/api/admin/problem-statements', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Fetch tasks stats
        const tasksResponse = await fetch('/api/admin/tasks', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (teamsResponse.ok && psResponse.ok && tasksResponse.ok) {
          const [teamsData, psData, tasksData] = await Promise.all([
            teamsResponse.json(),
            psResponse.json(),
            tasksResponse.json()
          ]);

          const teamStats = teamsData.teams || [];
          const psStats = psData.problemStatements || [];
          const taskStats = tasksData.tasks || [];

          setStats({
            totalTeams: teamStats.length,
            registeredTeams: teamStats.filter((t: any) => t.status === 'registered').length,
            selectedTeams: teamStats.filter((t: any) => t.status === 'selected').length,
            finalistTeams: teamStats.filter((t: any) => t.status === 'finalist').length,
            totalProblemStatements: psStats.length,
            activeProblemStatements: psStats.filter((ps: any) => ps.isActive).length,
            totalTasks: taskStats.length,
            activeTasks: taskStats.filter((t: any) => t.isActive).length,
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-heading mx-auto mb-4"></div>
          <p className="text-text font-body">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display text-heading mb-2">Admin Dashboard</h1>
            <p className="text-subheading font-body">Smart India Hackathon 2025 Administration</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400 font-body">Welcome back,</p>
            <p className="text-heading font-medium">{user.displayName || user.email}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/admin/teams')}
            className="p-6 bg-gradient-to-r from-blue-600/10 to-blue-400/10 border border-blue-500/30 rounded-xl text-left hover:border-blue-400/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-blue-400">{stats?.totalTeams || '...'}</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Manage Teams</h3>
            <p className="text-gray-400 text-sm">View and manage team registrations</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/admin/problem-statements')}
            className="p-6 bg-gradient-to-r from-green-600/10 to-green-400/10 border border-green-500/30 rounded-xl text-left hover:border-green-400/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-green-400">{stats?.totalProblemStatements || '...'}</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Problem Statements</h3>
            <p className="text-gray-400 text-sm">Manage problem statements and bulk upload</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/admin/tasks')}
            className="p-6 bg-gradient-to-r from-purple-600/10 to-purple-400/10 border border-purple-500/30 rounded-xl text-left hover:border-purple-400/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-purple-400">{stats?.totalTasks || '...'}</span>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Task Management</h3>
            <p className="text-gray-400 text-sm">Create and assign tasks to teams</p>
          </motion.button>
        </motion.div>

        {/* Statistics Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatsCard
            title="Total Teams"
            value={stats?.totalTeams || 0}
            icon="teams"
            color="blue"
            loading={statsLoading}
          />
          <StatsCard
            title="Selected Teams"
            value={stats?.selectedTeams || 0}
            icon="check"
            color="green"
            loading={statsLoading}
          />
          <StatsCard
            title="Active Problem Statements"
            value={stats?.activeProblemStatements || 0}
            icon="document"
            color="yellow"
            loading={statsLoading}
          />
          <StatsCard
            title="Active Tasks"
            value={stats?.activeTasks || 0}
            icon="task"
            color="purple"
            loading={statsLoading}
          />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8"
        >
          <h2 className="text-xl font-display text-heading mb-6">Quick Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-medium text-subheading mb-4">Team Status Distribution</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Registered</span>
                  <span className="text-blue-400 font-medium">{stats?.registeredTeams || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Selected</span>
                  <span className="text-green-400 font-medium">{stats?.selectedTeams || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Finalists</span>
                  <span className="text-purple-400 font-medium">{stats?.finalistTeams || 0}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-subheading mb-4">Problem Statements</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Total</span>
                  <span className="text-heading font-medium">{stats?.totalProblemStatements || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Active</span>
                  <span className="text-green-400 font-medium">{stats?.activeProblemStatements || 0}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-subheading mb-4">Task Management</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Total Tasks</span>
                  <span className="text-heading font-medium">{stats?.totalTasks || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Active</span>
                  <span className="text-purple-400 font-medium">{stats?.activeTasks || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}

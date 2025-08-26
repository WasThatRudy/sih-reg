'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/lib/context/AuthContext';

interface Team {
  _id: string;
  teamName: string;
  leader: {
    name: string;
    email: string;
    phone: string;
  };
  members: any[];
  problemStatement: {
    psNumber: string;
    title: string;
  };
  status: 'registered' | 'selected' | 'rejected' | 'finalist';
  createdAt: string;
}

export default function TeamsManagement() {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);

  const statusColors = {
    registered: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    selected: 'bg-green-500/20 text-green-400 border-green-500/30',
    rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    finalist: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
  };

  useEffect(() => {
    fetchTeams();
  }, [currentPage, filter, searchTerm]);

  const fetchTeams = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filter !== 'all' && { status: filter }),
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/admin/teams?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
        setTotalPages(Math.ceil((data.total || 0) / 10));
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTeamStatus = async (teamId: string, newStatus: string) => {
    if (!user) return;
    
    setUpdating(teamId);
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/teams', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ teamId, status: newStatus })
      });

      if (response.ok) {
        setTeams(teams.map(team => 
          team._id === teamId ? { ...team, status: newStatus as any } : team
        ));
      }
    } catch (error) {
      console.error('Error updating team status:', error);
    } finally {
      setUpdating(null);
    }
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = searchTerm === '' || 
      team.teamName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.leader.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      team.leader.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || team.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display text-heading mb-2">Teams Management</h1>
            <p className="text-subheading font-body">Manage team registrations and status updates</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search teams, leaders, or emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-heading focus:border-heading"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {['all', 'registered', 'selected', 'rejected', 'finalist'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    filter === status
                      ? 'bg-heading/20 text-heading border border-heading/30'
                      : 'bg-gray-800/50 text-gray-400 border border-gray-600 hover:bg-gray-700/50'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Teams Table */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-heading mx-auto mb-4"></div>
              <p className="text-gray-400">Loading teams...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Team</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Leader</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Problem Statement</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Registered</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredTeams.map((team) => (
                      <motion.tr
                        key={team._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white font-medium">{team.teamName}</p>
                            <p className="text-gray-400 text-sm">{team.members.length + 1} members</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white">{team.leader.name}</p>
                            <p className="text-gray-400 text-sm">{team.leader.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white font-medium">{team.problemStatement.psNumber}</p>
                            <p className="text-gray-400 text-sm truncate max-w-xs">{team.problemStatement.title}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${statusColors[team.status]}`}>
                            {team.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {new Date(team.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <select
                              value={team.status}
                              onChange={(e) => updateTeamStatus(team._id, e.target.value)}
                              disabled={updating === team._id}
                              className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-heading"
                            >
                              <option value="registered">Registered</option>
                              <option value="selected">Selected</option>
                              <option value="rejected">Rejected</option>
                              <option value="finalist">Finalist</option>
                            </select>
                            {updating === team._id && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-heading"></div>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-gray-800/50 border-t border-gray-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-sm">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

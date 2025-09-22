"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth } from "@/lib/context/AdminAuthContext";
import {
  ArrowLeft,
  Users,
  CheckCircle,
  AlertTriangle,
  FileText,
  Eye,
  TrendingUp,
  Search,
} from "lucide-react";

interface ProblemStatementStats {
  _id: string;
  psNumber: string;
  title: string;
  description: string;
  assignedEvaluators: number;
  completedEvaluations: number;
  totalTeams: number;
  conflictingTeams: number;
  isActive: boolean;
}

export default function ProblemRankingsOverview() {
  const { isSuperAdmin } = useAdminAuth();
  const router = useRouter();
  const [problemStatements, setProblemStatements] = useState<
    ProblemStatementStats[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!isSuperAdmin) {
      router.push("/admin");
      return;
    }
    fetchProblemStatements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin, router]);

  const fetchProblemStatements = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/admin/login");
        return;
      }

      const response = await fetch("/api/admin/rankings/problem-statements", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 403) {
          router.push("/admin");
          return;
        }
        throw new Error("Failed to fetch problem statements");
      }

      const data = await response.json();
      setProblemStatements(data.problemStatements || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      console.error("Error fetching problem statements:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProblemStatements = problemStatements.filter(
    (ps) =>
      ps.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ps.psNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ps.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCompletionColor = (completed: number, total: number) => {
    if (total === 0) return "text-gray-400 bg-gray-400/20";
    const percentage = (completed / total) * 100;
    if (percentage >= 80) return "text-green-400 bg-green-400/20";
    if (percentage >= 50) return "text-yellow-400 bg-yellow-400/20";
    return "text-red-400 bg-red-400/20";
  };

  const getConflictColor = (conflicts: number, total: number) => {
    if (total === 0 || conflicts === 0) return "text-green-400";
    const percentage = (conflicts / total) * 100;
    if (percentage > 20) return "text-red-400";
    if (percentage > 10) return "text-yellow-400";
    return "text-green-400";
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-heading border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">
              Loading problem statement rankings...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-display text-heading mb-2">Error</h2>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchProblemStatements}
              className="px-4 py-2 bg-heading/20 border border-heading/30 text-heading rounded-lg hover:bg-heading/30 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/admin/super-admin-dashboard")}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-display text-heading mb-1">
                Problem Statement Rankings
              </h1>
              <p className="text-gray-400">
                View evaluation progress and conflicts for each problem
                statement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg">
            <FileText className="w-4 h-4" />
            {problemStatements.length} active problem statements
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by PS number, title, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
          />
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-display text-heading">
                Problem Statements
              </h3>
            </div>
            <p className="text-2xl font-bold text-white">
              {problemStatements.length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-display text-heading">
                Fully Evaluated
              </h3>
            </div>
            <p className="text-2xl font-bold text-white">
              {
                problemStatements.filter(
                  (ps) =>
                    ps.completedEvaluations === ps.assignedEvaluators &&
                    ps.assignedEvaluators > 0
                ).length
              }
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <h3 className="text-lg font-display text-heading">
                With Conflicts
              </h3>
            </div>
            <p className="text-2xl font-bold text-white">
              {problemStatements.filter((ps) => ps.conflictingTeams > 0).length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-display text-heading">Total Teams</h3>
            </div>
            <p className="text-2xl font-bold text-white">
              {problemStatements.reduce((sum, ps) => sum + ps.totalTeams, 0)}
            </p>
          </motion.div>
        </div>

        {/* Problem Statements List */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6">
          <h2 className="text-xl font-display text-heading mb-6">
            Problem Statement Analysis
          </h2>

          {filteredProblemStatements.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-display text-heading mb-2">
                No problem statements found
              </h3>
              <p className="text-gray-400">
                {searchTerm
                  ? "Try adjusting your search criteria."
                  : "No active problem statements available."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProblemStatements.map((ps, index) => (
                <motion.div
                  key={ps._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-display text-heading mb-2">
                        {ps.psNumber} - {ps.title}
                      </h3>
                      {ps.description && (
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {ps.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Status Badge */}
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          ps.completedEvaluations === ps.assignedEvaluators &&
                          ps.assignedEvaluators > 0
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : ps.completedEvaluations > 0
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        }`}
                      >
                        {ps.completedEvaluations === ps.assignedEvaluators &&
                        ps.assignedEvaluators > 0
                          ? "Complete"
                          : ps.completedEvaluations > 0
                          ? "In Progress"
                          : "Not Started"}
                      </div>

                      {/* Conflict Badge */}
                      {ps.conflictingTeams > 0 && (
                        <div className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
                          {ps.conflictingTeams} Conflicts
                        </div>
                      )}

                      <button
                        onClick={() =>
                          router.push(
                            `/admin/super-admin-dashboard/problem-rankings/${ps._id}`
                          )
                        }
                        className="px-4 py-2 bg-heading/20 border border-heading/30 text-heading rounded-lg hover:bg-heading/30 transition-colors flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Analyze
                      </button>
                    </div>
                  </div>

                  {/* Statistics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-400 text-sm">Teams:</span>
                      </div>
                      <span className="text-white font-medium">
                        {ps.totalTeams}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-400 text-sm">
                          Evaluators:
                        </span>
                      </div>
                      <span className="text-white font-medium">
                        {ps.assignedEvaluators}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-gray-400 text-sm">
                          Completed:
                        </span>
                      </div>
                      <span
                        className={`font-medium ${
                          getCompletionColor(
                            ps.completedEvaluations,
                            ps.assignedEvaluators
                          ).split(" ")[0]
                        }`}
                      >
                        {ps.completedEvaluations}/{ps.assignedEvaluators}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                        <span className="text-gray-400 text-sm">
                          Conflicts:
                        </span>
                      </div>
                      <span
                        className={`font-medium ${getConflictColor(
                          ps.conflictingTeams,
                          ps.totalTeams
                        )}`}
                      >
                        {ps.conflictingTeams}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-sm">
                        Evaluation Progress
                      </span>
                      <span className="text-gray-300 text-sm">
                        {ps.assignedEvaluators > 0
                          ? Math.round(
                              (ps.completedEvaluations /
                                ps.assignedEvaluators) *
                                100
                            )
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          ps.assignedEvaluators > 0 &&
                          ps.completedEvaluations / ps.assignedEvaluators >= 0.8
                            ? "bg-green-400"
                            : ps.assignedEvaluators > 0 &&
                              ps.completedEvaluations / ps.assignedEvaluators >=
                                0.5
                            ? "bg-yellow-400"
                            : "bg-red-400"
                        }`}
                        style={{
                          width: `${
                            ps.assignedEvaluators > 0
                              ? (ps.completedEvaluations /
                                  ps.assignedEvaluators) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

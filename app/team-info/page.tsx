"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/context/AuthContext";

interface TeamMember {
  name: string;
  email: string;
  phone: string;
  college: string;
  branch: string;
  year: string;
  gender: string;
}

interface ProblemStatement {
  _id: string;
  psNumber: string;
  title: string;
  description: string;
  domain: string;
}

interface Team {
  _id: string;
  teamName: string;
  leader: {
    name: string;
    email: string;
    phone: string;
    branch: string;
    year: string;
    gender: string;
  };
  members: TeamMember[];
  problemStatement: ProblemStatement;
  status: string;
  createdAt: string;
}

export default function TeamInfo() {
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/teamRegistration", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setTeam(data.team);
        }
      } catch (error) {
        console.error("Error fetching team data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [user]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-heading mx-auto mb-4"></div>
              <p className="text-text font-body">Loading team information...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!team) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="max-w-4xl mx-auto px-6 py-20">
            <div className="text-center">
              <h1 className="text-4xl font-display text-heading mb-4">
                No Team Found
              </h1>
              <p className="text-text font-body mb-8">
                You are not registered with any team yet.
              </p>
              <a
                href="/registration"
                className="px-8 py-3 bg-gradient-to-r from-heading to-subheading text-background rounded-full text-lg font-bold tracking-wide shadow-2xl font-body hover:shadow-heading/30 hover:shadow-lg transition-all duration-300"
              >
                Register Your Team
              </a>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="max-w-6xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-display text-heading mb-4">
                Team Information
              </h1>
              <p className="text-subheading font-body">
                Your registered team details
              </p>
            </div>

            {/* Team Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-display text-heading mb-6">
                Team Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-subheading text-sm font-medium mb-2">
                    Team Name
                  </label>
                  <p className="text-text bg-gray-800/30 border border-gray-600 rounded-lg px-4 py-3">
                    {team.teamName}
                  </p>
                </div>
                <div>
                  <label className="block text-subheading text-sm font-medium mb-2">
                    Registration Status
                  </label>
                  <p className="text-text bg-gray-800/30 border border-gray-600 rounded-lg px-4 py-3 capitalize">
                    {team.status}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Problem Statement */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-display text-heading mb-6">
                Problem Statement
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-subheading text-sm font-medium mb-2">
                    Title
                  </label>
                  <p className="text-text bg-gray-800/30 border border-gray-600 rounded-lg px-4 py-3">
                    {team.problemStatement.psNumber}:{" "}
                    {team.problemStatement.title}
                  </p>
                </div>
                <div>
                  <label className="block text-subheading text-sm font-medium mb-2">
                    Description
                  </label>
                  <p className="text-text bg-gray-800/30 border border-gray-600 rounded-lg px-4 py-3">
                    {team.problemStatement.description}
                  </p>
                </div>
                <div>
                  <label className="block text-subheading text-sm font-medium mb-2">
                    Domain
                  </label>
                  <p className="text-text bg-gray-800/30 border border-gray-600 rounded-lg px-4 py-3">
                    {team.problemStatement.domain}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Team Leader */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-display text-heading mb-6">
                Team Leader
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-subheading text-sm font-medium mb-2">
                    Name
                  </label>
                  <p className="text-text bg-gray-800/30 border border-gray-600 rounded-lg px-4 py-3">
                    {team.leader.name}
                  </p>
                </div>
                <div>
                  <label className="block text-subheading text-sm font-medium mb-2">
                    Email
                  </label>
                  <p className="text-text bg-gray-800/30 border border-gray-600 rounded-lg px-4 py-3">
                    {team.leader.email}
                  </p>
                </div>
                <div>
                  <label className="block text-subheading text-sm font-medium mb-2">
                    Phone
                  </label>
                  <p className="text-text bg-gray-800/30 border border-gray-600 rounded-lg px-4 py-3">
                    {team.leader.phone}
                  </p>
                </div>
                <div>
                  <label className="block text-subheading text-sm font-medium mb-2">
                    Branch
                  </label>
                  <p className="text-text bg-gray-800/30 border border-gray-600 rounded-lg px-4 py-3">
                    {team.leader.branch}
                  </p>
                </div>
                <div>
                  <label className="block text-subheading text-sm font-medium mb-2">
                    Year
                  </label>
                  <p className="text-text bg-gray-800/30 border border-gray-600 rounded-lg px-4 py-3">
                    {team.leader.year}
                  </p>
                </div>
                <div>
                  <label className="block text-subheading text-sm font-medium mb-2">
                    Gender
                  </label>
                  <p className="text-text bg-gray-800/30 border border-gray-600 rounded-lg px-4 py-3">
                    {team.leader.gender}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Team Members */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8"
            >
              <h2 className="text-2xl font-display text-heading mb-6">
                Team Members
              </h2>
              <div className="space-y-6">
                {team.members.map((member, index) => (
                  <div
                    key={index}
                    className="border border-gray-700 rounded-xl p-6"
                  >
                    <h3 className="text-lg font-medium text-subheading mb-4">
                      Member {index + 1}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-subheading text-xs font-medium mb-1">
                          Name
                        </label>
                        <p className="text-text bg-gray-800/30 border border-gray-600 rounded-md px-3 py-2 text-sm">
                          {member.name}
                        </p>
                      </div>
                      <div>
                        <label className="block text-subheading text-xs font-medium mb-1">
                          Email
                        </label>
                        <p className="text-text bg-gray-800/30 border border-gray-600 rounded-md px-3 py-2 text-sm">
                          {member.email}
                        </p>
                      </div>
                      <div>
                        <label className="block text-subheading text-xs font-medium mb-1">
                          Phone
                        </label>
                        <p className="text-text bg-gray-800/30 border border-gray-600 rounded-md px-3 py-2 text-sm">
                          {member.phone}
                        </p>
                      </div>
                      <div>
                        <label className="block text-subheading text-xs font-medium mb-1">
                          College
                        </label>
                        <p className="text-text bg-gray-800/30 border border-gray-600 rounded-md px-3 py-2 text-sm">
                          {member.college}
                        </p>
                      </div>
                      <div>
                        <label className="block text-subheading text-xs font-medium mb-1">
                          Branch
                        </label>
                        <p className="text-text bg-gray-800/30 border border-gray-600 rounded-md px-3 py-2 text-sm">
                          {member.branch}
                        </p>
                      </div>
                      <div>
                        <label className="block text-subheading text-xs font-medium mb-1">
                          Year
                        </label>
                        <p className="text-text bg-gray-800/30 border border-gray-600 rounded-md px-3 py-2 text-sm">
                          {member.year}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <p className="text-text font-body mb-4">
                For any changes or queries, please contact the administrators.
              </p>
              <p className="text-subheading text-sm font-body">
                Registration Date:{" "}
                {new Date(team.createdAt).toLocaleDateString()}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

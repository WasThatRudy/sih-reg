"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import EditLeaderProfileModal, { LeaderProfileData } from "@/components/EditLeaderProfileModal";
import { useAuth } from "@/lib/context/AuthContext";
import { ExternalLink, FileText, Download, MessageCircle, Calendar, MapPin, Edit3, AlertCircle } from "lucide-react";

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
  leader?: {
    name: string;
    email: string;
    phone: string;
    branch: string;
    year: string;
    gender: string;
    college: string;
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const checkLeaderProfileCompleteness = (leader: Team['leader']) => {
    if (!leader) return false;
    const requiredFields: (keyof NonNullable<Team['leader']>)[] = ['phone', 'gender', 'college', 'year', 'branch'];
    return requiredFields.every(field => leader[field]);
  };

  const isProfileComplete = team?.leader ? checkLeaderProfileCompleteness(team.leader) : true;
  const [profileStatus, setProfileStatus] = useState<{
    isComplete: boolean;
    missingFields: string[];
  }>({
    isComplete: true,
    missingFields: []
  });

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const token = await user.getIdToken();
        
        // Fetch team data and profile status in parallel
        const [teamResponse, profileResponse] = await Promise.all([
          fetch("/api/teamRegistration", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("/api/team/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        ]);

        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          setTeam(teamData.team);
        }

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfileStatus({
            isComplete: profileData.isProfileComplete,
            missingFields: profileData.missingFields || []
          });
        }
      } catch (error) {
        console.error("Error fetching team data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [user]);

  const handleProfileUpdate = async (data: LeaderProfileData) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/team/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Refresh team data and profile status
        const [teamResponse, profileResponse] = await Promise.all([
          fetch("/api/teamRegistration", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("/api/team/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        ]);

        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          setTeam(teamData.team);
        }

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setProfileStatus({
            isComplete: profileData.isProfileComplete,
            missingFields: profileData.missingFields || []
          });
        }
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

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
            {/* Profile Incomplete Banner */}
            {!profileStatus.isComplete && profileStatus.missingFields.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8 rounded-r-lg"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">
                      Complete Your Team Leader Profile
                    </h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <p>
                        Your team is registered, but your leader profile is incomplete. Please complete the missing information:
                        <strong className="ml-1">
                          {profileStatus.missingFields.map((field, index) => (
                            <span key={field}>
                              {field === 'phone' ? 'Phone Number' : 
                               field === 'gender' ? 'Gender' :
                               field === 'college' ? 'College' :
                               field === 'year' ? 'Year' :
                               field === 'branch' ? 'Branch' : field}
                              {index < profileStatus.missingFields.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </strong>
                      </p>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="bg-amber-50 px-3 py-2 rounded-md text-sm font-medium text-amber-800 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-50 focus:ring-amber-600 transition-colors"
                      >
                        Update Profile
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* You&apos;re All Set Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-2xl p-8 text-center mb-8"
            >
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-3xl font-display text-green-400 mb-4">
                  You&apos;re All Set! 🎉
                </h2>
                <p className="text-green-200 font-body text-lg mb-6">
                  Your team has been successfully registered for the Smart India Hackathon 2025 Internal Round.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center justify-center gap-3 p-4 bg-gray-800/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <div className="text-left">
                    <p className="text-sm text-gray-400">Date</p>
                    <p className="text-white font-medium">21st September 2025</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3 p-4 bg-gray-800/30 rounded-lg">
                  <MapPin className="w-5 h-5 text-red-400" />
                  <div className="text-left">
                    <p className="text-sm text-gray-400">Venue</p>
                    <p className="text-white font-medium">DSCE Campus</p>
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3 p-4 bg-gray-800/30 rounded-lg">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                  <div className="text-left">
                    <p className="text-sm text-gray-400">Updates</p>
                    <p className="text-white font-medium">WhatsApp Group</p>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-gray-300 font-body mb-4">
                  Stay updated with all the latest information and announcements.
                </p>
                <p className="text-subheading text-sm font-body">
                  Registration Date: {new Date(team.createdAt).toLocaleDateString()}
                </p>
              </div>
            </motion.div>

            {/* Profile Incomplete Banner - Only show if profile is incomplete */}
            {!isProfileComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-6 mb-8"
              >
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center mt-1">
                    <svg className="w-5 h-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-amber-200 mb-2">
                      Complete Your Leader Profile
                    </h3>
                    <p className="text-amber-100/80 text-sm mb-4">
                      Your team registration is complete, but some leader information is missing. 
                      Please complete your profile to ensure all team data is up to date.
                    </p>
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                    >
                      Complete Profile
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* WhatsApp Group Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 mb-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-display text-heading mb-4">
                  Join WhatsApp Group
                </h2>
                <p className="text-subheading font-body">
                  <strong className="text-red-400">Compulsory</strong> - All participants must join for updates and announcements
                </p>
              </div>

              <div className="flex justify-center">
                <div className="text-center">
                  <div className="w-48 h-48 bg-white rounded-2xl p-4 mb-4 mx-auto shadow-2xl">
                    <img 
                      src="/sihqr.jpg" 
                      alt="WhatsApp QR Code" 
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </div>
                  <p className="text-sm text-gray-400">
                    Scan this QR code with your phone to join the group
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Important Documents Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8 mb-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-display text-heading mb-4">
                  Important Documents
                </h2>
                <p className="text-subheading font-body">
                  Download these required documents for the hackathon
                </p>
              </div>

              {/* Important Notice */}
              <div className="mb-8 p-4 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-amber-500/20 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-200 mb-2">Important Notice</h3>
                    <p className="text-amber-100/80 text-sm leading-relaxed">
                      The <strong>PPT template is mandatory</strong> for the actual hackathon presentation. 
                      The guidelines are for your reference to understand the rules and requirements.
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents List */}
              <div className="space-y-6">
                {/* PPT Template */}
                <motion.div
                  className="flex items-center justify-between p-6 bg-gray-800/30 rounded-xl border border-gray-700 hover:border-heading/30 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">SIH 2025 Idea Presentation Format</h3>
                      <p className="text-gray-400 text-sm">PowerPoint template for your hackathon presentation</p>
                    </div>
                  </div>
                  <a
                    href="https://www.sih.gov.in/letters/SIH2025-IDEA-Presentation-Format.pptx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <Download className="w-4 h-4" />
                    Download
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </motion.div>

                {/* Guidelines */}
                <motion.div
                  className="flex items-center justify-between p-6 bg-gray-800/30 rounded-xl border border-gray-700 hover:border-heading/30 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">SIH 2025 Official Guidelines</h3>
                      <p className="text-gray-400 text-sm">Reference document for rules and requirements</p>
                    </div>
                  </div>
                  <a
                    href="https://sih.gov.in/letters/SIH2025-Guidelines-College-SPOC.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <Download className="w-4 h-4" />
                    Download
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </motion.div>
              </div>

              {/* Additional Info */}
              <div className="mt-8 p-4 bg-gray-800/20 rounded-lg border border-gray-700">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-white mb-2">What to do with these documents?</h4>
                    <ul className="text-gray-300 text-sm space-y-1">
                      <li>• Use the PPT template for your hackathon presentation (mandatory)</li>
                      <li>• Review the guidelines to understand rules and requirements</li>
                      <li>• Follow the presentation format structure during the hackathon</li>
                      <li>• Keep the template ready for the actual event</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>

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
              transition={{ delay: 0.4 }}
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
              transition={{ delay: 0.5 }}
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
              transition={{ delay: 0.6 }}
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display text-heading">
                  Team Leader
                </h2>
                {!isProfileComplete && (
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <Edit3 className="w-4 h-4" />
                    Complete Profile
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-subheading text-sm font-medium mb-2">
                    Name
                  </label>
                  <p className="text-text bg-gray-800/30 border border-gray-600 rounded-lg px-4 py-3">
                    {team.leader?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-subheading text-sm font-medium mb-2">
                    Email
                  </label>
                  <p className="text-text bg-gray-800/30 border border-gray-600 rounded-lg px-4 py-3">
                    {team.leader?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-subheading text-sm font-medium mb-2">
                    Phone
                  </label>
                  <p className="text-text bg-gray-800/30 border border-gray-600 rounded-lg px-4 py-3">
                    {team.leader?.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-subheading text-sm font-medium mb-2">
                    College
                  </label>
                  <p className="text-text bg-gray-800/30 border border-gray-600 rounded-lg px-4 py-3">
                    {team.leader?.college || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-subheading text-sm font-medium mb-2">
                    Branch
                  </label>
                  <p className="text-text bg-gray-800/30 border border-gray-600 rounded-lg px-4 py-3">
                    {team.leader?.branch || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-subheading text-sm font-medium mb-2">
                    Year
                  </label>
                  <p className="text-text bg-gray-800/30 border border-gray-600 rounded-lg px-4 py-3">
                    {team.leader?.year || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-subheading text-sm font-medium mb-2">
                    Gender
                  </label>
                  <p className="text-text bg-gray-800/30 border border-gray-600 rounded-lg px-4 py-3">
                    {team.leader?.gender || "N/A"}
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
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <p className="text-text font-body mb-4">
                For any changes or queries, please contact the administrators.
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* Edit Profile Modal */}
        <EditLeaderProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleProfileUpdate}
          leaderData={{
            name: team.leader?.name || user?.displayName || '',
            email: team.leader?.email || user?.email || '',
            phone: team.leader?.phone || '',
            branch: team.leader?.branch || '',
            year: team.leader?.year || '',
            gender: team.leader?.gender || '',
            college: team.leader?.college || ''
          }}
        />
      </div>
    </ProtectedRoute>
  );
}

"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import TeamLeader from "@/components/registration/TeamLeader";
import TeamMembers from "@/components/registration/TeamMembers";

import CustomDropdown from "@/components/ui/CustomDropdown";
import AccordionSection from "@/components/ui/AccordionSection";
import ValidatedInput from "@/components/ui/ValidatedInput";
import { useAuth } from "@/lib/context/AuthContext";

interface ProblemStatement {
  _id: string;
  psNumber: string;
  title: string;
  description: string;
  domain: string;
  link: string;
  teamCount: number;
  maxTeams: number;
  isActive: boolean;
}

interface Team {
  _id: string;
  teamName: string;
  leader: string;
  members: any[];
  problemStatement: string;
  status: string;
}

export default function Registration() {
  const { user, refreshTeamStatus } = useAuth();

  const [problemStatements, setProblemStatements] = useState<
    ProblemStatement[]
  >([]);
  const [existingTeam, setExistingTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

  const [formData, setFormData] = useState({
    teamName: "",
    problemStatement: "",
    teamLeader: {
      name: "",
      email: "",
      phone: "",
      year: "",
      branch: "",
      gender: "",
      otherGender: "",
    },
    members: [
      {
        name: "",
        email: "",
        phone: "",
        college: "",
        year: "",
        branch: "",
        gender: "",
        otherGender: "",
      },
      {
        name: "",
        email: "",
        phone: "",
        college: "",
        year: "",
        branch: "",
        gender: "",
        otherGender: "",
      },
      {
        name: "",
        email: "",
        phone: "",
        college: "",
        year: "",
        branch: "",
        gender: "",
        otherGender: "",
      },
      {
        name: "",
        email: "",
        phone: "",
        college: "",
        year: "",
        branch: "",
        gender: "",
        otherGender: "",
      },
      {
        name: "",
        email: "",
        phone: "",
        college: "",
        year: "",
        branch: "",
        gender: "",
        otherGender: "",
      },
    ],
    mentor: {
      name: "",
      email: "",
      phone: "",
      designation: "",
    },
  });

  // Handle form submission
  const handleSubmit = async () => {
    if (!user || !isFormComplete) return;

    setSubmitLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/teamRegistration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Team registered successfully!");
        // Refresh team status and redirect to team info
        await refreshTeamStatus();
        window.location.href = "/team-info";
      } else {
        const error = await response.json();
        alert(`Registration failed: ${error.message}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred during registration.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleInputChange = (
    section: string,
    field: string,
    value: string,
    index?: number
  ) => {
    if (section === "teamLeader") {
      setFormData((prev) => ({
        ...prev,
        teamLeader: { ...prev.teamLeader, [field]: value },
      }));
    } else if (section === "members" && typeof index === "number") {
      setFormData((prev) => ({
        ...prev,
        members: prev.members.map((member, i) =>
          i === index ? { ...member, [field]: value } : member
        ),
      }));
    } else if (section === "mentor") {
      setFormData((prev) => ({
        ...prev,
        mentor: { ...prev.mentor, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Check if each step is completed
  const isTeamInfoComplete = formData.teamName && formData.problemStatement;

  const isTeamLeaderComplete =
    formData.teamLeader.name &&
    formData.teamLeader.email &&
    formData.teamLeader.phone &&
    formData.teamLeader.year &&
    formData.teamLeader.branch &&
    formData.teamLeader.gender;

  const isAtLeastOneMemberComplete = formData.members.some(
    (member) => member.name && member.email && member.phone
  );

  const canShowTeamLeader = isTeamInfoComplete;
  const canShowTeamMembers = isTeamInfoComplete && isTeamLeaderComplete;
  const canShowSubmit = isTeamInfoComplete && isTeamLeaderComplete;
  const isFormComplete =
    isTeamInfoComplete && isTeamLeaderComplete && isAtLeastOneMemberComplete;

  // State for which sections are manually opened
  const [openSections, setOpenSections] = useState<{ [key: number]: boolean }>({
    1: true, // Team info is always open initially
    2: false,
    3: false,
  });

  const toggleSection = (section: number) => {
    if (
      section === 1 ||
      (section === 2 && canShowTeamLeader) ||
      (section === 3 && canShowTeamMembers)
    ) {
      setOpenSections((prev) => ({
        ...prev,
        [section]: !prev[section],
      }));
    }
  };

  // Auto-open next section when current is completed
  useEffect(() => {
    if (isTeamInfoComplete && canShowTeamLeader && !openSections[2]) {
      setOpenSections((prev) => ({ ...prev, 2: true, 1: false }));
    }
  }, [isTeamInfoComplete, canShowTeamLeader]);

  useEffect(() => {
    if (isTeamLeaderComplete && canShowTeamMembers && !openSections[3]) {
      setOpenSections((prev) => ({ ...prev, 3: true, 2: false }));
    }
  }, [isTeamLeaderComplete, canShowTeamMembers]);

  // Fetch problem statements and check for existing team
  useEffect(() => {
    const fetchData = async () => {
      if (!user || dataFetched) return;

      setLoading(true);
      try {
        // Fetch problem statements only once
        const psResponse = await fetch("/api/problem-statements");
        if (psResponse.ok) {
          const psData = await psResponse.json();
          setProblemStatements(psData.problemStatements || []);
        }

        // Check for existing team registration
        const token = await user.getIdToken();
        const teamResponse = await fetch("/api/teamRegistration", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          if (teamData.isRegistered && teamData.team) {
            setExistingTeam(teamData.team);
            console.log(teamData.message); // Log the message for debugging
          }
        }

        setDataFetched(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, dataFetched]);

  // Auto-fill team leader data from authenticated user
  useEffect(() => {
    if (
      user &&
      !formData.teamLeader.name &&
      !formData.teamLeader.email &&
      !existingTeam
    ) {
      setFormData((prev) => ({
        ...prev,
        teamLeader: {
          ...prev.teamLeader,
          name: user.displayName || "",
          email: user.email || "",
        },
      }));
    }
  }, [user, formData.teamLeader.name, formData.teamLeader.email, existingTeam]);

  // Show loading spinner
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-heading mx-auto mb-4"></div>
              <p className="text-text font-body">Loading...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Show existing team info if already registered
  if (existingTeam) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="max-w-4xl mx-auto px-6 py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8"
            >
              <div className="text-center mb-8">
                <h1 className="text-4xl font-display text-heading mb-4">
                  Team Registration Complete
                </h1>
                <p className="text-subheading font-body">
                  Your team has been successfully registered!
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-subheading text-sm font-medium mb-2">
                      Team Name
                    </label>
                    <p className="text-text bg-gray-800/30 border border-gray-600 rounded-lg px-4 py-3">
                      {existingTeam.teamName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-subheading text-sm font-medium mb-2">
                      Status
                    </label>
                    <p className="text-text bg-gray-800/30 border border-gray-600 rounded-lg px-4 py-3 capitalize">
                      {existingTeam.status}
                    </p>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-text font-body">
                    For any changes or queries, please contact the
                    administrators.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              className="font-display text-5xl md:text-7xl font-light mb-8 tracking-tight leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-heading">Team</span>
              <br />
              <span className="text-subheading">Registration</span>
            </motion.h1>

            <motion.p
              className="font-body text-lg text-gray-400 max-w-2xl mx-auto font-light leading-relaxed tracking-wide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Register your team for the Smart India Hackathon 2025 Internal
              Round.
            </motion.p>
          </div>
        </section>

        {/* Registration Form */}
        <section className="pb-24 px-6">
          <div className="max-w-4xl mx-auto">
            {/* Progress Indicator */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-400 tracking-wide">
                  Registration Progress
                </span>
                <span className="text-sm font-medium text-subheading tracking-wide">
                  Step{" "}
                  {isTeamInfoComplete
                    ? isTeamLeaderComplete
                      ? "3"
                      : "2"
                    : "1"}{" "}
                  of 3
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-heading to-subheading h-2 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{
                    width: isTeamInfoComplete
                      ? isTeamLeaderComplete
                        ? "100%"
                        : "66%"
                      : "33%",
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span className={isTeamInfoComplete ? "text-heading" : ""}>
                  Team Info
                </span>
                <span className={isTeamLeaderComplete ? "text-heading" : ""}>
                  Team Leader
                </span>
                <span className={canShowTeamMembers ? "text-heading" : ""}>
                  Team Members
                </span>
              </div>
            </motion.div>

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {/* Step 1: Team Information */}
              <AccordionSection
                stepNumber={1}
                title="Team Information"
                isComplete={!!isTeamInfoComplete}
                isUnlocked={true}
                isOpen={openSections[1]}
                onToggle={() => toggleSection(1)}
                status={isTeamInfoComplete ? "completed" : "required"}
                allowOverflow={true}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ValidatedInput
                    label="Team Name"
                    type="text"
                    value={formData.teamName}
                    onChange={(value) =>
                      handleInputChange("", "teamName", value)
                    }
                    placeholder="Enter your team name"
                    required
                    validationType="team name"
                  />
                  <div>
                    <CustomDropdown
                      options={problemStatements.map((ps) => ({
                        value: ps._id,
                        label: `${ps.psNumber}: ${ps.title}`,
                        description: ps.description,
                      }))}
                      value={formData.problemStatement}
                      onChange={(value) =>
                        handleInputChange("", "problemStatement", value)
                      }
                      label="Problem Statement"
                      placeholder="Select a problem statement"
                    />
                  </div>
                </div>
              </AccordionSection>

              {/* Step 2: Team Leader */}
              <AccordionSection
                stepNumber={2}
                title="Team Leader Information"
                isComplete={!!isTeamLeaderComplete}
                isUnlocked={!!canShowTeamLeader}
                isOpen={openSections[2]}
                onToggle={() => toggleSection(2)}
                status={
                  !canShowTeamLeader
                    ? "locked"
                    : isTeamLeaderComplete
                    ? "completed"
                    : "required"
                }
              >
                <TeamLeader
                  teamLeader={formData.teamLeader}
                  onInputChange={handleInputChange}
                  isDataFromAuth={
                    !!(
                      user &&
                      (formData.teamLeader.name || formData.teamLeader.email)
                    )
                  }
                />
              </AccordionSection>

              {/* Step 3: Team Members */}
              <AccordionSection
                stepNumber={3}
                title="Team Members Information"
                isComplete={false}
                isUnlocked={!!canShowTeamMembers}
                isOpen={openSections[3]}
                onToggle={() => toggleSection(3)}
                status={!canShowTeamMembers ? "locked" : "optional"}
              >
                <TeamMembers
                  members={formData.members}
                  onInputChange={handleInputChange}
                />
              </AccordionSection>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0.3, y: 20 }}
                animate={{
                  opacity: canShowSubmit ? 1 : 0.3,
                  y: canShowSubmit ? 0 : 20,
                }}
                transition={{ duration: 0.5 }}
              >
                {canShowSubmit ? (
                  <button
                    onClick={handleSubmit}
                    disabled={submitLoading}
                    className="px-12 py-5 bg-gradient-to-r from-heading to-subheading text-background rounded-full text-lg font-bold tracking-wide shadow-2xl font-body hover:shadow-heading/30 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitLoading ? "Submitting..." : "Submit Registration"}
                  </button>
                ) : (
                  <div className="text-center">
                    <div className="px-12 py-5 bg-gray-700 text-gray-400 rounded-full text-lg font-medium tracking-wide shadow-2xl font-body cursor-not-allowed">
                      Complete required steps to submit
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.form>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}

import { Team, ITeam } from "../../models/Team";
import mongoose from "mongoose";

interface PopulatedLeader {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  gender?: string;
  college?: string;
  year?: string;
  branch?: string;
  firebaseUid?: string;
}

interface PopulatedProblemStatement {
  _id: string;
  psNumber: string;
  title: string;
  domain: string;
  teamCount: number;
}

interface PopulatedTeam extends Omit<ITeam, 'leader' | 'problemStatement'> {
  leader: PopulatedLeader;
  problemStatement: PopulatedProblemStatement;
}

/**
 * Verify that a user is the leader of a specific team
 * @param userId - The authenticated user's ID
 * @param teamId - The team ID to check (optional, will find any team led by user if not provided)
 * @param session - Optional database session for transactions
 * @returns Promise<{ isOwner: boolean, team?: PopulatedTeam, error?: string }>
 */
export async function verifyTeamOwnership(
  userId: string,
  teamId?: string,
  session?: mongoose.ClientSession
): Promise<{ isOwner: boolean; team?: PopulatedTeam; error?: string }> {
  try {
    // Build query to find team where user is the leader
    const query: mongoose.FilterQuery<ITeam> = { leader: userId };
    
    // If specific team ID is provided, also match it
    if (teamId) {
      query._id = teamId;
    }

    // Find the team with populated data
    const teamQuery = Team.findOne(query)
      .populate("leader", "name email phone gender college year branch firebaseUid")
      .populate("problemStatement", "psNumber title domain teamCount");

    // Add session if provided
    const team = session ? await teamQuery.session(session) : await teamQuery;

    if (!team) {
      return {
        isOwner: false,
        error: teamId 
          ? "Team not found or you are not the leader of this team" 
          : "No team found where you are the leader"
      };
    }

    // Additional verification: ensure the populated leader ID matches the user ID
    const leader = team.leader as unknown as PopulatedLeader;
    if (leader._id.toString() !== userId.toString()) {
      console.warn(`🚨 SECURITY WARNING: Team leader mismatch detected. Expected: ${userId}, Found: ${leader._id}`);
      return {
        isOwner: false,
        error: "Team ownership verification failed"
      };
    }

    return {
      isOwner: true,
      team: team as unknown as PopulatedTeam
    };
  } catch (error) {
    console.error("Error verifying team ownership:", error);
    return {
      isOwner: false,
      error: "Failed to verify team ownership"
    };
  }
}

/**
 * Verify that a user has permission to perform actions on a team
 * This includes additional checks like Firebase UID matching
 * @param authenticatedUser - The authenticated user object from middleware
 * @param team - The team object to verify ownership of
 * @returns { isAuthorized: boolean, error?: string }
 */
export function verifyTeamActionPermission(
  authenticatedUser: { _id: string; firebaseUid: string; role: string },
  team: PopulatedTeam
): { isAuthorized: boolean; error?: string } {
  // Check if user is a team leader
  if (authenticatedUser.role !== "leader") {
    return {
      isAuthorized: false,
      error: "Only team leaders can perform this action"
    };
  }

  const leader = team.leader;

  // Verify user ID matches team leader ID
  if (leader._id.toString() !== authenticatedUser._id.toString()) {
    return {
      isAuthorized: false,
      error: "You are not the leader of this team"
    };
  }

  // Additional security: verify Firebase UID if available
  if (leader.firebaseUid && leader.firebaseUid !== authenticatedUser.firebaseUid) {
    console.warn(`🚨 Firebase UID mismatch: ${authenticatedUser.firebaseUid} vs ${leader.firebaseUid}`);
    return {
      isAuthorized: false,
      error: "Authentication verification failed"
    };
  }

  return { isAuthorized: true };
}

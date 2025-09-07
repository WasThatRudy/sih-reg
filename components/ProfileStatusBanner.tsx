import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ProfileStatusBannerProps {
  isAuthenticated: boolean;
  userRole?: string;
}

export default function ProfileStatusBanner({ isAuthenticated, userRole }: ProfileStatusBannerProps) {
  const [profileStatus, setProfileStatus] = useState<{
    isComplete: boolean;
    missingFields: string[];
    loading: boolean;
    hasTeam: boolean;
  }>({
    isComplete: true,
    missingFields: [],
    loading: true,
    hasTeam: false
  });

  useEffect(() => {
    const checkProfileStatus = async () => {
      if (!isAuthenticated || userRole !== 'leader') {
        setProfileStatus(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        // Get team data to check if user has a team and leader profile completeness
        const teamResponse = await fetch('/api/teamRegistration');
        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          const hasTeam = !!teamData.team;
          
          if (hasTeam && teamData.team.leader) {
            const leader = teamData.team.leader;
            const missingFields: string[] = [];
            
            // Check for missing leader fields
            if (!leader.phone) missingFields.push('phone');
            if (!leader.gender) missingFields.push('gender');
            // if (!leader.college) missingFields.push('college');
            if (!leader.year) missingFields.push('year');
            if (!leader.branch) missingFields.push('branch');
            
            setProfileStatus({
              isComplete: missingFields.length === 0,
              missingFields,
              loading: false,
              hasTeam: true
            });
          } else {
            setProfileStatus({
              isComplete: true, // Don't show banner if no team
              missingFields: [],
              loading: false,
              hasTeam: hasTeam
            });
          }
        } else {
          setProfileStatus(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Failed to check profile status:', error);
        setProfileStatus(prev => ({ ...prev, loading: false }));
      }
    };

    checkProfileStatus();
  }, [isAuthenticated, userRole]);

  // Don't show banner if not authenticated, not a leader, loading, or profile is complete
  if (!isAuthenticated || userRole !== 'leader' || profileStatus.loading || profileStatus.isComplete) {
    return null;
  }

  // Only show for team leaders who have registered a team but have incomplete profile
  if (!profileStatus.hasTeam) {
    return null;
  }

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
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
            <div className="-mx-2 -my-1.5 flex">
              <Link
                href="/team-info"
                className="bg-amber-50 px-2 py-1.5 rounded-md text-sm font-medium text-amber-800 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-50 focus:ring-amber-600"
              >
                Update Profile
              </Link>
              <button
                type="button"
                onClick={() => setProfileStatus(prev => ({ ...prev, isComplete: true }))}
                className="ml-3 bg-amber-50 px-2 py-1.5 rounded-md text-sm font-medium text-amber-800 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-50 focus:ring-amber-600"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

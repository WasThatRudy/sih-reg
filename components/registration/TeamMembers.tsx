'use client';
import Slider from '@/components/ui/Slider';
import ValidatedInput from '@/components/ui/ValidatedInput';

interface TeamMember {
  name: string;
  email: string;
  phone: string;
  college: string;
  year: string;
  branch: string;
  gender: string;
  otherGender?: string;
}

interface TeamMembersProps {
  members: TeamMember[];
  onInputChange: (section: string, field: string, value: string, index: number) => void;
}

const yearOptions = [
  { value: '1st', label: '1st' },
  { value: '2nd', label: '2nd' },
  { value: '3rd', label: '3rd' },
  { value: '4th', label: '4th' }
];

const genderOptions = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' }
];

export default function TeamMembers({ members, onInputChange }: TeamMembersProps) {
  return (
    <div>
      <div className="space-y-6">
        {members.map((member, index) => (
          <div key={index} className="border border-gray-800 rounded-lg p-6">
            <h3 className="text-subheading text-lg font-medium mb-4 tracking-wide">Member {index + 1}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ValidatedInput
                label="Full Name"
                type="text"
                value={member.name}
                onChange={(value) => onInputChange('members', 'name', value, index)}
                placeholder="Enter full name"
                validationType="name"
              />
              <ValidatedInput
                label="Email"
                type="email"
                value={member.email}
                onChange={(value) => onInputChange('members', 'email', value, index)}
                placeholder="Enter email address"
                validationType="email"
              />
              <ValidatedInput
                label="Phone"
                type="tel"
                value={member.phone}
                onChange={(value) => onInputChange('members', 'phone', value, index)}
                placeholder="Enter phone number"
                validationType="phone"
              />
              <ValidatedInput
                label="College"
                type="text"
                value={member.college}
                onChange={(value) => onInputChange('members', 'college', value, index)}
                placeholder="Enter college name"
                validationType="name"
              />
              <div>
                <Slider
                    options={yearOptions}
                    value={member.year}
                    onChange={(value) => onInputChange('members', 'year', value, index)}
                    label="Year of Study"
                />
              </div>
              <div>
                <Slider
                    options={genderOptions}
                    value={member.gender}
                    onChange={(value) => onInputChange('members', 'gender', value, index)}
                    label="Gender"
                    showOtherInput={true}
                    otherValue={member.otherGender || ''}
                    onOtherChange={(value) => onInputChange('members', 'otherGender', value, index)}
                />
              </div>
              <ValidatedInput
                label="Branch"
                type="text"
                value={member.branch}
                onChange={(value) => onInputChange('members', 'branch', value, index)}
                placeholder="Enter branch (e.g., Computer Science)"
                validationType="branch"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

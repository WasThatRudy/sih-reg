import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, User } from 'lucide-react';
import ValidatedInput from '@/components/ui/ValidatedInput';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { branches } from '@/data/branches';

interface EditLeaderProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: LeaderProfileData) => Promise<void>;
  leaderData: {
    name: string;
    email: string;
    phone?: string;
    branch?: string;
    year?: string;
    gender?: string;
    college?: string;
  };
}

export interface LeaderProfileData {
  phone: string;
  gender: string;
  college: string;
  year: string;
  branch: string;
}

export default function EditLeaderProfileModal({
  isOpen,
  onClose,
  onSave,
  leaderData
}: EditLeaderProfileModalProps) {
  const [formData, setFormData] = useState<LeaderProfileData>({
    phone: leaderData.phone || '',
    gender: leaderData.gender || '',
    college: leaderData.college || '',
    year: leaderData.year || '',
    branch: leaderData.branch || '',
  });

  const [errors, setErrors] = useState<Partial<LeaderProfileData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<LeaderProfileData> = {};

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Phone number must be 10 digits';
    }

    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    if (!formData.college.trim()) {
      newErrors.college = 'College is required';
    }

    if (!formData.year) {
      newErrors.year = 'Year is required';
    }

    if (!formData.branch) {
      newErrors.branch = 'Branch is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof LeaderProfileData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-display text-heading">
                  Edit Leader Profile
                </h2>
                <p className="text-subheading text-sm">
                  Complete your team leader information
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Read-only info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-700">
              <div>
                <label className="block text-subheading text-sm font-medium mb-2">
                  Name
                </label>
                <p className="text-text bg-gray-800/30 border border-gray-600 rounded-lg px-4 py-3">
                  {leaderData.name}
                </p>
              </div>
              <div>
                <label className="block text-subheading text-sm font-medium mb-2">
                  Email
                </label>
                <p className="text-text bg-gray-800/30 border border-gray-600 rounded-lg px-4 py-3">
                  {leaderData.email}
                </p>
              </div>
            </div>

            {/* Editable fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ValidatedInput
                type="tel"
                label="Phone Number"
                value={formData.phone}
                onChange={(value) => handleInputChange('phone', value)}
                error={errors.phone}
                placeholder="Enter 10-digit phone number"
                validationType="phone"
                required
              />

              <div>
                <CustomDropdown
                  label="Gender"
                  placeholder="Select gender"
                  options={[
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                    { value: 'Other', label: 'Other' },
                  ]}
                  value={formData.gender}
                  onChange={(value) => handleInputChange('gender', value)}
                  required
                />
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-400">{errors.gender}</p>
                )}
              </div>

              <ValidatedInput
                type="text"
                label="College"
                value={formData.college}
                onChange={(value) => handleInputChange('college', value)}
                error={errors.college}
                placeholder="Enter college name"
                required
              />

              <div>
                <CustomDropdown
                  label="Year"
                  placeholder="Select year"
                  options={[
                    { value: '1st Year', label: '1st Year' },
                    { value: '2nd Year', label: '2nd Year' },
                    { value: '3rd Year', label: '3rd Year' },
                    { value: '4th Year', label: '4th Year' },
                  ]}
                  value={formData.year}
                  onChange={(value) => handleInputChange('year', value)}
                  required
                />
                {errors.year && (
                  <p className="mt-1 text-sm text-red-400">{errors.year}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <CustomDropdown
                  label="Branch"
                  placeholder="Select branch"
                  options={branches.map(branch => ({
                    value: branch,
                    label: branch
                  }))}
                  value={formData.branch}
                  onChange={(value) => handleInputChange('branch', value)}
                  required
                />
                {errors.branch && (
                  <p className="mt-1 text-sm text-red-400">{errors.branch}</p>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-heading to-subheading text-background rounded-lg font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-background"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

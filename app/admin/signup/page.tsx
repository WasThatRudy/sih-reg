'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import ValidatedInput from '@/components/ui/ValidatedInput';

export default function AdminSignup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminSecretKey: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.adminSecretKey) {
      newErrors.adminSecretKey = 'Admin secret key is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/auth/admin-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          adminSecretKey: formData.adminSecretKey
        })
      });

      if (response.ok) {
        alert('Admin account created successfully! You can now sign in.');
        router.push('/admin/login');
      } else {
        const errorData = await response.json();
        if (errorData.message.includes('secret key')) {
          setErrors({ adminSecretKey: 'Invalid admin secret key' });
        } else if (errorData.message.includes('email')) {
          setErrors({ email: 'Email already exists or is invalid' });
        } else {
          setErrors({ password: errorData.message || 'Registration failed' });
        }
      }
    } catch (error) {
      console.error('Admin signup error:', error);
      setErrors({ password: 'Registration failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-heading/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-heading/30"
            >
              <svg className="w-8 h-8 text-heading" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </motion.div>
            <h1 className="text-2xl font-display text-heading mb-2">Create Admin Account</h1>
            <p className="text-subheading font-body text-sm">
              Set up your SIH Admin Dashboard account
            </p>
          </div>

          {/* Admin Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <ValidatedInput
              label="Full Name"
              type="text"
              value={formData.name}
              onChange={(value) => handleInputChange('name', value)}
              placeholder="Enter your full name"
              required
              validationType="name"
              error={errors.name}
            />

            <ValidatedInput
              label="Admin Email"
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange('email', value)}
              placeholder="Enter your admin email"
              required
              validationType="email"
              error={errors.email}
            />

            <ValidatedInput
              label="Password"
              type="password"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              placeholder="Create a strong password"
              required
              error={errors.password}
            />

            <ValidatedInput
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={(value) => handleInputChange('confirmPassword', value)}
              placeholder="Confirm your password"
              required
              error={errors.confirmPassword}
            />

            <div>
              <label className="block text-subheading text-sm font-medium mb-2">
                Admin Secret Key *
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={formData.adminSecretKey}
                  onChange={(e) => handleInputChange('adminSecretKey', e.target.value)}
                  placeholder="Enter admin secret key"
                  className={`w-full px-4 py-3 bg-gray-800/30 border rounded-lg text-white font-body placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
                    errors.adminSecretKey
                      ? 'border-red-500 focus:ring-red-500/50'
                      : 'border-gray-600 focus:ring-heading focus:border-heading'
                  }`}
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              {errors.adminSecretKey && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-red-400 text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.adminSecretKey}
                </motion.p>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3 bg-gradient-to-r from-heading to-subheading text-background rounded-lg font-bold tracking-wide shadow-2xl font-body hover:shadow-heading/30 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-background"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                'Create Admin Account'
              )}
            </motion.button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-3">
            <motion.a
              href="/admin/login"
              whileHover={{ scale: 1.05 }}
              className="text-subheading hover:text-heading transition-colors text-sm font-body block"
            >
              Already have an admin account? Sign in
            </motion.a>
            <motion.a
              href="/"
              whileHover={{ scale: 1.05 }}
              className="text-gray-400 hover:text-subheading transition-colors text-sm font-body block"
            >
              ← Back to Main Site
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

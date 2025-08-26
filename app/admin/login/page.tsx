'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import ValidatedInput from '@/components/ui/ValidatedInput';
import { EyeIcon } from 'lucide-react';

export default function AdminLogin() {
  const { signIn, loading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    adminSecretKey: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showAdminSecretKey, setShowAdminSecretKey] = useState(false);
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

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

    if (!formData.adminSecretKey) {
      newErrors.adminSecretKey = 'Admin secret key is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSubmitLoading(true);
    try {
      // First validate admin credentials with backend
      const response = await fetch('/api/auth/admin-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Admin User', // Default name for login
          email: formData.email,
          password: formData.password,
          adminSecretKey: formData.adminSecretKey
        })
      });

      if (response.ok) {
        // If admin validation successful, sign in with Firebase
        await signIn(formData.email, formData.password);
        router.push('/admin');
      } else {
        const errorData = await response.json();
        if (errorData.message.includes('secret key')) {
          setErrors({ adminSecretKey: 'Invalid admin secret key' });
        } else if (errorData.message.includes('email')) {
          setErrors({ email: 'Invalid email or password' });
        } else {
          setErrors({ password: 'Invalid email or password' });
        }
      }
    } catch (error: any) {
      console.error('Admin login error:', error);
      setErrors({ password: 'Login failed. Please try again.' });
    } finally {
      setSubmitLoading(false);
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </motion.div>
            <h1 className="text-2xl font-display text-heading mb-2">Admin Access</h1>
            <p className="text-subheading font-body text-sm">
              Sign in to the SIH Admin Dashboard
            </p>
          </div>

          {/* Admin Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Enter your password"
              required
              error={errors.password}
            />

            <div>
              <label className="block text-subheading text-sm font-medium mb-2">
                Admin Secret Key *
              </label>
              <div className="relative">
                <input
                  type={showAdminSecretKey ? 'text' : 'password'}
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
                <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2" onClick={() => setShowAdminSecretKey(!showAdminSecretKey)}>
                  <EyeIcon className="w-5 h-5 text-gray-400" />
                </button>
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
              disabled={submitLoading || loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full px-6 py-3 bg-gradient-to-r from-heading to-subheading text-background rounded-lg font-bold tracking-wide shadow-2xl font-body hover:shadow-heading/30 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitLoading || loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-background"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In to Admin Panel'
              )}
            </motion.button>
          </form>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg"
          >
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <p className="text-yellow-400 font-medium text-sm">Security Notice</p>
                <p className="text-yellow-300/80 text-sm mt-1">
                  Admin access requires a valid secret key. Contact your system administrator if you don't have the key.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Links */}
          <div className="mt-6 text-center space-y-3">
            <motion.a
              href="/admin/signup"
              whileHover={{ scale: 1.05 }}
              className="text-subheading hover:text-heading transition-colors text-sm font-body block"
            >
              Need to create an admin account?
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

'use client';
import React, { useState, useEffect } from 'react';
import { UserCircle, Mail, Film } from 'lucide-react';

const ProfileView: React.FC<{ userProfile: any, onProfileUpdate: (profile: any) => void }> = ({ userProfile: initialProfile, onProfileUpdate }) => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    scriptId: '', 
  });

  useEffect(() => {
    // Using placeholder data as we are not connected to DB
    const placeholderProfile = {
        name: 'Script Writer',
        email: 'writer@example.com',
        mobileNumber: '1234567890'
    };
    const profileToUse = initialProfile || placeholderProfile;
    const scriptIdSuffix = (profileToUse.mobileNumber || '').slice(-4).padStart(4, '0');
    const scriptId = `SCP${scriptIdSuffix}`;

    setFormData({
        name: profileToUse.name || '',
        email: profileToUse.email || '',
        scriptId: scriptId,
    });
  }, [initialProfile]);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2 animate-fade-in">
        <h1 className="text-3xl font-extrabold text-slate-900">Your Profile</h1>
        <p className="text-slate-500">View your personal details and script identity.</p>
      </div>

      {/* Form - Now a read-only display */}
      <div className="space-y-6">
        {[
          {
            label: 'Name',
            icon: <UserCircle />,
            name: 'name',
            type: 'text',
            placeholder: 'Your full name',
            disabled: true
          },
          {
            label: 'Email',
            icon: <Mail />,
            name: 'email',
            type: 'email',
            placeholder: 'Your email address',
            disabled: true 
          },
          {
            label: 'Script ID',
            icon: <Film />,
            name: 'scriptId',
            type: 'text',
            placeholder: 'Your script writer ID',
            disabled: true
          }
        ].map((field, idx) => (
          <div
            key={field.name}
            className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 transform animate-slide-up`}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center">
              <span className="mr-2 text-slate-500">{field.icon}</span>
              {field.label}
            </label>
            <input
              type={field.type}
              name={field.name}
              value={formData[field.name as keyof typeof formData]}
              placeholder={field.placeholder}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none transition-all duration-200 placeholder:text-slate-400 disabled:bg-slate-100 cursor-not-allowed"
              disabled={field.disabled}
            />
          </div>
        ))}
      </div>

      {/* Global Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default ProfileView;

'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ProfileView = ({ userProfile }: { userProfile: any }) => {

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const itemVariants = {
    hidden: { x: -15, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  };

  if (!userProfile) {
    return (
      <div className="text-center py-8">
        <span className="text-4xl">⏳</span>
        <h3 className="text-lg font-semibold mt-4">Loading Profile...</h3>
      </div>
    )
  }

  return (
    <motion.div
      className="max-w-lg mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.1 }}
    >
      {/* Profile Info Card */}
      <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
        <motion.div variants={itemVariants} className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="font-semibold text-slate-600 text-sm">Editor Name</span>
          <span className="text-slate-800 font-bold text-base">{userProfile.name || 'N/A'}</span>
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="font-semibold text-slate-600 text-sm">Email</span>
          <span className="text-slate-700 font-medium break-all text-sm">{userProfile.email || 'N/A'}</span>
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-between items-center pb-3 border-b border-slate-100">
          <span className="font-semibold text-slate-600 text-sm">Last Login</span>
          <span className="text-slate-700 font-medium text-sm">
            {userProfile.lastLoginAt ? new Date(userProfile.lastLoginAt).toLocaleString() : 'N/A'}
          </span>
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-between items-center">
          <span className="font-semibold text-slate-600 text-sm">Editor ID</span>
          <span className="text-slate-800 font-mono bg-slate-100 px-2 py-1 rounded-md text-xs font-semibold">
            EDR-{userProfile.uid ? userProfile.uid.slice(-4).padStart(4, '0').toUpperCase() : '0000'}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProfileView;

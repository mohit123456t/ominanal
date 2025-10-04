
'use client';
import React from 'react';

export const PlaceholderView = ({ title }: { title: string }) => (
  <div className="text-center text-slate-500 p-8">
    <h2 className="text-2xl font-bold">{title}</h2>
    <p>This component has not been implemented yet.</p>
  </div>
);

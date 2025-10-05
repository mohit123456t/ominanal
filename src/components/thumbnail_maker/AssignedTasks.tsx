'use client';
import React from 'react';

const AssignedTasks = ({ userProfile, onTaskClick }: { userProfile: any, onTaskClick: (task: any) => void }) => {
    // Placeholder task
    const task = { id: 'task-1', name: 'Sample Thumbnail Task' };

    return (
        <div>
            <h1 className="text-2xl font-bold">My Tasks</h1>
            <p>This is a placeholder for the Assigned Tasks view.</p>
            <button onClick={() => onTaskClick(task)} className="mt-4 p-2 bg-blue-500 text-white rounded">View Sample Task</button>
        </div>
    );
};

export default AssignedTasks;

'use client';
import React from 'react';

const TaskDetailView = ({ task, onBack, userProfile }: { task: any, onBack: () => void, userProfile: any }) => {
    return (
        <div>
            <button onClick={onBack} className="mb-4 p-2 bg-gray-200 rounded">Back</button>
            <h1 className="text-2xl font-bold">Task Details: {task?.name}</h1>
            <p>This is a placeholder for the Task Detail view.</p>
        </div>
    );
};

export default TaskDetailView;

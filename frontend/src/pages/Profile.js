import React from 'react';
import { Helmet } from 'react-helmet-async';
import { User } from 'lucide-react';

const Profile = () => {
  return (
    <>
      <Helmet>
        <title>Profile - QuizMaster Pro</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">This page will show your profile information and settings.</p>
        </div>
      </div>
    </>
  );
};

export default Profile;

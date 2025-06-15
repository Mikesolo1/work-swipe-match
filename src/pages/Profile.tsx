
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProfileSeekerForm from '@/components/profile/ProfileSeekerForm';
import ProfileEmployerForm from '@/components/profile/ProfileEmployerForm';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Профиль недоступен</h2>
          <p className="text-gray-600">Необходимо войти в систему</p>
        </div>
      </div>
    );
  }

  if (user.role === 'seeker') {
    return <ProfileSeekerForm user={user} />;
  }

  if (user.role === 'employer') {
    return <ProfileEmployerForm user={user} />;
  }

  return null;
};

export default Profile;

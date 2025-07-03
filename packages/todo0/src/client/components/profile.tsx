import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from './authState';

function Profile() {
  const { authState, onRevokeAuthFn } = useAuthState();
  const navigate = useNavigate();

  const [user, setUser] = useState<Record<string, any>>({});

  const onRevokeAuth = async () => {
    const signOut = async () => {
      if (authState.isAuthenticated) {
        onRevokeAuthFn();
      }
    };
    await signOut();
    navigate('/');
  };

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const response = await fetch('/api/users/me', {
          credentials: 'same-origin',
          mode: 'same-origin',
        });
        const res = await response.json();
        setUser(res);
      } catch (error: unknown) {
        console.error(error);
      }
    };

    if (authState.isAuthenticated) {
      getUserProfile();
    }
  }, [authState.isAuthenticated]);

  return (
    authState.isAuthenticated && (
      <div className="profile-card">
        <h1 className="profile-title">My Profile</h1>
        <div className="flex flex-col gap-4 mt-10">
          {Object.entries(user).map(([key, value], index) => (
            <div
              key={key}
              className={`flex justify-between items-center rounded-lg px-4 py-3 ${
                index % 2 === 0 ? 'bg-slate-50' : 'bg-white'
              }`}
            >
              <span className="font-semibold text-slate-700 capitalize">{key}</span>
              <span className="text-slate-600 break-all text-right">{value}</span>
            </div>
          ))}
        </div>
        <button type="button" onClick={onRevokeAuth} className="profile-logout-btn">
          Log out
        </button>
      </div>
    )
  );
}

export default Profile;

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

  const userData = Object.entries(user).map(([key, value], index) => (
    <li key={key} className={index % 2 === 0 ? 'table-row bg-slate-50' : 'table-row'}>
      <span className="pl-2 py-2 table-cell font-['Inter'] ">{key}</span>
      <span className="table-cell">{value}</span>
    </li>
  ));

  return (
    authState.isAuthenticated && (
      <div>
        <h1 className="text-left mt-24 mb-6 mx-24 w-96 text-stone-900 text-5xl font-bold font-['Inter']">
          My Profile
        </h1>
        <ul className="w-3/5 text-left mx-24 table mt-10">{userData}</ul>
        <button
          type="button"
          onClick={onRevokeAuth}
          className="mx-24 mt-10 py-2 px-20 bg-slate-400 rounded-md text-white text-center"
        >
          Log out
        </button>
      </div>
    )
  );
}

export default Profile;

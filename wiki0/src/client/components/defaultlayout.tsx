import { Sidebar } from 'flowbite-react';
import { HiHome, HiLogout, HiPlus } from 'react-icons/hi';
import { Outlet, useNavigate } from 'react-router-dom';
import wikiIcon from '../assets/wiki_signin_icon.png';
import { useAuthState } from './authState';

function DefaultLayout() {
  const { authState, onRevokeAuthFn } = useAuthState();
  const navigate = useNavigate();
  const onRevokeAuth = async () => {
    const signOut = async () => {
      if (authState.isAuthenticated) {
        onRevokeAuthFn();
      }
    };
    await signOut();
    navigate('/');
  };
  return (
    <div>
      <Sidebar className="fixed top-0 left-0 z-40 w-80 h-screen transition-transform -translate-x-full bg-white border-r border-gray-200 md:translate-x-0 dark:bg-gray-800 dark:border-gray-700">
        <Sidebar.Logo
          href="#"
          img={wikiIcon}
          imgAlt="Wiki0"
          className="font-bold text-xl text-blue-500"
        >
          Wiki0
        </Sidebar.Logo>
        <Sidebar.Items>
          <Sidebar.ItemGroup>
            <Sidebar.Item href="/" icon={HiHome}>
              Home
            </Sidebar.Item>
            <Sidebar.Item href="/pages" icon={HiPlus}>
              Pages
            </Sidebar.Item>
            <Sidebar.Item onClick={onRevokeAuth} icon={HiLogout}>
              Signout
            </Sidebar.Item>
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
      <main className="md:ml-96 h-auto pr-20">
        <Outlet />
      </main>
    </div>
  );
}

export default DefaultLayout;

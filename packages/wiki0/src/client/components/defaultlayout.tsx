import { Sidebar } from 'flowbite-react';
import { HiHome, HiLogout, HiPlus } from 'react-icons/hi';
import { Outlet, useNavigate } from 'react-router-dom';
import wikiIcon from '../assets/wiki_signin_icon.png';
import { useAuthState } from './authState';

function DefaultLayout() {
  const { authState, onRevokeAuthFn } = useAuthState();
  const navigate = useNavigate();
  const onRevokeAuth = async () => {
    if (!window.confirm('Are you sure you want to logout?')) return;
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
      <Sidebar className="fixed top-0 left-0 z-40 w-80 h-screen transition-transform -translate-x-full bg-white border-r border-gray-200 md:translate-x-0 dark:bg-gray-800 dark:border-gray-700 py-6 px-2 text-left">
        <Sidebar.Logo
          href="/"
          img={wikiIcon}
          imgAlt="Wiki0"
          className="font-bold text-2xl text-blue-600 mb-6"
        >
          Wiki0
        </Sidebar.Logo>
        <Sidebar.Items>
          <Sidebar.ItemGroup>
            <Sidebar.Item
              href="/"
              icon={HiHome}
              className={
                window.location.pathname === '/'
                  ? 'bg-blue-100 text-blue-700 font-semibold justify-start text-left'
                  : 'justify-start text-left'
              }
            >
              Home
            </Sidebar.Item>
            <Sidebar.Item
              href="/pages"
              icon={HiPlus}
              className={
                window.location.pathname.startsWith('/pages')
                  ? 'bg-blue-100 text-blue-700 font-semibold justify-start text-left'
                  : 'justify-start text-left'
              }
            >
              Pages
            </Sidebar.Item>
            <Sidebar.Item
              onClick={onRevokeAuth}
              icon={HiLogout}
              className="hover:bg-red-100 justify-start text-left"
            >
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

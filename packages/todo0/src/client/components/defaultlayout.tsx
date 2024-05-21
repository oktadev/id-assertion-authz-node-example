import { Sidebar } from 'flowbite-react';
import { IconContext } from 'react-icons';
import { HiUserCircle } from 'react-icons/hi';
import { Outlet } from 'react-router-dom';

function profileIcon() {
  return (
    <IconContext.Provider value={{ className: 'w-8 h-8', color: '#2dd4bf' }}>
      <HiUserCircle className="w-50" />
    </IconContext.Provider>
  );
}

function DefaultLayout() {
  return (
    <div>
      <Sidebar className="fixed top-0 left-0 z-40 w-60 h-screen transition-transform -translate-x-full bg-white  md:translate-x-0  ">
        <Sidebar.Logo href="/" img="/favicon.ico" imgAlt="Todo0">
          Todo0
        </Sidebar.Logo>
        <Sidebar.Items>
          <Sidebar.ItemGroup>
            <Sidebar.Item href="/profile" icon={profileIcon}>
              My profile
            </Sidebar.Item>
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
      <main className="md:ml-96 h-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default DefaultLayout;

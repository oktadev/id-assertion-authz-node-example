import { initFlowbite } from 'flowbite';
import { FC, PropsWithChildren, useEffect } from 'react';
import { HiChevronLeft } from 'react-icons/hi';

const DebugDrawer: FC<PropsWithChildren<{ id: string }>> = function ({ id, children }) {
  useEffect(() => {
    initFlowbite();
  }, []);

  return (
    <>
      <div className="fixed top-4 right-4">
        <button
          className="text-white bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-gray-600 dark:hover:bg-gray-700 focus:outline-none dark:focus:ring-gray-800"
          type="button"
          data-drawer-target={id}
          data-drawer-show={id}
          data-drawer-placement="right"
          data-drawer-backdrop="false"
          aria-controls={id}
          aria-label="Open Debug Console"
        >
          <HiChevronLeft />
        </button>
      </div>
      <div
        id={id}
        className="fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto transition-transform translate-x-full bg-white w-5/12 dark:bg-gray-800"
        tabIndex={-1}
        aria-labelledby="drawer-right-label"
      >
        <h5
          id="drawer-right-label"
          className="inline-flex items-center mb-4 text-base font-semibold text-gray-500 dark:text-gray-400"
        >
          <svg
            className="w-4 h-4 me-2.5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
          </svg>
          Debug Console
        </h5>
        <button
          type="button"
          data-drawer-hide={id}
          aria-controls={id}
          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white"
        >
          <svg
            className="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
          <span className="sr-only">Close menu</span>
        </button>
        <div className="mb-6 text-sm text-gray-500 dark:text-gray-400">{children}</div>
      </div>
    </>
  );
};

export default DebugDrawer;

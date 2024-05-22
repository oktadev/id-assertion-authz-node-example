import { Popover } from 'flowbite-react';
import { FaRegCopy } from 'react-icons/fa';
import { parseJwt } from '../utils';

type TokenViewerProps = {
  token: string | undefined | null;
  saml?: boolean;
};

const defaultProps = {
  saml: false,
};

function TokenViewer({ token, saml }: TokenViewerProps) {
  if (!token) {
    return <div className="text-gray-400">No JWT token found</div>;
  }

  const displayToken = (tokenToDisplay: string, isSaml: boolean) => {
    if (isSaml) {
      return (
        <div className="max-w-md">
          Tip: Copy and Paste into{' '}
          <a
            target="_blank"
            href="https://samltool.io"
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            rel="noreferrer"
          >
            samltool.io
          </a>
          <pre className="">{atob(token)}</pre>
        </div>
      );
    }
    try {
      return JSON.stringify(parseJwt(tokenToDisplay), null, 2);
    } catch (e) {
      return 'Error parsing token';
    }
  };

  return (
    <>
      <Popover
        aria-labelledby="default-popover"
        content={
          <div style={{ fontSize: 12 }} className="w-auto text-sm text-gray-500 dark:text-gray-400">
            <div className="border-b border-gray-200 bg-gray-100 px-3 py-2 dark:border-gray-600 dark:bg-gray-700">
              <h3 id="default-popover" className="font-semibold text-slate-800 dark:text-white">
                {saml ? 'SAML XML' : 'JWT Token Claims'}
              </h3>
            </div>
            <div className="px-3 py-2 bg-gray-100 text-slate-600" style={{ fontSize: 12 }}>
              <pre className="pt-3">{displayToken(token, saml)}</pre>
            </div>
          </div>
        }
      >
        <button
          type="button"
          style={{ cursor: 'pointer' }}
          className="inline-block border-0 hover:text-black focus:outline-none bg-transparent pl-0  hover:underline inline-block"
        >
          {`${token.slice(0, 15)}...`}{' '}
        </button>
      </Popover>

      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(token.toString());
        }}
        className="inline-block focus:outline-nonetext-center hover:text-black inline-flex items-center me-2"
      >
        <FaRegCopy /> Copy
      </button>
      {saml && (
        <div className="font-semibold text-slate-600 dark:text-white">
          Tip: Copy and Paste into{' '}
          <a
            target="_blank"
            href="https://samltool.io"
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
            rel="noreferrer"
          >
            samltool.io
          </a>
        </div>
      )}
    </>
  );
}
TokenViewer.defaultProps = defaultProps;
export default TokenViewer;

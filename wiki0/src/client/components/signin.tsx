import { TextInput } from 'flowbite-react';
import { useState } from 'react';
import { useAuthState } from './authState';

import signinLogo from '../assets/signin.svg';
import wikiIcon from '../assets/wiki_signin_icon.png';

export default function Signin() {
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | undefined>(undefined);

  const { onUsernameEnteredFn } = useAuthState();

  const onAuthenticate = async () => {
    if (username) {
      const orgId = await onUsernameEnteredFn(username);

      if (orgId) {
        window.location.assign(`/api/openid/start/${username}`);
        return;
      }
    }
    setUsernameError('Domain not registered. Try using bob@tables.fake.');
  };

  return (
    <div className="py-16">
      <main className="flex bg-white rounded-lg shadow-lg overflow-hidden mx-auto max-w-sm lg:max-w-4xl">
        <div className="w-full p-8 lg:w-1/2">
          <div className="text-2xl font-semibold text-gray-700 text-center">
            <img src={wikiIcon} className="inline" alt="Logo" />
            <span className="text-xl text-blue-500 text-center ml-2">Wiki0</span>
          </div>

          <h1 className="text-center mt-6 mb-4">Welcome to your Wiki App</h1>
          <h3 className="text-center mb-6">Sign in with your work email address</h3>

          <form className="m-6">
            <div className="mb-6 mt-4">
              <label>
                <span className="block text-gray-700 text-sm font-bold mb-2">Work Email</span>
                <TextInput
                  id="email"
                  placeholder="Work email address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  color={usernameError && 'failure'}
                  helperText={usernameError}
                  theme={{
                    field: {
                      input: {
                        colors: {
                          gray: 'bg-white text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-3 px-4 block w-full appearance-nonew-full text-slate-900 placeholder-slate-400 rounded-md py-2 pl-2 ring-1 ring-slate-200',
                        },
                      },
                    },
                  }}
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </label>
            </div>

            <button
              type="submit"
              className="bg-blue-500 text-white font-bold py-2.5 px-4 w-full rounded-lg hover:bg-gray-600"
              onClick={(e) => {
                e.preventDefault();
                onAuthenticate();
              }}
              disabled={!username}
            >
              Continue
            </button>
          </form>
        </div>
        <div className="hidden lg:block lg:w-1/2 bg-cover">
          <img src={signinLogo} alt="Logo" />
        </div>
      </main>
    </div>
  );
}

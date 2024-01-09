import { useEffect, useState } from 'react';
import homeLogo from '../assets/home_logo.png';
import DebugDrawer from './DebugDrawer';

type AuthTokenType = {
  id: number;
  userId: number;
  resource: string;
  accessToken: string;
  refreshToken: string | null;
  jagToken: string | null;
};

const API_BASE_URL = '/api/tokens';

function parseJwt(token: string) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  );

  return JSON.parse(jsonPayload);
}

function Home() {
  const [tokens, setTokens] = useState<AuthTokenType[]>([]);
  useEffect(() => {
    const getTokens = async () => {
      try {
        const response = await fetch(API_BASE_URL, {
          credentials: 'same-origin',
          mode: 'same-origin',
        });
        const res = await response.json();
        setTokens(res.tokens);
      } catch (error: unknown) {
        console.error(error);
      }
    };
    getTokens();
  }, []);

  return (
    <>
      <DebugDrawer id="debug-drawer">
        <div>
          The following occurs after the IDP (i.e. Okta) redirects back to the Wiki0 auth server:
        </div>
        <ul className="list-disc pt-4 pl-4 pb-4">
          <li>For each resource app (e.g. Todo0) the auth server will:</li>
          <ul className="list-decimal pt-4 pl-4 pb-4">
            <li>Ask the IDP to exchange the ID token for a JWT Authorization Grant (JAG)</li>
            <li>
              Issue a request to the resource app&#39;s authorization server to exchange the JAG for
              an access/refresh token pair
            </li>
          </ul>
        </ul>
        <div className="space-y-4">
          <div>The following are the claims from the actual granted JAG and access tokens:</div>
          {tokens.length > 0 && (
            <>
              <div className="font-bold">JAG Token (Wiki0 -&gt; Okta):</div>
              <pre>
                {tokens[0].jagToken ? JSON.stringify(parseJwt(tokens[0].jagToken), null, 2) : ''}
              </pre>
              <div className="font-bold">Access Token (Wiki0 -&gt; Todo0):</div>
              <pre>{JSON.stringify(parseJwt(tokens[0].accessToken), null, 2)}</pre>
            </>
          )}
        </div>
      </DebugDrawer>

      <div className="p-8">
        <h1 className="mb-4">What is Wiki0?</h1>
        <div>
          Lorem ipsum dolor sit amet consectetur. Dictum lobortis auctor gravida sagittis sem vitae
          integer. Arcu sed quam sit faucibus vitae fringilla faucibus. Diam non faucibus
          pellentesque viverra eget eget amet. Sem duis viverra sodales tempor cras cras quis.
          Mollis nisl enim bibendum lectus bibendum arcu. Adipiscing ridiculus pulvinar est nisi
          risus aliquet.
        </div>
        <ul className="list-disc pt-4 pl-4 pb-4">
          <li>Proin facilisi enim et egestas quis tortor.</li>
          <li>Quisque euismod elementum suscipit amet et arcu mattis.</li>
          <li>Tristique leo aliquet diam sit elit leo pulvinar metus ultricies.</li>
        </ul>
        <div>
          Magna malesuada quis imperdiet leo eget netus posuere.Ac commodo ut a id.Sed egestas eget
          urna cursus tincidunt fermentum quis.Pellentesque aliquet pharetra a pellentesque lectus
          nulla ullamcorper nunc.Neque blandit porta amet enim eget arcu Connected Apps
        </div>
        <div className="flex justify-center align-center items-center mt-16">
          <img src={homeLogo} alt="" />
        </div>
      </div>
    </>
  );
}

export default Home;

import React, { useEffect, useMemo, useState } from 'react';
import homeLogo from '../assets/home_logo.png';
import { parseJwt, prefixLine } from '../utils';
import DebugDrawer from './DebugDrawer';
import TokenViewer from './tokenViewer';

type AuthTokenType = {
  idToken: string;
  id: number;
  userId: number;
  resource: string;
  accessToken: string;
  refreshToken: string | null;
  jagToken: string | null;
};

const API_BASE_URL = '/api/tokens';

const getIdpTokenUrlForDebug = (tokens: Record<string, any>[]) => {
  const defaultUrl = 'IDP Token Endpoint';
  if (!tokens.length || !tokens[0].jagToken) {
    return defaultUrl;
  }

  const { iss } = parseJwt(tokens[0].jagToken);
  if (!iss) {
    return defaultUrl;
  }
  return `${iss}/v1/token`;
};

const formatExchangeRequest = (tokens: Record<string, any>[]) => {
  const defaultUrl = 'IDP Token Endpoint';
  if (!tokens.length || !tokens[0].jagToken) {
    return defaultUrl;
  }

  return decodeURIComponent(
    new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      scope: 'read write',
      client_id: '<CLIENT_ID>', // Hardcoded fake assetion data
      client_secret: '<CLIENT_SECRET>',
      assertion: `${tokens[0].jagToken?.slice(0, 15)}...`,
    }).toString()
  )
    .toString()
    .replaceAll('&', '\n&');
};

function DebugCard({ children }: React.PropsWithChildren) {
  return (
    <div className="space-y-4 p-2 border-2 rounded border-dotted" style={{ fontSize: 12 }}>
      <div className="pt-2 pl-3">{children}</div>
    </div>
  );
}

function Home() {
  const [tokens, setTokens] = useState<AuthTokenType[]>([]);
  const [requestInfo, setRequestInfo] = useState<Record<string, any>>({});
  const idpTokenUrl = useMemo(() => getIdpTokenUrlForDebug(tokens), [tokens]);
  const exchangeRequest = useMemo(() => formatExchangeRequest(tokens), [tokens]);
  useEffect(() => {
    const getTokens = async () => {
      try {
        const response = await fetch(API_BASE_URL, {
          credentials: 'same-origin',
          mode: 'same-origin',
        });
        const res = await response.json();
        setTokens(res.tokens);
        setRequestInfo({
          request: {
            ...res.requestBody,
            // Add the real id token to the requst for the debug console
            subject_token: res.tokens ? `${res.tokens[0].idToken?.slice(0, 15)}...` : '',
          },
          response: {
            ...res.responseBody,
            // Add the real jag token to the requst for the debug console
            access_token: res.tokens ? `${res.tokens[0].jagToken?.slice(0, 15)}...` : '',
          },
          url: res.url,
        });
      } catch (error: unknown) {
        console.error(error);
      }
    };

    getTokens();
  }, []);

  return (
    <div className="p-2">
      <DebugDrawer id="debug-drawer">
        <div className="p-2 pb-4">
          The IDP (i.e. Okta) redirects back to the Wiki0 auth server, providing an ID Token. Then,
          for each resource app (e.g. Todo0) the auth server will:
          <ul className="list-decimal pt-4 pl-4 pb-4">
            <li>Ask the IDP to exchange the ID token for a JWT Authorization Grant (JAG)</li>
            <li>
              Issue a request to the resource app&#39;s authorization server to exchange the JAG for
              an access/refresh token pair
            </li>
          </ul>
          The following are the claims from the actual granted ID, JAG and access tokens:
        </div>

        <div className="space-y-4 ">
          <DebugCard>
            <strong>ID Token </strong>
            {tokens.length > 0 && (
              <pre>
                <TokenViewer token={tokens[0].idToken} />
              </pre>
            )}
          </DebugCard>
          <DebugCard>
            <strong>JAG Token </strong> (Wiki0 -&gt; Okta)
            {tokens.length > 0 && (
              <pre>
                <TokenViewer token={tokens[0].jagToken} />
              </pre>
            )}
          </DebugCard>
          <DebugCard>
            <strong>Access Token </strong> (Wiki0 -&gt; Todo0)
            {tokens.length > 0 && (
              <pre>
                <TokenViewer token={tokens[0].accessToken} />
              </pre>
            )}
          </DebugCard>
          <div className="p-2">
            The following is the request that Wiki0 made to the IDP to request a JAG token. The
            value of the &quot;subject_token&quot; field is the ID Token.
          </div>
          <DebugCard>
            <pre>
              <strong>POST {idpTokenUrl}</strong>
            </pre>

            <pre className="pt-2">
              {requestInfo.request && prefixLine('>', JSON.stringify(requestInfo.request, null, 2))}
            </pre>

            <pre className="pt-2">
              {requestInfo.response &&
                prefixLine('<', JSON.stringify(requestInfo.response, null, 2))}
            </pre>
          </DebugCard>
          <div className="p-2">
            <p>
              Finally, the JAG token is exchanged with Todo0 for an access token. The value of the
              &quot;assertion&quot; parameter is the JAG token from above.
            </p>
            <p>
              (Checkout this console on a Wiki0 page to see the access token exchanged for protected
              resources.)
            </p>
          </div>
          <DebugCard>
            <pre>
              <strong>POST {requestInfo?.request?.resource} </strong>
            </pre>

            <pre>{tokens.length && tokens[0].jagToken && prefixLine('>', exchangeRequest)}</pre>
          </DebugCard>
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
    </div>
  );
}

export default Home;

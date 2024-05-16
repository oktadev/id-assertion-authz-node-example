import React, { useEffect, useMemo, useState } from 'react';
import homeLogo from '../assets/home_logo.png';
import { parseJwt } from '../utils';
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

const debugIDPEndpoint = (tokens: Record<string, any>[]) => {
  const defaultUrl = 'IDP Token Endpoint';
  if (!tokens[0]?.jagToken) {
    return defaultUrl;
  }

  const { iss } = parseJwt(tokens[0].jagToken);
  if (!iss) {
    return defaultUrl;
  }
  return `${iss}/oauth/v1/token`;
};

const debugExchangeRequest = (tokens: Record<string, any>[]) => {
  if (!tokens.length || !tokens[0].jagToken) {
    return '';
  }

  const searchParamsString = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    scope: 'read write',
    client_id: '<CLIENT_ID>',
    client_secret: '<CLIENT_SECRET>',
    assertion: `${tokens[0].jagToken?.slice(0, 15)}...`,
  }).toString();

  return decodeURIComponent(searchParamsString).toString().replaceAll('&', '\n&');
};

function DebugCard({ children }: React.PropsWithChildren) {
  return (
    <div className="space-y-4 p-3 border-2 rounded border-dotted" style={{ fontSize: 12 }}>
      <div>{children}</div>
    </div>
  );
}

function Home() {
  const [tokens, setTokens] = useState<AuthTokenType[]>([]);
  const [requestInfo, setRequestInfo] = useState<Record<string, any>>({});
  const idpTokenUrl = useMemo(() => debugIDPEndpoint(tokens), [tokens]);
  const exchangeRequest = useMemo(() => debugExchangeRequest(tokens), [tokens]);
  useEffect(() => {
    const getTokens = async () => {
      try {
        const apiResponse = await fetch(API_BASE_URL, {
          credentials: 'same-origin',
          mode: 'same-origin',
        });

        const res = await apiResponse.json();
        setTokens(res.tokens);

        // Debug console data
        let assertion = '';
        // Add the real id and jag tokens to the requst for the debug console
        const request = { ...res.requestBody };
        const response = { ...res.responseBody };

        // Add the real id and jag tokens to the request for the debug console
        if (res.tokens?.length) {
          assertion = request?.subject_token;
          request.subject_token = `${request?.subject_token?.slice(0, 15)}...`;
          response.access_token = `${res.tokens[0].jagToken?.slice(0, 15)}...`;
        }

        setRequestInfo({
          request,
          response,
          isSaml: request?.subject_token_type?.includes('saml'),
          assertion,
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
          The IDP (i.e. Okta) redirects back to the Wiki0 auth server, providing an ID Assertion
          (SAML Assertion or OIDC ID Token). Then, for each resource app (e.g. Todo0) the auth
          server will:
          <ul className="list-decimal pt-4 pl-4 pb-4">
            <li>Ask the IDP to exchange the ID Assertion for a JWT Authorization Grant (JAG)</li>
            <li>
              Issue a request to the resource app&#39;s authorization server to exchange the JAG for
              an access/refresh token pair
            </li>
          </ul>
          The following are the claims from the actual granted ID, JAG and access tokens:
        </div>

        <div className="space-y-4 ">
          {/* <DebugCard>
            <strong>ID Assertion </strong>
            {tokens.length > 0 && (
              <pre>
                <TokenViewer token={tokens[0].idToken} />
              </pre>
            )}
          </DebugCard> */}
          <DebugCard>
            <strong>{requestInfo.isSaml ? 'SAML Assertion' : 'ID Token'}</strong>
            {tokens.length > 0 && (
              <pre>
                <TokenViewer token={requestInfo.assertion} saml={requestInfo.isSaml} />
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
            value of the &quot;subject_token&quot; field is the ID Assertion.
          </div>
          <DebugCard>
            <pre>
              <strong>POST {idpTokenUrl}</strong>
            </pre>
            <pre className="pt-2">
              <strong>Request</strong>
            </pre>
            <pre>
              {requestInfo.request &&
                decodeURIComponent(new URLSearchParams(requestInfo.request).toString())
                  .toString()
                  .replaceAll('&', '\n&')}
            </pre>
            <pre className="pt-2">
              <strong>Response</strong>
            </pre>
            <pre>{requestInfo.response && JSON.stringify(requestInfo.response, null, 2)}</pre>
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
            <pre className="pt-2">
              <strong>Request</strong>
            </pre>
            <pre>{tokens.length > 0 && tokens[0].jagToken && exchangeRequest}</pre>
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

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DebugDrawer from './DebugDrawer';
import TipTapEditor, { UnfurlLinkStorage } from './tiptapeditor';
import TokenViewer from './tokenViewer';
import { IPage } from './types';

type RequestLogItem = {
  id: number;
  url: string;
  requestHeaders: string;
  responseBody: string;
  requestedAt: string;
};

const API_BASE_URL = '/api/articles';

function Editor({
  page,
  savePage,
  links,
  requests,
}: {
  page: IPage;
  savePage: (id: number, html: string, links: Partial<Record<string, UnfurlLinkStorage>>) => void;
  links: Partial<Record<string, UnfurlLinkStorage>>;
  requests: RequestLogItem[];
}) {
  const requestElements = requests.map((r) => (
    <div style={{ fontSize: 12 }} key={r.id}>
      <pre>
        <strong>GET {r.url} </strong>
      </pre>

      <pre>{r.requestedAt && new Date(r.requestedAt).toUTCString()}</pre>
      <pre className="pt-2">
        <strong>Request Headers</strong>
      </pre>
      <pre>
        {r.requestHeaders?.split('Bearer ')?.length === 2 ? (
          <>
            {'{ \n   '}
            &quot;Authorization&quot;: &quot;Bearer{' '}
            <TokenViewer
              token={r.requestHeaders.split('Bearer ')[1].replaceAll('"', '').replaceAll('}', '')}
            />
            {'\n}'}
          </>
        ) : (
          ''
        )}
      </pre>
      <pre className="pt-2">
        <strong>Response</strong>
      </pre>
      <pre>{r.responseBody && JSON.stringify(JSON.parse(r.responseBody), null, 2)}</pre>
      <hr className="h-px my-4 bg-gray-200 border-0 dark:bg-gray-700" />
    </div>
  ));

  return (
    <div className="space-y-4 p-6">
      <h1>{page.title}</h1>
      <div>
        <DebugDrawer id="debug-drawer">
          {requestElements.length > 0 && (
            <div>
              <ul className="list-disc pl-4">{requestElements}</ul>
            </div>
          )}
        </DebugDrawer>
        <TipTapEditor
          content={page.content}
          onUpdate={(html, updatedLinks) => savePage(page.id, html, updatedLinks)}
          links={links}
        />
      </div>
    </div>
  );
}

function EditPage() {
  const { id } = useParams();
  const [page, setPage] = useState<IPage | null>(null);
  const [links, setLinks] = useState<Record<string, UnfurlLinkStorage>>({});
  const [requests, setRequests] = useState<RequestLogItem[]>([]);
  const unfurlLinks = async (urls: string[]) => {
    try {
      const response = await fetch(`${API_BASE_URL}/unfurl`, {
        credentials: 'same-origin',
        mode: 'same-origin',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls,
        }),
      });
      const res = (await response.json()) as {
        links: Record<string, UnfurlLinkStorage>;
        requests: RequestLogItem[];
      };
      setLinks({
        ...links,
        ...res.links,
      });
      setRequests(res.requests);
    } catch (error: unknown) {
      console.error(error);
    }
  };

  const savePage = async (
    idToSave: number,
    html: string,
    linksToUnfurl: Partial<Record<string, UnfurlLinkStorage>>
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${idToSave}`, {
        credentials: 'same-origin',
        mode: 'same-origin',
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...page,
          content: html,
        }),
      });
      const res = await response.json();
      setPage(res);

      const urlsToUnfurl = Object.keys(linksToUnfurl).filter((url) => {
        const unfurl = linksToUnfurl[url];
        return unfurl?.status === 'initiate';
      });

      if (urlsToUnfurl.length > 0) {
        unfurlLinks(urlsToUnfurl);
      }
    } catch (error: unknown) {
      console.error(error);
    }
  };

  useEffect(() => {
    const getPage = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
          credentials: 'same-origin',
          mode: 'same-origin',
        });
        const res = await response.json();
        setPage(res);
      } catch (error: unknown) {
        console.error(error);
      }
    };
    getPage();
  }, [id]);

  return (
    <div>
      {page && <Editor page={page} savePage={savePage} links={links} requests={requests} />}
    </div>
  );
}

export default EditPage;

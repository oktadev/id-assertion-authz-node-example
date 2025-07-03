import { Button, Card } from 'flowbite-react';
import { FC, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IPage } from './types';

const API_BASE_URL = '/api/articles';

const formatContentForPreview = (contentString: string): string => {
  try {
    const MAX_CHARS: number = 120;
    const regexp: RegExp = /(?!><)>(.*?)</g;
    const res = [...contentString.matchAll(regexp)]?.map((el) => el[1]);
    const result: string = [...res]?.join(' ')?.slice(0, MAX_CHARS + 1);

    return result.length > MAX_CHARS ? `${result}...` : result;
  } catch {
    return '';
  }
};

type SinglePageProps = {
  page: IPage;
  onDeletePage: (page: IPage) => void;
};

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const SinglePage: FC<SinglePageProps> = function ({ page, onDeletePage }: SinglePageProps) {
  const contentPreview = useMemo(() => formatContentForPreview(page.content), [page.content]);
  // Try to use updatedAt, fallback to createdAt, fallback to nothing
  const lastUpdated = (page as any).updatedAt || (page as any).createdAt || '';

  return (
    <Card
      href={`/pages/${page.id}/edit`}
      className="transition-transform duration-200 hover:scale-[1.025] hover:shadow-xl border border-gray-200 rounded-xl bg-white/90 p-6 min-h-[220px] flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-2">
        <h5 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white line-clamp-2">
          {page.title}
        </h5>
        <button
          type="button"
          aria-label="Delete Page"
          className="rounded-full p-2 hover:bg-red-100 transition-colors"
          onClick={(event) => {
            event.preventDefault();
            onDeletePage(page);
          }}
        >
          <svg
            className="h-6 fill-red-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 96 960 960"
          >
            <path d="M261 936q-24.75 0-42.375-17.625T201 876V306h-41v-60h188v-30h264v30h188v60h-41v570q0 24-18 42t-42 18H261Zm438-630H261v570h438V306ZM367 790h60V391h-60v399Zm166 0h60V391h-60v399ZM261 306v570-570Z" />
          </svg>
        </button>
      </div>
      <div className="flex gap-2 items-center mb-2">
        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center border border-gray-200">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10 10a4 4 0 100-8 4 4 0 000 8zm0 2c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z" />
          </svg>
        </div>
        <span className="text-gray-700 text-xs">
          Created by <span className="font-semibold">{page.user.name}</span>
        </span>
      </div>
      <p className="min-h-16 text-sm text-gray-700 line-clamp-3 mb-2">{contentPreview}</p>
      <div className="flex justify-between items-center mt-auto pt-2">
        <span className="text-xs text-gray-400">
          {'\n'}
          Last updated: {lastUpdated ? formatDate(lastUpdated) : 'N/A'}
        </span>
        <span className="text-xs text-gray-400 italic">ID: {page.id}</span>
      </div>
    </Card>
  );
};

function PageList() {
  const [pageList, setPageList] = useState<IPage[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getPages = async () => {
      try {
        const response = await fetch(API_BASE_URL, {
          credentials: 'same-origin',
          mode: 'same-origin',
        });
        const res = await response.json();
        setPageList(res.articles);
      } catch (error: unknown) {
        console.error(error);
      }
    };
    getPages();
  }, []);

  const onDeletePage = async (page: IPage) => {
    const url = `${API_BASE_URL}/${page.id}`;

    const apiCall = async () => {
      try {
        await fetch(url, {
          method: 'DELETE',
          credentials: 'same-origin',
          mode: 'same-origin',
        });
        setPageList(pageList.filter((p) => p.id !== page.id));
      } catch (error: unknown) {
        console.error(error);
      }
    };

    apiCall();
  };

  async function createDemoPage() {
    const response = await fetch(`${API_BASE_URL}/demo`, {
      credentials: 'same-origin',
      mode: 'same-origin',
      method: 'POST',
    });
    const res = await response.json();

    navigate(`/pages/${res.id}/edit`);
  }

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Pages</h1>
        <Button
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow focus:ring-2 focus:ring-blue-300 focus:outline-none"
          onClick={() => createDemoPage()}
        >
          + Create Page
        </Button>
      </div>
      {pageList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-white/80 rounded-2xl shadow-inner border border-dashed border-gray-200">
          <svg
            className="w-16 h-16 mb-4 text-blue-200"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-lg text-gray-500 font-medium">
            No pages yet. Click{' '}
            <span className="text-blue-600 font-semibold">&quot;Create Page&quot;</span> to get
            started!
            {'\n'}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pageList.map((p) => (
            <SinglePage key={p.id} page={p} onDeletePage={onDeletePage} />
          ))}
        </div>
      )}
    </div>
  );
}

export default PageList;

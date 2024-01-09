import { Avatar, Button, Card } from 'flowbite-react';
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

const SinglePage: FC<SinglePageProps> = function ({ page, onDeletePage }: SinglePageProps) {
  const contentPreview = useMemo(() => formatContentForPreview(page.content), [page.content]);

  return (
    <Card href={`/pages/${page.id}/edit`}>
      <div className="flex justify-between">
        <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          {page.title}
        </h5>
        <button
          type="button"
          aria-label="Delete Page"
          className="rounded-full p-2 hover:bg-gray-300"
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
      <div className="flex gap-2 justify-start">
        <Avatar rounded className="" size="sm" />
        <p className="pt-2 text-gray-800 text-sm">Created by {page.user.name}</p>
      </div>
      <p className="min-h-20 text-sm font-normal text-gray-700">{contentPreview}</p>
      <p className="font-normal text-gray-700 text-sm dark:text-gray-300">Some sub title here</p>
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
      <div className="gap-4 mb-6 grid grid-cols-2 justify-between">
        <div className="flex-start">
          <h1>Pages</h1>
        </div>
        <div className="justify-self-end">
          <Button
            size="xl"
            // className="flex-initial"
            onClick={() => {
              createDemoPage();
            }}
          >
            Create
          </Button>
        </div>
      </div>

      <div className="gap-8 mb-4 grid grid-cols-2 justify-between">
        {pageList.map((p) => (
          <div key={p.id} className="flex-1">
            <SinglePage page={p} onDeletePage={onDeletePage} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default PageList;

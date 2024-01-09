import { useEffect, useState } from 'react';
import { HiHashtag } from 'react-icons/hi';
import { useAuthState } from './authState';

interface ITodo {
  id: number;
  task: string;
  completed: boolean;
}

function Todos() {
  const [todoList, setTodoList] = useState<ITodo[]>([]);
  const [newTask, setNewTask] = useState<string>('');
  const { authState } = useAuthState();

  const API_BASE_URL = '/api/todos';

  const onNewTask = () => {
    const apiCall = async () => {
      try {
        const res = await fetch(API_BASE_URL, {
          method: 'POST',
          credentials: 'same-origin',
          mode: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ task: newTask }),
        });

        const todo = await res.json();
        setTodoList([todo, ...todoList]);
        setNewTask('');
      } catch (error: unknown) {
        console.error(error);
      }
    };
    apiCall();
  };

  const onChangeTaskStatus = (todo: ITodo) => {
    const { completed } = todo;
    const url = `${API_BASE_URL}/${todo.id}`;
    const apiCall = async () => {
      try {
        const res = await fetch(url, {
          method: 'PUT',
          credentials: 'same-origin',
          mode: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...todo, completed: !completed }),
        });
        const updatedTodo = await res.json();
        if (!completed) {
          setTodoList([...todoList.filter((t) => t.id !== todo.id), updatedTodo]);
        } else {
          setTodoList([updatedTodo, ...todoList.filter((t) => t.id !== todo.id)]);
        }
      } catch (error: unknown) {
        console.error(error);
      }
    };

    apiCall();
  };

  const onDeleteTask = (todo: ITodo) => {
    const url = `${API_BASE_URL}/${todo.id}`;

    const apiCall = async () => {
      try {
        await fetch(url, {
          method: 'DELETE',
          credentials: 'same-origin',
          mode: 'same-origin',
        });
        setTodoList(todoList.filter((t) => t.id !== todo.id));
      } catch (error: unknown) {
        console.error(error);
      }
    };

    apiCall();
  };

  const todoItems = todoList.map((todo) => (
    <li key={todo.id} className="p-3 flex justify-between items-center">
      <div className="flex items-center">
        <input
          type="checkbox"
          id={`check-${todo.id}`}
          className="rounded-full mr-4 w-6 h-6"
          checked={todo.completed}
          onChange={() => onChangeTaskStatus(todo)}
        />
        <label>
          <a className="hover:text-blue-700" href={`/todos/${todo.id}`}>
            {todo.task}
          </a>
        </label>
      </div>
      <div className="flex items-center">
        <button
          type="button"
          aria-label="Copy Link"
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.href}todos/${todo.id}`);
          }}
        >
          <HiHashtag />
        </button>
        <button
          type="button"
          aria-label="Delete Todo"
          className="rounded-full p-2 hover:bg-gray-100"
          onClick={() => onDeleteTask(todo)}
        >
          <svg
            className="h-7 fill-red-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 96 960 960"
          >
            <path d="M261 936q-24.75 0-42.375-17.625T201 876V306h-41v-60h188v-30h264v30h188v60h-41v570q0 24-18 42t-42 18H261Zm438-630H261v570h438V306ZM367 790h60V391h-60v399Zm166 0h60V391h-60v399ZM261 306v570-570Z" />
          </svg>
        </button>
      </div>
    </li>
  ));

  useEffect(() => {
    const getTodos = async () => {
      try {
        const response = await fetch(API_BASE_URL, {
          credentials: 'same-origin',
          mode: 'same-origin',
        });
        const res = await response.json();
        setTodoList(res.todos);
      } catch (error: unknown) {
        console.error(error);
      }
    };

    if (authState.isAuthenticated) {
      getTodos();
    }
  }, [authState.isAuthenticated]);

  return (
    <div>
      {authState.isAuthenticated && (
        <>
          <h1 className="text-left mt-24 mb-6 mx-24 w-96 text-stone-900 text-5xl font-bold font-['Inter']">
            Today
          </h1>
          <div className="w-3/5 text-left mx-24  border border-slate-200 rounded-xl">
            <div className="max-w px-8 py-6 flex justify-between gap-6">
              <input
                className="w-5/6 text-m text-slate-900 placeholder-slate-400 rounded-md py-2 pl-2 ring-1 border-none bg-gray-50 ring-slate-200"
                type="text"
                placeholder="Your task here"
                value={newTask}
                onChange={(event) => setNewTask(event.target.value)}
              />
              <button
                type="button"
                className="w-2/6 py-3 bg-teal-500 rounded-md text-white"
                onClick={onNewTask}
                disabled={!newTask}
              >
                Add task
              </button>
            </div>
            {todoList.length > 0 && (
              <div className="bg-slate-50 px-4 py-3 mb-2">
                <ul className="max-w">{todoItems}</ul>
              </div>
            )}
          </div>
          {todoList.length === 0 && (
            <p className="w-3/5 mx-24 py-6 text-center text-zinc-800 text-base font-semibold font-['Inter']">
              Plan your day: What stuff do you need to get done? Add a task to get started!
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default Todos;

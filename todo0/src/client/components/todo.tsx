import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE_URL = '/api/todos';

async function loadTodo(id?: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      credentials: 'same-origin',
      mode: 'same-origin',
    });
    const res = await response.json();
    return res.task;
  } catch (error: unknown) {
    console.error(error);
    return null;
  }
}

function Todo() {
  const { id } = useParams<{ id: string }>();
  const [task, setTask] = useState('');

  useEffect(() => {
    if (id) {
      loadTodo(id).then((loadedTask) => setTask(loadedTask));
    }
  }, [id]);

  return (
    <ul className="w-4/5">
      <li className="p-3 flex justify-between">
        <div className="flex">
          <h1>Todo: {task}</h1>
        </div>
      </li>
    </ul>
  );
}

export default Todo;

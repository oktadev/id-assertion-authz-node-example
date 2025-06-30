import { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import { useAuthState } from './components/authState';
import DefaultLayout from './components/defaultlayout';
import Profile from './components/profile';
import Signin from './components/signin';
import Todo from './components/todo';
import Todos from './components/todolist';

function App() {
  const { userIsAuthenticatedFn, authState } = useAuthState();
  const navigate = useNavigate();

  useEffect(() => {
    userIsAuthenticatedFn();
  }, [userIsAuthenticatedFn]);

  useEffect(() => {
    if (authState.isAuthenticated === false) {
      navigate('/signin');
    }
  }, [authState.isAuthenticated, navigate]);

  return (
    <div className="app-main-bg">
      <main>
        <Routes>
          <Route path="/signin" element={<Signin />} />
          <Route element={<DefaultLayout />}>
            <Route path="/" element={<Todos />} />
            <Route path="/todos/:id" element={<Todo />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;

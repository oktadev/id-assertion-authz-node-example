import { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import { useAuthState } from './components/authState';
import DefaultLayout from './components/defaultlayout';
import EditPage from './components/editpage';
import Home from './components/home';
import PageList from './components/pagelist';
import Signin from './components/signin';

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
  }, [authState.isAuthenticated]);

  return (
    <div>
      <main>
        <Routes>
          <Route path="/signin" element={<Signin />} />
          <Route element={<DefaultLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/pages" element={<PageList />} />
            <Route path="/pages/:id/edit" element={<EditPage />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;

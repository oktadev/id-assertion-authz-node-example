import { Link } from 'react-router-dom';
import { useAuthState } from './authState';

function Home() {
  const { authState } = useAuthState();

  return (
    <div className="">
      <h1 className="text-5xl text-center my-6">Ready to take on the day?</h1>
      <p className="text-center py-8">
        You won&apos;t miss a task with this fantastic Todo app - sign in and get tasking!
      </p>
      {authState.isAuthenticated && (
        <p className="text-center">
          <Link to="/todo" className="underline">
            Where&apos;s my todos?
          </Link>
        </p>
      )}
    </div>
  );
}

export default Home;

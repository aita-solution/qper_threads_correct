import type { NextPage } from 'next';
import Qper from '../src/Qper';

const Home: NextPage = () => {
  return (
    <main className="min-h-screen">
      <Qper />
    </main>
  );
};

export default Home;
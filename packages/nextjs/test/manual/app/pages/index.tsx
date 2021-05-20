import Link from 'next/link';

import Layout from '../components/Layout';

const IndexPage = (): JSX.Element => (
  <Layout title="Home | Next.js + TypeScript Example">
    <h1>Hello Next.js 👋</h1>
    <p>
      <Link href="/about">
        <a>About</a>
      </Link>
    </p>
    <button
      type="button"
      onClick={() => {
        throw new Error('Sentry Frontend Error');
      }}
    >
      Throw Error
    </button>
  </Layout>
);

export default IndexPage;

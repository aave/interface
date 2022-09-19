import type { NextPageContext } from 'next';
import Error from 'next/error';

type ErrorPageProps = {
  statusCode: number;
};

function ErrorPage({ statusCode }: ErrorPageProps) {
  return <Error statusCode={statusCode} />;
}

ErrorPage.getInitialProps = (ctx: NextPageContext) => {
  const { res, err } = ctx;
  // Inspect the status code and show the given template based off of it
  // Default to 404 page
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;

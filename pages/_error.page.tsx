import type { NextPageContext } from 'next';
import Error from 'next/error';

type ErrorPageProps = {
  statusCode: number;
};

function ErrorPage({ statusCode }: ErrorPageProps) {
  // return (
  //   <p>
  //     {statusCode ? `An error ${statusCode} occurred on server` : 'An error occurred on client'}
  //   </p>
  // );
  return <Error statusCode={statusCode} />;
}

ErrorPage.getInitialProps = (ctx: NextPageContext) => {
  const { res, err } = ctx;
  // Generalized, defaults to 404
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;

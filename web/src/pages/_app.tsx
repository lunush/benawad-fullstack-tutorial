import { ChakraProvider } from "@chakra-ui/react";
import { cacheExchange, Cache, QueryInput } from "@urql/exchange-graphcache";
import {
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
} from "src/generated/graphql";
import { createClient, dedupExchange, fetchExchange, Provider } from "urql";
import Navbar from "../components/Navbar";

import theme from "../theme";

function betterUpdateQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  return cache.updateQuery(qi, (data) => fn(result, data as any) as any);
}

const MyApp = ({ Component, pageProps }: any) => {
  const client = createClient({
    url: "http://localhost:4000/graphql",
    fetchOptions: {
      credentials: "include",
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        updates: {
          Mutation: {
            logout: (_result, _, cache) => {
              betterUpdateQuery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                () => ({ me: null })
              );
            },
            login: (_result, _, cache) => {
              betterUpdateQuery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.login.errors) return query;
                  else return { me: result.login.user };
                }
              );
            },
            register: (_result, _, cache) => {
              betterUpdateQuery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                _result,
                (result, query) => {
                  if (result.register.errors) return query;
                  else return { me: result.register.user };
                }
              );
            },
          },
        },
      }),
      fetchExchange,
    ],
  });

  return (
    <ChakraProvider resetCSS theme={theme}>
      <Provider value={client}>
        <Navbar />
        <Component {...pageProps} />
      </Provider>
    </ChakraProvider>
  );
};

export default MyApp;

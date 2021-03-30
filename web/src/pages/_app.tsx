import { ChakraProvider } from "@chakra-ui/react";
import { createClient, Provider } from "urql";

import theme from "../theme";

const MyApp = ({ Component, pageProps }: any) => {
  const client = createClient({
    url: "http://localhost:4000/graphql",
    fetchOptions: {
      credentials: "include",
    },
  });

  return (
    <ChakraProvider resetCSS theme={theme}>
      <Provider value={client}>
        <Component {...pageProps} />
      </Provider>
    </ChakraProvider>
  );
};

export default MyApp;

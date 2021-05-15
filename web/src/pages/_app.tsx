import { ChakraProvider } from "@chakra-ui/react";
import theme from "../theme";

const MyApp = ({ Component, pageProps }: any) => {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
};

export default MyApp;

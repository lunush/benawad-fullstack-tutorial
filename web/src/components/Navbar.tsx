import { useApolloClient } from "@apollo/client";
import { Link, Heading, Flex, Box, Button } from "@chakra-ui/react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "src/generated/graphql";
import { isServer } from "src/utils/isServer";
import { withApollo } from "src/utils/withApollo";

interface Props {}

const Navbar: React.FC<Props> = () => {
  const [logout, { loading }] = useLogoutMutation();
  const apolloClient = useApolloClient();
  const { data } = useMeQuery({
    skip: isServer(),
  });

  return (
    <Flex p={4} bg="teal" color="white" w="100%">
      <Flex alignItems="center" flex={1} maxW={800} mx="auto">
        <NextLink href="/">
          <Link mr="auto">
            <Heading fontSize="1.5rem">LiReddit</Heading>
          </Link>
        </NextLink>
        {!data?.me ? (
          <>
            <NextLink href="/login">
              <Link mr="1.5rem">Login</Link>
            </NextLink>
            <NextLink href="/register">
              <Link>Register</Link>
            </NextLink>
          </>
        ) : (
          <>
            <Box mr="1.5rem">{data.me.username}</Box>
            <Button
              onClick={async () => {
                await logout();
                await apolloClient.resetStore();
              }}
              isLoading={loading}
              variant="link"
              color="white"
            >
              Logout
            </Button>
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default withApollo({ ssr: true })(Navbar);

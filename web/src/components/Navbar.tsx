import { Link, Heading, Flex, Box, Button } from "@chakra-ui/react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "src/generated/graphql";
import { isServer } from "src/utils/isServer";

interface Props {}

const Navbar: React.FC<Props> = () => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data }] = useMeQuery({
    pause: isServer(),
  });

  return (
    <Flex p={4} bg="teal" color="white" w="100%" alignItems="center">
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
            onClick={() => logout()}
            isLoading={logoutFetching}
            variant="link"
            color="white"
          >
            Logout
          </Button>
        </>
      )}
    </Flex>
  );
};

export default Navbar;

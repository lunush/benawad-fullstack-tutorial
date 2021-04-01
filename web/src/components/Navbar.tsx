import { Link, Flex, Box, Button } from "@chakra-ui/react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "src/generated/graphql";
import { isServer } from "src/utils/isServer";

interface Props {}

const Navbar: React.FC<Props> = () => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });
  let body = null;

  if (fetching) {
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr="1.5rem">Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
      </>
    );
  } else {
    body = (
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
    );
  }

  return (
    <Flex p={4} bg="teal" color="white" w="100%">
      <NextLink href="/">
        <Link mr="auto">Home</Link>
      </NextLink>
      {body}
    </Flex>
  );
};

export default Navbar;

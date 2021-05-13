import { Link, Heading, Flex, Box, Button } from "@chakra-ui/react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useLogoutMutation, useMeQuery } from "src/generated/graphql";
import { isServer } from "src/utils/isServer";

interface Props {}

const Navbar: React.FC<Props> = () => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data }] = useMeQuery({
    pause: isServer(),
  });
  const router = useRouter();

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
                router.reload();
              }}
              isLoading={logoutFetching}
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

export default Navbar;

import { Flex, Box, Stack, Heading, Text, Button } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { usePostsQuery } from "src/generated/graphql";
import { createUrqlClient } from "src/utils/createUrqlClient";
import Layout from "../components/Layout";
import { Link } from "@chakra-ui/react";
import NextLink from "next/link";

const Index = () => {
  const [{ data, fetching }] = usePostsQuery({
    variables: {
      limit: 10,
    },
  });

  return (
    <Layout>
      <Flex borderBottomWidth={1} p={4} mb={4}>
        <NextLink href="/create-post">
          <Link color="teal">Create Post</Link>
        </NextLink>
      </Flex>
      {!data && fetching ? (
        <Box>Loading...</Box>
      ) : data ? (
        <Stack spacing={8}>
          {data.posts.map((p) => (
            <Box key={p.id} p={5} borderWidth={1}>
              <Heading>{p.title}</Heading>
              <Text isTruncated>{p.textSnippet}</Text>
            </Box>
          ))}
          <Flex>
            <Button isLoading={fetching} m="auto">
              Load More
            </Button>
          </Flex>
        </Stack>
      ) : (
        <Box>Unable to fetch the data</Box>
      )}
      {/* {data && (
        <Flex my={4}>
        </Flex>
      )} */}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(Index);

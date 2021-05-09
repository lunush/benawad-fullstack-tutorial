import { Flex, Box, Stack, Heading, Text, Button } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { usePostsQuery } from "src/generated/graphql";
import { createUrqlClient } from "src/utils/createUrqlClient";
import Layout from "../components/Layout";
import { Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useState } from "react";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as string | null,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  if (!data && !fetching) return <Box>Unable to fetch the data</Box>;

  return (
    <Layout>
      <Flex borderBottomWidth={1} p={4} mb={4}>
        <NextLink href="/create-post">
          <Link color="teal">Create Post</Link>
        </NextLink>
      </Flex>
      {!data && fetching ? (
        <Box>Loading...</Box>
      ) : (
        data?.posts?.posts && (
          <Stack spacing={8}>
            {data.posts.posts.map((p) => (
              <Box key={p.id} p={5} borderWidth={1}>
                <Flex>
                  <Heading>{p.title}</Heading>
                  <Text fontSize="0.8rem" textColor="gray" ml="auto">
                    posted by {p.creator.username}
                  </Text>
                </Flex>
                <Text isTruncated>{p.textSnippet}</Text>
              </Box>
            ))}
          </Stack>
        )
      )}
      {data && data.posts.hasMore && (
        <Flex w="full" mt={5}>
          <Button
            onClick={() => {
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
            isLoading={fetching}
            m="auto"
          >
            Load More
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(Index);

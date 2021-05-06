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
    limit: 10,
    cursor: null as string | null,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  console.log(variables, data);

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
        <Stack spacing={8}>
          {data!.posts.map((p) => (
            <Box key={p.id} p={5} borderWidth={1}>
              <Heading>{p.title}</Heading>
              <Text isTruncated>{p.textSnippet}</Text>
            </Box>
          ))}
          <Flex>
            <Button
              onClick={() => {
                setVariables({
                  limit: variables.limit,
                  cursor: data!.posts[data!.posts.length - 1].createdAt,
                });
              }}
              isLoading={fetching}
              m="auto"
            >
              Load More
            </Button>
          </Flex>
        </Stack>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(Index);

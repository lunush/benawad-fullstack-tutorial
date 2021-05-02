import { Box } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { usePostsQuery } from "src/generated/graphql";
import { createUrqlClient } from "src/utils/createUrqlClient";
import Layout from "../components/Layout";
import { Link } from "@chakra-ui/react";
import NextLink from "next/link";

const Index = () => {
  const [{ data }] = usePostsQuery({
    variables: {
      limit: 10,
    },
  });

  return (
    <Layout>
      <NextLink href="/create-post">
        <Link color="teal" ml="auto">
          Create Post
        </Link>
      </NextLink>
      {data ? (
        data.posts.map((p) => <Box key={p.id}>{p.title}</Box>)
      ) : (
        <Box>Unable to fetch the data</Box>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(Index);

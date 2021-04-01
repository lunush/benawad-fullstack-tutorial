import { Box } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { usePostsQuery } from "src/generated/graphql";
import { createUrqlClient } from "src/utils/createUrqlClient";
import Navbar from "../components/Navbar";

const Index = () => {
  const [{ data }] = usePostsQuery();

  console.log(data?.posts[0].title);

  return (
    <>
      <Navbar />
      {data ? (
        data.posts.map((p) => <Box key={p.id}>{p.title}</Box>)
      ) : (
        <Box>Unable to fetch the data</Box>
      )}
    </>
  );
};

export default withUrqlClient(createUrqlClient)(Index);

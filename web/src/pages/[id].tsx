import { Heading, Text, Flex, IconButton } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { usePostQuery } from "src/generated/graphql";
import { createUrqlClient } from "src/utils/createUrqlClient";
import Layout from "../components/Layout";

interface Props {}

const Id: React.FC<Props> = () => {
  const router = useRouter();
  const id =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
  const [{ data, fetching }] = usePostQuery({
    pause: id === -1,
    variables: {
      id,
    },
  });

  if (fetching) {
    return <Layout>Loading...</Layout>;
  }

  if (!data?.post) {
    return <Layout>Unable to fetch the data.</Layout>;
  }

  return (
    <Layout>
      <Flex>
        <Heading mb={4} mr="auto">
          {data.post.title}
        </Heading>
        <IconButton
          colorScheme="red"
          aria-label="Delete Post"
          icon={<DeleteIcon />}
        />
      </Flex>
      <Text>{data.post.text}</Text>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Id);

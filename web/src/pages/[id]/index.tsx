import { Heading, Text, Flex, IconButton, Link } from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import {
  useDeletePostMutation,
  useMeQuery,
  usePostQuery,
} from "src/generated/graphql";
import { createUrqlClient } from "src/utils/createUrqlClient";
import Layout from "../../components/Layout";
import NextLink from "next/link";

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

  const [{ data: meData }] = useMeQuery();

  const [, deletePost] = useDeletePostMutation();

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
        {data.post.creator.id === meData?.me?.id ? (
          <Flex>
            <NextLink href="/[id]/edit" as={`/${id}/edit`}>
              <IconButton
                as={Link}
                aria-label="Delete Post"
                icon={<EditIcon />}
                colorScheme="teal"
                mr={4}
              />
            </NextLink>
            <IconButton
              onClick={() => {
                deletePost({ id });
                router.push("/");
              }}
              colorScheme="red"
              aria-label="Delete Post"
              icon={<DeleteIcon />}
            />
          </Flex>
        ) : null}
      </Flex>
      <Text>{data.post.text}</Text>
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Id);

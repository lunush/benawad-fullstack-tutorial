import { Heading, Text, Flex, IconButton, Link } from "@chakra-ui/react";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import {
  useDeletePostMutation,
  useMeQuery,
  usePostQuery,
} from "src/generated/graphql";
import Layout from "../../components/Layout";
import NextLink from "next/link";
import { withApollo } from "src/utils/withApollo";

interface Props {}

const Id: React.FC<Props> = () => {
  const router = useRouter();
  const id =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;
  const { data, loading } = usePostQuery({
    skip: id === -1,
    variables: {
      id,
    },
  });

  const { data: meData } = useMeQuery();

  const [deletePost] = useDeletePostMutation();

  if (loading) {
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
                deletePost({
                  variables: { id },
                  update: (cache) => {
                    cache.evict({ id: "Post:" + id });
                  },
                });
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

export default withApollo({ ssr: true })(Id);

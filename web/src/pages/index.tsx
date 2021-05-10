import {
  Flex,
  Box,
  Stack,
  Heading,
  Text,
  Button,
  IconButton,
} from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import { withUrqlClient } from "next-urql";
import { usePostsQuery, useVoteMutation } from "src/generated/graphql";
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

  const [{ data, fetching: fetchingPosts }] = usePostsQuery({
    variables,
  });
  const [updootLoading, setUpdootLoading] = useState<{
    state: "updoot-loading" | "downdoot-loading" | "not-loading";
    postId: number | null;
  }>({ state: "not-loading", postId: null });

  const [, vote] = useVoteMutation();

  return (
    <Layout>
      <Flex borderBottomWidth={1} p={4} mb={4}>
        <NextLink href="/create-post">
          <Link color="teal">Create Post</Link>
        </NextLink>
      </Flex>
      {!data && !fetchingPosts ? (
        <Box>Unable to fetch the data</Box>
      ) : !data && fetchingPosts ? (
        <Box>Loading...</Box>
      ) : (
        data?.posts?.posts && (
          <Stack spacing={8}>
            {data.posts.posts.map((p) => (
              <Box key={p.id} p={5} borderWidth={1}>
                <Flex>
                  <Flex align="center">
                    <Flex mr={4} flexDirection="column" align="center">
                      <IconButton
                        variant={p.voteStatus === 1 ? "solid" : "outline"}
                        size="xs"
                        colorScheme={p.voteStatus === 1 ? "green" : "teal"}
                        aria-label="Vote Positively"
                        isLoading={
                          updootLoading.postId === p.id &&
                          updootLoading.state === "updoot-loading"
                        }
                        onClick={async () => {
                          if (p.voteStatus === 1) {
                            return;
                          }
                          setUpdootLoading({
                            state: "updoot-loading",
                            postId: p.id,
                          });
                          await vote({
                            value: 1,
                            postId: p.id,
                          });
                          setUpdootLoading({
                            state: "not-loading",
                            postId: null,
                          });
                        }}
                        icon={
                          <ChevronUpIcon fontWeight="bold" fontSize="1.2rem" />
                        }
                      />
                      <Text mt={1.5} fontSize="1.2rem" alignContent="center">
                        {p.points}
                      </Text>
                      <IconButton
                        variant={p.voteStatus === -1 ? "solid" : "outline"}
                        size="xs"
                        colorScheme={p.voteStatus === -1 ? "red" : "teal"}
                        aria-label="Vote Negatively"
                        isLoading={
                          updootLoading.postId === p.id &&
                          updootLoading.state === "downdoot-loading"
                        }
                        onClick={async () => {
                          if (p.voteStatus === -1) {
                            return;
                          }
                          setUpdootLoading({
                            state: "downdoot-loading",
                            postId: p.id,
                          });
                          await vote({
                            value: -1,
                            postId: p.id,
                          });
                          setUpdootLoading({
                            state: "not-loading",
                            postId: null,
                          });
                        }}
                        icon={
                          <ChevronDownIcon
                            fontWeight="bold"
                            fontSize="1.1rem"
                          />
                        }
                      />
                    </Flex>
                  </Flex>
                  {/* if flex and w are not set, text goes out of posts' container */}
                  <Flex flexDirection="column" flex={1} w="1%">
                    <Flex>
                      <Heading>{p.title}</Heading>
                      <Text fontSize="0.8rem" textColor="gray" ml="auto">
                        posted by {p.creator.username}
                      </Text>
                    </Flex>
                    <Text isTruncated>{p.textSnippet}</Text>
                  </Flex>
                </Flex>
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
            isLoading={fetchingPosts}
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

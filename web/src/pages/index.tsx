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
import {
  usePostsQuery,
  useVoteMutation,
  VoteMutation,
} from "src/generated/graphql";
import Layout from "../components/Layout";
import { Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { useState } from "react";
import { withApollo } from "src/utils/withApollo";
import { ApolloCache, gql } from "@apollo/client";

const updateAfterVote = (
  value: number,
  postId: number,
  cache: ApolloCache<VoteMutation>
) => {
  const data = cache.readFragment<{
    id: number;
    points: number;
    voteStatus: number | null;
  }>({
    id: "Post:" + postId,
    fragment: gql`
      fragment _vote on Post {
        id
        points
        voteStatus
      }
    `,
  });

  if (data) {
    if (data.voteStatus === value) return;
    const newPoints = data.points + (!data.voteStatus ? 1 : 2) * value;

    cache.writeFragment({
      id: "Post:" + postId,
      fragment: gql`
        fragment __vote on Post {
          points
          voteStatus
        }
      `,
      data: { points: newPoints, voteStatus: value },
    });
  }
};

const Index = () => {
  const { data, loading, fetchMore, variables } = usePostsQuery({
    variables: {
      limit: 2,
      cursor: null,
    },
    notifyOnNetworkStatusChange: true,
  });
  const [updootLoading, setUpdootLoading] = useState<{
    state: "updoot-loading" | "downdoot-loading" | "not-loading";
    postId: number | null;
  }>({ state: "not-loading", postId: null });

  const [vote] = useVoteMutation();

  return (
    <Layout>
      <Flex borderBottomWidth={1} p={4} mb={4}>
        <NextLink href="/create-post">
          <Link color="teal">Create Post</Link>
        </NextLink>
      </Flex>
      {!data && !loading ? (
        <Box>Unable to fetch the data</Box>
      ) : !data && loading ? (
        <Box>Loading...</Box>
      ) : (
        data?.posts?.posts && (
          <Stack spacing={8}>
            {data.posts.posts.map((p) =>
              !p ? null : (
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
                              variables: {
                                value: 1,
                                postId: p.id,
                              },
                              update: (cache) =>
                                updateAfterVote(1, p.id, cache),
                            });
                            setUpdootLoading({
                              state: "not-loading",
                              postId: null,
                            });
                          }}
                          icon={
                            <ChevronUpIcon
                              fontWeight="bold"
                              fontSize="1.2rem"
                            />
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
                              variables: {
                                value: -1,
                                postId: p.id,
                              },
                              update: (cache) =>
                                updateAfterVote(-1, p.id, cache),
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
                        <NextLink href="/[id]" as={`/${p.id}`}>
                          <Link>
                            <Heading>{p.title}</Heading>
                          </Link>
                        </NextLink>
                        <Text fontSize="0.8rem" textColor="gray" ml="auto">
                          posted by {p.creator.username}
                        </Text>
                      </Flex>
                      <Text isTruncated>{p.textSnippet}</Text>
                    </Flex>
                  </Flex>
                </Box>
              )
            )}
          </Stack>
        )
      )}
      {data && data.posts.hasMore && (
        <Flex w="full" mt={5}>
          <Button
            onClick={() => {
              fetchMore({
                variables: {
                  limit: variables?.limit,
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1].createdAt,
                },
              });
            }}
            isLoading={loading}
            m="auto"
          >
            Load More
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Index);

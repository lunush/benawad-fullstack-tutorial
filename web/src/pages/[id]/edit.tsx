import { Formik, Form } from "formik";
import { Button } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { usePostQuery, useUpdatePostMutation } from "src/generated/graphql";
import Layout from "../../components/Layout";
import InputField from "src/components/InputField";
import { withApollo } from "src/utils/withApollo";

interface Props {}

const EditPost: React.FC<Props> = () => {
  const router = useRouter();
  const id =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;

  const [updatePost] = useUpdatePostMutation();

  const { data, loading } = usePostQuery({
    skip: id === -1,
    variables: {
      id,
    },
  });

  if (loading) {
    return <Layout>Loading...</Layout>;
  }

  if (!data?.post) {
    return <Layout>Unable to fetch the data.</Layout>;
  }

  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values) => {
          const { title, text } = values;
          await updatePost({ variables: { id, title, text } });

          router.back();
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name="title" label="Title" />
            <InputField name="text" label="Text" textarea />
            <Button
              isLoading={isSubmitting}
              type="submit"
              backgroundColor="teal"
              color="white"
            >
              Update
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(EditPost);

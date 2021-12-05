import type { MetaFunction, LoaderFunction } from "remix";
import { useLoaderData, json, Link } from "remix";
import { gql } from "graphql-request";

import { graphcmsClient } from "~/lib/graphcms";

const GetAllVideos = gql`
  {
    videos {
      id
      title
    }
  }
`;

export let loader: LoaderFunction = async () => {
  const data = await graphcmsClient.request(GetAllVideos);

  return json(data);
};

export let meta: MetaFunction = () => ({
  title: "Video Reactions!",
});

export default function Index() {
  const data = useLoaderData();

  return (
    <div className="remix__page">
      {data?.videos.map(({ id, title }: any) => (
        <li key={id}>
          <Link to={`/${id}`}>{title}</Link>
        </li>
      ))}
    </div>
  );
}

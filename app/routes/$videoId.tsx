import { useState } from "react";
import type { ActionFunction, LoaderFunction, MetaFunction } from "remix";
import { Form, json, useActionData, redirect, useLoaderData } from "remix";
import YouTubePlayer from "react-player/youtube";
import { gql } from "graphql-request";

import { graphcmsClient } from "~/lib/graphcms";
import Reaction from "~/components/Reaction";

const GetVideoById = gql`
  query GetVideoById($id: ID!) {
    video(where: { id: $id }) {
      title
      url
      reactions {
        id
        timestamp
        duration
        emoji
      }
    }
  }
`;

const CreateReaction = gql`
  mutation CreateReaction(
    $timestamp: Float
    $duration: Int
    $emoji: Emoji
    $videoId: ID
  ) {
    createReaction(
      data: {
        timestamp: $timestamp
        duration: $duration
        emoji: $emoji
        video: { connect: { id: $videoId } }
      }
    ) {
      id
      timestamp
      duration
      emoji
    }
  }
`;

export const meta: MetaFunction = ({ data }) => ({
  title: data.title,
});

export const loader: LoaderFunction = async ({ params }) => {
  const { videoId } = params;

  const { video } = await graphcmsClient.request(GetVideoById, { id: videoId });

  return json(video);
};

export let action: ActionFunction = async ({ request, params }) => {
  const { videoId } = params;
  const formData = await request.formData();
  const { timestamp, duration, emoji } = Object.fromEntries(formData);

  await graphcmsClient.request(CreateReaction, {
    timestamp: Number(timestamp),
    duration: Number(duration),
    emoji: String(emoji),
    videoId,
  });

  return redirect(`/${videoId}`);
};

export default function ActionsDemo() {
  const actionMessage = useActionData<string>();
  const data = useLoaderData();

  const [secondsEnlapsed, setSecondsEnlapsed] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);

  const handleProgress = ({ playedSeconds }: { playedSeconds: number }) => {
    setSecondsEnlapsed(playedSeconds || 0);
  };

  const handleDuration = (duration: number) => {
    setDuration(duration || 0);
  };

  return (
    <div className="remix__page">
      <div>
        <h1>{data.title}</h1>
        <p>Watch a video, and react to it!</p>

        <div style={{ position: "relative" }}>
          {data?.url && (
            <YouTubePlayer
              url={data.url}
              onProgress={handleProgress}
              onDuration={handleDuration}
              controls
            />
          )}

          <div
            style={{
              marginTop: "10px",
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "25px",
              zIndex: 100,
            }}
          >
            <div style={{ position: "relative", zIndex: 100 }}>
              {data?.reactions.map(
                ({
                  id,
                  ...reaction
                }: {
                  id: string;
                  timestamp: number;
                  duration: number;
                  emoji: string;
                }) => (
                  <Reaction key={id} {...reaction} />
                )
              )}
            </div>
          </div>
        </div>

        <Form
          method="post"
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "30px",
          }}
        >
          <input type="hidden" name="timestamp" value={secondsEnlapsed} />
          <input type="hidden" name="duration" value={duration} />

          <button name="emoji" type="submit" value="CLAP">
            👏
          </button>

          <button name="emoji" type="submit" value="HEART">
            ❤️
          </button>

          <button name="emoji" type="submit" value="SHOCK">
            😱
          </button>

          <button name="emoji" type="submit" value="EYE">
            👁
          </button>

          {actionMessage ? (
            <p>
              <b>{actionMessage}</b>
            </p>
          ) : null}
        </Form>
      </div>
    </div>
  );
}

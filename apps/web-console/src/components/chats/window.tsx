import { useState } from "react";
import { SWRSubscription, useSWRSubscription } from "@/swr";

import { Bubble, EmptyState, Timestamp } from "@/components/chats";
import { useCurrentUser } from "@/current-user";
import { getTimeInShortMinuteFormat } from "@/utils/date";
import { webSocket } from "@/web-sockets";
import { BASE_WS_URL } from "@/web-sockets/constants";

const encoder = new TextEncoder();

export const Window = ({ accessToken }: { accessToken: string }) => {
  const { teamId, userId } = useCurrentUser();
  const [messages, setMessages] = useState<any[]>([]);

  const subscribeWS: SWRSubscription<string, number, Error> = (
    key,
    { next }
  ) => {
    console.log("subscribeWS", { key });

    if (webSocket) {
      // webSocket.addEventListener("message", (event) => next(null, event.data));
      // webSocket.addEventListener("error", (event: any) => next(event.error));

      webSocket.addEventListener("open", (event) => {
        console.log("@open", { event });

        let data = JSON.stringify({
          Data: {
            content: "hello",
            session_id: "abc",
            context: {
              user_id: userId,
              team_id: teamId,
              authorization_token: accessToken,
            },
          },
        });

        const binaryData = encoder.encode(data);
        console.log("Sending first hello message", data, binaryData);
        webSocket?.send(binaryData.buffer);
      });

      const receiveWSMessage = async (event: any) => {
        let data = JSON.parse(await event.data.text());
        console.log("WebSocket message received:", data);

        setMessages((prev) => [...prev, data.Data]);
        console.log("@message", { event, messageGroupData });
      };

      webSocket.addEventListener("message", receiveWSMessage);
    }

    return () => {
      console.log("@closed");
      webSocket?.close();
    };
  };

  const { data: wsData, error: wsError } = useSWRSubscription(
    BASE_WS_URL,
    subscribeWS,
    { revalidateOnFocus: true }
  );

  let messageGroupData: { [key: string]: any } = {};
  const combined = [...messages];
  combined.forEach((messageObj: any) => {
    const groupText = getTimeInShortMinuteFormat(
      new Date(messageObj.created_at)
    );
    if (!messageGroupData[groupText]) messageGroupData[groupText] = [];
    messageGroupData[groupText] = [
      ...messageGroupData[groupText],
      { ...messageObj, group: groupText },
    ];
  });

  const isSocketError = true;
  const isSocketDisconnected = true;
  const isSocketConnectionAvailable = !(isSocketError || isSocketDisconnected);

  console.log({ messageGroupData });

  if (!Object.keys(messageGroupData).length)
    return (
      <div className="flex items-center justify-center w-full h-full">
        <EmptyState />
      </div>
    );

  return (
    <>
      {Object.keys(messageGroupData).map((groupKey: string, index) => {
        let messages: any = messageGroupData[groupKey];

        return (
          <>
            <Timestamp groupKey={groupKey} />
            <div key={index}>
              {messages.map((message: any) => {
                // const waitBeforeHide = message.waitBeforeHide;
                // const waitBeforeShow = message.waitBeforeShow;

                // if (message.componentType === "chat-loader") {
                //   return <></>;
                // }
                return (
                  // <WaitBeforeShow
                  //   key={message.id}
                  //   waitBeforeShow={waitBeforeShow}
                  // >
                  <Bubble
                    key={message.id}
                    message={message.content}
                    sender={true}
                  />
                  // </WaitBeforeShow>
                );
              })}
            </div>
          </>
        );
      })}
    </>
  );
};

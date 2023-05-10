import { useEffect, useMemo, useRef, useState } from "react";
import { SWRSubscription, useSWRSubscription } from "@/swr";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { Bubble, EmptyState, Timestamp } from "@/components/chats";
import { getTimeInShortMinuteFormat } from "@/utils/date";
import { BASE_WS_URL } from "@/web-sockets/constants";
import { FormInputTextField } from "@/design-system/form";
import { useScrollToBottom } from "@/hooks";
import { SWRSubscriptionOptions } from "swr/subscription";

const schema = yup.object().shape({
  message: yup
    .string()
    .required("Required")
    .min(1, "Minimum one character is required"),
});

export const Window = (props: any) => {
  const { accessToken, user } = props;
  const { name: userName } = user;
  const webSocketRef = useRef<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [count, setCount] = useState(1);
  const { divRef, scrollToBottom } = useScrollToBottom();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const useFormObj = useMemo(
    () => ({
      defaultValues: {
        message: "",
      },
      resolver: yupResolver(schema),
    }),
    []
  );
  const hookFormProps = useForm(useFormObj);
  const { reset } = hookFormProps;

  const onFormSubmit: SubmitHandler<any> = (submittedFormData) => {
    const now = new Date();
    const nowTime = now.getTime();
    const count = messages.length + 1;
    const msg = submittedFormData?.message;

    const defaultProps = {
      id: `from-user-${count}-${nowTime}`,
      order: count,
      timestamp: now,
      type: "FROM_USER",
      sender: true,
    };

    const msgWithProps = {
      content: msg,
      message_type: "query",
      reciever: "system",
    };

    if (accessToken) {
      let data = JSON.stringify(msgWithProps);

      webSocketRef?.current?.send(data);
      setCount((prevValue) => prevValue + count);
      timeoutRef.current = setTimeout(scrollToBottom, 500);
      setMessages((prev) => [
        ...prev,
        { ...msgWithProps, ...defaultProps },
      ]);
      reset();
    }
  };

  const { handleSubmit } = hookFormProps;
  const subscribeWS = (
    key: string,
    { next }: SWRSubscriptionOptions<number, Error>
  ) => {
    const socket = new WebSocket(key);
    webSocketRef.current = socket;
    if (socket) {
      // webSocket.addEventListener("message", (event) => next(null, event.data));
      // webSocket.addEventListener("error", (event: any) => next(event.error));

      socket.addEventListener("open", (event: any) => {
        console.log("Connected to User Socket Server");
        // next(null, event.data);
      });

      socket.addEventListener("message", async (event: any) => {
        console.log("Message from server ", event.data)
        let data = JSON.parse(await event.data);

        const defaultProps = {
          id: `from-user-${count}-${new Date().getTime()}`,
          order: count,
          timestamp: new Date(),
          type: "system",
          sender: false,
        };

        setMessages((prev) => [...prev, { ...data, ...defaultProps, content: data.content.replaceAll("\n", `<br/>`) }]);
        setCount((prevValue) => prevValue + count);
        next(null, event.data)
      });

      timeoutRef.current = setTimeout(scrollToBottom, 500);
    }

    return () => {
      socket?.close();
    };
  };

  useSWRSubscription(BASE_WS_URL+ `?token=${accessToken}`, subscribeWS);

  useEffect(() => {
    const timeout = timeoutRef.current;
    return () => clearTimeout(timeout);
  }, [timeoutRef]);

  let messageGroupData: { [key: string]: any } = {};
  const combined = [...messages];
  combined.forEach((messageObj: any) => {
    const groupText = getTimeInShortMinuteFormat(
      messageObj.created_at ? new Date(messageObj.created_at) : new Date()
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

  if (!Object.keys(messageGroupData).length)
    return (
      <div className="overflow-auto h-[calc(100vh_-_140px)] mb-2 p-2 pb-40">
        <div className="flex items-center justify-center w-full h-full">
          <EmptyState />
        </div>
      </div>
    );

  return (
    <>
      <div
        className="overflow-auto h-[calc(100vh_-_140px)] mb-2 p-2 pb-40"
        ref={divRef}
      >
        {Object.keys(messageGroupData).map(
          (groupKey: string, index: number) => {
            let messages: any = messageGroupData[groupKey];
            const outerKey = `msg-group-${index}`;
            const innerKey = `thread-${groupKey}-${index}`;

            return (
              <div key={outerKey}>
                <Timestamp groupKey={groupKey} />
                <div key={innerKey}>
                  {messages.map((message: any, index: number) => {
                    const isLastMsg = messages.length === index + 1;
                    return (
                      <div key={`${message.id}`}>
                        <Bubble
                          key={message.id}
                          message={message.content}
                          sender={message.sender}
                          userName={userName}
                          isLastMsg={isLastMsg}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }
        )}
      </div>
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <FormInputTextField
          id="chat_message_input"
          name="message"
          contextId="chat_message_input"
          placeholder="Ask something and press Enter"
          {...hookFormProps}
        />
      </form>
    </>
  );
};

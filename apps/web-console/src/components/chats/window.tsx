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

const schema = yup.object().shape({
  message: yup
    .string()
    .required("Required")
    .min(1, "Minimum one character is required"),
});

const encoder = new TextEncoder();
const _messages = [
  {
    id: "1",
    content: "Hello",
    sender: false,
    created_at: new Date(),
  },
  {
    id: "2",
    content: "Hi! How are you?",
    sender: true,
    created_at: new Date(),
  },
  {
    id: "3",
    content: "Hello",
    sender: false,
    created_at: new Date(),
  },
  {
    id: "4",
    content: "Hi! How are you?",
    sender: true,
    created_at: new Date(),
  },
  {
    id: "5",
    content: "Hello",
    sender: false,
    created_at: new Date(),
  },
  {
    id: "6",
    content: "Hi! How are you?",
    sender: true,
    created_at: new Date(),
  },
  {
    id: "7",
    content:
      "HelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHelloHello",
    sender: false,
    created_at: new Date(),
  },
  {
    id: "8",
    content:
      "Hi! How are you?Hi! How are you?Hi! How are you?Hi! How are you?Hi! How are you?Hi! How are you?Hi! How are you?Hi! How are you?Hi! How are you?Hi! How are you?Hi! How are you?Hi! How are you?Hi! How are you?Hi! How are you?Hi! How are you?Hi! How are you?Hi! How are you?Hi! How are you?Hi! How are you?Hi! How are you?",
    sender: true,
    created_at: new Date(),
  },
  {
    id: "9",
    content: "Hello",
    sender: false,
    created_at: new Date(),
  },
  {
    id: "10",
    content: "Hi! How are you?",
    sender: true,
    created_at: new Date(),
  },
];

const isBrowser = typeof window !== "undefined";

export const Window = (props: any) => {
  const { accessToken, user } = props;
  const { namora_team_id, namora_user_id, name: userName } = user;
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
      Data: {
        content: msg,
        session_id: "8d77a6ab-975b-49c6-871e-707798a22751",
        context: {
          user_id: namora_user_id,
          team_id: namora_team_id,
          authorization_token: accessToken,
        },
      },
    };

    if (accessToken) {
      let data = JSON.stringify(msgWithProps);

      const binaryData = encoder.encode(data);
      webSocketRef?.current?.send(binaryData.buffer);
      setCount((prevValue) => prevValue + count);
      timeoutRef.current = setTimeout(scrollToBottom, 500);
      setMessages((prev) => [
        ...prev,
        { ...msgWithProps.Data, ...defaultProps },
      ]);
      reset();
    }
  };

  const { handleSubmit } = hookFormProps;
  const subscribeWS: SWRSubscription<string, number, Error> = (
    key,
    { next }
  ) => {
    const now = new Date();
    const nowTime = now.getTime();
    const webSocket = isBrowser ? new WebSocket(BASE_WS_URL) : null;
    webSocketRef.current = webSocket;
    if (webSocket) {
      // webSocket.addEventListener("message", (event) => next(null, event.data));
      // webSocket.addEventListener("error", (event: any) => next(event.error));

      webSocket.addEventListener("open", (event: any) => {
        let data = JSON.stringify({
          Data: {
            content: "hello",
            context: {
              session_id: "abc",
              user_id: namora_user_id,
              team_id: namora_team_id,
              authorization_token: accessToken,
            },
          },
        });

        const binaryData = encoder.encode(data);
        webSocket?.send(binaryData.buffer);
      });

      const receiveWSMessage = async (event: any) => {
        let data = JSON.parse(await event.data.text());

        const defaultProps = {
          id: `from-user-${count}-${nowTime}`,
          order: count,
          timestamp: now,
          type: "FROM_AI",
          sender: false,
        };

        setMessages((prev) => [...prev, { ...data.Data, ...defaultProps }]);
      };
      webSocket.addEventListener("message", receiveWSMessage);
      timeoutRef.current = setTimeout(scrollToBottom, 500);
    }

    return () => {
      webSocket?.close();
    };
  };

  useSWRSubscription(BASE_WS_URL, subscribeWS);

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
      <div className="box-border overflow-auto bg-white  divide-gray-200 rounded-lg shadow h-[calc(100vh_-_140px)] mb-2 p-2">
        <div className="flex items-center justify-center w-full h-full">
          <EmptyState />
        </div>
      </div>
    );

  return (
    <>
      <div
        className="box-border overflow-auto bg-white  divide-gray-200 rounded-lg  h-[calc(100vh_-_140px)] mb-2 p-2 pb-40 shadow-inset border-black"
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

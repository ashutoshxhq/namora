import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import * as yup from "yup";

import { BASE_WS_URL } from "@/web-sockets/constants";
import { Bubble, EmptyState, Timestamp, WaitBeforeShow } from "@/ui/chats";

const messages = [
  { message: "Hello!", sender: false },
  { message: "Hi! How are you?", sender: true },
  { message: "Hello!", sender: false },
  { message: "Hi! How are you?", sender: true },
  { message: "Hello!", sender: false },
  { message: "Hi! How are you?", sender: true },
  { message: "Hello!", sender: false },
  { message: "Hi! How are you?", sender: true },
  { message: "Hello!", sender: false },
  { message: "Hi! How are you?", sender: true },
  { message: "Hello!", sender: false },
  { message: "Hi! How are you?", sender: true },
  { message: "Hello!", sender: false },
  { message: "Hi! How are you?", sender: true },
  { message: "Hello!", sender: false },
  { message: "Hi! How are you?", sender: true },
  { message: "Hello!", sender: false },
  { message: "Hi! How are you?", sender: true },
  // Add more messages as needed
];

const schema = yup.object().shape({
  message: yup
    .string()
    .required("Required")
    .min(1, "Minimum one character is required"),
});

const isBrowser = typeof window !== "undefined";
console.log({ isBrowser });
const webSocketInstance = isBrowser ? new WebSocket(BASE_WS_URL) : null;

export const Window = () => {
  const webSocketMsg = "Connection Failed";

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
  const { handleSubmit } = hookFormProps;

  const { reset } = hookFormProps;

  const onFormSubmit: SubmitHandler<any> = (submittedFormData) => {
    handleClickOnSendMessage(submittedFormData);
  };

  const handleClickOnSendMessage = (submittedFormData: any) => {
    let data = JSON.stringify({
      Data: {
        message_from: "USER",
        message_to: "AI",
        message: submittedFormData.message,
      },
    });

    const encoder = new TextEncoder();
    const binaryData = encoder.encode(data);
    console.log("Sending", { data, binaryData });
    // webSocketInstance.send(binaryData.buffer)
  };

  useEffect(() => {
    if (webSocketInstance) {
      webSocketInstance?.addEventListener("open", (event) => {
        console.log("@open", { event });
      });
      webSocketInstance?.addEventListener("message", (event) => {
        console.log("@message", { event });
      });
      webSocketInstance.onopen = (event: any) => {
        console.log("webSocketInstance open", { event });
        // webSocketInstance.send(JSON.stringify(apiCall))
      };
      webSocketInstance.onmessage = function (event: any) {
        const json = JSON.parse(event.data);
        console.log({ json });

        try {
          if (json.event === "data") {
            const bids = json.data.bids.slice(0, 5);
            // setBids(bids)
            console.log({ bids });
          }
        } catch (err) {
          console.log(err);
        }
      };
    }
    return () => webSocketInstance?.close();
  }, []);

  const messageGroupData: any = [];
  const isSocketError = true;
  const isSocketDisconnected = true;
  const isSocketConnectionAvailable = !(isSocketError || isSocketDisconnected);

  <div className="flex flex-col p-4 pb-40 overflow-y-scroll h-[calc(100vh-theme(space.56))]">
    {messages.map(({ message, sender }, index: number) => (
      <Bubble key={index} message={message} sender={true} />
    ))}
  </div>;

  if (!Object.keys(messageGroupData).length)
    return (
      <div className="flex items-center justify-center w-full h-full">
        <EmptyState />
      </div>
    );

  return (
    <>
      {Object.keys(messageGroupData).map((groupKey: string) => {
        let messages: any = messageGroupData[groupKey];

        return (
          <>
            <Timestamp groupKey={groupKey} />
            {messages.map((message: any) => {
              const waitBeforeHide = message.waitBeforeHide;
              const waitBeforeShow = message.waitBeforeShow;

              if (message.componentType === "chat-loader") {
                return <></>;
              }
              return (
                <WaitBeforeShow
                  key={message.id}
                  waitBeforeShow={waitBeforeShow}
                >
                  <Bubble key={message.id} message={message} sender={true} />
                </WaitBeforeShow>
              );
            })}
          </>
        );
      })}
    </>
  );
};

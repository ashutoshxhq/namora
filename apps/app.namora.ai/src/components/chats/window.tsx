import { Bubble, EmptyState, Timestamp } from "@/components/chats";
import { useChats } from "@/hooks/chats";

export const Window = () => {
  const { messageGroupData } = useChats();

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

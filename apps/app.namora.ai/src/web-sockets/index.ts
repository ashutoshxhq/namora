import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import * as yup from "yup";

import { BASE_WS_URL } from "web-sockets/constants";

const schema = yup.object().shape({
  message: yup
    .string()
    .required("Required")
    .min(1, "Minimum one character is required"),
});

const web_socket = new WebSocket(BASE_WS_URL);

export const useWebSocketWindow = () => {
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
    // web_socket.send(binaryData.buffer)
  };

  useEffect(() => {
    web_socket.addEventListener("open", (event) => {
      console.log("@open", { event });
    });
    web_socket.addEventListener("message", (event) => {
      console.log("@message", { event });
    });
    // web_socket.onopen = (event: any) => {
    //   console.log('web_socket open', { event })
    //   // web_socket.send(JSON.stringify(apiCall))
    // }
    // web_socket.onmessage = function (event: any) {
    //   const json = JSON.parse(event.data)
    //   console.log({ json })

    //   try {
    //     if (json.event === 'data') {
    //       const bids = json.data.bids.slice(0, 5)
    //       // setBids(bids)
    //       console.log({ bids })
    //     }
    //   } catch (err) {
    //     console.log(err)
    //   }
    // }
    ///
    return () => web_socket.close();
  }, []);

  const isSocketError = true;
  const isSocketDisconnected = true;
  const isSocketConnectionAvailable = !(isSocketError || isSocketDisconnected);

  return {
    divRef: null,
    webSocketMsg,
    isSocketConnectionAvailable,
    messageGroupData: [],
    hookFormProps: { ...hookFormProps, onFormSubmit },
  };
};

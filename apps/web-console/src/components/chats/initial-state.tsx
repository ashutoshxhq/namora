import Image from "next/image";
import { BeatLoader } from "react-spinners";

export const InitialState = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="p-4 m-2 bg-gray-800 rounded-full">
        <Image
          className="w-auto h-10"
          src="https://assets.namora.ai/namora-white.svg"
          alt="Namora.ai"
          width="200"
          height="200"
        />
      </div>
      <div className="my-3">
        <BeatLoader color="#374151" size="10px" />
      </div>
    </div>
  );
};

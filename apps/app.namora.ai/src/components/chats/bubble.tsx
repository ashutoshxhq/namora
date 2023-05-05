export const Bubble = ({
  message,
  sender,
}: {
  message: string;
  sender: boolean;
}) => {
  const bubbleClasses = sender
    ? "bg-green-500 text-white"
    : "bg-gray-300 text-black";

  return (
    <div
      className={`p-2 rounded-lg max-w-2xl mb-2 ${bubbleClasses} ${
        sender ? "ml-auto" : "mr-auto"
      }`}
    >
      <p>{message}</p>
    </div>
  );
};

export const Timestamp = ({ groupKey }: { groupKey: string }) => {
  return (
    <div className="sticky top-0 text-center z-[1]">
      <div className="flex items-center justify-center">
        <p className="px-3 py-1 mx-5 text-sm bg-white border border-gray-200 rounded-xl">{`${groupKey}`}</p>
      </div>
    </div>
  );
};

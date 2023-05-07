export const Timestamp = ({ groupKey }: { groupKey: string }) => {
  return (
    <div className="sticky top-0 text-center z-2">
      <div className="flex items-center justify-center">
        <p className="p-2 border-blue-400 border-r-10 mx-15">{`${groupKey}`}</p>
      </div>
    </div>
  );
};

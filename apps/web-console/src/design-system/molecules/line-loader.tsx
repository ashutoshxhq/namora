export const LineLoader = () => {
  return (
    <div id="line-loader">
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-r bg-transparent h-[0.25rem] z-[51]">
        <div
          className={`h-full bg-blue-500 animate-progress-loader ease-in-out`}
        />
      </div>
    </div>
  );
};

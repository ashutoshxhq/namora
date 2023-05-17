export const TopLineLoader = () => {
  return (
    <div id="top-line-loader">
      <div className="fixed top-0 left-20 w-full bg-gradient-to-r bg-white h-[0.25rem] z-[51]">
        <div
          className={`h-full bg-black animate-progress-loader ease-in-out`}
        />
      </div>
    </div>
  );
};

import React from "react";
import { PersonalDetails } from "./personal-details";
import { Password } from "./password";

export const Account = () => {
  return (
    <div className="overflow-auto">
      <div className="divide-y divide-white/5">
        <PersonalDetails />
        <Password />
      </div>
    </div>
  );
};

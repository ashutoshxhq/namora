import React from "react";
import { PersonalDetails } from "@/components/settings/personal-details";
// import { Password } from "@/components/settings/password";

export const Account = (props: any) => {
  return (
    <div className="overflow-auto">
      <div className="divide-y divide-white/5">
        <PersonalDetails {...props} />
        {/* <Password /> */}
      </div>
    </div>
  );
};

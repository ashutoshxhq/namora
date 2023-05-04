import React from "react";
import PersonalDetails from "settings/ui/personal-details";
import Password from "settings/ui/password";

const Account = () => {
  return (
    <div className="overflow-auto">
      <div className="divide-y divide-white/5">
        <PersonalDetails />
        <Password />
      </div>
    </div>
  );
};

export default Account;

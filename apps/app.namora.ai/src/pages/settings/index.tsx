import { PersonalDetails } from "./ui/personal-details";
import { Password } from "./ui/password";

export default function Settings() {
  return (
    <div className="overflow-auto h-[calc(100vh-theme(space.24))]">
      <div className="divide-y divide-white/5">
        <PersonalDetails />
        <Password />
      </div>
    </div>
  );
}

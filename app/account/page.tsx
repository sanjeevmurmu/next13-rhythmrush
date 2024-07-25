import Header from "@/components/Header";

import AccountContent from "./components/AccountContent";
import getUserDetails from "@/actions/getUserDetails";

const Account = async() => {
  const userDetail = await getUserDetails();
  console.log(userDetail)

  return (
    <div 
      className="
        bg-neutral-900 
        rounded-lg 
        h-full 
        w-full 
        overflow-hidden 
        overflow-y-auto
      "
    >
      <Header className="from-bg-neutral-900">
        <div className="mb-2 flex flex-col gap-y-6">
          <h1 className="text-white text-3xl font-semibold">
            Account Settings
          </h1>
        </div>
      </Header>
      <AccountContent userDetail={userDetail}/>
    </div>
  )
}

export default Account;

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

import { useUser } from "@/hooks/useUser";
import Button from "@/components/Button";
import useSubscribeModal from "@/hooks/useSubscribeModal";
import { postData } from "@/libs/helpers";
import { UserDetails } from "@/types";

interface AccountContentProps {
  userDetail: UserDetails;
};


const AccountContent: React.FC<AccountContentProps> = ({userDetail}) => {
  const router = useRouter();
  const subscribeModal = useSubscribeModal();
  const { isLoading, subscription, user } = useUser();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/');
    }
  }, [isLoading, user, router]);

  const redirectToCustomerPortal = async () => {
    setLoading(true);
    try {
      const { url, error } = await postData({
        url: '/api/create-portal-link'
      });
      window.location.assign(url);
    } catch (error) {
      if (error) return toast.error((error as Error).message);
    }
    setLoading(false);
  };
  // console.log(userDetail)
  return ( 
    <div className="mb-7 px-6">
      <div className="mb-5">

      <span className="text-white text-3xl font-semibold">Name  </span>
      <span className="text-white text-2xl font-semibold">{userDetail.full_name}</span>
      </div>
      {!subscription && (
        <div className="flex flex-col gap-y-4">
        <p>No active plan.</p>
        <Button 
          onClick={subscribeModal.onOpen}
          className="w-[300px]"
        >
          Subscribe
        </Button>
      </div>
      )}
      {subscription && (
        <div className="flex flex-col gap-y-4">
          <p>You are currently on the 
            <b> {subscription?.prices?.products?.name} </b> 
            plan.
          </p>
          <Button
            disabled={loading || isLoading}
            onClick={redirectToCustomerPortal}
            className="w-[300px]"
          >
            Open customer portal
          </Button>
        </div>
      )}
    </div>
  );
}
 
export default AccountContent;

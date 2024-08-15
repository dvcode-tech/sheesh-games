'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { retrieveLaunchParams, useLaunchParams } from '@telegram-apps/sdk-react';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const initDataRaw = useLaunchParams().initDataRaw;
  const [userData, setUserData] = useState<any>(null);
  const launchParams = retrieveLaunchParams();

  console.log('userDataTest: ', userData);

  const onLogin = async () => {
    try {
      setLoading(false);
      fetch(`${process.env.NEXT_PUBLIC_BASEURL}/bot/login`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          initData: initDataRaw,
          startParam: launchParams?.startParam,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setUserData(data);
          localStorage.setItem('telegram_user_id', data?.data?.findUser?.telegram_user_id);
          localStorage.setItem('hashFromClient', data?.data?.hashFromClient);

          router.push(`/menu`);
        });
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    onLogin();
  }, []);
  return (
    <div className="flex flex-1 flex-col min-h-screen justify-between overflow-hidden bg-[url('/assets/menu-bg.png')] bg-cover bg-center bg-no-repeat">
      <img className="pt-[100px] shake" src="/assets/sheesh-logo.png" alt="" />
      <div className="pt-[70px] flex flex-1 w-full justify-center">
        <div className="loader"></div>
      </div>
      <div className="flex flex-col w-full py-8 items-center justify-center">
        <div className="text-white text-[11px] pb-2">Powered by</div>
        <img className="h-[20px] object-scale-down" src="/assets/dvcode.png" alt="" />
      </div>
    </div>
  );
}

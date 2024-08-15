import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { retrieveLaunchParams, useInitData, useLaunchParams, type User } from '@telegram-apps/sdk-react';

export default function useLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const initDataRaw = useLaunchParams().initDataRaw;
  const launchParams = retrieveLaunchParams();

  const initData = useInitData();
  const [userData, setUserData] = useState<any>(null);
  const [verifiedData, setVerifiedData] = useState<any>(null);

  const onLogin = async () => {
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
        onVerify(data);
      });

    const onVerify = async (_data: any) => {
      fetch(`${process.env.NEXT_PUBLIC_BASEURL}/bot/verify`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          telegram_user_id: _data?.data?.findUser?.telegram_user_id,
          hashFromClient: _data?.data?.hashFromClient,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setVerifiedData(data);
          localStorage.setItem('telegram_user_id', _data?.data?.findUser?.telegram_user_id);
          localStorage.setItem('hashFromClient', _data?.data?.hashFromClient);
          console.log('_data?.data?.hashFromClient: ', _data?.data?.hashFromClient);
          console.log('_data?.data?.findUser?.telegram_user_id: ', _data?.data?.findUser?.telegram_user_id);
          console.log('VerifyData: ', verifiedData);

          router.push(`/menu`);
        });
    };
  };

  return [
    {
      loading,
    },
    {
      onLogin,
    },
  ];
}

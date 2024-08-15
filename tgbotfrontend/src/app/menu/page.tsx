'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LuSearch, LuUserPlus, LuCopy, LuChevronLeft } from 'react-icons/lu';

import * as clipboard from 'clipboard-polyfill';
import { toast } from '@/components/ui/use-toast';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Games = [
  {
    name: 'Rock Paper Scissors',
    desc: 'Casual Game',
    banner: '/assets/game-logo/rps.png',
    status: true,
    href: '/game',
  },
  {
    name: 'Cryptosheesh',
    desc: 'Casual Game',
    banner: '/assets/game-logo/sheesh.png',
    status: false,
    href: '/game',
  },
  {
    name: 'Anito Legends',
    desc: 'Casual blockchain game launched in Aug 2022 by an all-Filipino team! (Polygon)',
    banner: '/assets/game-logo/anito.png',
    status: false,
    href: '/game',
  },
];

export default function Menu() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [referrals, setReferrals] = useState<any>([]);

  const _telegram_user_id = localStorage.getItem('telegram_user_id');
  const referral_link = `https://t.me/sheeshgamesbot/sheesh?startapp=ref-${_telegram_user_id}`;

  const showModal = () => {
    setShow(true);
    getReferrals();
  };

  const hideModal = () => {
    setShow(false);
  };

  useEffect(() => {
    if (show) {
      // Disables Background Scrolling whilst the SideDrawer/Modal is open
      if (typeof window != 'undefined' && window.document) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      // Unsets Background Scrolling to use when SideDrawer/Modal is closed
      document.body.style.overflow = 'unset';
    }
  }, [show]);

  const getReferrals = async () => {
    // const _hashFromClient = '4a1d1b8b639d8b6d9d7bd582d9ca80a07bd44700578eb7600db02a274617397b';
    // const _telegram_user_id = '5580471371';
    const _hashFromClient = localStorage.getItem('hashFromClient');
    const _telegram_user_id = localStorage.getItem('telegram_user_id');

    try {
      fetch(
        `${process.env.NEXT_PUBLIC_BASEURL}/bot/referrals?hashFromClient=${_hashFromClient}&telegram_user_id=${_telegram_user_id}&page=1&page_size=10`,
        {
          method: 'GET',
        },
      )
        .then((res) => res.json())
        .then((data) => {
          setReferrals(data);
          console.log('Referrals: ', data);
          setLoading(false);
        });
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {show && (
        <div className="fixed inset-0 z-[2] p-[18px] flex flex-1 flex-col h-full bg-[url('/assets/menu-bg.png')] bg-cover bg-center bg-no-repeat">
          <div onClick={hideModal} className="relative flex pb-[22px]">
            <LuChevronLeft className="text-white size-6" />
            <div>Referrals</div>
          </div>
          <div className="bg-[#161D28] p-[18px] rounded-xl">
            <h1 className="text-white text-[18px] font-bold text-center">I refer now!</h1>
            <p className="text-[#898989] text-[13px] text-center mb-[10px]">
              Refer and introduce the platform <br /> to your friends!
            </p>
            <div className="relative flex">
              <input
                type="text"
                readOnly
                placeholder={referral_link}
                className="h-[45px] w-full rounded-xl text-[13px] bg-[#293947] line-clamp-1 py-4 pl-4 pr-16 focus:outline-none focus:ring-transparent focus:ring-offset-transparent"
              />
              <button
                id="copy"
                onClick={() => {
                  clipboard.writeText(`${referral_link}`);
                  toast({
                    variant: 'default',
                    title: 'Copied',
                    duration: 2000,
                  });
                }}
                className="absolute size-8 text-center flex items-center justify-center text-[#677C8C] bg-[#151D28] rounded-lg active:scale-90 right-4 top-1/2 -translate-y-1/2"
              >
                <LuCopy className="text-lg" />
              </button>
            </div>
          </div>

          <div className="bg-[#161D28] p-[18px] rounded-xl mt-[18px] h-full">
            <h1 className="text-white text-[14px] font-medium text-center">All Referrals</h1>

            <div className="pt-[18px] space-y-[16px]">
              {referrals?.data?.referrals.map((item: any, idx: number) => (
                <div key={idx} className="flex space-x-[10px]">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" alt="" />
                  </Avatar>
                  <div className="flex flex-col">
                    <h1 className="text-white text-[13px]">{item?.invitedUser?.username}</h1>
                    <p className="text-[#898989] text-[10px]">
                      {new Date(item?.invitedUser?.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col min-h-screen overflow-hidden bg-[url('/assets/menu-bg.png')] bg-cover bg-center bg-no-repeat">
        <div className="px-[18px] flex flex-col flex-1 py-[20px] space-y-[23px]">
          <div className="relative flex">
            <input
              type="text"
              placeholder="Search for games"
              className="h-[45px] w-full rounded-xl bg-[#293947] placeholder:text-[#677C8C] py-4 pr-4 p-12 focus:outline-none focus:ring-transparent focus:ring-offset-transparent"
            />
            <LuSearch className="absolute text-[#677C8C] left-4 top-1/2 -translate-y-1/2 size-6" />
          </div>
          <div className="bg-[#161D28] py-[27px] px-[19px] rounded-xl">
            <h1 className="text-white text-[18px] font-bold uppercase mb-[10px]">Refer a friend!</h1>
            <div className="flex items-center space-x-2">
              <div>
                <LuUserPlus className="text-white text-xl" />
              </div>
              <div className="">
                <div className="text-[13px] text-white">Invite friends</div>
                <p className="line-clamp-1 text-[12px] text-[#898989]">{`${referral_link}`}</p>
              </div>

              <button
                id="copy"
                onClick={() => {
                  clipboard.writeText(`${referral_link}`);
                  toast({
                    variant: 'default',
                    title: 'Copied',
                    duration: 2000,
                  });
                }}
                className="bg-[#293947] p-3 rounded-lg active:scale-90"
              >
                <LuCopy className="text-lg" />
              </button>
            </div>

            <div onClick={showModal} className="text-white text-[12px] mt-[10px] hover:text-blue-700">
              View all invites
            </div>
          </div>

          <div className="flex flex-col space-y-[8px]">
            {Games.map((game, index) => (
              <div
                key={index}
                className={`bg-[#161D28] p-[20px] rounded-xl drop-shadow-md" ${game.status ? '' : 'opacity-40'}`}
              >
                <div className="flex space-x-[10px]">
                  <img className="aspect-square h-[75px]" src={game.banner} alt="" />
                  <div className="flex flex-col flex-1">
                    <h1 className="text-white text-[13px] font-medium">{game.name}</h1>
                    <p className="text-[12px] text-[#898989] line-clamp-3 pr-1">{game.desc}</p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => router.push(game.href)}
                      disabled={!game.status}
                      className="bg-white text-black disabled:bg-white/50 h-fit rounded-md text-[15px] py-1.5 px-[20px] text-center uppercase font-medium"
                    >
                      {game.status ? 'Play' : 'Soon'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-[#161D28] py-[27px] px-[19px] rounded-xl">
            <h1 className="text-white text-[18px] font-bold uppercase">Sheesh Games Community</h1>
            <p className="text-white text-[15px] mb-[20px]">Home for Telegram Gamer OGs</p>
            <a
              href="https://t.me/sheeshgames"
              className={`uppercase text-black text-center bg-white py-2 px-10 w-[70px] rounded-md text-[15px] font-semibold`}
            >
              Join
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

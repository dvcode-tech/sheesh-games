'use client';

import { NextPage } from 'next';
import { useEffect, useRef, useState } from 'react';

import '../_assets/globals.css';
import { useRouter } from 'next/navigation';

const Pick = [
  {
    name: 'rock',
    src: '/assets/player-rock.png',
    pick: 0,
  },
  {
    name: 'paper',
    src: '/assets/player-paper.png',
    pick: 1,
  },
  {
    name: 'scissor',
    src: '/assets/player-scissor.png',
    pick: 3,
  },
];

const CompPick = [
  {
    name: 'rock',
    src: '/assets/computer-rock.png',
    pick: 0,
  },
  {
    name: 'paper',
    src: '/assets/computer-paper.png',
    pick: 1,
  },
  {
    name: 'scissor',
    src: '/assets/computer-scissor.png',
    pick: 3,
  },
];

const PICKS = ['Rock', 'Paper', 'Scissors'];

const Game: NextPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [verifiedData, setVerifiedData] = useState<any>(null);
  const [resultData, setResultData] = useState<any>(null);
  const [gameResult, setGameResult] = useState<number>();
  const [battleCount, setbattleCount] = useState<number>(0);
  const [nextPlayTimer, setNextPlayTimer] = useState<any>();
  const [pick, setPick] = useState<number>();
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [leaderboard, setLeaderboard] = useState<any>([]);
  const [playHistory, setPlayHistory] = useState<any>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMatchHistory, setShowMatchHistory] = useState(false);

  useEffect(() => {
    if (verifiedData === null) {
      onVerify();
    }

    if (Date.now() > verifiedData?.data?.user?.next_play_at && verifiedData?.data?.user?.remaining_play_count <= 0) {
      setbattleCount(10);
    }

    getLeaderboards();
    console.log('leaderboard: ', leaderboard);
  }, [verifiedData]);

  const onVerify = async () => {
    try {
      const _telegram_user_id = localStorage.getItem('telegram_user_id');
      const _hashFromClient = localStorage.getItem('hashFromClient');

      // Debugging
      // const _hashFromClient = '8d2c562dea4ffaf88e448f184a355af9a463c73c4e529ed51e08189ee51baa48';
      // const _telegram_user_id = '5580471371';

      fetch(`${process.env.NEXT_PUBLIC_BASEURL}/bot/verify`, {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          telegram_user_id: _telegram_user_id,
          hashFromClient: _hashFromClient,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setVerifiedData(data);
          setbattleCount(data?.data?.user?.remaining_play_count);
          setNextPlayTimer(data?.data?.user?.next_play_at);
          setLoading(false);
        });
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const getLeaderboards = async () => {
    try {
      fetch(`${process.env.NEXT_PUBLIC_BASEURL}/bot/rps/leaderboard`, {
        method: 'GET',
      })
        .then((res) => res.json())
        .then((data) => {
          setLeaderboard(data);
          console.log('leaderboard: ', data);
          setLoading(false);
        });
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const getPlayHistory = async () => {
    const _hashFromClient = localStorage.getItem('hashFromClient');
    const _telegram_user_id = localStorage.getItem('telegram_user_id');

    // Debugging
    // const _hashFromClient = '8d2c562dea4ffaf88e448f184a355af9a463c73c4e529ed51e08189ee51baa48';
    // const _telegram_user_id = '5580471371';
    try {
      fetch(
        `${process.env.NEXT_PUBLIC_BASEURL}/bot/rps/playhistory?hashFromClient=${_hashFromClient}&telegram_user_id=${_telegram_user_id}&page=1&page_size=10`,
        {
          method: 'GET',
        },
      )
        .then((res) => res.json())
        .then((data) => {
          setPlayHistory(data);
          console.log('History: ', data);
          setLoading(false);
        });
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const onPick = async (_pick: number) => {
    const _telegram_user_id = localStorage.getItem('telegram_user_id');
    const _hashFromClient = localStorage.getItem('hashFromClient');

    // Debugging
    // const _hashFromClient = '8d2c562dea4ffaf88e448f184a355af9a463c73c4e529ed51e08189ee51baa48';
    // const _telegram_user_id = '5580471371';

    setPick(_pick);

    fetch(`${process.env.NEXT_PUBLIC_BASEURL}/bot/play`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        telegram_user_id: _telegram_user_id,
        hashFromClient: _hashFromClient,
        pick: _pick,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setResultData(data);
        setIsSelected(false);
        setPick(undefined);

        removeWarmupMatch();
        playMatch();

        setbattleCount(data?.data?.remaining_play_count);
        setNextPlayTimer(data?.data?.next_play_at);

        if (data?.data?.cpuPick === data?.data?.playerPick) {
          setGameResult(0);
          console.log('DRAW!');
        } else if (data?.data?.playerWon) {
          setGameResult(1);
          console.log('Player Win!');
        } else if (data?.data?.cpuWon) {
          setGameResult(2);
          console.log('CPU Win!');
        }
      });
  };

  const playerSwing = useRef<HTMLImageElement>(null);
  const cpuSwing = useRef<HTMLImageElement>(null);
  const playerSlam = useRef<HTMLImageElement>(null);
  const cpuSlam = useRef<HTMLImageElement>(null);

  const playWarmupMatch = () => {
    if (playerSwing.current) {
      playerSwing.current.classList.add('player');
    }
    if (cpuSwing.current) {
      cpuSwing.current.classList.add('cpu');
    }
  };

  const removeWarmupMatch = () => {
    if (playerSwing.current) {
      playerSwing.current.classList.remove('player');
    }
    if (cpuSwing.current) {
      cpuSwing.current.classList.remove('cpu');
    }
  };

  const playMatch = () => {
    if (playerSlam.current) {
      playerSlam.current.classList.add('slamPlayer');
    }
    if (cpuSlam.current) {
      cpuSlam.current.classList.add('slamCpu');
    }
  };

  const removeMatch = () => {
    if (playerSlam.current) {
      playerSlam.current.classList.remove('player');
    }
    if (cpuSlam.current) {
      cpuSlam.current.classList.remove('cpu');
    }
  };

  useEffect(() => {
    if (isSelected) {
      setResultData(null);
      removeMatch();
      playWarmupMatch();
    } else {
      removeWarmupMatch();
    }
  });

  //player won = 1, cpu won = 2, draw = 0
  const Checker = (playerPick: number, cpuPick: number) => {
    if (PICKS[playerPick] != PICKS[cpuPick]) {
      if (PICKS[playerPick] == 'Rock') {
        if (PICKS[cpuPick] == 'Scissors') {
          return 1;
        }
        if (PICKS[cpuPick] == 'Paper') {
          return 2;
        }
      }
      if (PICKS[playerPick] == 'Paper') {
        if (PICKS[cpuPick] == 'Scissors') {
          return 2;
        }
        if (PICKS[cpuPick] == 'Rock') {
          return 1;
        }
      }
      if (PICKS[playerPick] == 'Scissors') {
        if (PICKS[cpuPick] == 'Paper') {
          return 1;
        }
        if (PICKS[cpuPick] == 'Rock') {
          return 2;
        }
      }
    }

    return 0;
  };

  const showModal = () => {
    setShowLeaderboard(true);
  };

  const hideModal = () => {
    setShowLeaderboard(false);
  };
  const showMatchHistoryModal = () => {
    setShowMatchHistory(true);
  };

  const hideMatchHistoryModal = () => {
    setShowMatchHistory(false);
  };

  const [currentTime, setCurrentTime] = useState<any>();

  useEffect(() => {
    const updateDateTime = () => {
      const time = Date.now();
      setCurrentTime(time);
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (currentTime >= nextPlayTimer && battleCount === 0) {
      console.log('Battle Count Reset');
      setbattleCount(10);
      setIsSelected(false);
      setResultData(null);
    } else if (currentTime <= nextPlayTimer && battleCount === 0) {
      console.log('Play Again on: ', new Date(nextPlayTimer).toLocaleString());
    }
  }, [currentTime]);

  useEffect(() => {
    if (showLeaderboard && showMatchHistory) {
      // Disables Background Scrolling whilst the SideDrawer/Modal is open
      if (typeof window != 'undefined' && window.document) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      // Unsets Background Scrolling to use when SideDrawer/Modal is closed
      document.body.style.overflow = 'unset';
    }
  }, [showLeaderboard, showMatchHistory]);

  return (
    <>
      {verifiedData && verifiedData ? (
        <div className="relative flex flex-1 min-h-screen overflow-hidden bg-black bg-[url('/assets/bg.png')] bg-cover bg-center bg-no-repeat">
          <div className="flex flex-col flex-1">
            <div className="relative flex flex-1">
              <div className="">
                <button
                  onClick={() => router.back()}
                  className="absolute top-4 left-4 drop-shadow-md w-[50px] h-[50px] bg-[url('/assets/back-btn.png')] bg-cover bg-center bg-no-repeat"
                ></button>
                <button
                  onClick={() => {
                    showModal();
                    getLeaderboards();
                  }}
                  className="absolute top-4 right-4 drop-shadow-md w-[50px] h-[50px] bg-[url('/assets/leaderboards.png')] bg-cover bg-center bg-no-repeat"
                ></button>
                <button
                  onClick={() => {
                    getPlayHistory();
                    showMatchHistoryModal();
                  }}
                  className="absolute top-20 right-4 drop-shadow-md w-[50px] h-[50px] bg-[url('/assets/history-btn.png')] bg-cover bg-center bg-no-repeat"
                ></button>

                {showLeaderboard && (
                  <div className="fixed inset-0 z-[2] flex flex-1 flex-col h-full bg-[#CA4918]">
                    <div className="relative">
                      <div className="sticky flex p-[18px]">
                        <div onClick={hideModal}>
                          <img src="/assets/back2.png" alt="" />
                        </div>
                        <button className="h-[30px] bg-[url('/assets/back2.png')] bg-cover bg-center bg-no-repeat"></button>
                        <div className="text-white ml-[15px] font-semibold text-[23px] leading-none">Leaderboard</div>
                      </div>
                    </div>

                    <div className="bg-[#280F05] h-full p-[18px] border-t-4 border-[#FAAA34] overflow-y-scroll">
                      <div className="h-full relative">
                        <div className="flex flex-1 text-[12px] p-2 text-center">
                          <div className="w-[65px] font-semibold text-left">Ranks</div>
                          <div className="w-[127px] font-semibold text-left">Players</div>
                          <div className="w-[65px] font-semibold">Wins</div>
                          <div className="w-[65px] font-semibold">Losses</div>
                        </div>
                        {leaderboard?.data.map((data: any, index: number) => (
                          <div
                            key={index}
                            className="flex bg-[#FFB503] mb-[6px] rounded-xl shadow-inner text-[13px] p-[16px] text-[#722101] text-center"
                          >
                            <div className="w-[65px] font-bold text-left px-2">{index + 1}</div>
                            <div className="w-[127px] font-bold text-left">{data?.username}</div>
                            <div className="w-[65px] font-bold">{data?.wins}</div>
                            <div className="w-[65px] font-bold">{data?.losses}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {showMatchHistory && (
                  <div className="fixed inset-0 z-[2] flex flex-1 flex-col h-full bg-[#CA4918]">
                    <div className="relative">
                      <div className="sticky flex p-[18px]">
                        <div onClick={hideMatchHistoryModal}>
                          <img src="/assets/back2.png" alt="" />
                        </div>
                        <button className="h-[30px] bg-[url('/assets/back2.png')] bg-cover bg-center bg-no-repeat"></button>
                        <div className="text-white ml-[15px] font-semibold text-[23px] leading-none">Match History</div>
                      </div>
                    </div>
                    <div className="bg-[#280F05] h-full p-[18px] border-t-4 border-[#FAAA34] overflow-y-scroll">
                      <div className="h-full relative]">
                        {playHistory?.data?.playHistories.map((data: any, index: number) => (
                          <div
                            key={index}
                            className={`flex mb-[6px] rounded-xl text-[13px] p-2 text-center h-[100px] ${Checker(data?.playerPick, data?.cpuPick) == 0 ? 'bg-[#636363]' : Checker(data?.playerPick, data?.cpuPick) == 1 ? 'bg-[#0162A4]' : Checker(data?.playerPick, data?.cpuPick) == 2 ? 'bg-[#CD3D36]' : ''}`}
                          >
                            <div className="flex flex-1 justify-between">
                              <div className="flex">
                                <div className="text-[12px] font-bold uppercase">You</div>
                                <div className="flex items-center">
                                  <img
                                    className="h-[52px] w-[80px] object-scale-down"
                                    src={`${data?.playerPick === 0 ? '/assets/player-rock.png' : data?.playerPick === 1 ? '/assets/player-paper.png' : data?.playerPick === 2 ? '/assets/player-scissor.png' : ''}`}
                                    alt=""
                                  />
                                </div>
                              </div>
                              <div className="flex flex-col justify-between">
                                <div>
                                  <img
                                    className="h-[20px] w-[100px] object-scale-down"
                                    src={`${Checker(data?.playerPick, data?.cpuPick) == 0 ? '/assets/draw.png' : Checker(data?.playerPick, data?.cpuPick) == 1 ? '/assets/victory.png' : Checker(data?.playerPick, data?.cpuPick) == 2 ? '/assets/defeat.png' : ''}`}
                                    alt=""
                                  />
                                </div>
                                <div className="flex flex-col text-white">
                                  <div className="text-[9px]">{new Date(data?.created_at).toLocaleString()}</div>
                                  <div className="text-[9px] uppercase">{`battle ID: ${data?.id}`}</div>
                                </div>
                              </div>

                              <div className="flex">
                                <div className="flex items-center">
                                  <img
                                    className="h-[52px] w-[80px] object-scale-down"
                                    src={`${data?.cpuPick === 0 ? '/assets/computer-rock.png' : data?.cpuPick === 1 ? '/assets/computer-paper.png' : data?.cpuPick === 2 ? '/assets/computer-scissor.png' : ''}`}
                                    alt=""
                                  />
                                </div>
                                <div className="text-[12px] font-bold uppercase">CPU</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Match Result */}
              <div className="absolute bottom-0 w-full">
                {resultData ? (
                  <div className="flex items-center justify-center">
                    {gameResult === 0 ? (
                      <img className="w-[260px] drop-shadow-xl" src="/assets/draw.png" alt="" />
                    ) : gameResult === 1 ? (
                      <img className="w-[260px] drop-shadow-xl" src="/assets/victory.png" alt="" />
                    ) : gameResult === 2 ? (
                      <img className="w-[260px] drop-shadow-xl" src="/assets/defeat.png" alt="" />
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            {resultData ? (
              <div className="relative flex flex-1">
                <img
                  ref={playerSlam}
                  className="absolute -left-6 top-14 w-[180px] pointer-events-none"
                  src={`${Pick[resultData?.data?.playerPick].src}`}
                  alt=""
                />
                <img
                  ref={cpuSlam}
                  className="absolute -right-6 top-14 w-[180px] pointer-events-none"
                  src={`${CompPick[resultData?.data?.cpuPick].src}`}
                  alt=""
                />
              </div>
            ) : (
              <div className="relative flex flex-1">
                {isSelected ? (
                  <div className="relative flex flex-1">
                    <img
                      ref={playerSwing}
                      className="absolute -left-6 top-14 w-[180px] pointer-events-none"
                      src="/assets/player-rock.png"
                      alt=""
                    />
                    <img
                      ref={cpuSwing}
                      className="absolute -right-6 top-14 w-[180px] pointer-events-none"
                      src="/assets/computer-rock.png"
                      alt=""
                    />
                  </div>
                ) : (
                  <div className="relative flex flex-1">
                    <img
                      className="absolute -left-6 top-14 w-[180px] pointer-events-none"
                      src="/assets/player-rock.png"
                      alt=""
                    />
                    <img
                      className="absolute -right-6 top-14 w-[180px] pointer-events-none"
                      src="/assets/computer-rock.png"
                      alt=""
                    />
                  </div>
                )}
              </div>
            )}

            <div className="relative flex flex-1 flex-col">
              <div className="w-full flex items-center justify-center h-full gap-2">
                <button
                  onClick={() => {
                    onPick(0);
                    setIsSelected(true);
                  }}
                  disabled={isSelected || battleCount <= 0}
                  className={`w-[110px] h-[110px] drop-shadow-xl bg-[url('/assets/rock-btn.png')] bg-cover bg-center bg-no-repeat ${pick === 0 || battleCount === 0 ? 'opacity-50 scale-90' : ''}`}
                ></button>
                <button
                  onClick={() => {
                    onPick(1);
                    setIsSelected(true);
                  }}
                  disabled={isSelected || battleCount <= 0}
                  className={`w-[110px] h-[110px] drop-shadow-xl bg-[url('/assets/paper-btn.png')] bg-cover bg-center bg-no-repeat ${pick === 1 || battleCount === 0 ? 'opacity-50 scale-90' : ''}`}
                ></button>
                <button
                  onClick={() => {
                    onPick(2);
                    setIsSelected(true);
                  }}
                  disabled={isSelected || battleCount <= 0}
                  className={`w-[110px] h-[110px] drop-shadow-xl bg-[url('/assets/scissors-btn.png')] bg-cover bg-center bg-no-repeat ${pick === 2 || battleCount === 0 ? 'opacity-50 scale-90' : ''}`}
                ></button>
              </div>
              {battleCount <= 0 ? (
                <div className="relative w-full flex items-center justify-center h-[70px]">
                  <img className="h-[70px] pb-2" src="/assets/remaining_battle.png" alt="" />
                  <div className="absolute top-1.5 tracking-wide text-[13px] font-impact uppercase text-[#722101] drop-shadow-md">
                    Play again on
                  </div>
                  <div className="absolute bottom-5 tracking-wide text-[15px] font-impact uppercase text-[#722101] drop-shadow-md">
                    {new Date(nextPlayTimer).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className="relative w-full flex items-center justify-center h-[70px]">
                  <img className="h-[70px] pb-2" src="/assets/remaining_battle.png" alt="" />
                  <div className="absolute top-1.5 tracking-wide text-[13px] font-impact uppercase text-[#722101] drop-shadow-md">
                    Remaining Battle count
                  </div>
                  <div className="absolute bottom-2.5 tracking-wide text-[28px] font-impact uppercase text-[#722101] drop-shadow-md">
                    {battleCount}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col min-h-screen items-center justify-between overflow-hidden bg-[url('/assets/menu-bg.png')] bg-cover bg-center bg-no-repeat">
          <img className="pt-[180px] w-[275px] object-scale-down" src="/assets/rps-logo.png" alt="" />
          <div className="flex w-full pb-14 items-center justify-center">
            <div className="text-white text-[15px] pb-2">Loading Game...</div>
          </div>
        </div>
      )}
    </>
  );
};

export default Game;

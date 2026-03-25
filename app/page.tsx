'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useConnect, useDisconnect } from 'wagmi';
import { config } from '@/lib/wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { injected } from 'wagmi/connectors';

const queryClient = new QueryClient();

function CheckInApp() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [streak, setStreak] = useState<number>(0);
  const [lastCheckIn, setLastCheckIn] = useState<number>(0);

  const { data: userData } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUser',
    args: [address!],
    query: {
      enabled: !!address,
    },
  });

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (userData) {
      setLastCheckIn(Number(userData[0]));
      setStreak(Number(userData[1]));
    }
  }, [userData]);

  const handleCheckIn = () => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'checkIn',
    });
  };

  const canCheckIn = () => {
    const now = Math.floor(Date.now() / 1000);
    return now >= lastCheckIn + 86400;
  };

  const getBadgeLevel = () => {
    if (streak >= 30) return 'Legendary';
    if (streak >= 14) return 'Epic';
    if (streak >= 7) return 'Rare';
    if (streak >= 3) return 'Uncommon';
    return 'Common';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Daily Check-in Badge
        </h1>

        {!isConnected ? (
          <button
            onClick={() => connect({ connector: injected() })}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            Connect Wallet
          </button>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Connected:</p>
              <p className="font-mono text-sm break-all">{address}</p>
              <button
                onClick={() => disconnect()}
                className="mt-2 text-sm text-red-600 hover:text-red-800"
              >
                Disconnect
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{streak}</p>
                <p className="text-sm text-gray-600">Streak</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm text-gray-600">Last Check-in</p>
                <p className="text-sm">
                  {lastCheckIn ? new Date(lastCheckIn * 1000).toLocaleDateString() : 'Never'}
                </p>
              </div>
            </div>

            <button
              onClick={handleCheckIn}
              disabled={!canCheckIn() || isConfirming}
              className={`w-full font-semibold py-3 px-6 rounded-lg transition duration-200 ${
                canCheckIn() && !isConfirming
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isConfirming ? 'Checking in...' : canCheckIn() ? 'Check In' : 'Already checked today'}
            </button>

            {streak >= 1 && (
              <div className="text-center">
                <p className="text-sm text-gray-600">Badge Level:</p>
                <p className="text-lg font-semibold">{getBadgeLevel()}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <CheckInApp />
      </QueryClientProvider>
    </WagmiProvider>
  );
}
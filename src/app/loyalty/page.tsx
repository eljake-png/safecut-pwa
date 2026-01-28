import React, { useEffect, useState } from 'react';
import { getLoyaltyData, incrementHaircutCount } from '../../lib/loyalty';

const LoyaltyPage = () => {
  const [loyaltyData, setLoyaltyData] = useState({ haircutsCount: 0, rewards: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLoyaltyData('client-id'); // Replace 'client-id' with actual client ID logic
        setLoyaltyData(data);
      } catch (error) {
        console.error('Error fetching loyalty data:', error);
      }
    };

    fetchData();
  }, []);

  const handleIncrementHaircut = async () => {
    try {
      await incrementHaircutCount('client-id'); // Replace 'client-id' with actual client ID logic
      const updatedData = await getLoyaltyData('client-id');
      setLoyaltyData(updatedData);
    } catch (error) {
      console.error('Error updating haircut count:', error);
    }
  };

  return (
    <div className='bg-gray-800 text-white min-h-screen p-6'>
      <h1 className='text-3xl mb-4'>Loyalty Dashboard</h1>
      <button
        onClick={handleIncrementHaircut}
        className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6'
      >
        Increment Haircut Count
      </button>
      <div className='mb-8'>
        <h2 className='text-xl mb-2'>Progress</h2>
        <div className='w-full bg-gray-700 rounded-full h-2.5 dark:bg-gray-700'>
          <div
            className='bg-blue-600 h-2.5 rounded-full'
            style={{ width: `${(loyaltyData.haircutsCount / 10) * 100}%` }} // Example progress calculation
          ></div>
        </div>
        <p className='mt-2'>Haircuts: {loyaltyData.haircutsCount} / 10</p> {/* Example target */}
      </div>
      <div>
        <h2 className='text-xl mb-2'>Haircut History</h2>
        <ul>
          {loyaltyData.rewards.map((reward, index) => (
            <li key={index} className='mb-1'>
              {reward.name}: {reward.description}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LoyaltyPage;
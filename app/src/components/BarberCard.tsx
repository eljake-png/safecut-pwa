import React from 'react';

interface Barber {
  id: number;
  name: string;
  photoUrl: string;
}

const BarberCard = ({ barber }: { barber: Barber }) => {
  return (
    <div className='bg-gray-700 p-4 rounded-lg flex items-center mb-4'>
      <img src={barber.photoUrl} alt={`${barber.name}'s photo`} className='w-20 h-20 rounded-full mr-4' />
      <div>
        <h3 className='text-white text-xl'>{barber.name}</h3>
        <button className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>Забронювати</button>
      </div>
    </div>
  );
};

export default BarberCard;
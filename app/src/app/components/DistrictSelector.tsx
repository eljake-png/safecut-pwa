import React from 'react';

const DistrictSelector = ({ onSelectDistrict }) => {
  const districts = ['Північний', 'Ювілейний', 'Щасливе'];

  return (
    <div className='bg-gray-800 text-white p-4 rounded-lg'>
      <h2 className='text-xl mb-4'>Обрати район</h2>
      <ul>
        {districts.map((district, index) => (
          <li key={index} className='cursor-pointer hover:underline' onClick={() => onSelectDistrict(district)}>{district}</li>
        ))}
      </ul>
    </div>
  );
};

export default DistrictSelector;
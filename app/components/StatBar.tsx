"use client";

import React from "react";

export default function StatsBar() {
  const stats = [
    { label: "Top Speed", value: 60 },
    { label: "Acceleration", value: 70 },
    { label: "Braking", value: 40 },
    { label: "Grip", value: 80 },
  ];

  return (
    <div className='flex flex-col gap-4 p-4 text-white'>
      {stats.map((stat, index) => (
        <div key={index} className='flex items-center gap-4'>
          <span className='w-32 text-right'>{stat.label}</span>
          <div className='flex-1 h-12 relative overflow-hidden'>
            <div
              className='h-full flex'
              style={{
                width: `${stat.value}%`,
              }}
            >
              {/* 빨간색 부분 */}
              <div
                className='h-full'
                style={{
                  width: `${stat.value * 0.5}%`,
                  background: "linear-gradient(to right, #ff5050, #ff704d)",
                }}
              />
              {/* 초록색 부분 */}
              <div
                className='h-full'
                style={{
                  width: `${stat.value * 0.5}%`,
                  background: "linear-gradient(to right, #66ff66, #00e600)",
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

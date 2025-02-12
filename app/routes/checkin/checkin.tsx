import type { Route } from "./+types/checkin";

import search from "./search.png";
import qrcode from "./qrcode.png";
import { Link } from "react-router";

export default function Welcome() {
  return (
    <main className='flex items-center justify-center pt-16 pb-4 bg-[hsla(207,_82%,_4%,_1)] min-h-dvh'>
      <div className='space-y-16 max-w-4xl mx-auto text-white'>
        <div className='space-y-2 text-center text-balance'>
          <h1 className='font-mono text-7xl'>AFRICA TECHNOLOGY EXPO</h1>
          <p className='text-xl'>
            The Africa Technology Expo (ATE) is where Africa’s tech and business
            leaders gather with one clear goal: to make deals happen. It’s a
            space where enterprises, operators, and industry giants converge to
            showcase innovations, build partnerships, and deliver results.
          </p>
        </div>

        <div className='flex gap-8 justify-center'>
          {methods?.map((method, index) => (
            <Link
              key={index}
              to={`/checkin/${method.method}`}
              className='flex flex-col items-center justify-center space-y-4 aspect-square bg-white text-black size-64 rounded-3xl'
              viewTransition
            >
              <img src={method.image} alt='search' className='w-44 h-44' />
              <h2>{method.title}</h2>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

const methods = [
  {
    method: "qrcode",
    title: "Pickup tag with QR Code",
    image: qrcode,
  },
  {
    method: "search",
    title: "Pickup tag with Search",
    image: search,
  },
];

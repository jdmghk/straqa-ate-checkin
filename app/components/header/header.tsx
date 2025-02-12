import { Link } from "react-router";
import logo from "./logo.svg";

export default function Header() {
  return (
    <header className='w-screen py-6 bg-white shadow-lg shadow-white/20 fixed top-0 left-0'>
      <nav className='flex items-center justify-between mx-auto max-w-screen-2xl w-full'>
        <a
          href='/'
          target='_blank'
          rel='noopener noreferrer'
          className='max-w-[9.6rem] w-full'
        >
          <img src={logo} alt='Straqa' className='w-full' />
        </a>

        <Link to='/logout' viewTransition>
          Logout
        </Link>
      </nav>
    </header>
  );
}

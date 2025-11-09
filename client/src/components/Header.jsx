import React from "react";
import useMobile from "../hooks/useMobile";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import Search from "./Search";
import { FaRegUserCircle } from "react-icons/fa";

const Header = () => {
  const [isMobile] = useMobile();
  const location = useLocation();

  // when you are on /search and mobile => only show search bar
  const isSearchPage = location.pathname === "/search";

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-t from-purple-400 to-white shadow-md">
      <div className="container mx-auto px-3 py-2 flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* ✅ Show this part only if NOT (search page + mobile) */}
        {!(isSearchPage && isMobile) && (
          <div className="w-full flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                width={isMobile ? 120 : 170}
                height={50}
                alt="logo"
                className="object-contain"
              />
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Mobile user icon */}
              <button className="text-neutral-600 lg:hidden">
                <FaRegUserCircle size={26} />
              </button>

              {/* Desktop: Login & My Cart */}
              <div className="hidden lg:block text-neutral-700 font-semibold">
                Login and My Cart
              </div>
            </div>
          </div>
        )}

        {/* ✅ Search Section */}
        <div className="w-full">
          <Search />
        </div>
      </div>
    </header>
  );
};

export default Header;
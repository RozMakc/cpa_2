import { useEffect, useRef, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { DropdownItem } from "./ui/dropdown/DropdownItem";
import { Dropdown } from "./ui/dropdown/Dropdown";
import { Ellipsis } from "lucide-react";


export default function OfferDropdown({offer_id}) {
  const props = usePage().props
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

  return (
    <div className=" z-1" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
      >
        <Ellipsis />
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute z-99 right-20 mt-[17px] flex w-[190px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <ul className="flex flex-col gap-1">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to={route('offer.link.create', offer_id)}
              className="px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Получить ссылку
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to={route('offer.show', offer_id)}
              className="gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Подробнее
            </DropdownItem>
          </li>
        </ul>
      </Dropdown>
    </div>
  );
}
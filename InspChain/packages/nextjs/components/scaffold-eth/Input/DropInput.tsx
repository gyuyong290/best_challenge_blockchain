import { useState, useRef, useCallback, useEffect } from "react";
import { InputBase } from "./InputBase";

type DropdownItem = {
  id: string;
  label: string;
};

const dropdownItems: DropdownItem[] = [
  { id: "1", label: "Option 1" },
  { id: "2", label: "Option 2" },
  { id: "3", label: "Option 3" },
];

export const DropInput = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [filteredItems, setFilteredItems] = useState<DropdownItem[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle input change
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    setFilteredItems(
      dropdownItems.filter(item =>
        item.label.toLowerCase().includes(value.toLowerCase())
      )
    );
    setShowDropdown(true);
  }, []);

  // Handle item selection
  const handleItemSelect = (item: DropdownItem) => {
    setInputValue(item.label);
    setShowDropdown(false);
  };

  // Hide dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <InputBase
        name="address"
        value={inputValue}
        onChange={handleInputChange}
        placeholder="Enter address"
        reFocus={true}
      />
      {showDropdown && filteredItems.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-2 cursor-pointer hover:bg-gray-200"
              onClick={() => handleItemSelect(item)}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

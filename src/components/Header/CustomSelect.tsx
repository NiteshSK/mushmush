import React, { useState, useEffect } from "react";

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
}

const CustomSelect = ({ options, value, onChange }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(opt => opt.value === value) || options[0];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: Option) => {
    if (onChange) {
      onChange(option.value);
    }
    toggleDropdown();
  };

  useEffect(() => {
    // closing modal while clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as Element)?.closest(".dropdown-content")) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="dropdown-content custom-select relative" style={{ width: "200px" }}>
      <div
        className={`select-selected whitespace-nowrap ${
          isOpen ? "select-arrow-active" : ""
        }`}
        onClick={toggleDropdown}
      >
        {selectedOption.label}
      </div>
      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {options.slice(1, -1).map((option, index) => (
          <div
            key={index}
            onClick={() => handleOptionClick(option)}
            className={`select-item ${
              selectedOption === option ? "same-as-selected" : ""
            }`}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;

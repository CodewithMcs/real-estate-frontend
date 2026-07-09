"use client";

import { useState } from "react";

type PopupProps = {
  buttonText?: string;
  title?: string;
  message?: string;
};

export function Popup({
  buttonText = "Open Popup",
  title = "Popup Title",
  message = "This is a simple popup component.",
}: PopupProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="mt-6 w-fit rounded-md bg-black px-4 py-2 text-white"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        {buttonText}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-md bg-white p-6 text-black shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">{title}</h2>
              <button
                className="text-2xl leading-none text-gray-500 hover:text-black"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                x
              </button>
            </div>
            <p className="mt-4 text-gray-700">{message}</p>
            <button
              className="mt-6 rounded-md bg-black px-4 py-2 text-white"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

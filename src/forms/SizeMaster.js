import React from "react";

const SizeMaster = () => {
  return (
    <form className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Size Master</h2>
      <div>
        <label className="block">Size</label>
        <input type="text" className="border p-2 rounded w-full" />
      </div>
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Save
      </button>
    </form>
  );
};

export default SizeMaster;

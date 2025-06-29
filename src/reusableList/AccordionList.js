import React from "react";
import AccordionCard from "./AccordionCard";
import "../css/AccordionList.css";

const AccordionList = ({
  data,
  controls,
  onEdit,
  onDelete,
  page,
  setPage,
  pageSize,
}) => {
  const totalPages = Math.ceil(data.length / pageSize);

  const pagedData = data.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div className="accordion-list">
      {pagedData.length === 0 && <p className="no-records">No records found</p>}

      {pagedData.map((item) => (
        <AccordionCard
          key={item._id}
          item={item}
          controls={controls}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      <div className="accordion-pagination">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
        >
          ◀ Previous
        </button>

        <span>
          Page {page + 1} of {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
          disabled={page >= totalPages - 1}
        >
          Next ▶
        </button>
      </div>
    </div>
  );
};

export default AccordionList;

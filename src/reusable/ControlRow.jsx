// ControlRow.jsx
import React from "react";
import EntnoGenerator from "./EntnoGenerator"; // adjust path
import ConditionalControl from "./ConditionalControl"; // adjust path

const ControlRow = ({
  ctrl,
  index,
  draggedIndex,
  handleDragStart,
  handleDragEnter,
  handleDragEnd,
  updateControl,
  removeControl,
  addControl,
  saberpmenu,
  handleLabelBlur,
}) => {
  return (
    <div
      key={ctrl.id}
      className="control-row"
      draggable
      onDragStart={() => handleDragStart(index)}
      onDragEnter={() => handleDragEnter(index)}
      onDragEnd={handleDragEnd}
      onDragOver={(e) => e.preventDefault()} // allow drop
      style={{
        border:
          draggedIndex === index ? "2px dashed #4a90e2" : "1px solid #ccc",
        padding: "10px",
        marginBottom: "10px",
        backgroundColor: "#fff",
        cursor: "move",
      }}
    >
      <label>{ctrl.controlType} Label:</label>
      <input
        type="text"
        placeholder="column name"
        value={ctrl.label}
        onChange={(e) => updateControl(ctrl.id, "label", e.target.value)}
        onBlur={(e) => handleLabelBlur(ctrl.id, e.target.value)}
      />

      {ctrl.controlType === "input" && (
        <>
          <input
            type="text"
            value={ctrl?.options?.join(", ")}
            onChange={(e) =>
              updateControl(
                ctrl.id,
                "options",
                e.target.value.split(",").map((opt) => opt.trim())
              )
            }
            placeholder="Label Name"
          />
          <select
            value={ctrl.dataType}
            onChange={(e) => updateControl(ctrl.id, "dataType", e.target.value)}
          >
            <option value="">Select Datatype</option>
            <option value="nvarchar">NVARCHAR</option>
            <option value="int">INT</option>
            <option value="bigint">BIGINT</option>
            <option value="decimal">DECIMAL</option>
            <option value="date">DATE</option>
            <option value="sequence">Sequence</option>
          </select>

          {ctrl.dataType !== "date" && ctrl.dataType !== "sequence" && (
            <input
              type="number"
              placeholder="Size"
              value={ctrl.size}
              onChange={(e) => updateControl(ctrl.id, "size", e.target.value)}
              style={{ width: "60px", marginLeft: "5px" }}
              min={0}
              readOnly={["int", "bigint"].includes(ctrl.dataType)}
            />
          )}

          {ctrl.dataType === "decimal" && (
            <input
              type="number"
              placeholder="Decimals"
              value={ctrl.decimals}
              onChange={(e) =>
                updateControl(ctrl.id, "decimals", e.target.value)
              }
              style={{ width: "80px", marginLeft: "5px" }}
              min={0}
            />
          )}

          {ctrl.dataType !== "nvarchar" &&
            ctrl.dataType !== "date" &&
            ctrl.dataType !== "sequence" && (
              <input
                type="number"
                placeholder="length"
                value={ctrl.length}
                onChange={(e) =>
                  updateControl(ctrl.id, "length", e.target.value)
                }
                style={{ width: "60px", marginLeft: "5px" }}
                min={0}
              />
            )}

          {ctrl.dataType === "date" && (
            <select
              value={ctrl.defaultDateOption || ""}
              onChange={(e) =>
                updateControl(ctrl.id, "defaultDateOption", e.target.value)
              }
              style={{ marginLeft: "5px" }}
            >
              <option value="">Select Date Option</option>
              <option value="currentDate">Current Date</option>
            </select>
          )}
        </>
      )}

      {ctrl.controlType === "dropdown" && (
        <>
          <input
            type="text"
            value={ctrl?.options?.join(", ")}
            onChange={(e) =>
              updateControl(
                ctrl.id,
                "options",
                e.target.value.split(",").map((opt) => opt.trim())
              )
            }
            placeholder="Label Name"
          />
          <select
            value={ctrl?.sabtable}
            onChange={(e) => updateControl(ctrl.id, "sabtable", e.target.value)}
          >
            <option value="">Or select table (sabtable)</option>
            {saberpmenu.map((menu) =>
              menu.tablename ? (
                <option key={menu._id} value={menu.tablename}>
                  {menu.tablename}
                </option>
              ) : null
            )}
          </select>
        </>
      )}

      <select
        value={ctrl.required ? "true" : "false"}
        onChange={(e) =>
          updateControl(ctrl.id, "required", e.target.value === "true")
        }
        className="required-toggle"
      >
        <option value="false">Required: No</option>
        <option value="true">Required: Yes</option>
      </select>

      {ctrl.controlType === "input" && ctrl.dataType === "sequence" && (
        <EntnoGenerator
          value={ctrl.entnoFormat}
          lastNumber={123}
          user={"ADMIN"} // or get from auth
          onChange={(formatted, template) =>
            updateControl(ctrl.id, "entnoFormat", template)
          }
        />
      )}

      {ctrl.controlType !== "checkbox" && (
        <ConditionalControl
          condition={ctrl.conditionalVisibility}
          onChange={(val) =>
            updateControl(ctrl.id, "conditionalVisibility", val)
          }
        />
      )}

      {ctrl.controlType !== "checkbox" && (
        <input
          style={{ boxShadow: "none", width: "100px", cursor: "pointer" }}
          title="Read Only"
          type="checkbox"
          checked={ctrl.readOnly || false}
          onChange={(e) => updateControl(ctrl.id, "readOnly", e.target.checked)}
          placeholder="ReadOnly"
        />
      )}
      <select
        value={ctrl.visiblity ? "true" : "false"}
        onChange={(e) =>
          updateControl(ctrl.id, "visiblity", e.target.value === "true")
        }
        className="required-toggle"
      >
        <option value="false">visiblity: No</option>
        <option value="true">visiblity: Yes</option>
      </select>

      <button
        type="button"
        onClick={() => removeControl(ctrl.id)}
        className="remove-control-btn"
      >
        ❌
      </button>

      <div
        style={{
          display: "flex",
          gap: "5px",
          alignItems: "center",
          marginTop: "5px",
        }}
      >
        <select
          value=""
          onChange={(e) => {
            const [pos, type] = e.target.value.split("|");
            if (pos === "above") addControl(type, index);
            else if (pos === "below") addControl(type, index + 1);
          }}
        >
          <option value="">➕ Add Control...</option>
          <option value={`above|input`}>⬆️ Input Above</option>
          <option value={`above|dropdown`}>⬆️ Dropdown Above</option>
          <option value={`above|checkbox`}>⬆️ Checkbox Above</option>
          <option value={`below|input`}>⬇️ Input Below</option>
          <option value={`below|dropdown`}>⬇️ Dropdown Below</option>
          <option value={`below|checkbox`}>⬇️ Checkbox Below</option>
        </select>
      </div>
    </div>
  );
};

export default ControlRow;

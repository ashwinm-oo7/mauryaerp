// GridComponent.jsx
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const GridComponent = ({
  ctrl,
  saberpmenu,
  updateControl,
  updateSubControl,
}) => {
  const [draggedSubIndex, setDraggedSubIndex] = useState(null);

  const handleSubDragStart = (subIdx) => {
    setDraggedSubIndex(subIdx);
  };

  const handleSubDragEnter = (ctrlId, subIdx) => {
    if (draggedSubIndex === null || draggedSubIndex === subIdx) return;

    const updatedSubControls = [...(ctrl.subControls || [])];
    const draggedItem = updatedSubControls[draggedSubIndex];
    updatedSubControls.splice(draggedSubIndex, 1);
    updatedSubControls.splice(subIdx, 0, draggedItem);

    updateControl(ctrl.id, "subControls", updatedSubControls);
    setDraggedSubIndex(subIdx);
  };

  const handleSubDragEnd = () => {
    setDraggedSubIndex(null);
  };

  const addSubControl = () => {
    const newSubControl = {
      id: uuidv4(),
      label: "",
      controlType: "input",
      dataType: "nvarchar",
      size: "",
      decimals: "",
      length: "",
      required: false,
      readOnly: false,
      header: "",
      sabtable: "",
      entnoFormat: "",
      autoGenerate: false,
      defaultDateOption: "",
    };

    const updatedSubControls = [...(ctrl.subControls || []), newSubControl];
    updateControl(ctrl.id, "subControls", updatedSubControls);
  };

  const removeSubControl = (subIdx) => {
    const filtered = ctrl.subControls.filter((_, i) => i !== subIdx);
    updateControl(ctrl.id, "subControls", filtered);
  };

  return (
    <div className="sub-grid-controls" style={{ marginLeft: "20px" }}>
      <h4>Sub Controls (Grid Fields)</h4>
      <button type="button" onClick={addSubControl}>
        ➕ Add Field to Grid
      </button>

      {(ctrl.subControls || []).map((subCtrl, subIdx) => (
        <div
          key={subCtrl.id}
          className="sub-control-row"
          draggable
          onDragStart={() => handleSubDragStart(subIdx)}
          onDragEnter={() => handleSubDragEnter(ctrl.id, subIdx)}
          onDragEnd={handleSubDragEnd}
          onDragOver={(e) => e.preventDefault()}
          style={{
            border:
              draggedSubIndex === subIdx
                ? "2px dashed #4a90e2"
                : "1px solid #ddd",
            padding: "10px",
            marginBottom: "10px",
            backgroundColor: "#f9f9f9",
            cursor: "move",
          }}
        >
          {/* Label */}
          <input
            type="text"
            placeholder="Column Name"
            value={subCtrl.label}
            onChange={(e) =>
              updateSubControl(ctrl.id, subIdx, "label", e.target.value)
            }
          />

          {/* Header */}
          <input
            type="text"
            placeholder="Header Name"
            value={subCtrl.header}
            onChange={(e) =>
              updateSubControl(ctrl.id, subIdx, "header", e.target.value)
            }
          />

          {/* Control Type */}
          <select
            value={subCtrl.controlType}
            onChange={(e) =>
              updateSubControl(ctrl.id, subIdx, "controlType", e.target.value)
            }
          >
            <option value="input">Input</option>
            <option value="dropdown">Dropdown</option>
          </select>

          {/* Data Type */}
          <select
            value={subCtrl.dataType}
            onChange={(e) =>
              updateSubControl(ctrl.id, subIdx, "dataType", e.target.value)
            }
          >
            <option value="nvarchar">NVARCHAR</option>
            <option value="int">INT</option>
            <option value="decimal">DECIMAL</option>
            <option value="date">DATE</option>
            <option value="sequence">Sequence</option>
          </select>

          {/* Size */}
          {subCtrl.dataType !== "date" && subCtrl.dataType !== "sequence" && (
            <input
              type="number"
              placeholder="Size"
              value={subCtrl.size}
              onChange={(e) =>
                updateSubControl(ctrl.id, subIdx, "size", e.target.value)
              }
              style={{ width: "60px" }}
            />
          )}

          {/* Decimals */}
          {subCtrl.dataType === "decimal" && (
            <input
              type="number"
              placeholder="Decimals"
              value={subCtrl.decimals}
              onChange={(e) =>
                updateSubControl(ctrl.id, subIdx, "decimals", e.target.value)
              }
              style={{ width: "60px" }}
            />
          )}

          {/* Length */}
          {subCtrl.dataType !== "nvarchar" &&
            subCtrl.dataType !== "date" &&
            subCtrl.dataType !== "sequence" && (
              <input
                type="number"
                placeholder="Length"
                value={subCtrl.length}
                onChange={(e) =>
                  updateSubControl(ctrl.id, subIdx, "length", e.target.value)
                }
                style={{ width: "60px" }}
              />
            )}

          {/* Dropdown Options */}
          {subCtrl.controlType === "dropdown" && (
            <select
              value={subCtrl.sabtable}
              onChange={(e) =>
                updateSubControl(ctrl.id, subIdx, "sabtable", e.target.value)
              }
            >
              <option value="">Select sabtable</option>
              {saberpmenu.map((menu) =>
                menu.tablename ? (
                  <option key={menu._id} value={menu.tablename}>
                    {menu.tablename}
                  </option>
                ) : null
              )}
            </select>
          )}

          {/* Required */}
          <select
            value={subCtrl.required ? "true" : "false"}
            onChange={(e) =>
              updateSubControl(
                ctrl.id,
                subIdx,
                "required",
                e.target.value === "true"
              )
            }
          >
            <option value="false">Required: No</option>
            <option value="true">Required: Yes</option>
          </select>

          {/* Readonly */}
          <label>
            <input
              type="checkbox"
              checked={subCtrl.readOnly}
              onChange={(e) =>
                updateSubControl(ctrl.id, subIdx, "readOnly", e.target.checked)
              }
            />{" "}
            ReadOnly
          </label>

          {/* Sequence format */}
          {subCtrl.dataType === "sequence" && (
            <input
              type="text"
              placeholder="Entno Format"
              value={subCtrl.entnoFormat}
              onChange={(e) =>
                updateSubControl(ctrl.id, subIdx, "entnoFormat", e.target.value)
              }
            />
          )}

          {/* Default Date */}
          {subCtrl.dataType === "date" && (
            <select
              value={subCtrl.defaultDateOption || ""}
              onChange={(e) =>
                updateSubControl(
                  ctrl.id,
                  subIdx,
                  "defaultDateOption",
                  e.target.value
                )
              }
            >
              <option value="">Select Date Option</option>
              <option value="currentDate">Current Date</option>
            </select>
          )}

          {/* Delete sub-control */}
          <button type="button" onClick={() => removeSubControl(subIdx)}>
            ❌
          </button>
        </div>
      ))}
    </div>
  );
};

export default GridComponent;

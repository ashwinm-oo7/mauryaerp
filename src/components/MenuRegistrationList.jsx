import React, { useEffect, useState, useContext } from "react";
import { MenuContext } from "../context/MenuContext";
import axios from "axios";
import "../css/MenuRegistrationList.css";
import { useNavigate } from "react-router-dom";

const MenuRegistrationList = () => {
  const { saberpmenu } = useContext(MenuContext);
  const Navigate = useNavigate();

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  console.log("saberpmenu", saberpmenu);
  // const [error, setError] = useState(null);

  // const [editFormData, setEditFormData] = useState({
  //   bname: "",
  //   MenuName: "",
  //   ParentSubmenuName: "",
  //   tablename: "",
  // });

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/menus/getMenus`
      );
      setMenus(res?.data?.reverse());
    } catch (err) {
      console.error("Failed to fetch menus", err);
    } finally {
      setLoading(false);
    }
  };
  // const getBnameByPid = (pid) => {
  //   const match = saberpmenu.find((m) => m.pid === pid || m.bname === pid);
  //   return match ? match.bname : pid;
  // };

  // const startEdit = (menu) => {
  //   const controlsCopy =
  //     menu.controls?.map((ctrl) => ({
  //       ...ctrl,
  //       options: ctrl.options || [],
  //     })) || [];

  //   setEditFormData({
  //     ...menu,
  //     controls: controlsCopy,
  //   });
  //   setEditId(menu._id);
  // };

  const cancelEdit = () => {
    setEditId(null);
    setEditFormData(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Dynamic controls handlers
  const addControl = (type) => {
    setEditFormData((prev) => ({
      ...prev,
      controls: [
        ...prev.controls,
        {
          id: Date.now().toString(),
          controlType: type,
          label: "",
          options: type === "dropdown" ? [] : [],
          sabtable: "",
        },
      ],
    }));
  };

  const updateControl = (id, field, value) => {
    const updatedControls = editFormData.controls.map((ctrl) =>
      ctrl._id === id ? { ...ctrl, [field]: value } : ctrl
    );
    setEditFormData((prev) => ({ ...prev, controls: updatedControls }));
  };

  const removeControl = (id) => {
    setEditFormData((prev) => ({
      ...prev,
      controls: prev.controls.filter((ctrl) => ctrl.id !== id),
    }));
  };
  const validateEditForm = () => {
    if (!editFormData.bname.trim()) return "bname is required.";
    if (!editFormData.FormType) return "FormType is required.";
    return null;
  };

  const saveEdit = async () => {
    const error = validateEditForm();
    if (error) return alert(error);

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/menus/updateMenu/${editId}`,
        editFormData
      );
      alert("Menu updated successfully");
      cancelEdit();
      fetchMenus();
    } catch (err) {
      console.error("Failed to update menu", err);
      alert("Failed to update menu");
    }
  };

  const deleteMenu = async (id) => {
    if (!window.confirm("Are you sure you want to delete this menu?")) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/menus/deleteMenu/${id}`
      );
      fetchMenus();
    } catch (err) {
      alert("Failed to delete menu");
      console.error(err);
    }
  };

  if (loading) return <p>Loading menus...</p>;

  return (
    <div className="menu-list-container">
      <h2>Menu Registration List</h2>

      <table className="menu-table">
        <thead>
          <tr>
            <th>SR.No</th>
            <th>bname</th>
            <th>tablename</th>
            <th>MenuName</th>
            <th>ParentSubmenuName</th>
            <th>FormType</th>
            <th>Active</th>
            <th>Controls</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {menus.length === 0 && (
            <tr>
              <td colSpan="9" style={{ textAlign: "center" }}>
                No menus found
              </td>
            </tr>
          )}

          {menus.map((menu, idx) => {
            const isEditing = editId === menu._id;

            return (
              <tr key={menu._id}>
                <td>{idx + 1}</td>

                {/* Editable fields */}
                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      name="bname"
                      value={editFormData.bname}
                      onChange={handleInputChange}
                      required
                    />
                  ) : (
                    menu.bname
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      name="tablename"
                      value={editFormData.tablename}
                      onChange={handleInputChange}
                    />
                  ) : (
                    menu.tablename
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <select
                      name="MenuName"
                      value={editFormData.MenuName}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Menu</option>
                      {saberpmenu.map((m) => (
                        <option key={m._id} value={m.bname}>
                          {m.bname}
                        </option>
                      ))}
                    </select>
                  ) : (
                    menu.MenuName
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <select
                      name="ParentSubmenuName"
                      value={editFormData.ParentSubmenuName}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Submenu</option>
                      {saberpmenu.map((m) => (
                        <option key={m._id} value={m.bname}>
                          {m.bname}
                        </option>
                      ))}
                    </select>
                  ) : (
                    menu.ParentSubmenuName
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <select
                      name="FormType"
                      value={editFormData.FormType}
                      onChange={handleInputChange}
                    >
                      <option value="M">Master</option>
                      <option value="T">Transaction</option>
                      <option value="R">Report</option>
                      <option value="I">Inventory</option>
                    </select>
                  ) : (
                    menu.FormType
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      name="Active"
                      checked={editFormData.Active}
                      onChange={handleInputChange}
                    />
                  ) : menu.Active ? (
                    "Yes"
                  ) : (
                    "No"
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <>
                      {editFormData.controls?.map((ctrl, i) => (
                        <div key={ctrl.id} className="control-edit-row">
                          {ctrl.controlType === "input" && (
                            <input
                              type="text"
                              value={ctrl.label}
                              placeholder="Label"
                              onChange={(e) =>
                                updateControl(ctrl._id, "label", e.target.value)
                              }
                            />
                          )}
                          {ctrl.controlType === "dropdown" && (
                            <>
                              <input
                                type="text"
                                value={ctrl?.options?.join(", ")}
                                placeholder="Comma-separated options"
                                onChange={(e) =>
                                  updateControl(
                                    ctrl._id,
                                    "options",
                                    e.target.value
                                      .split(",")
                                      .map((opt) => opt.trim())
                                  )
                                }
                              />
                              <select
                                value={ctrl.sabtable}
                                onChange={(e) =>
                                  updateControl(
                                    ctrl._id,
                                    "sabtable",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="">Select sabtable</option>
                                {saberpmenu
                                  .filter((m) => m.tablename)
                                  .map((m) => (
                                    <option key={m._id} value={m.tablename}>
                                      {m.tablename}
                                    </option>
                                  ))}
                              </select>
                            </>
                          )}
                          <button
                            onClick={() => removeControl(ctrl.id)}
                            title="Remove control"
                            className="remove-control-btn"
                            type="button"
                          >
                            ❌
                          </button>
                        </div>
                      ))}

                      <div className="add-control-buttons">
                        <button
                          type="button"
                          onClick={() => addControl("input")}
                          className="add-control-btn"
                        >
                          ➕ Input
                        </button>
                        <button
                          type="button"
                          onClick={() => addControl("checkbox")}
                          className="add-control-btn"
                        >
                          ➕ Checkbox
                        </button>
                        <button
                          type="button"
                          onClick={() => addControl("dropdown")}
                          className="add-control-btn"
                        >
                          ➕ Dropdown
                        </button>
                      </div>
                    </>
                  ) : (
                    menu.controls?.map((ctrl, i) => (
                      <div key={ctrl.id} className="control-view-row">
                        <strong>{ctrl.controlType}</strong>: {ctrl.label}{" "}
                        {ctrl.controlType === "dropdown" &&
                          `(Options: ${ctrl.options.join(", ")},\n 
                          Sabtable: ${ctrl.sabtable || "-"})`}
                      </div>
                    ))
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <>
                      <button onClick={saveEdit} className="btn-save">
                        Save
                      </button>
                      <button onClick={cancelEdit} className="btn-cancel">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <div className="action-buttons">
                      <button
                        // onClick={() => startEdit(menu)}
                        onClick={() =>
                          Navigate(`/menuregistration/${menu._id}`)
                        }
                        className="btn-edit"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() => deleteMenu(menu._id)}
                        className="btn-delete"
                      >
                        ❌ Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MenuRegistrationList;

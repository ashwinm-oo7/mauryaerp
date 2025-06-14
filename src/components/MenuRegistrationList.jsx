import React, { useEffect, useState, useContext } from "react";
import { MenuContext } from "../context/MenuContext";
import axios from "axios";
import "../css/MenuRegistrationList.css";
import { useNavigate } from "react-router-dom";
import MenuFormViewer from "../menu/MenuFormViewer";

const MenuRegistrationList = () => {
  const { saberpmenu } = useContext(MenuContext);
  const Navigate = useNavigate();

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log("saberpmenu", saberpmenu);
  // const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFormView, setIsFormView] = useState(false);

  const [filters, setFilters] = useState({
    bname: "",
    tablename: "",
    MenuName: "",
    ParentSubmenuName: "",
    FormType: "",
    Active: "",
  });

  useEffect(() => {
    fetchMenus();
  }, []);
  const handleNext = () => {
    if (currentIndex < filteredMenus.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };
  const filteredMenus = menus.filter((menu) =>
    Object.entries(filters).every(([key, val]) =>
      val ? String(menu[key]).toLowerCase().includes(val.toLowerCase()) : true
    )
  );

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
      <div style={{ marginBottom: "20px" }}>
        <h2>Menu Registration List</h2>
        <button
          onClick={() => setIsFormView(!isFormView)}
          className="btn-toggle-view"
        >
          {isFormView ? "📋 Switch to Table View" : "📄 Switch to Form View"}
        </button>
      </div>
      {isFormView ? (
        <>
          {filteredMenus.length > 0 ? (
            <>
              <MenuFormViewer
                menu={filteredMenus[currentIndex]}
                currentIndex={currentIndex}
                total={filteredMenus.length}
                onNext={handleNext}
                onPrev={handlePrev}
              />
              <div className="menu-actions">
                <button
                  className="btn-edit"
                  onClick={() =>
                    Navigate(
                      `/menuregistration/${filteredMenus[currentIndex]._id}`
                    )
                  }
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => deleteMenu(filteredMenus[currentIndex]._id)}
                >
                  ❌ Delete
                </button>
              </div>
            </>
          ) : (
            <p>No menus found</p>
          )}
        </>
      ) : (
        <div className="menu-table-wrapper">
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
              </tr>{" "}
              <tr className="search-menu-field">
                <td></td>
                <td>
                  <input
                    name="bname"
                    value={filters.bname}
                    onChange={handleFilterChange}
                  />
                </td>
                <td>
                  <input
                    name="tablename"
                    value={filters.tablename}
                    onChange={handleFilterChange}
                  />
                </td>
                <td>
                  <input
                    name="MenuName"
                    value={filters.MenuName}
                    onChange={handleFilterChange}
                  />
                </td>
                <td>
                  <input
                    name="ParentSubmenuName"
                    value={filters.ParentSubmenuName}
                    onChange={handleFilterChange}
                  />
                </td>
                <td>
                  <input
                    name="FormType"
                    value={filters.FormType}
                    onChange={handleFilterChange}
                  />
                </td>
                <td>
                  <input
                    name="Active"
                    value={filters.Active}
                    onChange={handleFilterChange}
                  />
                </td>
                <td></td>
                <td></td>
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

              {filteredMenus.map((menu, idx) => {
                return (
                  <tr key={menu._id}>
                    <td>{idx + 1}</td>

                    {/* Editable fields */}
                    <td>{menu.bname}</td>

                    <td>{menu.tablename}</td>

                    <td>{menu.MenuName}</td>

                    <td>{menu.ParentSubmenuName}</td>

                    <td>{menu.FormType}</td>

                    <td>{menu.Active ? "Yes" : "No"}</td>

                    <td>
                      {menu.controls?.map((ctrl, i) => (
                        <div key={ctrl.id} className="control-view-row">
                          <strong>{ctrl.controlType}</strong>: {ctrl.label}{" "}
                          {ctrl.controlType === "dropdown" &&
                            `(Options: ${ctrl.options.join(", ")},\n 
                          Sabtable: ${ctrl.sabtable || "-"})`}
                        </div>
                      ))}
                    </td>

                    <td>
                      {
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
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MenuRegistrationList;

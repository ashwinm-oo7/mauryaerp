import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import "../css/MobileMenu.css";
import { MenuContext } from "../context/MenuContext";
import { useAuth } from "../context/AuthContext";

const MobileMenu = ({ isOpen, onClose }) => {
  const {
    menus = [],
    submenus = [],
    nestedSubmenusMap = {},
    forms = [],
  } = useContext(MenuContext);

  const { logout, isAuthenticated, userAccess, power } = useAuth();

  const [openMenuId, setOpenMenuId] = useState(null);
  const [openSubmenuId, setOpenSubmenuId] = useState(null);

  const toggleMenu = (menuId) => {
    setOpenMenuId((prev) => (prev === menuId ? null : menuId));
    setOpenSubmenuId(null); // Close any open submenu
  };

  const toggleSubmenu = (submenuId) => {
    setOpenSubmenuId((prev) => (prev === submenuId ? null : submenuId));
  };

  const renderNestedSubmenus = (parentName, menuName) => {
    const children = nestedSubmenusMap?.[parentName] || [];
    const childForms = forms.filter(
      (form) =>
        form.formParentType === "nested-submenu" &&
        form.MenuName === parentName &&
        form.formParentName === menuName
    );

    return (
      <ul className="mobile-submenu__list">
        {childForms.map((form) => (
          <li key={form._id}>
            <Link to={`/${form.bname.replace(/\s+/g, "-")}`} onClick={onClose}>
              {form.bname}
            </Link>
          </li>
        ))}

        {children.map((submenu) => (
          <li key={submenu._id}>
            <span onClick={() => toggleSubmenu(submenu._id)}>
              {submenu.bname}
            </span>
            {openSubmenuId === submenu._id &&
              renderNestedSubmenus(submenu.bname, menuName)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={`mobile-menu ${isOpen ? "open" : ""}`}>
      <div className="mobile-menu__overlay" onClick={onClose} />
      <div className="mobile-menu__content">
        <button className="mobile-menu__close" onClick={onClose}>
          ✕
        </button>

        <ul className="mobile-menu__list">
          {/* File Menu */}
          <li className="mobile-menu__item">
            <span onClick={() => toggleMenu("file")} className="mobile-toggle">
              File
              <span className="arrow">
                {openMenuId === "file" ? "▼" : "▶"}
              </span>
            </span>
            {openMenuId === "file" && (
              <ul className="mobile-submenu__list">
                {["Developer", "Admin"].includes(userAccess) && (
                  <>
                    <li>
                      <Link to="/menuregistration" onClick={onClose}>
                        Menu Registration
                      </Link>
                    </li>
                    <li>
                      <Link to="/menuregistrationlist" onClick={onClose}>
                        Menu RegistrationList
                      </Link>
                    </li>
                  </>
                )}
                {power && (
                  <>
                    <li>
                      <Link to="/backup" onClick={onClose}>
                        Backup
                      </Link>
                    </li>
                    <li>
                      <Link to="/auditlogs" onClick={onClose}>
                        Audit Logs
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/dedfvudegfsfauhiuiytredcfvghjgfqsrdscfsfvssrtd"
                        onClick={onClose}
                      >
                        Admin Panel
                      </Link>
                    </li>
                  </>
                )}
                {isAuthenticated && (
                  <li>
                    <span
                      onClick={() => {
                        logout();
                        onClose();
                      }}
                    >
                      Logout
                    </span>
                  </li>
                )}
                {!isAuthenticated && (
                  <li>
                    <Link to="/register" onClick={onClose}>
                      Register
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </li>

          {/* Dynamic Menus */}
          {menus.map((menu) => {
            const topSubmenus = submenus.filter(
              (s) => s.MenuName === menu.bname
            );
            const directForms = forms.filter(
              (form) =>
                form.formParentType === "menu" &&
                form.formParentName === menu.bname
            );

            return (
              <li key={menu._id} className="mobile-menu__item">
                <span
                  onClick={() => toggleMenu(menu._id)}
                  className="mobile-toggle"
                >
                  {menu.bname}
                  <span className="arrow">
                    {openMenuId === menu._id ? "▼" : "▶"}
                  </span>
                </span>

                {openMenuId === menu._id && (
                  <ul className="mobile-submenu__list">
                    {topSubmenus.map((submenu) => (
                      <li key={submenu._id}>
                        <span
                          onClick={() => toggleSubmenu(submenu._id)}
                          className="mobile-sub-toggle"
                        >
                          {submenu.bname}
                          <span className="arrow">
                            {openSubmenuId === submenu._id ? "▼" : "▶"}
                          </span>
                        </span>
                        {openSubmenuId === submenu._id &&
                          renderNestedSubmenus(submenu.bname, menu.bname)}
                      </li>
                    ))}
                    {directForms.map((form) => (
                      <li key={form._id}>
                        <Link
                          to={`/${form.bname
                            .replace(/\s+/g, "-")
                            .toLowerCase()}`}
                          onClick={onClose}
                        >
                          {form.bname}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default MobileMenu;

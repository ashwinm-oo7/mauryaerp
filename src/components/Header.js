import React, { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import "../css/Header.css";
import { MenuContext } from "../context/MenuContext";
import { useAuth } from "../context/AuthContext";
import MobileMenu from "./MobileMenu";

const Header = () => {
  const {
    menus = [],
    submenus = [],
    nestedSubmenusMap = {},
    forms = [],
  } = useContext(MenuContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [openSubmenuId, setOpenSubmenuId] = useState(null);
  const { auth, logout, isAuthenticated, isAdmin, userAccess, power } =
    useAuth();
  console.log("isadmin", isAdmin, "userAccess :", userAccess);

  const menuRefs = useRef({});

  useEffect(() => {
    const handleClickOutside = (e) => {
      let clickedInside = false;
      for (const key in menuRefs.current) {
        if (menuRefs.current[key]?.contains(e.target)) {
          clickedInside = true;
          break;
        }
      }
      if (!clickedInside) {
        setOpenMenuId(null);
        setOpenSubmenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (menuId) => {
    setOpenMenuId((prev) => (prev === menuId ? null : menuId));
    setOpenSubmenuId(new Set());
  };

  const handleSubmenuClick = (submenuId) => {
    setOpenSubmenuId((prev) => (prev === submenuId ? null : submenuId));
  };

  // Renders nested submenus and forms for a given parent name.
  const renderNestedSubmenus = (parentName, menuName) => {
    const childSubmenus = nestedSubmenusMap?.[parentName] || [];

    const childForms = forms.filter(
      (form) =>
        form.formParentType === "nested-submenu" &&
        form.MenuName === parentName &&
        form.formParentName === menuName
    );

    return (
      <ul className="header__nested-dropdown">
        {childForms.map((form) => (
          <li key={form._id} className="header__dropdown-item">
            <Link
              to={`/${form.bname.replace(/\s+/g, "-")}`}
              className="header__dropdown-link"
              onClick={() => {
                setOpenMenuId(null);
                setOpenSubmenuId(null);
              }}
            >
              {form.bname}
            </Link>
          </li>
        ))}

        {childSubmenus.map((submenu) => (
          <li
            key={submenu._id}
            className="header__dropdown-item has-nested"
            onClick={(e) => {
              e.stopPropagation();
              handleSubmenuClick(submenu._id);
            }}
          >
            {submenu.bname}
            {openSubmenuId === submenu._id &&
              renderNestedSubmenus(submenu.bname, menuName)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      <nav className="header">
        <button
          className="mobile-menu-button"
          onClick={() => setMobileMenuOpen(true)}
        >
          ☰
        </button>

        <ul className="header__menu-bar">
          {/* Static File Menu */}
          <li
            ref={(el) => (menuRefs.current["file"] = el)}
            className="header__menu-item"
            onClick={() => handleMenuClick("file")}
          >
            File
            {openMenuId === "file" && (
              <ul className="header__dropdown">
                {["Developer", "Admin"].includes(userAccess) && (
                  <li className="header__dropdown-item">
                    <Link
                      to="/menuregistration"
                      className="header__dropdown-link"
                      onClick={() => setOpenMenuId(null)}
                    >
                      Menu Registration
                    </Link>
                  </li>
                )}
                {["Developer", "Admin"].includes(userAccess) && (
                  <li className="header__dropdown-item">
                    <Link
                      to="/menuregistrationList"
                      className="header__dropdown-link"
                      onClick={() => setOpenMenuId(null)}
                    >
                      Menu RegistrationList
                    </Link>
                  </li>
                )}
                {power && (
                  <li className="header__dropdown-item">
                    <Link
                      to="/dedfvudegfsfauhiuiytredcfvghjgfqsrdscfsfvssrtd"
                      className="header__dropdown-link"
                      onClick={() => setOpenMenuId(null)}
                    >
                      AdminPanel
                    </Link>
                  </li>
                )}
                {power && (
                  <li className="header__dropdown-item">
                    <Link
                      to="/auditlogs"
                      className="header__dropdown-link"
                      onClick={() => setOpenMenuId(null)}
                    >
                      View Audit Logs
                    </Link>
                  </li>
                )}

                {power && (
                  <li className="header__dropdown-item">
                    <Link
                      to="/backup"
                      className="header__dropdown-link"
                      onClick={() => setOpenMenuId(null)}
                    >
                      Backup
                    </Link>
                  </li>
                )}
                {isAuthenticated && (
                  <li className="header__dropdown-item">
                    <span
                      onClick={() => {
                        logout();
                        setOpenMenuId(null);
                      }}
                      className="header__dropdown-link"
                    >
                      Logout
                    </span>
                  </li>
                )}
                {!isAuthenticated && (
                  <li className="header__dropdown-item">
                    <Link
                      to="/register"
                      className="header__dropdown-link"
                      onClick={() => setOpenMenuId(null)}
                    >
                      Register
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </li>
          {isAuthenticated && (
            <>
              {/* Dynamic Menus */}
              {menus.map((menu) => {
                // Top-level submenus for this menu container
                const topSubmenus = submenus.filter(
                  (s) => s.MenuName === menu.bname
                );

                // Direct forms under the menu (using our classification "menu")
                const directForms = forms.filter(
                  (form) =>
                    form.formParentType === "menu" &&
                    form.formParentName === menu.bname
                );

                return (
                  <li
                    key={menu._id}
                    ref={(el) => (menuRefs.current[menu._id] = el)}
                    className="header__menu-item"
                    onClick={() => handleMenuClick(menu._id)}
                  >
                    {menu.bname}
                    {openMenuId === menu._id && (
                      <ul className="header__dropdown">
                        {topSubmenus.map((submenu) => (
                          <li
                            key={submenu._id}
                            className="header__dropdown-item has-nested"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSubmenuClick(submenu._id);
                            }}
                          >
                            {submenu.bname} <span className="arrow">»</span>
                            {openSubmenuId === submenu._id &&
                              renderNestedSubmenus(submenu.bname, menu.bname)}
                          </li>
                        ))}

                        {directForms.map((form) => (
                          <li key={form._id} className="header__dropdown-item">
                            <Link
                              to={`/${form.bname
                                .replace(/\s+/g, "-")
                                .toLowerCase()}`}
                              className="header__dropdown-link"
                              onClick={() => {
                                setOpenMenuId(null);
                                setOpenSubmenuId(null);
                              }}
                            >
                              {form.bname}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}{" "}
            </>
          )}
        </ul>
      </nav>
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
};

export default Header;

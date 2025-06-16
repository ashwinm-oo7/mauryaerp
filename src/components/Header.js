import React, { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import "../css/Header.css";
import { MenuContext } from "../context/MenuContext";

const Header = () => {
  const {
    menus = [],
    submenus = [],
    nestedSubmenusMap = {},
    forms = [],
  } = useContext(MenuContext);

  const [openMenuId, setOpenMenuId] = useState(null);
  const [openSubmenuId, setOpenSubmenuId] = useState(null);

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
    <nav className="header">
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
              <li className="header__dropdown-item">
                <Link
                  to="/menuregistration"
                  className="header__dropdown-link"
                  onClick={() => setOpenMenuId(null)}
                >
                  Menu Registration
                </Link>
              </li>
              <li className="header__dropdown-item">
                <Link
                  to="/menuregistrationList"
                  className="header__dropdown-link"
                  onClick={() => setOpenMenuId(null)}
                >
                  Menu RegistrationList
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Dynamic Menus */}
        {menus.map((menu) => {
          // Top-level submenus for this menu container
          const topSubmenus = submenus.filter((s) => s.MenuName === menu.bname);

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
                        to={`/${form.bname.replace(/\s+/g, "-").toLowerCase()}`}
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
        })}
      </ul>
    </nav>
  );
};

export default Header;

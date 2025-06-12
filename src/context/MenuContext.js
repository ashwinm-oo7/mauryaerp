import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { LoadingContext } from "./LoadingContext";

export const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [menus, setMenus] = useState([]);
  const [submenus, setSubmenus] = useState([]);
  const [nestedSubmenusMap, setNestedSubmenusMap] = useState({});
  const [forms, setForms] = useState([]);
  const [saberpmenu, setSaberpmenu] = useState([]);
  const { setIsLoading } = useContext(LoadingContext);

  useEffect(() => {
    const fetchMenus = async () => {
      setIsLoading(true);

      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/menus/getMenus`
        );
        const data = res.data;

        // Store all valid entries for saberpmenu display
        setSaberpmenu(data.filter((item) => item.bname));

        // Top-level menus: bname exists, and no MenuName, ParentSubmenuName, or tablename
        const menus = data.filter(
          (item) =>
            item.bname &&
            !item.MenuName &&
            !item.ParentSubmenuName &&
            !item.tablename
        );

        // Submenus directly under a menu: MenuName exists; no tablename or ParentSubmenuName
        const submenus = data.filter(
          (item) => item.MenuName && !item.tablename && !item.ParentSubmenuName
        );

        // Build a nested submenus map based on ParentSubmenuName
        const nestedMap = {};
        data.forEach((item) => {
          if (item.ParentSubmenuName) {
            const trimmedParent = item.ParentSubmenuName.trim();
            if (!nestedMap[trimmedParent]) {
              nestedMap[trimmedParent] = [];
            }
            nestedMap[trimmedParent].push(item);
          }
        });

        // Build forms with classification:
        //   - "menu": Form directly under a Menu (MenuName exists, but no ParentSubmenuName).
        //   - "nested-submenu": Form inside a nested submenu (both MenuName and ParentSubmenuName exist).
        //   - "top-level": Form not associated with any menu (rare)
        const forms = data
          .filter((item) => item.tablename)
          .map((form) => {
            const hasMenuName = !!form.MenuName?.trim();
            const hasParentSubmenu = !!form.ParentSubmenuName?.trim();

            let formParentType = "menu";
            let formParentName = form.MenuName?.trim();

            if (hasMenuName && hasParentSubmenu) {
              formParentType = "nested-submenu";
              formParentName = form.ParentSubmenuName?.trim();
            } else if (hasMenuName && !hasParentSubmenu) {
              formParentType = "menu"; // ✅ Directly under menu, not submenu
              formParentName = form.MenuName?.trim();
            }

            return {
              ...form,
              formParentType,
              formParentName,
            };
          });

        // Set state with all categorized data
        setMenus(menus);
        setSubmenus(submenus);
        setNestedSubmenusMap(nestedMap);
        setForms(forms);
      } catch (err) {
        console.error("Failed to fetch menus:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MenuContext.Provider
      value={{
        menus,
        submenus,
        nestedSubmenusMap,
        forms,
        saberpmenu,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
};

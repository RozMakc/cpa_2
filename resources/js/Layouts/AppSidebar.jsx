import { useCallback, useEffect, useRef, useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { ChevronDown, LayoutGrid, MenuIcon, Settings2, ShoppingBasket, SquareGanttChart, Users } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { useRoles } from "@/hooks/useRoles";

const AppSidebar = () => {
  const { isExpanded, isHovered, isMobileOpen, setIsHovered } = useSidebar();
  const { hasRole } = useRoles();
  const projects = usePage().props.projects;
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  const [openSubmenu, setOpenSubmenu] = useState({ type: "main", index: null });
  const [subMenuHeight, setSubMenuHeight] = useState({});
  const subMenuRefs = useRef({});

  let navItems = [
    { icon: <LayoutGrid />, name: "Dashboard", path: "/dashboard" },
    { icon: <SquareGanttChart />, name: "Проекты", path: "/projects" },
    { icon: <ShoppingBasket />, name: "Лиды", path: "/leads" },
  ];

  if (hasRole("manager")) {
    navItems = [
      {
        icon: <SquareGanttChart />,
        name: "Проекты",
        subItems: (projects || []).map((project) => ({
          name: project.name,
          path: `/projects/${project.id}`,
          badge: project.status === "active" ? "active" : "inactive",
        })),
      },
    ];
  }

  if (hasRole("admin")) {
    navItems = [
      { icon: <LayoutGrid />, name: "Dashboard", path: "/dashboard" },
      {
        icon: <SquareGanttChart />,
        name: "Проекты",
        subItems: [
          { name: "Все", path: "/projects" },
          ...(projects || []).map((project) => ({
            name: project.name,
            path: `/projects/${project.id}`,
            badge: project.status === "active" ? "active" : "inactive",
          })),
        ],
      },
      { icon: <ShoppingBasket />, name: "Лиды", path: "/leads" },
      { icon: <Users />, name: "Пользователи", path: "/users" },
      {
        icon: <Settings2 />,
        name: "Настройки",
        subItems: [
          { name: "Интеграции", path: "/integration" },
          { name: "Поля", path: "/fields" },
        ],
      },
    ];
  }

  const isActive = useCallback((path) => currentPath === path, [currentPath]);

  useEffect(() => {
    let submenuMatched = false;

    navItems.forEach((nav, index) => {
      nav.subItems?.forEach((subItem) => {
        if (isActive(subItem.path)) {
          setOpenSubmenu({ type: "main", index });
          submenuMatched = true;
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu({ type: "main", index: null });
    }
  }, [currentPath, isActive]);

  useEffect(() => {
    if (openSubmenu.index === null) {
      return;
    }

    const key = `${openSubmenu.type}-${openSubmenu.index}`;
    if (subMenuRefs.current[key]) {
      setSubMenuHeight((prevHeights) => ({
        ...prevHeights,
        [key]: subMenuRefs.current[key]?.scrollHeight || 0,
      }));
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index, menuType) => {
    setOpenSubmenu((prevOpenSubmenu) => (
      prevOpenSubmenu.type === menuType && prevOpenSubmenu.index === index
        ? { type: menuType, index: null }
        : { type: menuType, index }
    ));
  };

  const renderMenuItems = (items, menuType) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${openSubmenu.type === menuType && openSubmenu.index === index ? "menu-item-active" : "menu-item-inactive"} cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
            >
              <span className={`menu-item-icon-size ${openSubmenu.type === menuType && openSubmenu.index === index ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDown className={`ml-auto h-5 w-5 transition-transform duration-200 ${openSubmenu.type === menuType && openSubmenu.index === index ? "rotate-180 text-brand-500" : ""}`} />
              )}
            </button>
          ) : (
            nav.path && (
              <Link href={nav.path} className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}>
                <span className={`menu-item-icon-size ${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
              </Link>
            )
          )}

          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height: openSubmenu.type === menuType && openSubmenu.index === index
                  ? `${subMenuHeight[`${menuType}-${index}`]}px`
                  : "0px",
              }}
            >
              <ul className="ml-9 mt-2 space-y-1">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link href={subItem.path} className={`menu-dropdown-item ${isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}>
                      {subItem.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed left-0 top-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 bg-white px-5 text-gray-900 transition-all duration-300 ease-in-out dark:border-gray-800 dark:bg-gray-900 lg:mt-0 ${
        isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"
      } ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`flex py-8 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              <img className="dark:hidden" src="/images/logo/logo.svg" alt="Logo" width={150} height={40} />
              <img className="hidden dark:block" src="/images/logo/logo-dark.svg" alt="Logo" width={150} height={40} />
            </>
          ) : (
            <img src="/images/logo/logo-icon.png" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>
      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mb-6">
          <h2 className={`mb-4 flex text-xs uppercase leading-[20px] text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
            {isExpanded || isHovered || isMobileOpen ? "Menu" : <MenuIcon className="size-6" />}
          </h2>
          {renderMenuItems(navItems, "main")}
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;

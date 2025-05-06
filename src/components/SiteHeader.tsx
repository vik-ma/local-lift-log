import {
  Button,
  Link,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  ChevronIcon,
  RefreshIcon,
} from "../assets";

export const SiteHeader = () => {
  const navigate = useNavigate();

  return (
    <nav className="flex justify-center sticky top-0 inset-x-0 z-40 w-full h-16 backdrop-blur-lg backdrop-saturate-150 bg-background/70 border-b border-divider">
      <div className="flex justify-between w-[1024px] px-4">
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            as={Link}
            onPress={() => navigate(-1)}
          >
            <ArrowLeftIcon />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            as={Link}
            onPress={() => navigate(+1)}
          >
            <ArrowRightIcon />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            as={Link}
            onPress={() => navigate(0)}
          >
            <RefreshIcon />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/workouts">Workouts</NavLink>
          <NavLink to="/analytics">Analytics</NavLink>
          <Dropdown shouldBlockScroll={false}>
            <DropdownTrigger>
              <Button
                disableRipple
                className="nav-menu-trigger-button p-0 text-[#404040] text-base font-medium bg-transparent data-[hover=true]:text-stone-400 data-[hover=true]:bg-transparent"
                endContent={<ChevronIcon color="#404040" size={18} />}
                radius="sm"
                variant="light"
                size="sm"
              >
                More
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Dropdown Menu With Navigation To More Pages">
              <DropdownItem
                className="nav-menu-dropdown-item"
                textValue="Exercise List"
                key="exercises"
              >
                <NavLink
                  className="nav-menu-dropdown-item-link"
                  to="/exercises"
                >
                  Exercise List
                </NavLink>
              </DropdownItem>
              <DropdownItem
                className="nav-menu-dropdown-item"
                textValue="Routines"
                key="routines"
              >
                <NavLink className="nav-menu-dropdown-item-link" to="/routines">
                  Routines
                </NavLink>
              </DropdownItem>
              <DropdownItem
                className="nav-menu-dropdown-item"
                textValue="Multisets"
                key="multisets"
              >
                <NavLink
                  className="nav-menu-dropdown-item-link"
                  to="/multisets"
                >
                  Multisets
                </NavLink>
              </DropdownItem>
              <DropdownItem
                className="nav-menu-dropdown-item"
                textValue="Workout Templates"
                key="workout-templates"
              >
                <NavLink
                  className="nav-menu-dropdown-item-link"
                  to="/workout-templates"
                >
                  Workout Templates
                </NavLink>
              </DropdownItem>
              <DropdownItem
                className="nav-menu-dropdown-item"
                textValue="Logging"
                key="logging"
              >
                <NavLink className="nav-menu-dropdown-item-link" to="/logging">
                  Logging
                </NavLink>
              </DropdownItem>
              <DropdownItem
                className="nav-menu-dropdown-item"
                textValue="Presets"
                key="presets"
              >
                <NavLink className="nav-menu-dropdown-item-link" to="/presets">
                  Presets
                </NavLink>
              </DropdownItem>
              <DropdownItem
                className="nav-menu-dropdown-item"
                textValue="Time Periods"
                key="time-periods"
              >
                <NavLink
                  className="nav-menu-dropdown-item-link"
                  to="/time-periods"
                >
                  Time Periods
                </NavLink>
              </DropdownItem>
              <DropdownItem
                className="nav-menu-dropdown-item"
                textValue="Settings"
                key="settings"
              >
                <NavLink className="nav-menu-dropdown-item-link" to="/settings">
                  Settings
                </NavLink>
              </DropdownItem>
              <DropdownItem
                className="nav-menu-dropdown-item"
                textValue="TEST PAGE"
                key="test"
              >
                <NavLink
                  className="nav-menu-dropdown-item-link !text-violet-500"
                  to="/test"
                >
                  TEST PAGE
                </NavLink>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </nav>
  );
};

export default SiteHeader;

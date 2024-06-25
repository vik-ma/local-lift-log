import {
  Navbar,
  NavbarContent,
  NavbarItem,
  Button,
  Link,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/react";
import { NavLink, useNavigate } from "react-router-dom";
import { ArrowRightIcon, ArrowLeftIcon, ChevronIcon } from "../assets";

export const SiteHeader = () => {
  const navigate = useNavigate();

  return (
    <Navbar className="h-16" isBordered>
      <NavbarContent className="flex gap-1.5">
        <NavbarItem className="flex items-center justify-center">
          <Button
            size="sm"
            variant="ghost"
            as={Link}
            onPress={() => navigate(-1)}
          >
            <ArrowLeftIcon />
          </Button>
        </NavbarItem>
        <NavbarItem className="flex items-center justify-center">
          <Button
            size="sm"
            variant="ghost"
            as={Link}
            onPress={() => navigate(+1)}
          >
            <ArrowRightIcon />
          </Button>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent className="flex gap-4" justify="end">
        <NavbarItem>
          <NavLink to="/">Home</NavLink>
        </NavbarItem>
        <NavbarItem>
          <NavLink to="/routines">Routines</NavLink>
        </NavbarItem>
        <NavbarItem>
          <NavLink to="/workouts">Workouts</NavLink>
        </NavbarItem>
        <Dropdown>
          <DropdownTrigger>
            <Button
              disableRipple
              className="p-0 text-[#404040] text-md font-medium bg-transparent data-[hover=true]:bg-transparent"
              endContent={<ChevronIcon color="#404040" size={18} />}
              radius="sm"
              variant="light"
            >
              More
            </Button>
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Dropdown menu with navigation to more pages"
            itemClasses={{
              base: "hover:text-[#404040]",
            }}
          >
            <DropdownItem textValue="Exercise List" key="exercises">
              <NavLink to="/exercises">Exercise List</NavLink>
            </DropdownItem>
            <DropdownItem textValue="Workout Templates" key="workout-templates">
              <NavLink to="/workout-templates">Workout Templates</NavLink>
            </DropdownItem>
            <DropdownItem textValue="Body Measurements" key="measurements">
              <NavLink to="/measurements">Body Measurements</NavLink>
            </DropdownItem>
            <DropdownItem textValue="Presets" key="presets">
              <NavLink to="/presets">Presets</NavLink>
            </DropdownItem>
            <DropdownItem textValue="Settings" key="settings">
              <NavLink to="/settings">Settings</NavLink>
            </DropdownItem>
            <DropdownItem textValue="TEST PAGE">
              <NavLink className="text-yellow-600" to="/test">
                TEST PAGE
              </NavLink>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
};

export default SiteHeader;

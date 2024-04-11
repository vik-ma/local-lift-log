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
import { ArrowRightIcon, ArrowLeftIcon, ChevronDownIcon } from "../assets";

export const SiteHeader = () => {
  const navigate = useNavigate();

  return (
    <Navbar isBordered>
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
          <NavbarItem>
            <DropdownTrigger>
              <Button
                disableRipple
                className="p-0 text-[#404040] text-md font-medium bg-transparent data-[hover=true]:bg-transparent"
                endContent={<ChevronDownIcon fill="currentColor" size={16} />}
                radius="sm"
                variant="light"
              >
                More
              </Button>
            </DropdownTrigger>
          </NavbarItem>
          <DropdownMenu
            aria-label="Dropdown menu with navigation to more pages"
            itemClasses={{
              base: "hover:text-[#404040] gap-4",
            }}
          >
            <DropdownItem href="/exercises" key="exercises">
              Exercise List
            </DropdownItem>
            <DropdownItem href="/workout-templates" key="workout-templates">
              Workout Templates
            </DropdownItem>
            <DropdownItem href="/measurements" key="measurements">
              Body Measurements
            </DropdownItem>
            <DropdownItem href="/presets" key="equipment-weights">
              Presets 
            </DropdownItem>
            <DropdownItem href="/settings" key="settings">
              Settings
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  );
};

export default SiteHeader;

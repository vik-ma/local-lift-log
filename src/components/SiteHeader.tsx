import { Navbar, NavbarContent, NavbarItem, Button, Link } from "@nextui-org/react";
import { NavLink, useNavigate } from "react-router-dom";
import ArrowRightIcon from "../assets/ArrowRightIcon";
import ArrowLeftIcon from "../assets/ArrowLeftIcon";

export default function SiteHeader() {
  const navigate = useNavigate();

  return (
    <Navbar isBordered>
      <NavbarContent className="flex gap-4">
        <NavbarItem>
          <NavLink to="/">Home</NavLink>
        </NavbarItem>
        <NavbarItem>
          <NavLink to="/routines">Routines</NavLink>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent className="flex gap-2" justify="end">
        <NavbarItem className="flex items-center justify-center">
          <Button
            size="sm"
            variant="ghost"
            as={Link}
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon />
          </Button>
        </NavbarItem>
        <NavbarItem className="flex items-center justify-center">
          <Button
            size="sm"
            variant="ghost"
            as={Link}
            onClick={() => navigate(+1)}
          >
            <ArrowRightIcon />
          </Button>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}

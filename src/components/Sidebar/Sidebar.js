/*eslint-disable*/
import { useState, useEffect, useCallback } from "react";
import { NavLink as NavLinkRRD, Link } from "react-router-dom";
import { PropTypes } from "prop-types";
import {
  Collapse,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Media,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container,
  Row,
  Col,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
} from "reactstrap";

const MD_BREAKPOINT = 768;

const Sidebar = (props) => {
  const [collapseOpen, setCollapseOpen] = useState(false);
  const [mini, setMini] = useState(false);

  // Sur desktop : on ajoute/retire la classe CSS sur le sidebar et main-content
  // Sur mobile : on ne touche à RIEN — Argon gère tout via son propre CSS
  const applyMiniClass = useCallback((isMini) => {
    const sidebar = document.getElementById("sidenav-main");
    const main = document.querySelector(".main-content");
    if (!sidebar || !main) return;

    if (window.innerWidth < MD_BREAKPOINT) {
      // Mobile : retirer toute trace de nos overrides
      sidebar.classList.remove("sidebar-mini");
      main.classList.remove("main-content-mini");
      return;
    }

    // Desktop uniquement
    if (isMini) {
      sidebar.classList.add("sidebar-mini");
      main.classList.add("main-content-mini");
    } else {
      sidebar.classList.remove("sidebar-mini");
      main.classList.remove("main-content-mini");
    }
  }, []);

  useEffect(() => {
    applyMiniClass(mini);
  }, [mini, applyMiniClass]);

  useEffect(() => {
    const onResize = () => applyMiniClass(mini);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [mini, applyMiniClass]);

  const toggleCollapse = () => setCollapseOpen((v) => !v);
  const closeCollapse = () => setCollapseOpen(false);

  const createLinks = (routes) =>
    routes.map((prop, key) => (
      <NavItem key={key}>
        <NavLink
          to={prop.layout + prop.path}
          tag={NavLinkRRD}
          onClick={closeCollapse}
          title={mini ? prop.name : undefined}
          className={mini ? "nav-link-mini" : ""}
        >
          <i className={prop.icon} />
          {!mini && <span>{prop.name}</span>}
        </NavLink>
      </NavItem>
    ));

  const { routes, logo } = props;
  let navbarBrandProps = {};
  if (logo?.innerLink) navbarBrandProps = { to: logo.innerLink, tag: Link };
  else if (logo?.outterLink) navbarBrandProps = { href: logo.outterLink, target: "_blank" };

  return (
    // ⚠️ AUCUN style inline de width ici — tout est géré par CSS
    <Navbar
      className="navbar-vertical fixed-left navbar-light bg-white"
      expand="md"
      id="sidenav-main"
    >
      <Container fluid>
        {/* Mobile toggler */}
        <button className="navbar-toggler" type="button" onClick={toggleCollapse}>
          <span className="navbar-toggler-icon" />
        </button>

        {/* Logo */}
        {logo && (
          <NavbarBrand className="pt-0" {...navbarBrandProps}>
            <img
              alt={logo.imgAlt}
              className="navbar-brand-img"
              src={mini ? require("../../assets/img/brand/box.png") : logo.imgSrc}
            />
          </NavbarBrand>
        )}

        {/* Mobile user icons */}
        <Nav className="align-items-center d-md-none">
          <UncontrolledDropdown nav>
            <DropdownToggle nav className="nav-link-icon">
              <i className="ni ni-bell-55" />
            </DropdownToggle>
            <DropdownMenu
              aria-labelledby="navbar-default_dropdown_1"
              className="dropdown-menu-arrow"
              right
            >
              <DropdownItem>Action</DropdownItem>
              <DropdownItem>Another action</DropdownItem>
              <DropdownItem divider />
              <DropdownItem>Something else here</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
          <UncontrolledDropdown nav>
            <DropdownToggle nav>
              <Media className="align-items-center">
                <span className="avatar avatar-sm rounded-circle">
                  <img
                    alt="..."
                    src={require("../../assets/img/theme/team-1-800x800.jpg")}
                  />
                </span>
              </Media>
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-arrow" right>
              <DropdownItem className="noti-title" header tag="div">
                <h6 className="text-overflow m-0">Welcome!</h6>
              </DropdownItem>
              <DropdownItem to="/admin/user-profile" tag={Link}>
                <i className="ni ni-single-02" /><span>My profile</span>
              </DropdownItem>
              <DropdownItem to="/admin/user-profile" tag={Link}>
                <i className="ni ni-settings-gear-65" /><span>Settings</span>
              </DropdownItem>
              <DropdownItem to="/admin/user-profile" tag={Link}>
                <i className="ni ni-calendar-grid-58" /><span>Activity</span>
              </DropdownItem>
              <DropdownItem to="/admin/user-profile" tag={Link}>
                <i className="ni ni-support-16" /><span>Support</span>
              </DropdownItem>
              <DropdownItem divider />
              <DropdownItem href="#pablo" onClick={(e) => e.preventDefault()}>
                <i className="ni ni-user-run" /><span>Logout</span>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        </Nav>

        {/* Collapse */}
        <Collapse navbar isOpen={collapseOpen}>
          {/* Mobile collapse header */}
          <div className="navbar-collapse-header d-md-none">
            <Row>
              {logo && (
                <Col className="collapse-brand" xs="6">
                  {logo.innerLink
                    ? <Link to={logo.innerLink}><img alt={logo.imgAlt} src={logo.imgSrc} /></Link>
                    : <a href={logo.outterLink}><img alt={logo.imgAlt} src={logo.imgSrc} /></a>
                  }
                </Col>
              )}
              <Col className="collapse-close" xs="6">
                <button className="navbar-toggler" type="button" onClick={toggleCollapse}>
                  <span /><span />
                </button>
              </Col>
            </Row>
          </div>

          {/* Mobile search */}
          <Form className="mt-4 mb-3 d-md-none">
            <InputGroup className="input-group-rounded input-group-merge">
              <Input
                aria-label="Search"
                className="form-control-rounded form-control-prepended"
                placeholder="Search"
                type="search"
              />
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <span className="fa fa-search" />
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Form>

          {/* Bouton toggle mini — desktop uniquement */}
          <Nav navbar className="d-none d-md-block mb-1">
            <NavItem>
              <NavLink
                href="#"
                onClick={(e) => { e.preventDefault(); setMini((v) => !v); }}
                title={mini ? "Expand sidebar" : "Collapse sidebar"}
                className="nav-link-mini"
              >
                <i className="fa fa-bars" />
              </NavLink>
            </NavItem>
          </Nav>

          {/* Routes */}
          <Nav navbar>{createLinks(routes)}</Nav>

          <hr className="my-3" />

          {!mini && (
            <h6 className="navbar-heading text-muted">Side Parts</h6>
          )}

          <Nav className="mb-md-3" navbar>
            {[
              { href: "https://", icon: "ni ni-spaceship", label: "part1" },
              { href: "https://", icon: "ni ni-palette",   label: "part2" },
              { href: "https://", icon: "ni ni-ui-04",     label: "part3" },
            ].map((item, key) => (
              <NavItem key={key}>
                <NavLink
                  href={item.href}
                  title={mini ? item.label : undefined}
                  className={mini ? "nav-link-mini" : ""}
                >
                  <i className={item.icon} />
                  {!mini && item.label}
                </NavLink>
              </NavItem>
            ))}
          </Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
};

Sidebar.defaultProps = { routes: [{}] };

Sidebar.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.object),
  logo: PropTypes.shape({
    innerLink:  PropTypes.string,
    outterLink: PropTypes.string,
    imgSrc:     PropTypes.string.isRequired,
    imgAlt:     PropTypes.string.isRequired,
  }),
};

export default Sidebar;
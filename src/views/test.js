/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import Diagram from "./logigramme/Diagram.js";
import FlowEditorPage from "./editor/FlowEditorPage.jsx";
// reactstrap components
import { Card, Container, Row } from "reactstrap";

// core components
import Header from "components/Headers/Header.js";
import Diag from "./test/diag.js";

// src/App.jsx
import BuilderPage from "./builder/BuilderPage.jsx";


const Test = () => {
  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow border-0">
              
               {/* <FlowEditorPage /> */}

              <BuilderPage />;

            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default Test;

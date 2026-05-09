import { useSelector } from 'react-redux';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import useSocket from '../../../hooks/useSocket';
import {
  selectDashboardAlerts,
  selectDashboardKpis,
  selectDashboardStations,
} from '../../../store/slices/dashboardSlice';
import { selectRealtime } from '../../../store/slices/realtimeSlice';
import KPISection from '../components/KPISection';
import AlertsFeed from '../components/AlertsFeed';
import StationOverview from '../components/StationOverview';
import RealtimeStats from '../components/RealtimeStats';

export default function DashboardPage() {
  useSocket(true);

  const kpis = useSelector(selectDashboardKpis);
  const alerts = useSelector(selectDashboardAlerts);
  const stations = useSelector(selectDashboardStations);
  const realtime = useSelector(selectRealtime);

  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
        <Container fluid>
          <div className="header-body">
            <KPISection kpis={kpis} />
          </div>
        </Container>
      </div>
      <Container className="mt--7" fluid>
        <Row>
          <Col xl="8" className="mb-5 mb-xl-0">
            <StationOverview stations={stations} />
          </Col>
          <Col xl="4">
            <AlertsFeed alerts={alerts} />
          </Col>
        </Row>
        <Row className="mt-5">
          <Col xl="4" className="mb-5 mb-xl-0">
            <RealtimeStats realtime={realtime} />
          </Col>
          <Col xl="8">
            <Card className="shadow">
              <CardBody>
                <h3>Operational Focus</h3>
                <p className="text-muted mb-0">
                  Live monitoring is connected to the Redux dashboard state, with the existing workflow builder kept intact under Automation Builder.
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}

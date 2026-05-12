import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Col,
  Container,
  Input,
  Row,
  Spinner,
  Table,
} from 'reactstrap';
import useSocket from '../../../hooks/useSocket';
import { selectUserRole } from '../../../store/slices/authSlice';
import {
  acknowledgeAlert,
  fetchAlerts,
  resolveAlert,
  selectAlerts,
  selectAlertsError,
  selectAlertsLoading,
} from '../../../store/slices/alertsSlice';

const SEVERITY_COLORS = {
  info: 'info',
  warning: 'warning',
  error: 'danger',
  critical: 'danger',
};

const STATUS_COLORS = {
  active: 'danger',
  acknowledged: 'warning',
  resolved: 'success',
  suppressed: 'secondary',
};

export default function AlertsPage() {
  const dispatch = useDispatch();
  const alerts = useSelector(selectAlerts);
  const isLoading = useSelector(selectAlertsLoading);
  const error = useSelector(selectAlertsError);
  const userRole = useSelector(selectUserRole);
  const canManageAlerts = ['admin', 'operator', 'technician'].includes(userRole);

  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useSocket(true);

  useEffect(() => {
    const params = {};
    if (severityFilter) params.severity = severityFilter;
    if (statusFilter) params.status = statusFilter;
    dispatch(fetchAlerts(params));
  }, [dispatch, severityFilter, statusFilter]);

  return (
    <>
      <div className="header bg-gradient-danger pb-8 pt-5 pt-md-8">
        <Container fluid>
          <Row className="align-items-center">
            <Col>
              <h1 className="text-white mb-0">Alerts</h1>
              <p className="text-white-50 mb-0">Operational alerts and intervention signals.</p>
            </Col>
          </Row>
        </Container>
      </div>
      <Container className="mt--7" fluid>
        <Card className="shadow">
          <CardHeader className="border-0">
            <Row className="align-items-center">
              <Col>
                <h3 className="mb-0">Alert Center</h3>
              </Col>
              <Col xs="12" md="auto">
                <Row className="align-items-center gx-2">
                  <Col xs="auto">
                    <Input
                      type="select"
                      bsSize="sm"
                      value={severityFilter}
                      onChange={(e) => setSeverityFilter(e.target.value)}
                      style={{ minWidth: 130 }}
                    >
                      <option value="">All Severities</option>
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="critical">Critical</option>
                    </Input>
                  </Col>
                  <Col xs="auto">
                    <Input
                      type="select"
                      bsSize="sm"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{ minWidth: 130 }}
                    >
                      <option value="">All Statuses</option>
                      <option value="active">Active</option>
                      <option value="acknowledged">Acknowledged</option>
                      <option value="resolved">Resolved</option>
                    </Input>
                  </Col>
                  {(severityFilter || statusFilter) && (
                    <Col xs="auto">
                      <Button
                        size="sm"
                        color="link"
                        className="text-muted p-0"
                        onClick={() => { setSeverityFilter(''); setStatusFilter(''); }}
                      >
                        Clear
                      </Button>
                    </Col>
                  )}
                </Row>
              </Col>
            </Row>
            {error && <p className="text-danger text-sm mb-0 mt-2">{error}</p>}
          </CardHeader>
          <Table className="align-items-center table-flush" responsive>
            <thead className="thead-light">
              <tr>
                <th>Severity</th>
                <th>Message</th>
                <th>Station</th>
                <th>Sensor</th>
                <th>Time</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <Spinner color="danger" />
                  </td>
                </tr>
              ) : alerts.length ? (
                alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>
                      <Badge color={SEVERITY_COLORS[alert.severity] || 'secondary'}>
                        {alert.severity}
                      </Badge>
                    </td>
                    <th scope="row">{alert.message}</th>
                    <td>{alert.station?.name || '-'}</td>
                    <td>{alert.sensor?.name || '-'}</td>
                    <td>{alert.createdAt ? new Date(alert.createdAt).toLocaleString() : '-'}</td>
                    <td>
                      <Badge color={STATUS_COLORS[alert.status] || 'secondary'}>
                        {alert.status}
                      </Badge>
                    </td>
                    <td className="text-right">
                      {canManageAlerts ? (
                        <>
                          <Button
                            size="sm"
                            color="warning"
                            disabled={alert.status !== 'active'}
                            onClick={() => dispatch(acknowledgeAlert(alert.id))}
                          >
                            Acknowledge
                          </Button>
                          <Button
                            size="sm"
                            color="success"
                            className="ml-2"
                            disabled={alert.status === 'resolved'}
                            onClick={() => dispatch(resolveAlert(alert.id))}
                          >
                            Resolve
                          </Button>
                        </>
                      ) : (
                        <span className="text-muted text-sm">Read only</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-5">
                    No alerts found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </Container>
    </>
  );
}

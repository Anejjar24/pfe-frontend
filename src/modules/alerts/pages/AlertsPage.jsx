import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Badge, Button, Card, CardHeader, Container, Spinner, Table } from 'reactstrap';
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

  useEffect(() => {
    dispatch(fetchAlerts());
  }, [dispatch]);

  return (
    <>
      <div className="header bg-gradient-danger pb-8 pt-5 pt-md-8">
        <Container fluid>
          <h1 className="text-white mb-0">Alerts</h1>
          <p className="text-white-50 mb-0">Operational alerts and intervention signals.</p>
        </Container>
      </div>
      <Container className="mt--7" fluid>
        <Card className="shadow">
          <CardHeader className="border-0">
            <h3 className="mb-0">Alert Center</h3>
            {error && <p className="text-danger text-sm mb-0">{error}</p>}
          </CardHeader>
          <Table className="align-items-center table-flush" responsive>
            <thead className="thead-light">
              <tr>
                <th>Message</th>
                <th>Station</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-5"><Spinner color="primary" /></td></tr>
              ) : alerts.length ? (
                alerts.map((alert) => (
                  <tr key={alert.id}>
                    <th scope="row">{alert.message}</th>
                    <td>{alert.station?.name || '-'}</td>
                    <td><Badge color={SEVERITY_COLORS[alert.severity] || 'secondary'}>{alert.severity}</Badge></td>
                    <td><Badge color={STATUS_COLORS[alert.status] || 'secondary'}>{alert.status}</Badge></td>
                    <td>{alert.createdAt ? new Date(alert.createdAt).toLocaleString() : '-'}</td>
                    <td className="text-right">
                      <Button size="sm" color="warning" disabled={alert.status !== 'active'} onClick={() => dispatch(acknowledgeAlert(alert.id))}>
                        Ack
                      </Button>
                      <Button size="sm" color="success" className="ml-2" disabled={alert.status === 'resolved'} onClick={() => dispatch(resolveAlert(alert.id))}>
                        Resolve
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center text-muted py-5">No alerts found.</td></tr>
              )}
            </tbody>
          </Table>
        </Card>
      </Container>
    </>
  );
}

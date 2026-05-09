import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Badge, Card, CardHeader, Container, Spinner, Table } from 'reactstrap';
import {
  fetchMaintenance,
  selectMaintenanceError,
  selectMaintenanceItems,
  selectMaintenanceLoading,
} from '../../../store/slices/maintenanceSlice';

const PRIORITY_COLORS = {
  low: 'success',
  medium: 'info',
  high: 'warning',
  critical: 'danger',
};

const STATUS_COLORS = {
  scheduled: 'info',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'secondary',
  on_hold: 'dark',
};

export default function MaintenancePage() {
  const dispatch = useDispatch();
  const items = useSelector(selectMaintenanceItems);
  const isLoading = useSelector(selectMaintenanceLoading);
  const error = useSelector(selectMaintenanceError);

  useEffect(() => {
    dispatch(fetchMaintenance());
  }, [dispatch]);

  return (
    <>
      <div className="header bg-gradient-warning pb-8 pt-5 pt-md-8">
        <Container fluid>
          <h1 className="text-white mb-0">Maintenance</h1>
          <p className="text-white-50 mb-0">Interventions, inspections, and repair tracking.</p>
        </Container>
      </div>
      <Container className="mt--7" fluid>
        <Card className="shadow">
          <CardHeader className="border-0">
            <h3 className="mb-0">Maintenance Work Orders</h3>
            {error && <p className="text-danger text-sm mb-0">{error}</p>}
          </CardHeader>
          <Table className="align-items-center table-flush" responsive>
            <thead className="thead-light">
              <tr>
                <th>Title</th>
                <th>Station</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Scheduled</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-5"><Spinner color="primary" /></td></tr>
              ) : items.length ? (
                items.map((item) => (
                  <tr key={item.id}>
                    <th scope="row">{item.title}</th>
                    <td>{item.station?.name || '-'}</td>
                    <td className="text-capitalize">{item.type}</td>
                    <td><Badge color={PRIORITY_COLORS[item.priority] || 'secondary'}>{item.priority}</Badge></td>
                    <td><Badge color={STATUS_COLORS[item.status] || 'secondary'}>{item.status}</Badge></td>
                    <td>{item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString() : '-'}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center text-muted py-5">No maintenance records found.</td></tr>
              )}
            </tbody>
          </Table>
        </Card>
      </Container>
    </>
  );
}

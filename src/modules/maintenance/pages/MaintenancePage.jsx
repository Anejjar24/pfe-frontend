import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Col,
  Container,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
  Table,
} from 'reactstrap';
import { selectUserRole } from '../../../store/slices/authSlice';
import {
  createMaintenance,
  deleteMaintenance,
  fetchMaintenance,
  selectMaintenanceError,
  selectMaintenanceItems,
  selectMaintenanceLoading,
  selectMaintenanceSaving,
  updateMaintenance,
} from '../../../store/slices/maintenanceSlice';
import { fetchStations, selectStations } from '../../../store/slices/stationsSlice';

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

const initialForm = {
  title: '',
  type: 'preventive',
  priority: 'medium',
  status: 'scheduled',
  stationId: '',
  description: '',
  scheduledDate: '',
};

export default function MaintenancePage() {
  const dispatch = useDispatch();
  const items = useSelector(selectMaintenanceItems);
  const stations = useSelector(selectStations);
  const isLoading = useSelector(selectMaintenanceLoading);
  const isSaving = useSelector(selectMaintenanceSaving);
  const error = useSelector(selectMaintenanceError);
  const userRole = useSelector(selectUserRole);

  const canCreate = ['admin', 'operator', 'technician'].includes(userRole);
  const canEdit = ['admin', 'operator', 'technician'].includes(userRole);
  const canDelete = userRole === 'admin';

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(fetchMaintenance());
    dispatch(fetchStations());
  }, [dispatch]);

  const openCreate = () => {
    setEditingItem(null);
    setForm({ ...initialForm, stationId: stations[0]?.id || '' });
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title || '',
      type: item.type || 'preventive',
      priority: item.priority || 'medium',
      status: item.status || 'scheduled',
      stationId: item.station?.id || '',
      description: item.description || '',
      scheduledDate: item.scheduledDate ? item.scheduledDate.slice(0, 10) : '',
    });
    setModalOpen(true);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      scheduledDate: form.scheduledDate || undefined,
    };

    if (editingItem) {
      await dispatch(updateMaintenance({ id: editingItem.id, payload }));
    } else {
      await dispatch(createMaintenance(payload));
    }
    setModalOpen(false);
  };

  const handleDelete = (item) => {
    setDeleteTarget(item);
  };

  const confirmDelete = () => {
    dispatch(deleteMaintenance(deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <>
      <div className="header bg-gradient-warning pb-8 pt-5 pt-md-8">
        <Container fluid>
          <Row className="align-items-center">
            <Col>
              <h1 className="text-white mb-0">Maintenance</h1>
              <p className="text-white-50 mb-0">Interventions, inspections, and repair tracking.</p>
            </Col>
            <Col className="text-right" xs="12" md="3">
              {canCreate && (
                <Button color="default" size="sm" onClick={openCreate}>
                  <i className="ni ni-fat-add mr-2" />
                  New Work Order
                </Button>
              )}
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="mt--7" fluid>
        <Card className="shadow">
          <CardHeader className="border-0">
            <h3 className="mb-0">Maintenance Work Orders</h3>
            {error && <p className="text-danger text-sm mb-0 mt-1">{error}</p>}
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
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-5">
                    <Spinner color="warning" />
                  </td>
                </tr>
              ) : items.length ? (
                items.map((item) => (
                  <tr key={item.id}>
                    <th scope="row">{item.title}</th>
                    <td>{item.station?.name || '-'}</td>
                    <td className="text-capitalize">{item.type?.replace('_', ' ')}</td>
                    <td>
                      <Badge color={PRIORITY_COLORS[item.priority] || 'secondary'}>
                        {item.priority}
                      </Badge>
                    </td>
                    <td>
                      <Badge color={STATUS_COLORS[item.status] || 'secondary'}>
                        {item.status?.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td>
                      {item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="text-right">
                      {canEdit && (
                        <Button size="sm" color="info" onClick={() => openEdit(item)}>
                          Edit
                        </Button>
                      )}
                      {canDelete && (
                        <Button size="sm" color="danger" className="ml-2" onClick={() => handleDelete(item)}>
                          Delete
                        </Button>
                      )}
                      {!canEdit && !canDelete && (
                        <span className="text-muted text-sm">Read only</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-5">
                    No maintenance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card>
      </Container>

      <Modal isOpen={!!deleteTarget} toggle={() => setDeleteTarget(null)}>
        <ModalHeader toggle={() => setDeleteTarget(null)}>
          <span className="text-danger">
            <i className="ni ni-fat-remove mr-2" />
            Delete Work Order
          </span>
        </ModalHeader>
        <ModalBody>
          <p className="mb-1">
            Are you sure you want to delete this work order?
          </p>
          <p className="font-weight-bold mb-0">
            {deleteTarget?.title}
          </p>
          {deleteTarget?.station && (
            <p className="text-muted text-sm mb-0">
              Station: {deleteTarget.station.name}
            </p>
          )}
          <p className="text-danger text-sm mt-3 mb-0">
            This action cannot be undone.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button color="danger" onClick={confirmDelete} disabled={isSaving}>
            {isSaving ? 'Deleting...' : 'Delete'}
          </Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} size="lg">
        <Form onSubmit={handleSubmit}>
          <ModalHeader toggle={() => setModalOpen(false)}>
            {editingItem ? 'Edit Work Order' : 'New Work Order'}
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label>Title</Label>
              <Input
                name="title"
                value={form.title}
                onChange={handleInputChange}
                required
                placeholder="e.g. Quarterly pump inspection"
              />
            </FormGroup>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Type</Label>
                  <Input type="select" name="type" value={form.type} onChange={handleInputChange}>
                    <option value="preventive">Preventive</option>
                    <option value="corrective">Corrective</option>
                    <option value="inspection">Inspection</option>
                    <option value="repair">Repair</option>
                    <option value="replacement">Replacement</option>
                    <option value="calibration">Calibration</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>Priority</Label>
                  <Input type="select" name="priority" value={form.priority} onChange={handleInputChange}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Status</Label>
                  <Input type="select" name="status" value={form.status} onChange={handleInputChange}>
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="on_hold">On Hold</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>Station</Label>
                  <Input type="select" name="stationId" value={form.stationId} onChange={handleInputChange}>
                    <option value="">No station</option>
                    {stations.map((station) => (
                      <option key={station.id} value={station.id}>
                        {station.name}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
            </Row>
            <FormGroup>
              <Label>Scheduled Date</Label>
              <Input
                type="date"
                name="scheduledDate"
                value={form.scheduledDate}
                onChange={handleInputChange}
              />
            </FormGroup>
            <FormGroup>
              <Label>Description</Label>
              <Input
                type="textarea"
                name="description"
                rows="3"
                value={form.description}
                onChange={handleInputChange}
                placeholder="Describe the work to be done..."
              />
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : editingItem ? 'Update Work Order' : 'Create Work Order'}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </>
  );
}

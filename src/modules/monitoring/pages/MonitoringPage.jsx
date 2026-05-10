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
import useSocket from '../../../hooks/useSocket';
import { selectUserRole } from '../../../store/slices/authSlice';
import {
  createSensor,
  fetchSensors,
  selectSensors,
  selectSensorsError,
  selectSensorsLoading,
} from '../../../store/slices/sensorsSlice';
import { fetchStations, selectStations } from '../../../store/slices/stationsSlice';

const STATUS_COLORS = {
  active: 'success',
  inactive: 'secondary',
  faulty: 'danger',
  offline: 'dark',
};

const initialForm = {
  name: '',
  type: 'pressure',
  unit: 'bar',
  stationId: '',
  location: '',
  minThreshold: '',
  maxThreshold: '',
  status: 'active',
  alertEnabled: true,
  deviceId: '',
  serialNumber: '',
};

export default function MonitoringPage() {
  const dispatch = useDispatch();
  const sensors = useSelector(selectSensors);
  const stations = useSelector(selectStations);
  const isLoading = useSelector(selectSensorsLoading);
  const error = useSelector(selectSensorsError);
  const userRole = useSelector(selectUserRole);
  const canManageSensors = ['admin', 'operator'].includes(userRole);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  useSocket(true);

  useEffect(() => {
    dispatch(fetchSensors());
    dispatch(fetchStations());
  }, [dispatch]);

  const openCreate = () => {
    setForm({
      ...initialForm,
      stationId: stations[0]?.id || '',
    });
    setModalOpen(true);
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      minThreshold: form.minThreshold === '' ? undefined : Number(form.minThreshold),
      maxThreshold: form.maxThreshold === '' ? undefined : Number(form.maxThreshold),
    };

    await dispatch(createSensor(payload));
    await dispatch(fetchSensors());
    setModalOpen(false);
  };

  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
        <Container fluid>
          <Row className="align-items-center">
            <Col>
              <h1 className="text-white mb-0">Monitoring</h1>
              <p className="text-white-50 mb-0">Live sensor inventory and latest readings.</p>
            </Col>
            <Col className="text-right" xs="12" md="3">
              {canManageSensors && (
                <Button color="default" size="sm" onClick={openCreate} disabled={!stations.length}>
                  <i className="ni ni-fat-add mr-2" />
                  New Sensor
                </Button>
              )}
            </Col>
          </Row>
        </Container>
      </div>
      <Container className="mt--7" fluid>
        <Card className="shadow">
          <CardHeader className="border-0">
            <h3 className="mb-0">Sensors</h3>
            {!stations.length && (
              <p className="text-warning text-sm mb-0">Create a station first before adding sensors.</p>
            )}
            {error && <p className="text-danger text-sm mb-0">{error}</p>}
          </CardHeader>
          <Table className="align-items-center table-flush" responsive>
            <thead className="thead-light">
              <tr>
                <th>Name</th>
                <th>Station</th>
                <th>Type</th>
                <th>Status</th>
                <th>Last Reading</th>
                <th>Thresholds</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-5"><Spinner color="primary" /></td></tr>
              ) : sensors.length ? (
                sensors.map((sensor) => (
                  <tr key={sensor.id}>
                    <th scope="row">{sensor.name}</th>
                    <td>{sensor.station?.name || '-'}</td>
                    <td className="text-capitalize">{sensor.type}</td>
                    <td><Badge color={STATUS_COLORS[sensor.status] || 'secondary'}>{sensor.status}</Badge></td>
                    <td>
                      {sensor.lastReading === null || sensor.lastReading === undefined
                        ? '-'
                        : Number(sensor.lastReading).toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                      {sensor.lastReading === null || sensor.lastReading === undefined ? '' : sensor.unit}
                    </td>
                    <td>{sensor.minThreshold ?? '-'} / {sensor.maxThreshold ?? '-'}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center text-muted py-5">No sensors found.</td></tr>
              )}
            </tbody>
          </Table>
        </Card>
      </Container>

      <Modal isOpen={modalOpen} toggle={() => setModalOpen(false)} size="lg">
        <Form onSubmit={handleSubmit}>
          <ModalHeader toggle={() => setModalOpen(false)}>Create Sensor</ModalHeader>
          <ModalBody>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Name</Label>
                  <Input name="name" value={form.name} onChange={handleInputChange} required />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>Station</Label>
                  <Input type="select" name="stationId" value={form.stationId} onChange={handleInputChange} required>
                    <option value="">Select station</option>
                    {stations.map((station) => (
                      <option key={station.id} value={station.id}>{station.name}</option>
                    ))}
                  </Input>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="4">
                <FormGroup>
                  <Label>Type</Label>
                  <Input type="select" name="type" value={form.type} onChange={handleInputChange}>
                    <option value="pressure">Pressure</option>
                    <option value="flow">Flow</option>
                    <option value="temperature">Temperature</option>
                    <option value="quality">Quality</option>
                    <option value="level">Level</option>
                    <option value="ph">pH</option>
                    <option value="turbidity">Turbidity</option>
                    <option value="chlorine">Chlorine</option>
                  </Input>
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label>Unit</Label>
                  <Input name="unit" value={form.unit} onChange={handleInputChange} required />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label>Status</Label>
                  <Input type="select" name="status" value={form.status} onChange={handleInputChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="faulty">Faulty</option>
                    <option value="offline">Offline</option>
                  </Input>
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="4">
                <FormGroup>
                  <Label>Location</Label>
                  <Input name="location" value={form.location} onChange={handleInputChange} />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label>Min Threshold</Label>
                  <Input name="minThreshold" type="number" step="0.01" value={form.minThreshold} onChange={handleInputChange} />
                </FormGroup>
              </Col>
              <Col md="4">
                <FormGroup>
                  <Label>Max Threshold</Label>
                  <Input name="maxThreshold" type="number" step="0.01" value={form.maxThreshold} onChange={handleInputChange} />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <FormGroup>
                  <Label>Device ID</Label>
                  <Input name="deviceId" value={form.deviceId} onChange={handleInputChange} />
                </FormGroup>
              </Col>
              <Col md="6">
                <FormGroup>
                  <Label>Serial Number</Label>
                  <Input name="serialNumber" value={form.serialNumber} onChange={handleInputChange} />
                </FormGroup>
              </Col>
            </Row>
            <FormGroup check>
              <Label check>
                <Input type="checkbox" name="alertEnabled" checked={form.alertEnabled} onChange={handleInputChange} />
                Enable threshold alerts
              </Label>
            </FormGroup>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button color="primary" type="submit">
              Save Sensor
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </>
  );
}

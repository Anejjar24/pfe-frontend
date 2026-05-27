import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  FormGroup,
  Input,
  Label,
  Row,
  Spinner,
} from 'reactstrap';
import {
  fetchAnalyticsOverview,
  fetchAnalyticsSensors,
  fetchSensorStats,
  clearSensorStats,
  selectAnalyticsOverview,
  selectAnalyticsOverviewLoading,
  selectAnalyticsOverviewError,
  selectAnalyticsSensors,
  selectAnalyticsSensorStats,
  selectAnalyticsStatsLoading,
  selectAnalyticsStatsError,
} from '../../../store/slices/analyticsSlice';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS_CSS = {
  normal: '#2dce89',
  warning: '#fb6340',
  critical: '#f5365c',
  offline: '#adb5bd',
};

const SEVERITY_COLORS_CSS = {
  critical: '#f5365c',
  warning: '#fb6340',
  error: '#fd7e14',
  info: '#11cdef',
};

function isoOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
}

const RANGE_PRESETS = [
  { label: '24 h', days: 1 },
  { label: '7 d', days: 7 },
  { label: '30 d', days: 30 },
];

// ─── Chart builders ───────────────────────────────────────────────────────────

function buildStatusChart(stationsByStatus) {
  const labels = stationsByStatus.map((s) => s.status);
  const counts = stationsByStatus.map((s) => s.count);
  const colors = labels.map((l) => STATUS_COLORS_CSS[l] || '#8898aa');
  return {
    labels,
    datasets: [{ data: counts, backgroundColor: colors, borderWidth: 0 }],
  };
}

function buildSeverityChart(alertsBySeverity) {
  const labels = alertsBySeverity.map((a) => a.severity);
  const counts = alertsBySeverity.map((a) => a.count);
  const colors = labels.map((l) => SEVERITY_COLORS_CSS[l] || '#8898aa');
  return {
    labels,
    datasets: [{ data: counts, backgroundColor: colors, borderWidth: 0 }],
  };
}

function buildSensorLineChart(timeSeries, sensor) {
  if (!timeSeries || timeSeries.length === 0) return null;
  const labels = timeSeries.map((b) => {
    const d = new Date(b.time);
    return d.toLocaleString(undefined, {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  });

  return {
    labels,
    datasets: [
      {
        label: `Avg ${sensor?.name || ''} (${sensor?.unit || ''})`,
        data: timeSeries.map((b) => b.avg),
        borderColor: '#5e72e4',
        backgroundColor: 'rgba(94,114,228,0.08)',
        fill: true,
        pointRadius: timeSeries.length > 72 ? 0 : 3,
        borderWidth: 2,
      },
      {
        label: 'Min',
        data: timeSeries.map((b) => b.min),
        borderColor: '#2dce89',
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Max',
        data: timeSeries.map((b) => b.max),
        borderColor: '#f5365c',
        borderDash: [4, 4],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      },
    ],
  };
}

const doughnutOptions = {
  maintainAspectRatio: false,
  legend: { position: 'bottom', labels: { boxWidth: 12 } },
  cutoutPercentage: 65,
};

const lineOptions = {
  maintainAspectRatio: false,
  legend: { display: true, position: 'top', labels: { boxWidth: 12 } },
  scales: {
    xAxes: [{ ticks: { maxTicksLimit: 10, maxRotation: 30, autoSkip: true } }],
    yAxes: [{ ticks: { beginAtZero: false } }],
  },
  tooltips: { mode: 'index', intersect: false },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const dispatch = useDispatch();

  // ── Redux state (fetched data) ───────────────────────────────────────────
  const overview = useSelector(selectAnalyticsOverview);
  const overviewLoading = useSelector(selectAnalyticsOverviewLoading);
  const overviewError = useSelector(selectAnalyticsOverviewError);
  const sensors = useSelector(selectAnalyticsSensors);
  const sensorStats = useSelector(selectAnalyticsSensorStats);
  const statsLoading = useSelector(selectAnalyticsStatsLoading);
  const statsError = useSelector(selectAnalyticsStatsError);

  // ── Local UI state (not worth caching in Redux) ──────────────────────────
  const [selectedSensorId, setSelectedSensorId] = useState('');
  const [rangePreset, setRangePreset] = useState(1); // days
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [useCustomRange, setUseCustomRange] = useState(false);

  // Load overview + sensor list on mount
  useEffect(() => {
    dispatch(fetchAnalyticsOverview());
    dispatch(fetchAnalyticsSensors());
  }, [dispatch]);

  // Fetch sensor stats whenever sensor or range changes
  useEffect(() => {
    if (!selectedSensorId) {
      dispatch(clearSensorStats());
      return;
    }

    const params = {};
    if (useCustomRange) {
      if (customFrom) params.from = new Date(customFrom).toISOString();
      if (customTo) params.to = new Date(customTo).toISOString();
    } else {
      params.from = new Date(Date.now() - rangePreset * 24 * 60 * 60 * 1000).toISOString();
      params.to = new Date().toISOString();
    }

    dispatch(fetchSensorStats({ sensorId: selectedSensorId, params }));
  }, [dispatch, selectedSensorId, rangePreset, useCustomRange, customFrom, customTo]);

  const refreshOverview = () => {
    dispatch(fetchAnalyticsOverview());
  };

  const statusChartData = overview?.stationsByStatus?.length
    ? buildStatusChart(overview.stationsByStatus) : null;
  const severityChartData = overview?.alertsBySeverity?.length
    ? buildSeverityChart(overview.alertsBySeverity) : null;
  const lineChartData = sensorStats?.timeSeries?.length
    ? buildSensorLineChart(sensorStats.timeSeries, sensorStats.sensor) : null;

  return (
    <>
      {/* Header */}
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
        <Container fluid>
          <div className="header-body">
            {overviewLoading ? (
              <div className="text-center py-4"><Spinner color="light" /></div>
            ) : overviewError ? (
              <Alert color="warning">{overviewError}</Alert>
            ) : overview ? (
              <Row>
                {[
                  { label: 'Total Stations', value: overview.totalStations, icon: 'ni-building', bg: 'primary' },
                  { label: 'Active Sensors', value: overview.activeSensors, icon: 'ni-chart-bar-32', bg: 'success' },
                  { label: 'Open Alerts', value: overview.openAlerts, icon: 'ni-bell-55', bg: overview.openAlerts > 0 ? 'danger' : 'success' },
                  { label: 'Maintenance Pending', value: overview.maintenancePending, icon: 'ni-settings', bg: 'warning' },
                ].map(({ label, value, icon, bg }) => (
                  <Col lg="3" md="6" key={label}>
                    <Card className="card-stats mb-4 mb-xl-0">
                      <CardBody>
                        <Row>
                          <div className="col">
                            <h5 className="card-title text-uppercase text-muted mb-0">{label}</h5>
                            <span className="h2 font-weight-bold mb-0">{value ?? '—'}</span>
                          </div>
                          <Col className="col-auto">
                            <div className={`icon icon-shape bg-${bg} text-white rounded-circle shadow`}>
                              <i className={`ni ${icon}`} />
                            </div>
                          </Col>
                        </Row>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : null}
          </div>
        </Container>
      </div>

      <Container className="mt--7" fluid>
        {/* ── Breakdown charts ─────────────────────────────────────────────── */}
        <Row className="mb-4">
          {/* Stations by Status */}
          <Col xl="6" className="mb-4">
            <Card className="shadow">
              <CardHeader className="border-0 d-flex align-items-center justify-content-between">
                <h3 className="mb-0">Stations by Status</h3>
                <Button color="link" size="sm" className="p-0 text-muted" onClick={refreshOverview}>
                  <i className="ni ni-refresh-02" />
                </Button>
              </CardHeader>
              <CardBody>
                {!statusChartData ? (
                  <p className="text-muted text-center mb-0">No station data available.</p>
                ) : (
                  <div style={{ height: 220 }}>
                    <Doughnut data={statusChartData} options={doughnutOptions} />
                  </div>
                )}
                {overview?.stationsByStatus?.length > 0 && (
                  <div className="d-flex flex-wrap justify-content-center mt-3">
                    {overview.stationsByStatus.map(({ status, count }) => (
                      <div key={status} className="mx-2 text-center">
                        <Badge
                          style={{ backgroundColor: STATUS_COLORS_CSS[status] || '#8898aa', fontSize: '0.75rem' }}
                          className="text-capitalize"
                        >
                          {status}
                        </Badge>
                        <div className="font-weight-bold">{count}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>

          {/* Alerts by Severity */}
          <Col xl="6" className="mb-4">
            <Card className="shadow">
              <CardHeader className="border-0">
                <h3 className="mb-0">Active Alerts by Severity</h3>
              </CardHeader>
              <CardBody>
                {!severityChartData ? (
                  <p className="text-muted text-center mb-0">No active alerts.</p>
                ) : (
                  <div style={{ height: 220 }}>
                    <Doughnut data={severityChartData} options={doughnutOptions} />
                  </div>
                )}
                {overview?.alertsBySeverity?.length > 0 && (
                  <div className="d-flex flex-wrap justify-content-center mt-3">
                    {overview.alertsBySeverity.map(({ severity, count }) => (
                      <div key={severity} className="mx-2 text-center">
                        <Badge
                          style={{ backgroundColor: SEVERITY_COLORS_CSS[severity] || '#8898aa', fontSize: '0.75rem' }}
                          className="text-capitalize"
                        >
                          {severity}
                        </Badge>
                        <div className="font-weight-bold">{count}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* ── Sensor Analysis ──────────────────────────────────────────────── */}
        <Row>
          <Col>
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <Col>
                    <h3 className="mb-0">Sensor Analysis</h3>
                    <p className="text-sm text-muted mb-0">
                      Select a sensor and time range to view aggregated statistics.
                    </p>
                  </Col>
                </Row>

                {/* Controls */}
                <Row className="mt-3 align-items-end">
                  <Col md="4">
                    <FormGroup className="mb-0">
                      <Label className="form-control-label text-sm">Sensor</Label>
                      <Input
                        type="select"
                        value={selectedSensorId}
                        onChange={(e) => setSelectedSensorId(e.target.value)}
                      >
                        <option value="">— Select a sensor —</option>
                        {sensors.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.unit}) {s.station?.name ? `· ${s.station.name}` : ''}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>

                  <Col md="5">
                    <FormGroup className="mb-0">
                      <Label className="form-control-label text-sm">Time Range</Label>
                      <div className="d-flex align-items-center flex-wrap" style={{ gap: '6px' }}>
                        {RANGE_PRESETS.map(({ label, days }) => (
                          <Button
                            key={days}
                            size="sm"
                            color={!useCustomRange && rangePreset === days ? 'primary' : 'secondary'}
                            onClick={() => { setRangePreset(days); setUseCustomRange(false); }}
                          >
                            {label}
                          </Button>
                        ))}
                        <Button
                          size="sm"
                          color={useCustomRange ? 'primary' : 'secondary'}
                          onClick={() => setUseCustomRange(true)}
                        >
                          Custom
                        </Button>
                      </div>
                    </FormGroup>
                  </Col>

                  {useCustomRange && (
                    <Col md="3">
                      <FormGroup className="mb-0">
                        <Label className="form-control-label text-sm">From</Label>
                        <Input
                          type="datetime-local"
                          value={customFrom || isoOffset(7)}
                          onChange={(e) => setCustomFrom(e.target.value)}
                        />
                      </FormGroup>
                      <FormGroup className="mb-0 mt-2">
                        <Label className="form-control-label text-sm">To</Label>
                        <Input
                          type="datetime-local"
                          value={customTo || new Date().toISOString().slice(0, 16)}
                          onChange={(e) => setCustomTo(e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                  )}
                </Row>
              </CardHeader>

              <CardBody>
                {!selectedSensorId && (
                  <p className="text-muted text-center py-5">Select a sensor above to view analytics.</p>
                )}

                {selectedSensorId && statsLoading && (
                  <div className="text-center py-5"><Spinner color="primary" /></div>
                )}

                {selectedSensorId && statsError && (
                  <Alert color="danger">{statsError}</Alert>
                )}

                {selectedSensorId && !statsLoading && sensorStats && (
                  <>
                    {/* Stats cards */}
                    <Row className="mb-4">
                      {[
                        { label: 'Average', value: sensorStats.stats.avg, unit: sensorStats.sensor.unit, color: 'primary' },
                        { label: 'Minimum', value: sensorStats.stats.min, unit: sensorStats.sensor.unit, color: 'success' },
                        { label: 'Maximum', value: sensorStats.stats.max, unit: sensorStats.sensor.unit, color: 'danger' },
                        { label: 'Readings', value: sensorStats.stats.count, unit: '', color: 'info' },
                        { label: 'Std Dev', value: sensorStats.stats.stddev, unit: sensorStats.sensor.unit, color: 'warning' },
                      ].map(({ label, value, unit, color }) => (
                        <Col key={label} xs="6" md="4" xl="2" className="mb-3">
                          <Card className={`bg-gradient-${color} border-0`}>
                            <CardBody className="py-3 px-3">
                              <h6 className="text-white text-uppercase text-xs mb-1">{label}</h6>
                              <span className="h4 font-weight-bold text-white mb-0">
                                {value != null ? `${Number(value).toFixed(2)}` : '—'}
                                {unit && value != null ? <small className="ml-1" style={{ fontSize: '0.65rem' }}>{unit}</small> : null}
                              </span>
                            </CardBody>
                          </Card>
                        </Col>
                      ))}
                    </Row>

                    {/* Time-series chart */}
                    {lineChartData ? (
                      <div style={{ height: 300 }}>
                        <Line data={lineChartData} options={lineOptions} />
                      </div>
                    ) : (
                      <p className="text-muted text-center py-4">
                        No readings found for the selected period.
                      </p>
                    )}

                    {/* Sensor meta */}
                    <Row className="mt-3">
                      <Col>
                        <small className="text-muted">
                          <strong>{sensorStats.sensor.name}</strong>
                          {' · '}Type: <span className="text-capitalize">{sensorStats.sensor.type}</span>
                          {' · '}Status:{' '}
                          <Badge color={sensorStats.sensor.status === 'active' ? 'success' : 'secondary'} className="text-capitalize">
                            {sensorStats.sensor.status}
                          </Badge>
                          {sensorStats.sensor.station && (
                            <> · Station: <strong>{sensorStats.sensor.station.name}</strong></>
                          )}
                          {sensorStats.sensor.minThreshold != null && (
                            <> · Min threshold: {sensorStats.sensor.minThreshold} {sensorStats.sensor.unit}</>
                          )}
                          {sensorStats.sensor.maxThreshold != null && (
                            <> · Max threshold: {sensorStats.sensor.maxThreshold} {sensorStats.sensor.unit}</>
                          )}
                        </small>
                      </Col>
                    </Row>
                  </>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
